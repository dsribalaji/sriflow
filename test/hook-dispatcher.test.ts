import { describe, test, expect } from 'bun:test';
import { HookDispatcher, HookContext, HookResult } from '../src/hooks/HookDispatcher';

describe('HookDispatcher', () => {
  test('runPre with no hooks returns proceed', async () => {
    const d = new HookDispatcher();
    const result = await d.runPre('step1', { step: 'step1', skill: 'test', args: {}, state: {} });
    expect(result.proceed).toBe(true);
  });

  test('runPost with no hooks returns proceed', async () => {
    const d = new HookDispatcher();
    const result = await d.runPost('step1', { step: 'step1', skill: 'test', args: {}, state: {} });
    expect(result.proceed).toBe(true);
  });

  test('pre-hook can block execution', async () => {
    const d = new HookDispatcher();
    d.registerPre('step1', async (ctx: HookContext): Promise<HookResult> => {
      return { proceed: false, error: 'security check failed' };
    }, 'security-check');
    const result = await d.runPre('step1', { step: 'step1', skill: 'test', args: {}, state: {} });
    expect(result.proceed).toBe(false);
    expect(result.error).toContain('security-check');
  });

  test('all pre-hooks must pass', async () => {
    const d = new HookDispatcher();
    let callCount = 0;
    d.registerPre('step1', async () => { callCount++; return { proceed: true }; }, 'first');
    d.registerPre('step1', async () => { callCount++; return { proceed: false, error: 'second blocked' }; }, 'second');
    d.registerPre('step1', async () => { callCount++; return { proceed: true }; }, 'third');
    const result = await d.runPre('step1', { step: 'step1', skill: 'test', args: {}, state: {} });
    expect(result.proceed).toBe(false);
    expect(callCount).toBe(2);
  });

  test('post-hook can modify state', async () => {
    const d = new HookDispatcher();
    d.registerPost('step1', async (ctx: HookContext): Promise<HookResult> => {
      return { proceed: true, stateModifications: { logged: true, duration: 42 } };
    }, 'logger');
    const state: Record<string, unknown> = {};
    const result = await d.runPost('step1', { step: 'step1', skill: 'test', args: {}, state });
    expect(result.proceed).toBe(true);
    expect(state.logged).toBe(true);
    expect(state.duration).toBe(42);
  });

  test('priority ordering: higher priority runs first', async () => {
    const d = new HookDispatcher();
    const order: number[] = [];
    d.registerPre('step1', async () => { order.push(3); return { proceed: true }; }, 'third', 0);
    d.registerPre('step1', async () => { order.push(1); return { proceed: true }; }, 'first', 10);
    d.registerPre('step1', async () => { order.push(2); return { proceed: true }; }, 'second', 5);
    await d.runPre('step1', { step: 'step1', skill: 'test', args: {}, state: {} });
    expect(order).toEqual([1, 2, 3]);
  });

  test('unregisterPre removes hook', async () => {
    const d = new HookDispatcher();
    d.registerPre('step1', async () => ({ proceed: false, error: 'blocked' }), 'blocker');
    const removed = d.unregisterPre('step1', 'blocker');
    expect(removed).toBe(true);
    const result = await d.runPre('step1', { step: 'step1', skill: 'test', args: {}, state: {} });
    expect(result.proceed).toBe(true);
  });

  test('unregisterPre returns false for unknown hook', () => {
    const d = new HookDispatcher();
    expect(d.unregisterPre('step1', 'nope')).toBe(false);
  });

  test('registeredSteps returns all steps', () => {
    const d = new HookDispatcher();
    d.registerPre('step1', async () => ({ proceed: true }), 'a');
    d.registerPost('step2', async () => ({ proceed: true }), 'b');
    const steps = d.registeredSteps();
    expect(steps.pre).toContain('step1');
    expect(steps.post).toContain('step2');
  });

  test('multiple hooks same step all run in priority order', async () => {
    const d = new HookDispatcher();
    const results: string[] = [];
    d.registerPre('step1', async () => { results.push('a'); return { proceed: true }; }, 'a');
    d.registerPre('step1', async () => { results.push('b'); return { proceed: true }; }, 'b');
    await d.runPre('step1', { step: 'step1', skill: 'test', args: {}, state: {} });
    expect(results).toHaveLength(2);
  });
});
