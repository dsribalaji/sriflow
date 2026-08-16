# Backend: Consolidation

Concept doc for cross-session memory compaction. A `consolidate`
worker compacts memory across sessions to prevent "catastrophic
forgetting" — stale context crowding out what matters. sriflow-memory's
compression (`02-compression.md`) is the per-file form; consolidation is the
**cross-file** form.

## What consolidation does

Per-file compression collapses old rows inside one JSONL. Consolidation
collapses **themes across files**:

- Learnings that were promoted into decisions (the learning is now a
  resolved decision — the learning record is redundant).
- Eureka insights absorbed into a decision's rationale.
- Timeline events superseded by compression summaries.
- Instincts promoted into reusable patterns (see instinct-evolution.md).

## Trigger

Consolidation is **manual and user-initiated**, or triggered at reflect time
(sriflow-reflect runs it at the end of a cycle). It is never automatic in the
middle of a session — mid-session consolidation would destroy working context.

```bash
sriflow-memory consolidate
```

## Process

1. **Scan** all JSONL files in the project state dir.
2. **Group** records by theme: same `domain` + overlapping `related`/`id`
   references.
3. **Reduce** each theme:
   - Mark absorbed records `"superseded":true` rather than deleting (append
     rule, see `03-operational-rules.md`).
   - The surviving record gains a `consolidated_from` array listing the
     superseded ids.
4. **Summarize** per theme into a single current-state record written to the
   appropriate file (usually `learnings.jsonl` or `decisions.jsonl`).
5. **Log** a `timeline.jsonl` event with counts before/after.

## Output shape

```json
{"id":"L-050","ts":"2026-08-16T18:00:00Z","domain":"architecture",
 "learning":"Sync is the primitive; build the offline queue first",
 "consolidated_from":["L-042","E-003"],"supersedes":["L-041"],
 "source":"consolidation of 3 records","compressed":true,"original_count":3}
```

## Rules

1. Consolidation only marks `superseded:true` — it never hard-deletes.
   Records remain readable in history.
2. Open decisions and unresolved questions are never consolidated.
3. A theme needs ≥2 records to consolidate. Single records pass through.
4. Run at most once per reflect cycle. More frequent runs hide the trail.
5. The in-repo `SRIFLOW_MEMORY.md` log records the consolidation run with
   before/after counts, so the human trail stays legible.