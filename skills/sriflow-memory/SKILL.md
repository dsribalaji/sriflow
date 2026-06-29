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

## When to invoke

Manages `SRIFLOW_MEMORY.md`. Three modes:
- **READ** — surface context: goal, stack, stage, last 10 entries, suggested next skill.
- **WRITE** — append log entry, update Summary. Auto-triggered by every sriflow skill on completion.
- **COMPRESS** — summarise oldest 40 entries, keep newest 10. Auto-triggers at >50; skips D1 when auto-triggered.
Call: `/sriflow-memory` (READ), `/sriflow-memory write "<note>"` (WRITE), `/sriflow-memory compress` (COMPRESS).

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"; _TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH | SESSION_ID: $_SESSION_ID"
_MEMORY_EXISTS=false; _LOG_COUNT=0
if [ -f "SRIFLOW_MEMORY.md" ]; then _MEMORY_EXISTS=true; _LOG_COUNT=$(grep -c "^### " SRIFLOW_MEMORY.md 2>/dev/null || echo "0"); fi
echo "MEMORY_EXISTS: $_MEMORY_EXISTS | LOG_ENTRIES: $_LOG_COUNT"
if $_MEMORY_EXISTS && [ "$_LOG_COUNT" -gt 50 ]; then echo "AUTO-COMPRESS TRIGGERED: $_LOG_COUNT entries > 50 threshold"; fi
if [ -n "${SRIFLOW_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then export SRIFLOW_PLAN_MODE="active"; elif [ "${SRIFLOW_PLAN_MODE:-}" = "active" ]; then export SRIFLOW_PLAN_MODE="active"; else export SRIFLOW_PLAN_MODE="inactive"; fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"
_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"; echo "SESSION_KIND: $_SESSION_KIND"
if [ -f "SRIFLOW_MEMORY.md" ]; then _WORD_COUNT=$(wc -w < "SRIFLOW_MEMORY.md" 2>/dev/null | tr -d ' '); echo "MEMORY_WORDS: $_WORD_COUNT"; if [ "$_WORD_COUNT" -gt 10000 ] 2>/dev/null; then echo "MEMORY_WARNING: file is large ($_WORD_COUNT words) — run /sriflow-memory compress"; fi; fi
```

| Key | Meaning |
|---|---|
| `MEMORY_EXISTS: true` | File found |
| `LOG_ENTRIES: N` | `### ` header lines |
| `AUTO-COMPRESS TRIGGERED` | >50 entries — skip to COMPRESS |
| `MEMORY_WARNING` | >10,000 words |
| `SESSION_KIND: spawned` | Auto-choose, no prompts |

## Voice & Mode Detection

Direct, builder-to-builder, compressed. Lead with the point. No filler, no corporate, no AI vocabulary, no em dashes.
**WRITE**: another skill calls this (passes `skill | outcome | duration | note`), user says "save context"/"remember this"/"log this", or `MEMORY_EXISTS: false`. **READ**: user says `/sriflow-memory`/"read memory"/"what's our context", or `MEMORY_EXISTS: true` with new session context. **COMPRESS**: user says compress, or `AUTO-COMPRESS TRIGGERED` (skips D1). **Ambiguous**: READ if memory exists, WRITE (init) if not.

## Step 1 — READ mode
### 1a — Check memory

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then echo "MEMORY_FOUND"; else echo "NO_MEMORY_FILE"; fi
```

`NO_MEMORY_FILE` → "No memory yet. Run /sriflow-plan to begin, or say 'save context' to create SRIFLOW_MEMORY.md." Stop.

### 1b — Surface the file
Read via Read tool. Show:
1. Full Summary verbatim.
2. Last 10 log entries (newest last). Post-compress: all in `## Log (newest 10)`.
3. "Current goal: <Goal>. Last action: <skill> — <outcome> on <YYYY-MM-DD>."
4. Next skill:

| Stage | Next |
|---|---|
| `init` | `/sriflow-plan` |
| `plan` | `/sriflow-design` |
| `design` | `/sriflow-build` |
| `build` | `/sriflow-code-review` |
| `review` | `/sriflow-test` |
| `test` | `/sriflow` front door |
| `ship` | `/sriflow-reflect` |
| `unknown` | `/sriflow-plan` |

Last outcome `blocked` → add "Resolve blocker before advancing." Suggest once.

### 1c — Token warning
If `MEMORY_WARNING`: "Memory growing large — run /sriflow-memory compress."

## Step 2 — WRITE mode
### 2a — Create file if missing
If `MEMORY_EXISTS: false`, detect project and create from `reference/file-structure.md` initial template using actual values. Continue to 2b.

### 2b — Collect entry fields
All mandatory:
1. **timestamp**: `_ENTRY_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)`
2. **skill-name**: exact `name:` from calling skill's frontmatter, or `sriflow-memory` if user called directly.
3. **outcome**: exactly `done`/`done-with-concerns`/`blocked`/`needs-context`. Map closest; prefer `done-with-concerns` when uncertain.
4. **duration**: `$(date +%s) - _TEL_START`. Use passed duration if available. Unknown → `0`.
5. **note (optional)**: one line. Use calling skill's summary or user's verbatim. No note → omit line.

### 2c — Append log entry
Edit appends to end:

```
### <TIMESTAMP> | <skill> | <outcome> | <duration>s
Branch: <branch>
Session: <session-id>
<optional note — one line>
```

Blank line between entries. No trailing blank line. See `reference/examples.md`.

### 2d — Update Summary
Edit updates only:
- **`Last Updated`** → `_ENTRY_TIMESTAMP`.
- **`Current Stage`** → advance on `done`:

| Calling skill | Stage |
|---|---|
| `sriflow-plan` | `plan` |
| `sriflow-design` | `design` |
| `sriflow-build` | `build` |
| `sriflow-code-review` | `review` |
| `sriflow-test` | `test` |
| `sriflow-reflect` | `ship` |

`blocked`/`needs-context` → no advance. `sriflow-memory` direct → no change.
- **`Next Priority`** → update if note has carry-forward. Otherwise unchanged.
- Do NOT modify `Goal`, `Stack`, `Key Decisions`, `Compressed History`.

User states new goal/decision → update directly. New decision → `- D<N+1>: <decision> (<date>)`.

### 2e — Auto-compress check
```bash
_NEW_LOG_COUNT=$(grep -c "^### " SRIFLOW_MEMORY.md 2>/dev/null || echo 0)
echo "UPDATED_LOG_ENTRIES: $_NEW_LOG_COUNT"
```

> 50 → COMPRESS (Step 3). Skip D1, go to Step 3b.

### 2f — Confirm write (no compress)
If <= 50: report `MEMORY UPDATED` block with Skill, Outcome, Stage, Entries, File.

## Step 3 — COMPRESS mode
Read `reference/compression.md` for full Steps 3a-3f. Quick:
1. Guard: ≤10 → stop. 11-50 → ask D1. >50/auto → skip D1.
2. Split: oldest 40 (or all-except-newest-10 if 11-49) vs newest 10.
3. Summarise: 3-6 sentence prose. Extract Key Decisions.
4. Rewrite full file. Template: `reference/file-structure.md`.
5. Confirm with stats block.

## Step 4 — Token budget

If `MEMORY_WARNING`: "Memory growing large — run /sriflow-memory compress." After compress still large: also "Shorten future notes to one line."

## Step 5 — Other skills invoke WRITE

```
/sriflow-memory write "<skill> | <outcome> | <duration>s | <note>"
```

sriflow-memory: parse fields, run 2b with passed values, run 2c/2d/2e, report MEMORY UPDATED.
Calling skill: compute duration, map status, write note. NOT responsible for: reading memory, checking compress, updating Summary.
Stage transition: only sriflow-memory updates `Current Stage`.

## Step 6 — Suggest next skill

After READ or WRITE without auto-compress: suggest once if stage implies one (Step 1b table). After auto-compress: no suggestion. After manual compress: stats, then suggest.

## Important Rules

- Never modify code. Only `SRIFLOW_MEMORY.md`.
- Log append-only. COMPRESS preserves newest 10.
- Threshold 50. Count `### ` in Log only, not prose.
- Auto-compress never prompts. Manual asks D1 at 11-50.
- Always update `Last Updated` after log write.
- Outcomes: `done`/`done-with-concerns`/`blocked`/`needs-context` only.
- Duration seconds, always present. Unknown → `0`.
- Branch + Session required. Non-git → `Branch: unknown`.
- Note optional, one line when present.
- Infer from preamble/context. Don't interrogate.
- Spawned sessions: skip AskUserQuestion, auto-choose.
- Word warning at 10,000 words.
- Plan mode: READ only unless user requests writes.
- End every run: DONE/DONE_WITH_CONCERNS/BLOCKED/NEEDS_CONTEXT.
- Confusion: high-stakes ambiguity → STOP, present options, ask.

## Reference files

- `reference/file-structure.md` — canonical SRIFLOW_MEMORY.md structure
- `reference/compression.md` — full compression workflow (Steps 3a-3f)
- `reference/examples.md` — log entries, confirmation blocks, calling patterns
- `reference/operational-rules.md` — detailed constraints, plan mode, completion protocol
