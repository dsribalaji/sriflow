import { IMemoryBackend, MemoryEntry } from './IMemoryBackend';

export interface ConsolidationOptions {
  maxEntries?: number;
  maxAgeDays?: number;
  deduplicate?: boolean;
}

const DEFAULT_OPTIONS: ConsolidationOptions = {
  maxEntries: 1000,
  maxAgeDays: 90,
  deduplicate: true,
};

function sameEntry(a: MemoryEntry, b: MemoryEntry): boolean {
  return a.skill === b.skill
    && a.outcome === b.outcome
    && a.note === b.note;
}

export async function consolidate(
  backend: IMemoryBackend,
  options: ConsolidationOptions = {},
): Promise<{ removed: number; kept: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let entries = await backend.query({ sort: 'asc' });
  let removed = 0;

  if (opts.deduplicate && entries.length > 1) {
    const deduped: MemoryEntry[] = [];
    for (const entry of entries) {
      const isDuplicate = deduped.some(e => sameEntry(e, entry));
      if (!isDuplicate) deduped.push(entry);
      else removed++;
    }
    entries = deduped;
  }

  if (opts.maxAgeDays) {
    const cutoff = Date.now() - opts.maxAgeDays * 86400_000;
    const before = entries.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    removed += entries.length - before.length;
    entries = before;
  }

  if (opts.maxEntries && entries.length > opts.maxEntries) {
    const keep = entries.slice(-opts.maxEntries);
    removed += entries.length - keep.length;
    entries = keep;
  }

  await backend.clear();
  for (const entry of entries) {
    const line = JSON.stringify(entry);
    await Bun.write(
      `${process.env.HOME}/.sriflow/projects/${backend.name}`,
      line + '\n',
      { append: true },
    ).catch(() => {});
  }

  return { removed, kept: entries.length };
}
