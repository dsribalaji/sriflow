# Compression Rules (Step 3 detail)

## 3a — Guard: size check for manual compress

If COMPRESS mode was triggered manually (not auto-triggered from Step 2e), check the entry count first:

```bash
_LOG_COUNT=$(grep -c "^### " SRIFLOW_MEMORY.md 2>/dev/null || echo 0)
echo "LOG_ENTRY_COUNT: $_LOG_COUNT"
```

**If `LOG_ENTRY_COUNT` <= 10:**

Tell the user: "Log has only `<count>` entries. Nothing to compress — minimum retained is 10." Stop.

**If `LOG_ENTRY_COUNT` between 11 and 50 (inclusive):**

Ask D1 — manual compress confirmation:

```
D1 — Compress memory now?
Branch: <_BRANCH>
ELI10: Your log has <count> entries, below the auto-trigger threshold of 50. Compressing
now summarises the oldest entries down to a prose paragraph and keeps the newest 10
verbatim. You permanently lose the raw detail of the summarised entries — they become
one paragraph, not individual timestamped lines.
Stakes if wrong: Compression is irreversible. If you later need to know exactly what
sriflow-build did on 2026-06-12, and that entry was compressed, you only have the
prose summary — not the original entry with its branch, session, and note.
Recommendation: B because the log is small enough that auto-compress will handle it
soon without any action needed.
Completeness: A=7/10, B=10/10
A) Compress now
  ✅ Reduces file size and token overhead immediately — helpful if context is tight.
  ✅ Promotes key decisions from old entries into the Summary section now.
  ❌ Irreversible — old entries become prose only, detail is lost permanently.
  ❌ Premature at <count> entries; the log is still small and readable.
B) Wait until threshold (recommended)
  ✅ Preserves full log detail for debugging and retrospective use this sprint.
  ✅ Auto-compress triggers cleanly at 50 with no extra action needed.
  ❌ File keeps growing; you will need to compress eventually.
Net: Trading raw log detail for token budget. With only <count> entries, the budget
impact is minimal — waiting costs nothing and preserves maximum detail.
```

If user answers A: proceed to Step 3b.
If user answers B: STOP. Report "Compression deferred. Auto-compress will trigger at 50 entries."

**If `LOG_ENTRY_COUNT` > 50 and manually triggered:** the preamble already showed `AUTO-COMPRESS TRIGGERED`. Skip D1, proceed directly to Step 3b.

**If auto-triggered from Step 2e:** always skip D1. Proceed directly to Step 3b.

## 3b — Read and split the log

Read the full `SRIFLOW_MEMORY.md` using the Read tool.

Locate the `## Log` section (or `## Log (newest 10)` if previously compressed). Within it, collect all entries — every block starting with `### `.

Split:
- **Oldest 40**: the first 40 `### ` blocks in order of appearance (top of the Log section to the 40th entry).
- **Newest 10**: the last 10 `### ` blocks in order of appearance (the 10 most recent entries).

If the total count is between 11 and 49 (manual compress confirmed): compress all entries older than the newest 10. "Oldest 40" becomes "all entries except the newest 10."

## 3c — Summarise the oldest 40

From the oldest 40 entries (or all-except-newest-10 if fewer than 50 total), extract and synthesise:

1. **Date range** — timestamp of the oldest entry (first `### ` line) to timestamp of the 40th entry (last entry being compressed).
2. **Skills that ran** and their frequency (count per skill name, e.g. "sriflow-build × 12").
3. **Outcomes distribution** across the compressed entries (e.g. "done: 8, done-with-concerns: 3, blocked: 1").
4. **Stage transitions** — any stage changes implied by outcomes (e.g. "moved plan → design after sriflow-design completed on 2026-06-01").
5. **Notable notes** — any entry note that mentions a decision, a blocker resolution, or a concrete milestone. Quoted verbatim if short, paraphrased if long.
6. **Blockers encountered** — any `blocked` entries and what they were blocked on (from the note line).

Write a 3-6 sentence prose paragraph in sriflow voice. Lead with the date range. Name skills, stages, and concrete outcomes. Do not use filler or generic summaries. Example:

> From 2026-05-10T09:00:00Z to 2026-06-15T17:42:07Z (40 entries across 36 days): planning dominated early (sriflow-plan × 6, sriflow-design × 9, all done), with the auth module scope locked by 2026-05-22. Building ran 18 cycles (sriflow-build × 18: done × 14, done-with-concerns × 3, blocked × 1) — the single block was a JWT refresh token edge case, resolved in the next cycle. Key note from 2026-05-22: "switched from Redis sessions to stateless JWT — decided against Redis to avoid infrastructure cost." Code review ran 7 times, 6 done and 1 done-with-concerns (SQL injection in user_lookup.ts — resolved in sriflow-build cycle on 2026-06-10). Stage advanced from init → plan → design → build across this period.

## 3d — Extract Key Decisions from compressed entries

Scan the notes of the compressed entries for phrases indicating a decision was made: "decided", "decision", "switched", "chose", "rejected", "opted for", "going with", "won't use". For each found, create a Key Decisions entry:

```
- D<N>: <decision statement in one line> (<date of that log entry>)
```

Append these to the existing `**Key Decisions:**` list in the Summary. Do not remove or modify prior decisions. If no decisions are found in the compressed entries, do not modify the Key Decisions field.

## 3e — Rewrite the file

Use the Write tool to rewrite `SRIFLOW_MEMORY.md` in full. See `reference/file-structure.md` for the complete post-compress template.

**Critical rules for the rewrite:**
- Preserve the project name from the original `# SRIFLOW_MEMORY —` header exactly.
- Preserve the `**Goal:**`, `**Stack:**`, and `**Current Stage:**` values exactly — do not infer or update them during compress.
- Preserve the 10 newest log entries verbatim — every line including Branch, Session, and note lines. Do not summarise or truncate them.
- `**Last Updated:**` is the only Summary field that changes to a new value (current time).
- The `**Lessons:**` field is only included if lessons were found. Do not add an empty Lessons field.
- The `## Log (newest 10)` header replaces `## Log` to make the compression state visible.

## 3f — Confirm compression

After rewriting, report:

```
MEMORY COMPRESSED
════════════════════════════════════════
Entries before compress:  <old LOG_ENTRY_COUNT>
Entries summarised:       <count of compressed entries>
Entries kept verbatim:    10
Decisions extracted:      <N new decisions added to Summary>
Date range compressed:    <oldest timestamp> to <newest compressed timestamp>
File:                     SRIFLOW_MEMORY.md
════════════════════════════════════════

Run /sriflow-memory to read the updated context.
```
