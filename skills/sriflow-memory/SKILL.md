---
name: sriflow-memory
preamble-tier: 1
version: 2.0.0
description: Per-project memory — append log, auto-compress at 50 entries. READ/WRITE/COMPRESS modes. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - AskUserQuestion
triggers:
  - save context
  - remember this
  - update memory
  - read memory
  - what's our context
  - /sriflow-memory
---

## When to invoke this skill

Manages `SRIFLOW_MEMORY.md` in the project root. Three modes:

- **READ** — surface current context: goal, stack, stage, last 10 log entries, 2-sentence summary, suggested next skill.
- **WRITE** — append a structured log entry and update Summary metadata. Auto-triggered by every other sriflow skill on completion.
- **COMPRESS** — summarise the oldest 40 log entries into the Summary section, keep the newest 10 verbatim. Auto-triggers when the log exceeds 50 entries; skips confirmation prompt when auto-triggered.

Call directly as `/sriflow-memory` (READ), `/sriflow-memory write "<note>"` (WRITE), or `/sriflow-memory compress` (COMPRESS). All other sriflow skills invoke WRITE mode on completion via the calling pattern defined in Step 5.

This is the memory backbone of the sriflow stack. Without it, every session starts cold — no goal, no stack, no history of what worked and what didn't. With it, any session can resume in under 30 seconds.

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH | SESSION_ID: $_SESSION_ID"

_MEMORY_EXISTS=false
_LOG_COUNT=0
if [ -f "SRIFLOW_MEMORY.md" ]; then
  _MEMORY_EXISTS=true
  _LOG_COUNT=$(grep -c "^### " SRIFLOW_MEMORY.md 2>/dev/null || echo "0")
fi
echo "MEMORY_EXISTS: $_MEMORY_EXISTS | LOG_ENTRIES: $_LOG_COUNT"

if $_MEMORY_EXISTS && [ "$_LOG_COUNT" -gt 50 ]; then
  echo "AUTO-COMPRESS TRIGGERED: $_LOG_COUNT entries > 50 threshold"
fi

# Plan-mode detection
if [ -n "${SRIFLOW_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
elif [ "${SRIFLOW_PLAN_MODE:-}" = "active" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="inactive"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# Word-count warning for oversized memory files
if [ -f "SRIFLOW_MEMORY.md" ]; then
  _WORD_COUNT=$(wc -w < "SRIFLOW_MEMORY.md" 2>/dev/null | tr -d ' ')
  echo "MEMORY_WORDS: $_WORD_COUNT"
  if [ "$_WORD_COUNT" -gt 10000 ] 2>/dev/null; then
    echo "MEMORY_WARNING: file is large ($_WORD_COUNT words) — run /sriflow-memory compress to reduce token overhead"
  fi
fi
```

Preamble output keys and how to read them:

| Key | Meaning |
|---|---|
| `MEMORY_EXISTS: true` | `SRIFLOW_MEMORY.md` found in the project root |
| `LOG_ENTRIES: N` | Number of `### ` header lines counted in the file |
| `AUTO-COMPRESS TRIGGERED` | Log exceeded 50 entries — skip to COMPRESS mode, no D1 prompt |
| `MEMORY_WARNING` | File exceeds 10,000 words — surface warning after any operation |
| `SESSION_KIND: interactive` | Normal user session — AskUserQuestion is available |
| `SESSION_KIND: spawned` | Called from another AI session — auto-choose recommended options, no prompts |

## Plan Mode Safe Operations

In plan mode: `Bash` (read-only commands), `Read`, `Grep`, and writes to `SRIFLOW_MEMORY.md` are allowed. No git mutations, no code changes, no file deletions.

If `SRIFLOW_PLAN_MODE` is `"active"`: run READ mode only. Do not append log entries or compress in plan mode unless the user explicitly requests it and confirms via AskUserQuestion.

## Skill Invocation During Plan Mode

If invoked in plan mode, this skill takes precedence over generic plan mode behavior. Follow steps sequentially starting from Step 0. AskUserQuestion satisfies plan mode's end-of-turn requirement. At a STOP point, stop immediately. Call ExitPlanMode only after the skill workflow completes, or if the user cancels.

## AskUserQuestion Format

Every AskUserQuestion is a decision brief. Format strictly as:

```
D<N> — <one-line question title>
Branch: <_BRANCH>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks or is lost>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option>
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
Net: <one-line synthesis of what you're actually trading off>
```

D-numbering: first question in this skill invocation is `D1`; increment per question. This is a model-level instruction.

ELI10 is always present, in plain English. Recommendation is always present with a concrete reason. `(recommended)` appears on exactly one option per question.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut). When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

If AskUserQuestion is unavailable: render as prose with the mandatory triad (ELI10, per-choice completeness, recommendation + `(recommended)` marker), then STOP and wait for typed reply.

If `SESSION_KIND: spawned`: skip AskUserQuestion entirely. Auto-choose the recommended option and log the decision as a one-line note.

## Voice

SriFlow voice: direct, builder-to-builder, compressed for runtime.

- Lead with the point. What it does, why it matters, what changes.
- Be concrete: file names, timestamps, skill names, outcome counts, real numbers.
- Never corporate, academic, or hype. No filler, no throat-clearing.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted, furthermore, moreover, pivotal.
- The user decides. Cross-model agreement is a recommendation, not a decision.
- Sound like a builder talking to a builder, not a consultant writing a status update.

Good: "Log has 52 entries — compressing oldest 40. Kept: 10. Stage: build. Next: /sriflow-code-review."
Bad: "I've identified that the memory file has accumulated a comprehensive set of log entries that may benefit from compression."

## Completeness Principle

Do the complete thing. The only out-of-scope is genuinely unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence (file written, entry count, stage).
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  head -60 SRIFLOW_MEMORY.md
  echo "..."
  echo "=== RECENT LOG ENTRIES ==="
  grep -n "^### " SRIFLOW_MEMORY.md | tail -10
  echo "=== END CONTEXT ==="
else
  echo "NO_MEMORY_FILE"
fi
```

If memory found: give a 2-sentence welcome-back summary from the Summary section. If the current stage implies a next skill (see Step 1b table), suggest it once in one line.

## Confusion Protocol

For high-stakes ambiguity (would overwrite existing memory, unknown project name, destructive scope): STOP. Name the ambiguity in one sentence. Present 2-3 options with tradeoffs. Ask. Do not use for routine reads or routine log appends — those are never ambiguous.

---

# /sriflow-memory — Memory System

You are a **context management engineer** ensuring no sriflow session ever starts cold. Your job is to maintain `SRIFLOW_MEMORY.md` — the persistent project brain that every skill reads on startup and writes on completion.

The design goal: after reading `SRIFLOW_MEMORY.md`, any session should know in 30 seconds what we're building, where we are in the pipeline, what decisions we've made, and what to do next. If the file doesn't give that, something is wrong with how it was last written.

**HARD GATE:** This skill only reads and writes `SRIFLOW_MEMORY.md`. It does not implement code changes, run builds, trigger git commits, or touch any file other than `SRIFLOW_MEMORY.md`.

---

## SRIFLOW_MEMORY.md File Structure

The canonical structure of a healthy `SRIFLOW_MEMORY.md` before any compression:

```markdown
# SRIFLOW_MEMORY — <project name>

## Summary
**Goal:** <the current build goal, one concrete sentence>
**Stack:** <detected or stated tech stack, e.g. "Next.js 14 + Postgres + Vercel">
**Current Stage:** <one of: init | plan | design | build | review | test | ship>
**Last Updated:** <ISO-8601 UTC timestamp, e.g. 2026-06-28T14:32:07Z>
**Key Decisions:**
- D1: <decision and its outcome, with date>
- D2: <decision and its outcome, with date>

**Next Priority:** <the most important thing to do next session, in one line>

## Log
### 2026-06-10T09:15:22Z | sriflow-plan | done | 312s
Branch: main
Session: 45231-1749547822
Completed BA phases 1-4. Auth module scope locked. Postgres chosen over SQLite.

### 2026-06-11T11:03:07Z | sriflow-design | done | 540s
Branch: feat/auth
Session: 45232-1749634987
Wireframes approved. Component spec written to DESIGN.md.

### 2026-06-12T16:22:44Z | sriflow-build | done-with-concerns | 1203s
Branch: feat/auth
Session: 45233-1749742964
JWT auth implemented. Refresh token rotation works. SQL injection concern raised by code review.
```

The `## Log` section is append-only. Newest entries at the bottom. Each entry begins with `### ` followed by the four required fields separated by ` | `.

After compression, a `**Compressed History:**` field appears in Summary and the Log section header becomes `## Log (newest 10)`. See Step 3e for the full post-compress structure.

---

## Step 0 — Detect mode

Parse the user's invocation and preamble output to determine which mode to run:

**WRITE mode** — triggered by any of:
- Another sriflow skill called this skill on its completion (most common path — the calling skill passes `skill | outcome | duration | note` in its invocation).
- User says "save context", "remember this", "update memory", "log this", or passes `/sriflow-memory write "<note>"`.
- `MEMORY_EXISTS: false` and no explicit mode signal → first-time init, then WRITE the first entry.

**READ mode** — triggered by any of:
- User says `/sriflow-memory`, "read memory", "what's our context", "where were we", "what was I doing", "restore context", "what's the current goal".
- Preamble shows `MEMORY_EXISTS: true` and the context indicates a new session starting (no calling skill, no note to write).

**COMPRESS mode** — triggered by any of:
- User says `/sriflow-memory compress`, "compress memory", "shrink memory".
- Preamble shows `AUTO-COMPRESS TRIGGERED` (log count > 50). In this case, auto-compress skips the D1 confirmation AskUserQuestion entirely.

**Ambiguous**: if mode cannot be determined from context and preamble, default to READ if `MEMORY_EXISTS: true`, WRITE (init) if `MEMORY_EXISTS: false`.

---

## Step 1 — READ mode

### 1a — Check memory exists

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY_FOUND"
else
  echo "NO_MEMORY_FILE"
fi
```

If `NO_MEMORY_FILE`: output the following and stop. Do not create the file in READ mode — creation happens only in WRITE mode.

```
No memory yet. Starting fresh.

Run /sriflow-plan to begin, or say "save context" after your first session to
create SRIFLOW_MEMORY.md with your goal and stack.
```

### 1b — Read and surface the full file

Read `SRIFLOW_MEMORY.md` using the Read tool (not bash cat — the Read tool is preferred for file access).

Surface content in this order:

**1. Show the full Summary section verbatim.** Every field: Goal, Stack, Current Stage, Last Updated, Key Decisions, Compressed History (if present), Lessons (if present), Next Priority.

**2. Show the last 10 log entries verbatim**, newest last (same order as in the file). If the file has a `## Log (newest 10)` section (post-compress), show all entries in that section. If the log has fewer than 10 entries, show all of them.

**3. Output a 2-sentence context summary** in this exact format:

```
Current goal: <Goal value>. Last action: <skill-name> — <outcome> on <date from the last log entry's timestamp, formatted as YYYY-MM-DD>.
```

Example:
```
Current goal: Build JWT auth with refresh token rotation for the user API. Last action: sriflow-build — done-with-concerns on 2026-06-12.
```

**4. Suggest the next skill** based on Current Stage:

| Current Stage | Suggested Next Skill | Trigger Condition |
|---|---|---|
| `init` | `/sriflow-plan` | No planning done yet |
| `plan` | `/sriflow-design` | Plan complete, need wireframes |
| `design` | `/sriflow-build` | Design locked, ready to build |
| `build` | `/sriflow-code-review` | Build complete, need review |
| `review` | `/sriflow-test` | Review passed, need QA |
| `test` | Consult `/sriflow` front door | Tests green, ready to ship |
| `ship` | `/sriflow-reflect` | Shipped, run retrospective |
| `unknown` | `/sriflow-plan` | State unclear, start over |

Output the suggestion as: "Current stage is `<stage>` — suggested next: `/<skill>`."

Only suggest once. If the last log entry's outcome is `blocked`, add: "Last action was blocked — resolve the blocker before advancing stage."

### 1c — Token budget warning

If the preamble echoed `MEMORY_WARNING`, surface it now as a standalone line:

```
Memory growing large — run /sriflow-memory compress to reduce token overhead.
```

---

## Step 2 — WRITE mode

### 2a — Create file if missing (first-time init)

If `MEMORY_EXISTS: false`, detect the project name:

```bash
_PROJECT=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || basename "$PWD")
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "PROJECT: $_PROJECT"
echo "TIMESTAMP: $_TIMESTAMP"
```

Use the Write tool to create `SRIFLOW_MEMORY.md` with the initial template. Fill in the `_PROJECT` and `_TIMESTAMP` values from the bash output above. Do not use placeholders — use the actual detected values:

```markdown
# SRIFLOW_MEMORY — <project name from _PROJECT>

## Summary
**Goal:** <to be updated>
**Stack:** <to be detected>
**Current Stage:** init
**Last Updated:** <timestamp from _TIMESTAMP>
**Key Decisions:**

**Next Priority:** Run /sriflow-plan to begin.

## Log
```

After writing the initial file, `MEMORY_EXISTS` is now effectively `true`. Continue to Step 2b to append the first log entry.

### 2b — Collect entry fields

Before writing a log entry, determine all four required fields. All four are mandatory. None can be omitted.

**Field 1: timestamp**

```bash
_ENTRY_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "ENTRY_TIMESTAMP: $_ENTRY_TIMESTAMP"
```

**Field 2: skill-name**

The name of the skill that triggered this WRITE. Use the exact `name:` value from that skill's frontmatter (e.g. `sriflow-build`, `sriflow-design`, `sriflow-plan`). If called directly by the user (not from another skill), use `sriflow-memory`.

**Field 3: outcome**

One of exactly four values: `done` / `done-with-concerns` / `blocked` / `needs-context`.

Map the calling skill's completion status:
- Skill reported DONE → `done`
- Skill reported DONE_WITH_CONCERNS → `done-with-concerns`
- Skill reported BLOCKED → `blocked`
- Skill reported NEEDS_CONTEXT → `needs-context`
- Any other status → map to the nearest of these four; prefer `done-with-concerns` when uncertain.

**Field 4: duration**

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
echo "DURATION_SECONDS: $_TEL_DUR"
```

`_TEL_START` was set in the preamble. If the calling skill passed its own duration, use that value instead of recomputing. If duration is unknown for any reason, write `0`.

**Field 5 (optional): note**

A one-line description of what happened this run. If called from another skill, use that skill's outcome summary sentence. If the user passed a note via `/sriflow-memory write "<note>"`, use their note verbatim — do not paraphrase. If no note is available, omit the line entirely (do not write an empty note line).

### 2c — Append log entry

Use the Edit tool to append the new entry to the end of `SRIFLOW_MEMORY.md`. Target the `old_string` as the last line in the file or the last existing log entry. Append after it.

The entry format, exactly:

```
### <ENTRY_TIMESTAMP> | <skill-name> | <outcome> | <DURATION_SECONDS>s
Branch: <_BRANCH>
Session: <_SESSION_ID>
<optional note — only include this line if a note is available>
```

A blank line separates this entry from the previous one. Do not add a trailing blank line after the new entry.

Concrete example with all fields:

```
### 2026-06-28T14:32:07Z | sriflow-build | done | 847s
Branch: feat/auth-flow
Session: 12345-1751118727
Implemented JWT auth + refresh token rotation. All 47 tests green.
```

Concrete example without optional note:

```
### 2026-06-28T14:33:51Z | sriflow-memory | done | 12s
Branch: feat/auth-flow
Session: 12346-1751118831
```

### 2d — Update Summary metadata

After appending the log entry, use the Edit tool to update the `## Summary` section. Update only these fields — leave all others unchanged:

**`**Last Updated:**`** — always update to the `_ENTRY_TIMESTAMP` from Step 2b.

**`**Current Stage:**`** — update if the calling skill implies a stage transition:

| Calling skill | New stage (if outcome is `done`) |
|---|---|
| `sriflow-plan` | `plan` |
| `sriflow-design` | `design` |
| `sriflow-build` | `build` |
| `sriflow-code-review` | `review` |
| `sriflow-test` | `test` |
| `sriflow-reflect` | `ship` |

If the calling skill's outcome is `blocked` or `needs-context`: do NOT advance the stage. Keep it unchanged.

If the skill was `sriflow-memory` (called directly): do not change the stage.

**`**Next Priority:**`** — if the calling skill's note contains a carry-forward action (e.g. "Next: fix the SQL injection in user_lookup.ts"), update this field with that action. Otherwise leave it unchanged.

Do not modify `**Goal:**`, `**Stack:**`, `**Key Decisions:**`, or `**Compressed History:**` in WRITE mode. Those are only updated during COMPRESS, or by the user explicitly via a "remember this" invocation where the user states a new goal or decision.

**Special case — user states a new goal or decision:**

If the user said "remember this" or "save context" and their message contains a new goal statement (e.g. "remember: we're switching to GraphQL") or a new decision, update the relevant Summary field directly:

- New goal statement → update `**Goal:**`
- New decision → append to `**Key Decisions:**` as `- D<N+1>: <decision> (<today's date>)`
- New stack info → update `**Stack:**`

### 2e — Auto-compress check

After writing the entry and updating Summary, recount log entries:

```bash
_NEW_LOG_COUNT=$(grep -c "^### " SRIFLOW_MEMORY.md 2>/dev/null || echo 0)
echo "UPDATED_LOG_ENTRIES: $_NEW_LOG_COUNT"
```

If `UPDATED_LOG_ENTRIES` > 50: proceed immediately to COMPRESS mode (Step 3). This is auto-compress — skip D1 entirely, go directly to Step 3b.

### 2f — Confirm write (only if compress was NOT triggered)

If `UPDATED_LOG_ENTRIES` <= 50, report:

```
MEMORY UPDATED
════════════════════════════════════════
Skill:    <skill-name>
Outcome:  <outcome>
Stage:    <current stage after update>
Entries:  <UPDATED_LOG_ENTRIES>
File:     SRIFLOW_MEMORY.md
════════════════════════════════════════
```

---

## Step 3 — COMPRESS mode

### 3a — Guard: size check for manual compress

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

### 3b — Read and split the log

Read the full `SRIFLOW_MEMORY.md` using the Read tool.

Locate the `## Log` section (or `## Log (newest 10)` if previously compressed). Within it, collect all entries — every block starting with `### `.

Split:
- **Oldest 40**: the first 40 `### ` blocks in order of appearance (top of the Log section to the 40th entry).
- **Newest 10**: the last 10 `### ` blocks in order of appearance (the 10 most recent entries).

If the total count is between 11 and 49 (manual compress confirmed): compress all entries older than the newest 10. "Oldest 40" becomes "all entries except the newest 10."

### 3c — Summarise the oldest 40

From the oldest 40 entries (or all-except-newest-10 if fewer than 50 total), extract and synthesise:

1. **Date range** — timestamp of the oldest entry (first `### ` line) to timestamp of the 40th entry (last entry being compressed).
2. **Skills that ran** and their frequency (count per skill name, e.g. "sriflow-build × 12").
3. **Outcomes distribution** across the compressed entries (e.g. "done: 8, done-with-concerns: 3, blocked: 1").
4. **Stage transitions** — any stage changes implied by outcomes (e.g. "moved plan → design after sriflow-design completed on 2026-06-01").
5. **Notable notes** — any entry note that mentions a decision, a blocker resolution, or a concrete milestone. Quoted verbatim if short, paraphrased if long.
6. **Blockers encountered** — any `blocked` entries and what they were blocked on (from the note line).

Write a 3-6 sentence prose paragraph in sriflow voice. Lead with the date range. Name skills, stages, and concrete outcomes. Do not use filler or generic summaries. Example:

> From 2026-05-10T09:00:00Z to 2026-06-15T17:42:07Z (40 entries across 36 days): planning dominated early (sriflow-plan × 6, sriflow-design × 9, all done), with the auth module scope locked by 2026-05-22. Building ran 18 cycles (sriflow-build × 18: done × 14, done-with-concerns × 3, blocked × 1) — the single block was a JWT refresh token edge case, resolved in the next cycle. Key note from 2026-05-22: "switched from Redis sessions to stateless JWT — decided against Redis to avoid infrastructure cost." Code review ran 7 times, 6 done and 1 done-with-concerns (SQL injection in user_lookup.ts — resolved in sriflow-build cycle on 2026-06-10). Stage advanced from init → plan → design → build across this period.

### 3d — Extract Key Decisions from compressed entries

Scan the notes of the compressed entries for phrases indicating a decision was made: "decided", "decision", "switched", "chose", "rejected", "opted for", "going with", "won't use". For each found, create a Key Decisions entry:

```
- D<N>: <decision statement in one line> (<date of that log entry>)
```

Append these to the existing `**Key Decisions:**` list in the Summary. Do not remove or modify prior decisions. If no decisions are found in the compressed entries, do not modify the Key Decisions field.

### 3e — Rewrite the file

Use the Write tool to rewrite `SRIFLOW_MEMORY.md` in full. The complete post-compress structure:

```markdown
# SRIFLOW_MEMORY — <project name from original header>

## Summary
**Goal:** <preserve from original — do not change>
**Stack:** <preserve from original — do not change>
**Current Stage:** <preserve from original — do not change>
**Last Updated:** <current UTC timestamp from date -u +%Y-%m-%dT%H:%M:%SZ>
**Key Decisions:**
<all prior Key Decisions entries>
<any new decisions extracted in Step 3d, appended>

**Compressed History:** <timestamp of oldest compressed entry> to <timestamp of newest compressed entry>
<the 3-6 sentence prose summary from Step 3c>

**Lessons:** <any lessons extracted from entry notes — omit this entire line/field if none found>
**Next Priority:** <preserve from original, or update if the compressed entries reveal a clearer next action>

## Log (newest 10)
### <timestamp> | <skill-name> | <outcome> | <duration>s
Branch: <branch>
Session: <session-id>
<optional note>

### <timestamp> | <skill-name> | <outcome> | <duration>s
Branch: <branch>
Session: <session-id>
<optional note>

<... 10 entries total, verbatim from the original file>
```

**Critical rules for the rewrite:**
- Preserve the project name from the original `# SRIFLOW_MEMORY —` header exactly.
- Preserve the `**Goal:**`, `**Stack:**`, and `**Current Stage:**` values exactly — do not infer or update them during compress.
- Preserve the 10 newest log entries verbatim — every line including Branch, Session, and note lines. Do not summarise or truncate them.
- `**Last Updated:**` is the only Summary field that changes to a new value (current time).
- The `**Lessons:**` field is only included if lessons were found. Do not add an empty Lessons field.
- The `## Log (newest 10)` header replaces `## Log` to make the compression state visible.

### 3f — Confirm compression

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

---

## Step 4 — Token budget warning (all modes)

After any operation completes, if the preamble echoed `MEMORY_WARNING`, surface it:

```
Memory growing large — run /sriflow-memory compress to reduce token overhead.
```

This fires after READ, WRITE, or COMPRESS. After a COMPRESS run that still leaves the file large (unusual — can happen with very long entry notes), also add: "Consider shortening future log entry notes to one line each."

---

## Step 5 — How other sriflow skills invoke WRITE mode

Every sriflow skill calls `/sriflow-memory` on its completion. The calling convention:

**Invocation pattern from another skill:**

The calling skill passes a single string argument to `/sriflow-memory write` with this format:

```
/sriflow-memory write "<skill-name> | <outcome> | <duration>s | <one-line note>"
```

Example from sriflow-build:

```
/sriflow-memory write "sriflow-build | done | 847s | JWT auth complete, refresh token rotation working, all 47 tests green"
```

Example from sriflow-plan when blocked:

```
/sriflow-memory write "sriflow-plan | blocked | 203s | Blocked on missing stakeholder requirements for payment module — awaiting input"
```

**What sriflow-memory does with this invocation:**

1. Parses the four pipe-separated fields: skill-name, outcome, duration, note.
2. Runs Step 2b using those values (skipping the duration bash computation — uses the passed duration directly).
3. Runs Steps 2c, 2d, 2e as normal.
4. Reports the MEMORY UPDATED confirmation block.

**Calling skill responsibility:**

The calling skill is responsible for:
- Computing its own duration (`_TEL_END - _TEL_START` in seconds).
- Mapping its completion status to one of the four outcome values.
- Writing a one-line note that captures what it actually did or why it was blocked.

The calling skill is NOT responsible for:
- Reading `SRIFLOW_MEMORY.md` before writing.
- Checking whether compress is needed (sriflow-memory handles this).
- Updating the Summary section (sriflow-memory handles this).

**Stage transition responsibility:**

Only sriflow-memory updates `**Current Stage:**` in the Summary. The calling skill never modifies that field directly. The stage table in Step 2d defines the transitions.

---

## Step 6 — Suggest next skill (all modes)

After READ or after any WRITE that did not trigger auto-compress: if the current stage implies a next skill, suggest it once in one line. Use the table from Step 1b.

After auto-compress: do not suggest a next skill. The compress confirmation block is the terminal output.

After manual compress confirmed and run: output the Step 3f confirmation, then suggest the next skill based on current stage.

---

## Initial template (reference)

The exact file written on first creation in Step 2a. No deviations — use this exact structure:

```markdown
# SRIFLOW_MEMORY — <project name>

## Summary
**Goal:** <to be updated>
**Stack:** <to be detected>
**Current Stage:** init
**Last Updated:** <ISO-8601 UTC timestamp>
**Key Decisions:**

**Next Priority:** Run /sriflow-plan to begin.

## Log
```

The `## Log` section is intentionally left empty (no entries) at creation. The first log entry is appended immediately in Step 2c. The blank line after `## Log` is required — it gives the Edit tool a clean target for the first append.

---

## Post-compress structure (reference)

The canonical structure after a successful COMPRESS run. Use this as the exact Write template in Step 3e:

```markdown
# SRIFLOW_MEMORY — <project name>

## Summary
**Goal:** <preserved from pre-compress — not changed>
**Stack:** <preserved from pre-compress — not changed>
**Current Stage:** <preserved from pre-compress — not changed>
**Last Updated:** <current UTC timestamp at time of compress>
**Key Decisions:**
- D1: <prior decision — preserved verbatim>
- D2: <prior decision — preserved verbatim>
- D3: <new decision extracted during compress — appended>

**Compressed History:** 2026-05-10T09:00:00Z to 2026-06-15T17:42:07Z
From 2026-05-10 to 2026-06-15 (40 entries): <prose summary from Step 3c>.

**Lessons:** <lessons extracted from notes — omit this field entirely if none>
**Next Priority:** <preserved or updated carry-forward action>

## Log (newest 10)
### 2026-06-16T08:11:02Z | sriflow-build | done | 1023s
Branch: feat/payments
Session: 45265-1750057862
Payment module scaffolded. Stripe webhook endpoint tested locally.

### 2026-06-16T14:30:07Z | sriflow-code-review | done-with-concerns | 318s
Branch: feat/payments
Session: 45266-1750078207
Two concerns: missing idempotency key on Stripe charge, rate limiting not implemented.

<... 8 more entries following the same structure>
```

---

## Important Rules

**Operational constraints:**
- **Never modify code.** This skill only reads and writes `SRIFLOW_MEMORY.md`.
- **Log is append-only under normal operation.** Only COMPRESS mode removes entries. COMPRESS always preserves the newest 10.
- **Threshold is 50 log entries.** Count `### ` lines in the Log section only — not in Compressed History prose. The `### ` in a prose paragraph does not count.
- **Auto-compress never prompts.** When triggered from Step 2e (log count exceeded 50 after a write), skip D1 and proceed directly to Step 3b.
- **Manual compress asks D1 when log is between 11 and 50 entries.** Skip D1 only when the preamble already showed `AUTO-COMPRESS TRIGGERED`.

**Data integrity:**
- **Always update `**Last Updated:**` in Summary** after any write to the Log section.
- **Outcome vocabulary is fixed.** Only four valid values: `done`, `done-with-concerns`, `blocked`, `needs-context`. Any other status from a calling skill must be mapped to one of these four before writing.
- **Duration is always in seconds and always present.** If unknown, write `0`. Never omit the duration field or write `Ns` with non-numeric N.
- **Branch and Session are required in every log entry.** Even if running in a non-git directory, write `Branch: unknown` and the `_SESSION_ID` from the preamble.
- **Note line is optional but when present must be exactly one line.** Multi-line notes must be collapsed to one line before writing. Never write a blank note line.

**Inference rules:**
- **Infer, don't interrogate.** Use preamble output and conversation context to fill entry fields. Only use AskUserQuestion when D1 is explicitly required (manual compress, entry count 11-50) or when mode genuinely cannot be determined from any available signal.
- **In spawned sessions:** skip all AskUserQuestion prompts. Auto-choose the recommended option and log the auto-decision as a one-line note.

**Token management:**
- **Word count warning at 10,000 words.** `MEMORY_WORDS` is computed in the preamble. Surface the warning after any operation if it appeared.
- **First priority after a READ that shows MEMORY_WARNING:** suggest compress before suggesting the next pipeline skill.
