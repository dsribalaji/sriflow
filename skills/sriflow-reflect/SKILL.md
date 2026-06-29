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

## When to invoke this skill

End-of-cycle retrospective for solo product builders. Reads SRIFLOW_MEMORY.md, PLAN.md, QA_REPORT.md, CODE_REVIEW.md, and git log. Produces RETRO.md with 8 structured sections. Updates SRIFLOW_MEMORY.md with lessons and next priority.

Use when asked to "retro", "retrospective", "what did we learn", "reflect on this cycle", "end of sprint", or when pipeline stage is `ship-complete` or `qa-complete`. Proactively suggest after `/sriflow-ship` completes or when a cycle milestone is reached.

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

# Stale base guard
_BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo "main")
_COMMITS_SINCE=$(git rev-list ${_BASE}..HEAD --count 2>/dev/null || echo "0")
_LAST_DEPLOY=$(grep "### DEPLOY" SRIFLOW_MEMORY.md 2>/dev/null | tail -1 || echo "none")
echo "BASE: $_BASE | COMMITS_SINCE_BASE: $_COMMITS_SINCE | LAST_DEPLOY: $_LAST_DEPLOY"

if [ -f "SRIFLOW_MEMORY.md" ]; then cat SRIFLOW_MEMORY.md; fi
```

## Plan Mode Safe Operations

In plan mode, allowed because they inform the plan: `Bash` (read-only), `Read`, `Glob`, `Grep`, writes to `SRIFLOW_MEMORY.md`, and writes to `RETRO.md`. No git mutations, no destructive file ops in plan mode.

## Skill Invocation During Plan Mode

If the user invokes this skill in plan mode, follow it step by step starting from Step 0. AskUserQuestion satisfies plan mode's end-of-turn requirement. At a STOP point, stop immediately. Call ExitPlanMode only after the skill workflow completes, or if the user tells you to cancel.

If `SRIFLOW_PLAN_MODE` is `"active"`: read files and analyze freely, but do not run git mutations. Write RETRO.md and SRIFLOW_MEMORY.md updates (these are plan-mode-safe).

## AskUserQuestion Format

Every AskUserQuestion is a decision brief sent as tool_use:

```
D<N> — <one-line question title>
Branch: <_BRANCH value>
ELI10: <plain English a 16-year-old could follow, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks or what you lose>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment yourself. ELI10 always present. Recommendation always present. `(recommended)` on exactly one option.

If AskUserQuestion is unavailable: render as prose with the mandatory triad (ELI10, per-choice completeness, recommendation + `(recommended)` label), then STOP and wait for a typed reply.

## Voice

SriFlow voice: direct, builder-to-builder, compressed for runtime.

- Lead with the point. What shipped, why it matters, what to do next.
- Be concrete. Name files, commit hashes, line counts, actual dates.
- Never corporate, academic, or hype. No filler, no throat-clearing.
- Sound like a builder talking to a builder, not a consultant presenting.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted, furthermore, pivotal, tapestry, underscore, foster, intricate, vibrant, fundamental.
- The user has domain context you do not. Your analysis is a recommendation, not a verdict.
- Never narrate what you're doing. Just do it. Comment the WHY only when non-obvious.

Good: "auth.ts:47 returns undefined when the session cookie expires. Fix: null check + redirect /login."
Bad: "I've identified a potential issue in the authentication flow that may cause problems under certain conditions."

## Completeness Principle

Do the complete thing. Tests, edge cases, error paths. "Out of scope" applies only to genuinely unrelated multi-quarter work — never as an excuse to skip a section.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence (RETRO.md written, memory updated).
- **DONE_WITH_CONCERNS** — completed; concerns listed inline.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

## Confusion Protocol

For high-stakes ambiguity (scope of cycle, conflicting signals in memory vs git, destructive overwrite): STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Do not use for routine analysis or obvious data gaps — synthesize best-effort and note assumptions.

---

# /sriflow-reflect — Retrospective

Generates a cycle retrospective for a solo product builder. Reads all available signals (memory, git, reports), computes metrics, produces RETRO.md with 8 structured sections, and updates SRIFLOW_MEMORY.md with lessons and next priority.

No team leaderboard. No per-contributor breakdown. Signal extraction only: what shipped, what didn't, where time went, what to change.

## Arguments

- `/sriflow-reflect` — default: last 7 days
- `/sriflow-reflect 7d` — explicit 7-day window
- `/sriflow-reflect 14d` — last 14 days
- `/sriflow-reflect 30d` — last 30 days
- `/sriflow-reflect 24h` — last 24 hours
- `/sriflow-reflect cycle` — full project cycle from memory start date

Parse the argument first. Default to `7d` if no argument given. All times in system local timezone (do NOT set `TZ`).

**Midnight-aligned windows:** For `d` units, compute the absolute start date at local midnight. If today is 2026-06-28 and window is `7d`, start is `2026-06-21T00:00:00`. Use `--since="<date>T00:00:00"` in all git log queries — without the explicit time suffix, git interprets it as current wall time, not midnight. For `h` units, use `--since="N hours ago"`. For `cycle`: read the project start date from SRIFLOW_MEMORY.md `## Goal`, `## Started`, or the earliest log entry timestamp; use that as the since date.

**Argument validation:** If the argument doesn't match `Nd`, `Nh`, or `cycle`, show usage and stop:

```
Usage: /sriflow-reflect [window | cycle]
  /sriflow-reflect        — last 7 days (default)
  /sriflow-reflect 7d     — explicit 7-day window
  /sriflow-reflect 14d    — last 14 days
  /sriflow-reflect 30d    — last 30 days
  /sriflow-reflect 24h    — last 24 hours
  /sriflow-reflect cycle  — full project cycle from memory start date
```

---

## Step 0: Detect time window + stale base guard

Resolve `_RETRO_SINCE` from the argument. For `cycle`, read the start date from SRIFLOW_MEMORY.md. Then run the pre-flight guard:

```bash
# Set _RETRO_SINCE to the midnight-aligned date string, e.g. "2026-06-21T00:00:00"
# For 7d default (today 2026-06-28): _RETRO_SINCE="2026-06-21T00:00:00"
# For cycle: _RETRO_SINCE="<start-date-from-memory>T00:00:00"

# Pre-check A: no remote configured?
_RETRO_HAS_REMOTE=$(git remote 2>/dev/null | grep -c '^origin$' || echo 0)
if [ "$_RETRO_HAS_REMOTE" = "0" ]; then
  echo "RETRO_GUARD: no 'origin' remote — proceeding (local-only repo)"
  _RETRO_GUARD_VERDICT="skip-no-remote"
fi

# Pre-check B: detached HEAD?
if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _RETRO_HEAD_REF=$(git symbolic-ref --quiet HEAD 2>/dev/null || echo "")
  if [ -z "$_RETRO_HEAD_REF" ]; then
    echo "RETRO_GUARD: detached HEAD — proceeding"
    _RETRO_GUARD_VERDICT="skip-detached"
  fi
fi

# Pre-check C: fetch origin; warn and proceed if offline
if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo "main")
  if ! git fetch origin "$_DEFAULT_BRANCH" --quiet 2>/dev/null; then
    echo "RETRO_GUARD: fetch failed (offline?) — proceeding against last-known origin"
    _RETRO_GUARD_VERDICT="warn-fetch-failed"
  fi
fi

# Pre-check D: check whether latest commit is within the window
if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _RETRO_LATEST_ISO=$(git log -1 --format=%ci "origin/$_DEFAULT_BRANCH" 2>/dev/null | awk '{print $1}')
  if [ -n "$_RETRO_LATEST_ISO" ]; then
    echo "RETRO_GUARD: latest origin/$_DEFAULT_BRANCH commit on $_RETRO_LATEST_ISO"
    _RETRO_GUARD_VERDICT="check-gap"
  fi
fi
```

After running: evaluate `RETRO_GUARD: latest ... commit on <DATE>` against today and the window. If the latest-commit date is older than `(today - window-days)`, and the window is not `cycle`:

BLOCK with: "Retro window is stale. Latest commit on `origin/<branch>` was `<DATE>`, but the window covers `<since>` to `<today>`. This usually means the branch is stale or `origin/<branch>` hasn't been fetched. Run `git fetch origin` and re-run /sriflow-reflect." Stop until resolved.

Also: if the last commit is more than 30 days ago regardless of window, warn at the top of RETRO.md: "Reviewing a stale branch. Last commit was `<DATE>`. Findings may not reflect current state."

Skip paths (`skip-no-remote`, `skip-detached`, `warn-fetch-failed`) proceed to Step 1 with the cited reason noted in the retro narrative.

---

## Step 1: Read all project context

Read these in parallel (all independent):

```bash
# Full project memory
cat SRIFLOW_MEMORY.md 2>/dev/null || echo "SRIFLOW_MEMORY.md: not found"

# What was planned
cat PLAN.md 2>/dev/null || echo "PLAN.md: not found"

# QA results
cat QA_REPORT.md 2>/dev/null || echo "QA_REPORT.md: not found"

# Code review findings
cat CODE_REVIEW.md 2>/dev/null || echo "CODE_REVIEW.md: not found"

# Backlog
cat TODOS.md 2>/dev/null || echo "TODOS.md: not found"

# Design artifacts (if any)
cat DESIGN.md 2>/dev/null || echo "DESIGN.md: not found"
```

From SRIFLOW_MEMORY.md, extract:
- Project start date (for cycle window and session counting)
- All `### <timestamp> | <skill> | <status> | <duration>` log entries (these are pipeline stage records)
- All D-numbered decisions (AUQ records) — look for `Decision D<N>:` or similar patterns
- Current stage: `## Current Stage: <value>`
- Any prior lesson blocks from previous retros

---

## Step 2: Git data collection

Run these in parallel:

```bash
# 1. All commits in window with shortstat (files changed, LOC added/deleted)
git log --since="$_RETRO_SINCE" --no-merges --format="%H|%aN|%ai|%s" --shortstat 2>/dev/null

# 2. Per-commit numstat for test vs prod LOC split
#    Lines matching test/, spec/, __tests__/, .test., .spec. are test LOC
git log --since="$_RETRO_SINCE" --no-merges --format="COMMIT:%H|%ai|%s" --numstat 2>/dev/null

# 3. Commit timestamps ascending (for session detection)
git log --since="$_RETRO_SINCE" --no-merges --format="%at|%ai|%s" 2>/dev/null | sort -n

# 4. File hotspots — most frequently changed files
git log --since="$_RETRO_SINCE" --no-merges --format="" --name-only 2>/dev/null \
  | grep -v '^$' | sort | uniq -c | sort -rn | head -20

# 5. Total commit count (no merges)
git log --since="$_RETRO_SINCE" --no-merges --oneline 2>/dev/null | wc -l | tr -d ' '

# 6. Active days (distinct calendar dates with commits)
git log --since="$_RETRO_SINCE" --no-merges --format="%ai" 2>/dev/null \
  | awk '{print $1}' | sort -u

# 7. Unique files touched
git log --since="$_RETRO_SINCE" --no-merges --format="" --name-only 2>/dev/null \
  | grep -v '^$' | sort -u | wc -l | tr -d ' '

# 8. Commit type breakdown (conventional commits)
git log --since="$_RETRO_SINCE" --no-merges --format="%s" 2>/dev/null \
  | grep -oE '^(feat|fix|refactor|test|chore|docs|style|perf|ci|build)\b' | sort | uniq -c | sort -rn

# 9. Test file count (current state)
find . -name '*.test.*' -o -name '*.spec.*' -o -name '*_test.*' -o -name '*_spec.*' \
  2>/dev/null | grep -v node_modules | wc -l | tr -d ' '

# 10. Co-authored commits (AI-assisted)
git log --since="$_RETRO_SINCE" --no-merges --format="%b" 2>/dev/null \
  | grep -c "Co-Authored-By:" || echo 0
```

**Session detection algorithm:** Sort commit timestamps (`%at`, unix epoch) ascending. A new session starts when the gap between consecutive commits exceeds 2700 seconds (45 minutes). Count total sessions. A session with a single commit of any LOC counts as a session. Report: total sessions, avg session duration (minutes), longest session.

**Test LOC split:** From numstat, files matching any of: path contains `test/`, `spec/`, `__tests__/`, filename contains `.test.`, `.spec.`, `_test.`, `_spec.` are test files. Sum their insertions as test LOC; sum all other insertions as prod LOC. Test LOC ratio = test LOC / (test LOC + prod LOC).

**Backlog health (if TODOS.md found):** Count total open TODOs (lines starting with `- [ ]` or similar, excluding `## Completed` section). Count P0/P1 items (look for `[P0]`, `[P1]`, `priority: high`, `URGENT`, or similar markers). Count items closed this cycle (items in `## Completed` with dates within the window, or `- [x]` items).

---

## Step 3: Emit cycle metrics block

Before writing RETRO.md, emit the metrics block directly to the conversation so the user sees raw numbers:

```
CYCLE METRICS (<window>: <since> to <today>):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commits:       N (no merges)
LOC:           +X added / -Y deleted / Z net
Test LOC:      N added (X% of total)
Files:         N unique files touched
Active days:   N of <window-days> days
Sessions:      N detected (avg Xmin, longest Xmin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline ran:  [plan] [design] [build] [qa] [review] [ship]
Code review:   N critical, N warn, N nitpick
QA:            N/N checks passing (N categories with failures)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backlog:       N open (X P0/P1) · N closed this cycle
AI-assisted:   N commits with Co-Authored-By trailers
```

If CODE_REVIEW.md was not found: show `Code review: not run this cycle`.
If QA_REPORT.md was not found: show `QA: not run this cycle`.
If TODOS.md was not found: show `Backlog: no TODOS.md found`.

---

## Step 4: Pipeline stage analysis

From SRIFLOW_MEMORY.md log entries, reconstruct which pipeline stages ran this cycle.

Look for log entries matching the pattern `### <timestamp> | sriflow-<skill> | <status> | <duration>s`. Parse each entry:
- Skill name maps to pipeline stage (e.g., `sriflow-plan` → `plan`, `sriflow-build` → `build`)
- Status: `DONE`, `DONE_WITH_CONCERNS`, `BLOCKED`, `NEEDS_CONTEXT`
- Duration: in seconds, convert to minutes for display

For each pipeline stage, determine:
1. **Did it run?** (yes / no / partial — no log entry means not run)
2. **How long?** (sum of durations across all runs of that stage)
3. **Rework?** (count commits or memory entries that explicitly revise the stage output — look for `fix:`, `rework:`, `revise:` commit prefixes touching stage-related files)
4. **Notes** — any BLOCKED or DONE_WITH_CONCERNS status, any skipped stage with rationale from memory

Present as a table, then 2-3 sentences on which stage consumed the most time and which had the most rework:

| Stage | Ran? | Time spent | Rework | Notes |
|-------|------|-----------|--------|-------|
| plan | yes | Xmin | N commits | ... |
| design | yes/no | Xmin | N commits | ... |
| build | yes | Xmin | N commits | ... |
| qa | yes/no | Xmin | N commits | ... |
| review | yes/no | Xmin | N commits | ... |
| ship | yes/no | Xmin | N commits | ... |

If a stage has no evidence (no log entry, no commits touching its artifact), mark it `no` and note it was skipped.

---

## D1 — Retro depth preference

Before writing RETRO.md, ask:

```
D1 — How thorough should this retro be?
Branch: <_BRANCH>
ELI10: A quick retro is bullet lists only — scan in 2 minutes, act immediately. A thorough retro has narrative for each section — deeper context, better for end-of-quarter reviews or when something went wrong.
Stakes if wrong: Too short misses systemic patterns. Too long is noise you won't read next time.
Recommendation: A) because quick retros get read; thorough retros get skipped.
Completeness: A=7/10, B=9/10
A) Quick — concise bullet lists, action-focused (recommended)
  ✅ Read in 2 minutes; keeps retrospective habit sustainable
  ❌ Less context for future self reviewing this later
B) Thorough — narrative for each section, full decision analysis
  ✅ Captures the full story of the cycle for posterity
  ❌ Longer to write and longer to read; may go unread
Net: Default to quick. Use thorough at major milestones or after a hard cycle.
```

If the user picks A: write RETRO.md with concise bullet lists in each section (max 5 bullets per section, 1 sentence each, no narrative paragraphs).
If the user picks B: write RETRO.md with narrative paragraphs (3-5 sentences per section) plus the bullet lists.

---

## Step 5: Write RETRO.md

Write RETRO.md to the project root. Overwrite if it exists.

Structure (8 mandatory sections):

```markdown
# RETRO — <cycle name or date range>

_Generated: <ISO date>. Window: <since> to <today>. Branch: <_BRANCH>. Depth: <quick|thorough>._

---

## 1. What Shipped

<Concrete list of features, fixes, and changes that are now in production or merged.
Each item names the actual thing: file, endpoint, UI change, behavior change.
No vague items. "Improved auth" is not acceptable; "auth.ts: added 15-minute session
timeout with redirect to /login on expiry" is.>

- ...

---

## 2. What Was Planned But Didn't Ship

<Items from PLAN.md that did not land. For each: what it was + why it didn't ship
(scope cut / blocked / deprioritized / still in progress). Be honest. "Ran out of
time" is a valid reason. So is "discovered it wasn't needed.">

- <Item>: <reason it didn't ship>

If PLAN.md was not found: note "No PLAN.md found — cannot compare planned vs shipped."

---

## 3. Where Time Went

<Breakdown of estimated time per pipeline stage. Source: SRIFLOW_MEMORY.md log
entry durations + session detection from git timestamps. If durations are unavailable,
estimate based on commit density per stage. Be honest about estimates vs measurements.>

| Stage | Time | % of cycle |
|-------|------|-----------|
| plan | Xmin | X% |
| design | Xmin | X% |
| build | Xmin | X% |
| qa | Xmin | X% |
| review | Xmin | X% |
| ship | Xmin | X% |
| **Total** | **Xmin** | **100%** |

<1-2 sentences on what this distribution reveals. Was time allocation healthy?
Where did most of it actually go vs where you expected it to go?>

---

## 4. Decision Quality

<Review each D-numbered decision made this cycle. These come from AskUserQuestion
records in SRIFLOW_MEMORY.md. For each decision:
- What was decided
- Was it the right call in hindsight?
- What would you change?>

If no decisions were logged: "No D-numbered decisions found in SRIFLOW_MEMORY.md.
Consider logging key choices via AskUserQuestion for better retrospective signal."

| Decision | What was decided | Right call? | Change in hindsight |
|----------|-----------------|-------------|---------------------|
| D1 | ... | yes/no/partial | ... |
| D2 | ... | ... | ... |

<If "thorough" depth: write 1-2 sentences of narrative per decision that had a
non-obvious outcome.>

---

## 5. Code Quality Signals

<Patterns from CODE_REVIEW.md findings. Focus on recurring categories — a single
WARN in one category is noise; a WARN in the same category across 3+ findings is
a systemic issue.>

If CODE_REVIEW.md found:
- Total findings: N critical, N warn, N nitpick
- Recurring WARN categories: [list — these are systemic issues to address]
- CRITICAL findings and their resolution status
- Any finding that was deferred: what's the plan?

If CODE_REVIEW.md not found: "Code review was not run this cycle."

File hotspot analysis (from git numstat):

| File | Changes | Signal |
|------|---------|--------|
| <path> | N times | churn hotspot / expected / test file |

<Flag files changed 5+ times as churn hotspots. A file churning that often either
needs a rewrite or is in the critical path and growing — both worth naming.>

---

## 6. What Broke

<QA failures, production issues, bugs found in this cycle.>

If QA_REPORT.md found:
- Total: N/N checks passing
- Failed categories: [list]
- Open failures: [list of specific failing tests/checks]
- Were any QA failures already known (tracked in TODOS.md)?

If QA_REPORT.md not found: "QA was not run this cycle."

If neither CODE_REVIEW.md nor QA_REPORT.md found and commits exist: note
"Neither QA nor code review ran. For next cycle: run /sriflow-test and
/sriflow-code-review before shipping."

---

## 7. Carry-Forward

<Top 3 concrete actions for the next cycle. Not "do better at X" but "Before
merging the next PR, add an integration test for the auth timeout path." Specific,
actionable, with clear done criteria. Priority order: most impactful first.>

1. **<action>**: <rationale — one sentence on why this matters most>
2. **<action>**: <rationale>
3. **<action>**: <rationale>

---

## 8. Lessons

<3 sentences max. What changed in how you'd approach this type of cycle.
Concrete and specific to this project. Not platitudes.
Bad: "Plan more carefully next time."
Good: "The build phase stalled for 2 sessions because DESIGN.md had no mobile breakpoints specified. Next cycle: add responsive specs to DESIGN.md before /sriflow-build starts.">

1. <lesson — ≤2 sentences>
2. <lesson — ≤2 sentences>
3. <lesson — ≤2 sentences>

---

## Appendix: Metrics

<Metrics block from Step 3.>

## Appendix: Pipeline Stage Analysis

<Stage table from Step 4.>
```

---

## Step 6: Update SRIFLOW_MEMORY.md

After RETRO.md is written, update SRIFLOW_MEMORY.md. Make all edits with the Edit tool — not by overwriting the file.

**6a: Compress if needed.**

Count log entries in SRIFLOW_MEMORY.md: look for lines matching `### <timestamp> |` pattern. If there are more than 50 such entries:
1. Find the oldest 40 entries (first 40 by date).
2. Summarize them into a single block:

```markdown
### <earliest-date> to <40th-entry-date> | COMPRESSED | <N> entries

Summary of compressed entries:
- Stages run: [list of unique skills from compressed entries]
- Total sessions: N
- Status distribution: N DONE, N DONE_WITH_CONCERNS, N BLOCKED
- Key decisions: [any D-numbered decisions referenced in compressed entries]
- Notable events: [any BLOCKED or repeated NEEDS_CONTEXT patterns]
```

3. Replace the oldest 40 entries with this summary block using the Edit tool.
4. Keep all entries newer than the 40th oldest (i.e., entries 41+ stay intact).

Note in conversation: "Compressed 40 oldest log entries into summary block."

**6b: Append lessons block.**

Append to the end of SRIFLOW_MEMORY.md:

```markdown

### <ISO-timestamp> | sriflow-reflect | DONE | <duration>s
Branch: <_BRANCH>
Session: <_SESSION_ID>
Window: <_RETRO_SINCE> to <today>
Lessons:
- <lesson 1 from RETRO.md § 8>
- <lesson 2 from RETRO.md § 8>
- <lesson 3 from RETRO.md § 8>
Carry-forward:
- <carry-forward item 1>
- <carry-forward item 2>
- <carry-forward item 3>
```

**6c: Update stage and next priority.**

Find the line `## Current Stage:` in SRIFLOW_MEMORY.md and update it:

```
## Current Stage: reflect-complete
```

Find or add the line `## Next Priority:` and set it to the first carry-forward item from RETRO.md § 7:

```
## Next Priority: <first item from § 7 Carry-Forward, condensed to one clause>
```

If neither line exists, append both to the end of the file under a `## Status` header.

Run the memory update:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "REFLECT_DONE: duration ${_TEL_DUR}s | timestamp $_TIMESTAMP"
```

Use this duration and timestamp in the log entry appended to SRIFLOW_MEMORY.md.

---

## Step 7: Announce completion

After RETRO.md and SRIFLOW_MEMORY.md are both updated, print:

```
Cycle closed.

RETRO.md written: 8 sections, <N> lessons, <N> carry-forward items.
SRIFLOW_MEMORY.md updated: lessons appended, stage → reflect-complete.
Next priority: <first carry-forward item>

Start next cycle with /sriflow-plan.
```

Then emit completion status: **DONE** — RETRO.md written, SRIFLOW_MEMORY.md updated with lessons and next priority.

---

## Context Recovery

At session start or after context compaction:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
if [ -f "RETRO.md" ]; then
  echo "=== RETRO (last cycle) ==="
  head -60 RETRO.md
  echo "=== END RETRO ==="
fi
```

If memory found: give a 2-sentence welcome-back summary covering current stage and next priority. If a next skill is implied (e.g., stage is `reflect-complete` → suggest `/sriflow-plan`), suggest it once.

---

## Operational Notes

**No git writes.** This skill is read-only on git. It reads `git log` and `git fetch` but never commits, branches, or pushes.

**Overwrite policy.** RETRO.md is always overwritten. If RETRO.md exists from a prior run, it is replaced entirely. SRIFLOW_MEMORY.md is append-only (except for the compression step and stage/priority line updates — those are surgical edits, not rewrites).

**Missing files are not errors.** If PLAN.md, QA_REPORT.md, CODE_REVIEW.md, or TODOS.md don't exist, note their absence in the relevant RETRO.md section. Never block on a missing file — synthesize best-effort from what's available and make the gap explicit.

**Zero commits in window.** If the git window returns no commits, say: "No commits found in the `<window>` window ending <today>. Either nothing shipped this cycle or the branch is stale. Try `/sriflow-reflect cycle` to review the full project history, or check `git log` manually." Do not write an empty RETRO.md.

**Stale branch (>30 days since last commit).** Warn at the top of the retro output (before RETRO.md content): "Last commit was <date>, more than 30 days ago. This retro reflects a stale branch — findings may not match the current state of the codebase."

**If SRIFLOW_MEMORY.md has no log entries.** The project memory exists but has no stage records. Proceed with git-only analysis. Note in RETRO.md § 4 (Decision Quality): "No pipeline log entries found in SRIFLOW_MEMORY.md. Run /sriflow-plan to start structured cycle tracking."

**Lessons quality gate.** Do not write generic lessons. Before writing § 8 Lessons, verify each lesson against this checklist:
- [ ] Names a specific file, stage, tool, or pattern from THIS cycle
- [ ] Actionable in the next cycle (someone could do something different based on it)
- [ ] Not a restatement of a lesson already in SRIFLOW_MEMORY.md

If you can't generate 3 non-generic lessons from the available data, write as many as the data supports and note: "Only N lessons generated from available data — more pipeline tracking would improve this."

---

## Step 8: Commit time distribution and cadence analysis

After computing sessions, produce a commit time histogram and cadence interpretation. This section outputs directly to the conversation — it does NOT go into RETRO.md (it's signal for the builder, not a record).

**Hourly histogram.** From commit timestamps (local time), bucket commits by hour:

```
Commit distribution by hour (local time):
00:   2  ██
01:   0
02:   0
...
09:   5  █████
10:   8  ████████
11:   6  ██████
12:   3  ███
...
22:   4  ████
23:   1  █
```

Each █ = 1 commit. Max bar width is proportional to the busiest hour. Show all 24 hours, even empty ones (show 0 and blank bar). Identify:
- **Peak hour(s)**: the top 1-2 hours by commit count
- **Dead zone**: hours 00:00-06:00 with 0 commits (healthy) vs commits (late-night pattern)
- **Bimodal pattern**: morning cluster + evening cluster with a trough in between (indicates context-switching between work and personal time)

**Session cadence.** From session detection (45-minute gap threshold), compute:
- Total sessions: N
- Average session length: Xmin
- Longest session: Xmin (when)
- Shortest session: Xmin (single commit)
- Sessions by depth:
  - Deep: sessions > 90 minutes (rare, focused work)
  - Medium: 30-90 minutes (standard feature work)
  - Micro: < 30 minutes (quick fix, review, hotpatch)

**Cadence interpretation.** Based on the histogram and session data, write 2-3 sentences:
- Is the work pattern sustainable? (Late-night bursts are a warning sign for solo builders.)
- Are sessions getting longer or shorter over the window? (If window is 14d+, compare first half vs second half.)
- Is there a "ship day" pattern? (Many commits concentrated on one or two days per week suggests batch shipping, which increases risk per ship.)

**AI-assisted percentage.** From command 10 (Co-Authored-By count), compute:
- N% of commits had AI co-author trailers (Co-Authored-By: Claude, Co-Authored-By: GitHub Copilot, etc.)
- If > 80%: note "Heavily AI-assisted cycle — code review signal from CODE_REVIEW.md is especially important."
- If 0%: note "No AI co-author trailers found. If AI tools were used, adding Co-Authored-By trailers improves cycle tracking."

---

## Step 9: Prior retro comparison

Before writing RETRO.md, check whether a prior RETRO.md exists in the project history:

```bash
# Check for prior retro in git history (not the working tree — that's the current one being written)
git log --oneline --diff-filter=A -- RETRO.md 2>/dev/null | head -5

# Also check for a dated retro archive if the project uses one
ls RETRO-*.md 2>/dev/null | sort | tail -3
```

If a prior retro exists in git history:
1. Read it: `git show HEAD~1:RETRO.md 2>/dev/null` (or the specific commit from the log above)
2. Extract its carry-forward items (§ 7) and lessons (§ 8)
3. In RETRO.md § 2 (What Was Planned But Didn't Ship), also check whether prior carry-forward items landed this cycle
4. Add a **Prior Carry-Forward Resolution** section immediately after § 2:

```markdown
## 2b. Prior Carry-Forward Resolution

Items from the last retro's carry-forward list — did they ship this cycle?

| Item | Shipped? | Notes |
|------|---------|-------|
| <prior CF item 1> | yes/no/partial | <what happened> |
| <prior CF item 2> | yes/no/partial | <what happened> |
| <prior CF item 3> | yes/no/partial | <what happened> |

<1 sentence: what carry-forward resolution rate tells you about follow-through.
If < 1/3 carried forward items shipped: this is a pattern to name in § 8 Lessons.>
```

If no prior retro is found (first retro for this project): skip this step. Note in § 8 Lessons: "This is the first retro — run again after the next cycle to see trends."

**Trend summary.** If a prior retro exists, add a one-line trend summary at the top of RETRO.md after the generated-date line:

```
Trend vs last retro: commits [↑↓→] N% | LOC [↑↓→] N% | sessions [↑↓→] N | QA pass rate [↑↓→] N%
```

Use ↑ for improvement, ↓ for regression, → for within 10% of prior. If prior data is unavailable for a metric, omit that metric from the trend line.

---

## Step 10: RETRO.md quality check

After writing RETRO.md, run a self-check before finishing:

**Completeness check:**
- [ ] § 1 What Shipped: every item names a specific artifact (file, endpoint, feature name) — not a vague action
- [ ] § 2 What Was Planned: compared against PLAN.md (or noted that PLAN.md was missing)
- [ ] § 3 Where Time Went: table is present with at least one row showing time > 0
- [ ] § 4 Decision Quality: all D-numbered decisions from SRIFLOW_MEMORY.md are reviewed (or "none found" noted)
- [ ] § 5 Code Quality Signals: file hotspot table is present (even if empty)
- [ ] § 6 What Broke: QA findings present (or "QA not run" noted)
- [ ] § 7 Carry-Forward: exactly 3 items, each specific and actionable
- [ ] § 8 Lessons: 3 lessons, none of which are generic platitudes

**Lesson quality check.** For each lesson in § 8, verify:
- Does it name something specific from THIS cycle? (file path, stage name, specific failure)
- Is it actionable? (Does it suggest a behavior change, not just an observation?)
- Is it different from lessons already in SRIFLOW_MEMORY.md?

If any lesson fails the check, rewrite it. A rewritten lesson that is more specific but still factual is always better than a passing-but-generic one.

**Carry-forward quality check.** For each item in § 7:
- Does it have a clear done condition? ("Add auth timeout test" is done when the test exists. "Improve auth" never has a done condition.)
- Is it scoped to the next cycle? (Not "someday" — something achievable in the next 1-2 weeks.)
- Is it the right priority? (The top item should be the thing that, if not done, most threatens the next cycle's quality.)

If a carry-forward item is vague, rewrite it to be specific. If you cannot make it specific from available data, note the gap: "This item needs more context — check TODOS.md or PLAN.md for the next cycle."

---

## Step 11: Save retro snapshot (optional, if RETRO archive pattern detected)

If the project has a `retros/` directory or a pattern of dated retro files (`RETRO-YYYY-MM-DD.md`), save a copy:

```bash
# Check for retro archive directory
ls -d retros/ 2>/dev/null || echo "no retros dir"
ls RETRO-*.md 2>/dev/null | head -3 || echo "no dated retros"
```

If a `retros/` directory exists: copy RETRO.md to `retros/RETRO-<today>.md` (do not overwrite the working RETRO.md).
If dated retro files exist in the root: copy RETRO.md to `RETRO-<today>.md`.
If neither pattern is detected: skip. Note: "No retro archive pattern detected. To enable retro history, create a `retros/` directory."

Do NOT create the archive directory or pattern speculatively. Only use patterns already established in the project.

---

## Worked examples

### Example: minimal project, first retro, quick depth

Context: A new project with 12 commits over 5 days. No PLAN.md. No QA_REPORT.md. CODE_REVIEW.md found with 3 warnings. One session in SRIFLOW_MEMORY.md (sriflow-build ran for 23 minutes, DONE).

Expected behavior:
- Step 0: pre-flight passes, window is 7d
- Step 1: reads memory (1 entry found), CODE_REVIEW.md (3 warns), all others missing
- Step 2: 12 commits, 340 LOC added, 80 LOC deleted, 3 sessions, 4 active days
- Step 3: emits metrics block with CODE_REVIEW: 0 critical, 3 warn, 0 nitpick; QA: not run
- Step 4: pipeline table shows build=yes (23min), plan/design/qa/review/ship all=no
- D1 asks depth preference — user picks quick
- Step 5: writes RETRO.md with § 1 listing the 12 commits by subject, § 2 noting "No PLAN.md found", § 3 showing 100% of time in build, § 4 "No D-numbered decisions found", § 5 showing 3 WARN findings, § 6 "QA not run", § 7 with 3 carry-forwards, § 8 with 3 lessons
- Step 6: appends to SRIFLOW_MEMORY.md, sets Current Stage: reflect-complete
- Step 7: prints summary

### Example: mature project, full cycle retro, thorough depth

Context: A 30-day `cycle` window. PLAN.md exists with 8 items. QA_REPORT.md: 47/50 checks passing. CODE_REVIEW.md: 2 critical, 8 warn. SRIFLOW_MEMORY.md has 45 log entries (under compression threshold). Prior RETRO.md in git history.

Expected behavior:
- Step 0: resolves `_RETRO_SINCE` from SRIFLOW_MEMORY.md project start date
- Step 9 (prior retro): reads prior RETRO.md, extracts 3 carry-forward items from last cycle, adds § 2b
- Step 2: larger git dataset — 80+ commits, multiple sessions
- Step 8: commit histogram shows bimodal pattern (9am-11am + 9pm-11pm); 15 sessions avg 42min
- D1: user picks thorough
- Step 5: § 1 cross-references PLAN.md items that shipped, § 2 lists 2 unshipped PLAN.md items with reasons, § 2b shows 2/3 prior carry-forward items shipped, § 4 has 6 D-numbered decisions reviewed with narrative, § 5 names 2 CRITICAL findings and their resolution status
- Step 6: 45 entries is under threshold — no compression; appends lessons normally
- RETRO.md gets trend line at top

---

## SRIFLOW_MEMORY.md format reference

This skill reads and writes SRIFLOW_MEMORY.md. Understanding its format is required for correct parsing and writing.

### Expected top-level structure

```markdown
# SRIFLOW_MEMORY — <project name>

## Goal
<One paragraph: what this project is trying to accomplish.>

## Started
<ISO date when the project was created or when memory was initialized.>

## Current Stage: <stage-name>

## Next Priority: <one-clause description of the most urgent next action>

## Summary
<Rolling summary of the project state. Updated by /sriflow-memory and /sriflow-reflect.>
Last cycle complete: <ISO timestamp>. Next priority: <item>.

## Log

### <ISO-timestamp> | <skill-name> | <STATUS> | <duration>s
<Optional context lines: Branch, Session, notes from the skill run.>

### <ISO-timestamp> | <skill-name> | <STATUS> | <duration>s
...
```

### Log entry patterns to recognize

**Standard skill log entry:**
```
### 2026-06-21T14:32:00Z | sriflow-build | DONE | 1842s
Branch: main
Session: 12345-1750512720
```

**Decision record** (from AUQ in any skill):
```
### 2026-06-20T11:15:00Z | sriflow-plan | DONE | 920s
Branch: feature/auth
D1: Chose JWT stateless tokens over session table — stateless avoids DB dependency for auth
D2: Deferred mobile layout to next cycle — desktop-only MVP
```

**Deploy record:**
```
### DEPLOY | 2026-06-22T16:00:00Z | production | sha:abc1234
```

**Prior retro lessons block:**
```
### 2026-06-14T18:00:00Z | sriflow-reflect | DONE | 340s
Branch: main
Lessons:
- DESIGN.md lacked responsive specs; build stalled 2 sessions
- Code review found 3 SQL injection risks; add review before ship next cycle
- QA ran after ship instead of before; reverse order next time
Carry-forward:
- Add responsive specs template to DESIGN.md
- Run /sriflow-code-review before /sriflow-ship
- Add integration tests for auth endpoints
```

When reading SRIFLOW_MEMORY.md, parse these patterns to:
1. Reconstruct which pipeline stages ran and when (for § 3 Where Time Went)
2. Extract D-numbered decisions for § 4 Decision Quality review
3. Find prior carry-forward items for § 2b Prior Carry-Forward Resolution
4. Determine the start date for `cycle` window mode
5. Count log entries to determine if compression is needed (> 50 entries)

### Writing rules for SRIFLOW_MEMORY.md

1. **Never overwrite the full file.** Use Edit (surgical replacement) or Bash append. Overwriting loses prior log entries.
2. **Stage and Next Priority lines must be on their own lines.** The regex `^## Current Stage:` and `^## Next Priority:` must match. If using sed replacement, verify the lines match exactly.
3. **Compression must preserve the Summary section.** The `## Summary` block and everything above it (Goal, Started, Current Stage, Next Priority) is never compressed. Only `## Log` entries are compressed.
4. **Timestamps are UTC ISO-8601.** Use `date -u +%Y-%m-%dT%H:%M:%SZ` in bash.
5. **Duration in seconds.** Always log `${_TEL_DUR}s` — not minutes, not "~Xh". Seconds enables programmatic analysis.

---

## Integration with other sriflow skills

**After /sriflow-ship:** Proactively suggest `/sriflow-reflect` if the ship was for a major milestone. Say: "Ship complete. Want to run /sriflow-reflect to close the cycle and capture lessons?" Do not auto-run — let the user decide.

**After /sriflow-test produces failures:** If QA_REPORT.md shows failures and the user asks "what went wrong," run the retro's Step 5 § 6 (What Broke) section standalone — answer the question directly without running the full retro. Only run the full retro when the user explicitly requests a retrospective.

**Before /sriflow-plan (next cycle):** If SRIFLOW_MEMORY.md shows stage `reflect-complete`, read the carry-forward items from the most recent retro lessons block in memory. Surface them at the start of the plan skill as "Carry-forward from last cycle:" before asking the user what to plan next.

**Relationship to /sriflow-memory:** `/sriflow-memory` is the lightweight skill for reading and writing individual memory entries during a cycle. `/sriflow-reflect` is the heavyweight skill for full cycle analysis. They share the SRIFLOW_MEMORY.md file but serve different purposes:
- `/sriflow-memory WRITE`: appends a single log entry (used by other skills)
- `/sriflow-memory READ`: reads and summarizes current memory state
- `/sriflow-reflect`: reads memory + git + all reports, produces RETRO.md, compresses memory if needed

Do not invoke `/sriflow-memory` from within `/sriflow-reflect` — write directly to SRIFLOW_MEMORY.md using Edit/Bash. Chaining skill invocations adds latency and context overhead.

---

## Edge cases and error handling

**Project has git history but no SRIFLOW_MEMORY.md.** The project is using git but hasn't started structured pipeline tracking. Proceed with git-only analysis. At the end of RETRO.md § 8 Lessons, add: "This project has no SRIFLOW_MEMORY.md. Run /sriflow-plan to start structured cycle tracking — it will initialize memory and improve future retro signal significantly."

**SRIFLOW_MEMORY.md exists but is malformed.** Lines don't match expected patterns. Do not fail — read the raw content, extract what you can (any line with a timestamp counts as evidence of activity), and note at the top of the retro: "SRIFLOW_MEMORY.md format appears non-standard — pipeline analysis may be incomplete."

**Very large git log (> 500 commits in window).** Cap git log at 500 commits for analysis. Note: "Analysis capped at 500 commits — window may cover more commits than shown." Use `--max-count=500` in git log commands.

**Binary files in hotspot analysis.** The file hotspot list from git log may include binary files (images, compiled assets, lock files). Filter out common binary and generated file extensions before presenting the hotspot table:
- Filter out: `package-lock.json`, `yarn.lock`, `*.lock`, `dist/`, `build/`, `*.png`, `*.jpg`, `*.svg`, `*.ico`, `*.wasm`, `*.map`
- Note at bottom of hotspot table: "Lock files, dist/, and binary assets excluded."

**Multiple branches in window.** `git log --since=<date>` includes commits from ALL local branches by default. This can inflate commit counts if multiple branches have been worked on. For accurate cross-branch metrics, use `git log --since=<date> HEAD` (HEAD branch only) or `git log --since=<date> --branches` with explicit filtering. Note the branch scope at the top of the metrics block: "Metrics scope: HEAD branch only (`<_BRANCH>`)."

**clock drift or containerized environment.** The preamble echoes `_TEL_START=$(date +%s)`. If the system clock is wrong, durations will be wrong. Do not use `date` output to infer "today" for the retro window — use the `currentDate` from the session context reminder if available. The git log timestamps are from the commits themselves and are reliable.

**PLAN.md has a format that doesn't enumerate items clearly.** Some PLAN.md files are prose documents without a clear checklist format. In this case: extract the stated goals from PLAN.md using your best reading, match them to commit subjects and CODE_REVIEW.md sections, and note in § 2: "PLAN.md uses prose format — goal matching is approximate." Do not invent unshipped items.

**QA_REPORT.md has a non-standard format.** Different sriflow projects may have different QA report formats. Look for: pass/fail counts near the top, headings like "## Failures", "## Passing", "## Open Issues". Extract what you can. If the format is unrecognizable, quote the first 10 lines of QA_REPORT.md in § 6 and note: "QA report format unrecognized — manual review needed."

**CODE_REVIEW.md severity labels.** Look for these severity markers: `CRITICAL`, `🔴`, `[CRIT]`, `[ERROR]` for critical; `WARN`, `⚠️`, `[WARN]`, `WARNING` for warnings; `NITPICK`, `💬`, `[NIT]`, `NOTE` for nitpicks. If the code review uses a different labeling scheme, try to map it: anything blocking ship = critical, anything that should be fixed soon = warn, anything optional = nitpick. Note the mapping if it differs from standard.

---

## Self-improvement notes

When this skill runs and produces output, log one operational observation if you discovered something non-obvious about the project's development pattern. Write it to SRIFLOW_MEMORY.md as part of the lessons block, prefixed with `[reflect-observation]:`:

```
[reflect-observation]: Build phase consistently runs 3x longer than plan phase — consider breaking large build tasks into smaller milestones
```

Good observations:
- Recurring pipeline stage that consistently runs long (suggest breaking it up)
- A file that appears in every session's commits (might be a God Object — suggest refactor)
- QA pass rate trending down over multiple retros (systemic quality issue)
- Carry-forward completion rate < 50% across 2+ retros (systemic follow-through issue)
- Commits heavily concentrated in one hour of the day (possible context: only working during a specific window)

Bad observations (do not log):
- Generic "tests are important" type observations
- Observations that repeat what's already in the lessons block
- Observations the user obviously already knows (e.g., "this project uses TypeScript")

Only log 1 observation per retro run. If nothing non-obvious was discovered, skip it.

---

## Telemetry (run last)

After workflow completion:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "SRIFLOW_REFLECT_COMPLETE: branch=$_BRANCH duration=${_TEL_DUR}s session=$_SESSION_ID ts=$_TIMESTAMP"
```

This line is parsed by SRIFLOW_MEMORY.md log tooling. Do not modify its format.
