# 02 — Auto-Compression Rules

Auto-compression triggers when a JSONL file exceeds **50 entries**. The rule
(consolidation inspired): summarize the oldest 40, keep the
newest 10 verbatim.

## Trigger

After every append, check the count:

```bash
COUNT=$(wc -l < "$STATE_DIR/<file>.jsonl" 2>/dev/null || echo 0)
if [ "$COUNT" -gt 50 ]; then
  # run compression for this file
fi
```

Compression is per-file and synchronous. If multiple files exceed 50 in one
operation, compress them in this order: `learnings`, `decisions`,
`timeline`, then the rest.

## What happens

1. Take the oldest 40 records (everything except the last 10).
2. Summarize them into **one** synthetic record per logical group:
   - `learnings.jsonl` → group by `domain` tag
   - `decisions.jsonl` → group by `status` (resolved/outcome only; open
     decisions are NEVER compressed)
   - `timeline.jsonl` → one record per day (event summaries)
   - others → one summary record per file
3. The summary record is prefixed with the oldest and newest `ts` it covers
   and carries `"compressed": true, "original_count": N`.
4. The last 10 entries stay verbatim. Append the summary records; truncate
   the file to (summaries + 10).

## Compression summary record shape

```json
{"id":"C-001","ts":"2026-08-16T00:00:00Z","compressed":true,
 "original_count":38,"span_start":"2026-06-01T00:00:00Z",
 "span_end":"2026-08-10T00:00:00Z","domain":"testing",
 "summary":"12 learnings on vitest mocking; 3 on CI flakiness",
 "key_points":["mock fetch at the boundary","retry flaky e2e once"]}
```

## What is never compressed

- **Open decisions** (`status != resolved`) — compressing these destroys
  active context.
- **Unresolved questions** in `questions.jsonl`.
- **The last 10 entries** of any file — recent context stays exact.
- **context.json** — it's a single object, not a JSONL; it has no
  compression, only overwrite.

## Rules

1. Compression is lossy by design but never silent: every compressed file
   keeps the summary records, never a bare truncation.
2. If the file has 51-60 entries, compress oldest to reach ≤ 11 records
   (summaries + 10 verbatim). Never compress to zero verbatim entries.
3. After compression, log a `timeline.jsonl` event:
   `{"event":"compression","file":"learnings.jsonl","before":52,"after":11}`.
4. Compression must never produce a file with a record that lacks a `ts`.

## Off-switch

`preferences.jsonl` may carry `{"compression":"off"}` per project. When set,
the skill warns at >100 entries instead of compressing, and the user decides.