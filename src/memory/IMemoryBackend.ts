export interface MemoryEntry {
  id: string;
  timestamp: string;
  skill: string;
  outcome: string;
  note: string;
  [key: string]: unknown;
}

export interface MemoryQuery {
  limit?: number;
  offset?: number;
  since?: string;
  before?: string;
  skills?: string[];
  sort?: 'asc' | 'desc';
}

export interface MemoryStats {
  total: number;
  oldest: string | null;
  newest: string | null;
  bySkill: Record<string, number>;
}

export interface IMemoryBackend {
  readonly name: string;
  append(fields: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<MemoryEntry>;
  query(query?: MemoryQuery): Promise<MemoryEntry[]>;
  get(id: string): Promise<MemoryEntry | null>;
  count(): Promise<number>;
  tail(n: number): Promise<MemoryEntry[]>;
  stats(): Promise<MemoryStats>;
  clear(): Promise<void>;
}
