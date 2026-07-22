export interface HookContext {
  step: string;
  skill: string;
  args: Record<string, unknown>;
  state: Record<string, unknown>;
}

export interface HookResult {
  proceed: boolean;
  error?: string;
  stateModifications?: Record<string, unknown>;
}

export type HookFn = (context: HookContext) => HookResult | Promise<HookResult>;

type HookEntry = { fn: HookFn; name: string; priority: number };

export class HookDispatcher {
  private preHooks: Map<string, HookEntry[]> = new Map();
  private postHooks: Map<string, HookEntry[]> = new Map();

  registerPre(step: string, fn: HookFn, name = 'anonymous', priority = 0): void {
    const entries = this.preHooks.get(step) || [];
    entries.push({ fn, name, priority });
    entries.sort((a, b) => b.priority - a.priority);
    this.preHooks.set(step, entries);
  }

  registerPost(step: string, fn: HookFn, name = 'anonymous', priority = 0): void {
    const entries = this.postHooks.get(step) || [];
    entries.push({ fn, name, priority });
    entries.sort((a, b) => b.priority - a.priority);
    this.postHooks.set(step, entries);
  }

  unregisterPre(step: string, name: string): boolean {
    const entries = this.preHooks.get(step);
    if (!entries) return false;
    const before = entries.length;
    const filtered = entries.filter(e => e.name !== name);
    this.preHooks.set(step, filtered);
    return filtered.length !== before;
  }

  unregisterPost(step: string, name: string): boolean {
    const entries = this.postHooks.get(step);
    if (!entries) return false;
    const before = entries.length;
    const filtered = entries.filter(e => e.name !== name);
    this.postHooks.set(step, filtered);
    return filtered.length !== before;
  }

  async runPre(step: string, context: HookContext): Promise<HookResult> {
    const entries = this.preHooks.get(step) || [];
    for (const entry of entries) {
      const result = await entry.fn(context);
      if (!result.proceed) {
        return { proceed: false, error: `Pre-hook "${entry.name}" blocked: ${result.error || 'no reason'}` };
      }
      if (result.stateModifications) {
        Object.assign(context.state, result.stateModifications);
      }
    }
    return { proceed: true };
  }

  async runPost(step: string, context: HookContext): Promise<HookResult> {
    const entries = this.postHooks.get(step) || [];
    for (const entry of entries) {
      const result = await entry.fn(context);
      if (!result.proceed) {
        return { proceed: false, error: `Post-hook "${entry.name}" blocked: ${result.error || 'no reason'}` };
      }
      if (result.stateModifications) {
        Object.assign(context.state, result.stateModifications);
      }
    }
    return { proceed: true };
  }

  registeredSteps(): { pre: string[]; post: string[] } {
    return {
      pre: [...this.preHooks.keys()],
      post: [...this.postHooks.keys()],
    };
  }
}
