import { IMemoryBackend, MemoryEntry, MemoryQuery, MemoryStats } from './IMemoryBackend';
import * as fs from 'fs';
import * as path from 'path';

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

export class JsonlMemoryBackend implements IMemoryBackend {
  readonly name: string;
  private filePath: string;

  constructor(name: string, stateDir: string) {
    this.name = name;
    this.filePath = path.join(stateDir, `${name}.jsonl`);
  }

  private ensureDir(): void {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
  }

  private readLines(): string[] {
    if (!fs.existsSync(this.filePath)) return [];
    const text = fs.readFileSync(this.filePath, 'utf-8');
    return text.split('\n').filter(l => l.trim().length > 0);
  }

  async append(fields: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<MemoryEntry> {
    this.ensureDir();
    const entry: MemoryEntry = {
      id: generateId(),
      timestamp: isoNow(),
      ...fields,
    } as MemoryEntry;
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.filePath, line, 'utf-8');
    return entry;
  }

  async query(query?: MemoryQuery): Promise<MemoryEntry[]> {
    const entries: MemoryEntry[] = this.readLines().map(l => {
      try { return JSON.parse(l) as MemoryEntry; }
      catch { return null; }
    }).filter(Boolean) as MemoryEntry[];

    let filtered = entries;
    if (query?.since) {
      filtered = filtered.filter(e => e.timestamp >= query.since!);
    }
    if (query?.before) {
      filtered = filtered.filter(e => e.timestamp < query.before!);
    }
    if (query?.skills && query.skills.length > 0) {
      filtered = filtered.filter(e => query.skills!.includes(e.skill));
    }
    if (query?.sort === 'asc') {
      filtered.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    } else {
      filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
    if (query?.offset) {
      filtered = filtered.slice(query.offset);
    }
    if (query?.limit) {
      filtered = filtered.slice(0, query.limit);
    }
    return filtered;
  }

  async get(id: string): Promise<MemoryEntry | null> {
    const entries = await this.query();
    return entries.find(e => e.id === id) ?? null;
  }

  async count(): Promise<number> {
    return this.readLines().length;
  }

  async tail(n: number): Promise<MemoryEntry[]> {
    const lines = this.readLines().slice(-n).reverse();
    return lines.map(l => {
      try { return JSON.parse(l) as MemoryEntry; }
      catch { return null; }
    }).filter(Boolean) as MemoryEntry[];
  }

  async stats(): Promise<MemoryStats> {
    const entries = await this.query({ sort: 'asc' });
    const bySkill: Record<string, number> = {};
    for (const e of entries) {
      bySkill[e.skill] = (bySkill[e.skill] || 0) + 1;
    }
    return {
      total: entries.length,
      oldest: entries.length > 0 ? entries[0].timestamp : null,
      newest: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
      bySkill,
    };
  }

  async clear(): Promise<void> {
    try { fs.unlinkSync(this.filePath); }
    catch {}
  }
}
