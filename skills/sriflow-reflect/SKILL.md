---
name: sriflow-reflect
preamble-tier: 2
version: 2.0.0
description: End-of-cycle retro. Reads memory + git + reports. Produces RETRO.md with lessons and next priority. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - retro
  - retrospective
  - what did we learn
  - reflect on this cycle
  - end of sprint
  - /sriflow-reflect
---

## When to invoke

End-of-cycle retro for solo product builders. Reads SRIFLOW_MEMORY.md, PLAN.md, QA_REPORT.md, CODE_REVIEW.md, and git log. Produces RETRO.md (8 sections). Updates SRIFLOW_MEMORY.md.

Use when: "retro", "retrospective", "what did we learn", "reflect on this cycle", "end of sprint", or pipeline stage `ship-complete`/`qa-complete`. Suggest after `/sriflow-ship` completes.

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"

if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

_BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo "main")
_COMMITS_SINCE=$(git rev-list ${_BASE}..HEAD --count 2>/dev/null || echo "0")
_LAST_DEPLOY=$(grep "### DEPLOY" SRIFLOW_MEMORY.md 2>/dev/null | tail -1 || echo "none")
echo "BASE: $_BASE | COMMITS_SINCE_BASE: $_COMMITS_SINCE | LAST_DEPLOY: $_LAST_DEPLOY"

if [ -f "SRIFLOW_MEMORY.md" ]; then cat SRIFLOW_MEMORY.md; fi
```

## Plan Mode

Allowed: `Bash` (read-only), `Read`, `Glob`, `Grep`, writes to `SRIFLOW_MEMORY.md` and `RETRO.md`. No git mutations, no destructive file ops. If active: read/analyze freely, write RETRO.md and memory updates (safe). At STOP point, stop. ExitPlanMode only after workflow completes.

## Voice

Direct, builder-to-builder, compressed. Lead with the point. Be concrete — name files, commit hashes, line counts. No filler, no em dashes, no AI vocabulary (delve, crucial, robust, comprehensive, nuanced, multifaceted, furthermore, pivotal, tapestry, underscore, foster, intricate, vibrant, fundamental). Never narrate what you're doing.

Good: "auth.ts:47 returns undefined when session cookie expires. Fix: null check + redirect /login."
Bad: "I've identified a potential issue in the authentication flow that may cause problems under certain conditions."

## AskUserQuestion

Decision brief format — see **reference/ask-user-question.md** for template and D1 retro depth question.

## Completion Status

End every run: **DONE** (completed with evidence), **DONE_WITH_CONCERNS** (completed, concerns listed), **BLOCKED** (state blocker), or **NEEDS_CONTEXT** (state what's needed). Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

## Confusion Protocol

High-stakes ambiguity: STOP. Name it, present 2-3 options with tradeoffs, ask. Not for routine analysis.

---

# /sriflow-reflect — Retrospective

Cycle retro. Reads signals (memory, git, reports), computes metrics, produces RETRO.md (8 sections), updates SRIFLOW_MEMORY.md. No team leaderboard. Signal extraction only.

## Arguments

- `/sriflow-reflect` — default: last 7 days
- `/sriflow-reflect 7d` / `14d` / `30d` — explicit window
- `/sriflow-reflect 24h` — last 24 hours
- `/sriflow-reflect cycle` — full project cycle from memory start date

Default `7d`. All times in system local timezone.

**Midnight-aligned:** `d` units → `--since="<date>T00:00:00"`. `h` units → `--since="N hours ago"`. `cycle` → read start date from SRIFLOW_MEMORY.md `## Goal`/`## Started`/earliest log entry.

**Invalid arg:** Show usage (see Arguments list above), stop.

---

## Workflow

### Step 0: Time window + stale base guard

Resolve `_RETRO_SINCE` from argument. Run pre-flight — see **reference/stale-base-guard.md** for full bash block and verdict logic. Verdicts: `skip-no-remote`/`skip-detached`/`warn-fetch-failed` → proceed with reason noted. `check-gap` → block if latest commit older than window (unless `cycle`). >30 days stale → warn in RETRO.md.

### Step 1: Read context

Read in parallel: SRIFLOW_MEMORY.md, PLAN.md, QA_REPORT.md, CODE_REVIEW.md, TODOS.md, DESIGN.md. Extract from memory: start date, log entries, D-numbered decisions, current stage, prior lessons.

### Step 2: Git data collection

10 git commands in parallel — **reference/metrics-collection.md** for full block.

### Step 3: Emit metrics

Emit to conversation — **reference/metrics-collection.md** for format.

### Step 4: Pipeline stage analysis

Reconstruct stages from SRIFLOW_MEMORY.md log entries — **reference/pipeline-analysis.md**.

### D1: Depth preference

Ask: quick (bullet lists, 2-min read) vs thorough (narrative). Default quick. See **reference/ask-user-question.md**.

### Step 5: Write RETRO.md

8 mandatory sections — **reference/retro-template.md**. Overwrite if exists. Append § 2b if prior retro found.

### Step 6: Update SRIFLOW_MEMORY.md

All edits via Edit tool. **6a:** Compress if >50 entries (oldest 40 → summary). **6b:** Append lessons block. **6c:** Set `## Current Stage: reflect-complete` and `## Next Priority:` to first carry-forward item. Run telemetry: `_TEL_END=$(date +%s); _TEL_DUR=$(($_TEL_END - _TEL_START)); echo "REFLECT_DONE: duration ${_TEL_DUR}s"`

### Step 7: Announce completion

Print summary (8 sections, N lessons, N carry-forwards, stage → reflect-complete, next priority). **DONE**.

### Step 8: Commit time distribution

Hourly histogram + session cadence + AI-assisted % — **reference/metrics-collection.md**. To conversation only, NOT into RETRO.md.

### Step 9: Prior retro comparison

Check git history for prior RETRO.md. If found: read, extract carry-forward + lessons, add § 2b, trend line — **reference/pipeline-analysis.md**.

### Step 10: Quality check

8-section completeness + lesson quality + carry-forward quality — **reference/pipeline-analysis.md**.

### Step 11: Retro snapshot

If project has `retros/` dir or dated retro pattern: copy RETRO.md. Never create patterns speculatively.

---

## Operational Rules

- **No git writes.** Read-only on git.
- **Overwrite policy.** RETRO.md overwritten. SRIFLOW_MEMORY.md append-only (except compression + stage/priority).
- **Missing files ≠ errors.** Note absence. Synthesize best-effort.
- **Zero commits.** Don't write empty RETRO.md. Suggest `/sriflow-reflect cycle`.
- **Stale branch >30 days.** Warn at top.
- **Lessons gate.** Each must: name specific file/stage/tool/pattern from THIS cycle, be actionable, not repeat existing memory. If <3 non-generic, write what data supports.
- **No skill chaining.** Write directly to SRIFLOW_MEMORY.md via Edit/Bash.

## Integration

- **After /sriflow-ship:** Suggest for major milestones. Don't auto-run.
- **After /sriflow-test failures:** Run § 6 standalone if user asks "what went wrong".
- **Before /sriflow-plan:** If stage `reflect-complete`, surface carry-forward items.
- **vs /sriflow-memory:** `/sriflow-memory` = single entries mid-cycle. This = full cycle analysis.

---

## Context Recovery

See **reference/context-recovery.md**.

---

## Reference Files

| File | Content |
|------|---------|
| `reference/ask-user-question.md` | Decision brief template + D1 depth question |
| `reference/stale-base-guard.md` | Step 0 pre-flight bash block and verdict logic |
| `reference/metrics-collection.md` | Git commands, session detection, test LOC, histogram |
| `reference/retro-template.md` | RETRO.md 8-section template + § 2b + trend line |
| `reference/pipeline-analysis.md` | Steps 4/9/10/11, worked examples, self-improvement |
| `reference/memory-format.md` | SRIFLOW_MEMORY.md format, parsing, writing rules |
| `reference/edge-cases.md` | Error handling, edge cases, format workarounds |
| `reference/context-recovery.md` | Session recovery + telemetry |
