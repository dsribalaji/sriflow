# Backend: Vector Search

Concept doc for the **future** search backend. Today sriflow-memory searches
JSONL via tags and line filters. The AgentDB pattern (HNSW vector
index over embedded memory) is the documented upgrade path.

## Current state: tag-based search

Until a vector backend ships, search is deterministic:

- Every record that benefits from retrieval carries a `domain` or `tags`
  field (`testing`, `architecture`, `python`, ...).
- Searches filter by tag + time range + full-text substring, newest first.
- Learnings search: `sriflow-learnings search "retry flaky"` matches `domain`
  and the `learning` text.

## Target state: HNSW over JSONL embeddings

The AgentDB pattern keeps vector indexes over memory and routes queries
semantically. The equivalent for sriflow-memory:

1. **Embed at write.** On append, embed the record's text fields into a
   vector and store alongside (or in a sidecar index).
2. **Index structure.** HNSW graph in the state dir:
   `~/.sriflow/projects/<slug>/.index/` — not in a JSONL file.
3. **Query flow.** Semantic query → HNSW top-k → re-rank by tag filter →
   return records with their `ts` intact.
4. **Dataset guidance** (from benchmarks): under ~500 vectors, brute
   force cosine is fine (perfect recall); 500-50K use HNSW; beyond that,
   disk-backed vectors. sriflow projects live in the first two bands.

## What stays true regardless of backend

- The JSONL files remain the **source of truth**. An index is derived data
  and can be rebuilt from scratch (`sriflow-memory rebuild-index`).
- Records are never deleted because an index lost them.
- Compression (`02-compression.md`) re-embeds the summary records; verbatim
  entries keep their original embeddings.

## Enabling (future)

- Opt-in per project via `preferences.jsonl`:
  `{"key":"vector_search","value":"on","backend":"hnsw"}`.
- Requires an embedding provider; records embed lazily on next read if the
  index is stale.
- Until the backend ships, the CLI exposes the same query interface over
  tag search so callers don't change.

## Rules

1. No vector search without the user opting in — it adds a dependency
   (embedding provider) and sriflow-memory stays dependency-free by default.
2. Index rebuild must be reproducible from JSONL alone.
3. Semantic search is a supplement: tag search must keep working so the
   system degrades gracefully without embeddings.