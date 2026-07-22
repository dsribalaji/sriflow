import { describe, test, expect } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { JsonlMemoryBackend } from '../src/memory/JsonlMemoryBackend';

function freshBackend(): { backend: JsonlMemoryBackend; cleanup: () => void } {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sriflow-memory-'));
  const backend = new JsonlMemoryBackend('test-memory', tmpDir);
  return { backend, cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }) };
}

describe('JsonlMemoryBackend', () => {
  test('append creates entry with id and timestamp', async () => {
    const { backend, cleanup } = freshBackend();
    const entry = await backend.append({ skill: 'test', outcome: 'done', note: 'first entry' });
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.skill).toBe('test');
    expect(entry.outcome).toBe('done');
    expect(entry.note).toBe('first entry');
    cleanup();
  });

  test('count returns total entries', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'a' });
    await backend.append({ skill: 'build', outcome: 'blocked', note: 'b' });
    const count = await backend.count();
    expect(count).toBe(2);
    cleanup();
  });

  test('tail returns last N entries', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'first' });
    await backend.append({ skill: 'build', outcome: 'done', note: 'second' });
    await backend.append({ skill: 'ship', outcome: 'done', note: 'third' });
    const tail = await backend.tail(2);
    expect(tail.length).toBe(2);
    expect(tail[0].note).toBe('third');
    expect(tail[1].note).toBe('second');
    cleanup();
  });

  test('query filters by skill', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'a' });
    await backend.append({ skill: 'build', outcome: 'done', note: 'b' });
    await backend.append({ skill: 'test', outcome: 'done', note: 'c' });
    const results = await backend.query({ skills: ['build'] });
    expect(results.length).toBe(1);
    expect(results[0].skill).toBe('build');
    cleanup();
  });

  test('query limits results', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'a' });
    await backend.append({ skill: 'test', outcome: 'done', note: 'b' });
    const results = await backend.query({ limit: 1 });
    expect(results.length).toBe(1);
    cleanup();
  });

  test('query with sort asc returns in chronological order', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'first' });
    await backend.append({ skill: 'test', outcome: 'done', note: 'second' });
    const results = await backend.query({ sort: 'asc' });
    expect(results[0].note).toBe('first');
    expect(results[1].note).toBe('second');
    cleanup();
  });

  test('get returns entry by id', async () => {
    const { backend, cleanup } = freshBackend();
    const entry = await backend.append({ skill: 'test', outcome: 'done', note: 'get me' });
    const found = await backend.get(entry.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(entry.id);
    cleanup();
  });

  test('get returns null for missing id', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'x' });
    const found = await backend.get('nonexistent');
    expect(found).toBeNull();
    cleanup();
  });

  test('stats returns aggregated data', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'a' });
    await backend.append({ skill: 'build', outcome: 'done', note: 'b' });
    await backend.append({ skill: 'test', outcome: 'blocked', note: 'c' });
    const stats = await backend.stats();
    expect(stats.total).toBe(3);
    expect(stats.bySkill.test).toBe(2);
    expect(stats.bySkill.build).toBe(1);
    cleanup();
  });

  test('clear removes all entries', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'x' });
    await backend.clear();
    const count = await backend.count();
    expect(count).toBe(0);
    cleanup();
  });

  test('handles empty file gracefully', async () => {
    const { backend, cleanup } = freshBackend();
    const count = await backend.count();
    expect(count).toBe(0);
    const query = await backend.query();
    expect(query).toEqual([]);
    const stats = await backend.stats();
    expect(stats.total).toBe(0);
    cleanup();
  });

  test('query with since filter', async () => {
    const { backend, cleanup } = freshBackend();
    await backend.append({ skill: 'test', outcome: 'done', note: 'old' });
    await new Promise(r => setTimeout(r, 10));
    const later = await backend.append({ skill: 'test', outcome: 'done', note: 'new' });
    const results = await backend.query({ since: later.timestamp });
    expect(results.length).toBe(1);
    expect(results[0].note).toBe('new');
    cleanup();
  });
});
