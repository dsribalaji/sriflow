---
name: sriflow
preamble-tier: 3
version: 2.0.0
description: SriFlow front door — routes any intent to the correct pipeline skill. Shows status and help. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - sriflow
  - what stage am I on
  - where are we
  - sriflow help
  - /sriflow
---

## When to invoke this skill

Single entry point for the SriFlow pipeline. Use when you invoke `/sriflow` without a specific skill, want pipeline status, need routing help, or are unsure which skill fits your current intent. Does NOT execute destination skills — tells you which to invoke and what it does.

## Preamble (run first, every invocation)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"

# Plan-mode detection
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Project memory
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -30 SRIFLOW_MEMORY.md
  _CURRENT_STAGE=$(grep "^Current Stage:" SRIFLOW_MEMORY.md | head -1 | sed 's/Current Stage: //' || echo "unknown")
  _PROJECT_NAME=$(grep "^Project:" SRIFLOW_MEMORY.md | head -1 | sed 's/Project: //' || echo "unnamed")
else
  echo "MEMORY: missing"
  _CURRENT_STAGE="not-started"
  _PROJECT_NAME="unnamed"
fi
echo "CURRENT_STAGE: $_CURRENT_STAGE"
echo "PROJECT_NAME: $_PROJECT_NAME"

# Artifact detection — determines pipeline position
for f in PLAN.md PLAN_REVIEW.md DESIGN.md CODE_REVIEW.md QA_REPORT.md RETRO.md; do
  [ -e "$f" ] && echo "ARTIFACT: $f found"
done
[ -d "design" ] && echo "ARTIFACT: design/ directory found"

# Git state summary
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
echo "GIT: staged=$_GIT_STAGED unstaged=$_GIT_UNSTAGED untracked=$_GIT_UNTRACKED"

# Version check — compare installed VERSION against remote
_SRIFLOW_VERSION=$(cat VERSION 2>/dev/null || echo "0.0.0")
echo "VERSION: $_SRIFLOW_VERSION"

# Check for updates (non-blocking, 2s timeout)
if command -v git >/dev/null 2>&1; then
  _REMOTE_VERSION=$(timeout 2 git ls-remote --tags origin 2>/dev/null | grep -oP 'refs/tags/v\K[0-9.]+$' | tail -1 || echo "")
  if [ -n "$_REMOTE_VERSION" ] && [ "$_REMOTE_VERSION" != "$_SRIFLOW_VERSION" ]; then
    echo "UPDATE: available v$_REMOTE_VERSION (installed v$_SRIFLOW_VERSION)"
  fi
fi
```

## Plan Mode Safe Operations

In plan mode, allowed: `Bash` (read-only), `Read`, `Glob`, `Grep`, writes to `SRIFLOW_MEMORY.md`. No destructive file operations or git mutations.

## Skill Invocation During Plan Mode

If invoked in plan mode: follow steps in order. AskUserQuestion satisfies plan mode's end-of-turn requirement. STOP at STOP points immediately. No routing — only status and guidance.

If `SRIFLOW_PLAN_MODE` is `"active"`: read files, analyze, report findings. Do not run destructive ops.

# /sriflow — Pipeline Router

## Step 0 — Detect pipeline position from artifacts

```bash
# Check every stage artifact
_PLAN_DONE=0; _PLAN_REVIEW_DONE=0; _DESIGN_DONE=0
_BUILD_DONE=0; _CODE_REVIEW_DONE=0; _TEST_DONE=0
_SHIP_DONE=0; _REFLECT_DONE=0

[ -f "PLAN.md" ] && _PLAN_DONE=1 && echo "STAGE: plan=done"
[ -f "PLAN_REVIEW.md" ] && _PLAN_REVIEW_DONE=1 && echo "STAGE: plan-review=done"
[ -f "DESIGN.md" ] || [ -d "design" ] && _DESIGN_DONE=1 && echo "STAGE: design=done"
[ -f "CODE_REVIEW.md" ] && _CODE_REVIEW_DONE=1 && echo "STAGE: code-review=done"
[ -f "QA_REPORT.md" ] && _TEST_DONE=1 && echo "STAGE: test=done"
[ -f "RETRO.md" ] && _REFLECT_DONE=1 && echo "STAGE: reflect=done"

# Get file dates for display
[ -f "PLAN.md" ] && stat -c "%y" PLAN.md 2>/dev/null | cut -d' ' -f1
[ -f "PLAN_REVIEW.md" ] && stat -c "%y" PLAN_REVIEW.md 2>/dev/null | cut -d' ' -f1
[ -f "DESIGN.md" ] && stat -c "%y" DESIGN.md 2>/dev/null | cut -d' ' -f1
[ -f "CODE_REVIEW.md" ] && stat -c "%y" CODE_REVIEW.md 2>/dev/null | cut -d' ' -f1
[ -f "QA_REPORT.md" ] && stat -c "%y" QA_REPORT.md 2>/dev/null | cut -d' ' -f1
[ -f "RETRO.md" ] && stat -c "%y" RETRO.md 2>/dev/null | cut -d' ' -f1
```

If `SRIFLOW_MEMORY.md` exists and contains a `Current Stage:` line, that overrides artifact inference for the ⏳ marker.

## Step 1 — Identify intent

Read the user's message. Match against the routing table. If matched, proceed to Step 2. If not matched, proceed to Step 4 (AUQ).

Recognized intent patterns:

| Intent | Route |
|--------|-------|
| new idea / I have an idea / plan this / think through this | `/sriflow-plan` |
| ideate / brainstorm / /sriflow-think | `/sriflow-plan` |
| let me think / explore this idea / what should I build | `/sriflow-plan` |
| review the plan / is this plan good / plan review | `/sriflow-plan-review` |
| audit the plan / check the plan before building | `/sriflow-plan-review` |
| design / wireframe / mockup / UI spec | `/sriflow-design` |
| layout / screens / draw the interface | `/sriflow-design` |
| build / implement / code / write the code | `/sriflow-build` |
| start coding / make it / create the feature | `/sriflow-build` |
| code review / review my changes / review the diff | `/sriflow-code-review` |
| check the diff / security review / audit the code | `/sriflow-code-review` |
| test / QA / does it work / check for bugs | `/sriflow-test` |
| run tests / verify / quality check | `/sriflow-test` |
| browse / open in browser / check the site / navigate | `/sriflow-browser` |
| screenshot / scrape / open localhost / headless | `/sriflow-browser` |
| ship / deploy / release / go live / push to prod | `/sriflow-ship` |
| merge and deploy / CI / smoke test | `/sriflow-ship` |
| retro / reflect / what did we learn / retrospective | `/sriflow-reflect` |
| after-action / lessons learned / what worked | `/sriflow-reflect` |
| save context / read memory / update memory | `/sriflow-memory` |
| compress memory / what do we know / project state | `/sriflow-memory` |
| status / where am I / what stage / pipeline status | show status (Step 3) |
| help / what skills / what can sriflow do | show help (Step 3) |
| upgrade / update sriflow / check for updates | upgrade check (Step 3b) |
| /sriflow-think | `/sriflow-plan` (think merged into plan) |

## Step 2 — Route

When intent is matched, output exactly this format:

```
→ /sriflow-<skill>
<One sentence: what that skill will do for you right now.>
```

Do not execute the destination skill. Do not plan ahead. One routing message, then stop.

Examples:

- Intent "I have an idea for a new feature":
  ```
  → /sriflow-plan
  Runs the BA pipeline (6 phases) to turn your idea into a structured PLAN.md.
  ```

- Intent "review the plan":
  ```
  → /sriflow-plan-review
  Three-lens review (CEO, Design, Eng) — scores 0-10 per lens, blocks if any < 7.
  ```

- Intent "build it":
  ```
  → /sriflow-build
  Implements the approved DESIGN.md — pre-build safety check, then writes code.
  ```

If `/sriflow-think` is invoked explicitly, route to `/sriflow-plan` and note once: "sriflow-think is now merged into sriflow-plan."

## Step 3 — Status and Help display

### Pipeline status (triggered by: "status", "where am I", "what stage", "pipeline status")

Read artifact detection output from Step 0. Read `_CURRENT_STAGE` from preamble. Compute markers:

- ✅ = artifact file for this stage exists on disk
- ⏳ = this is the current stage per `SRIFLOW_MEMORY.md` (or first stage without artifact if memory absent)
- ⬜ = not yet started

Render:

```
SRIFLOW PIPELINE — <_PROJECT_NAME>
Branch: <_BRANCH>

✅ /sriflow-plan          PLAN.md (<date>)
✅ /sriflow-plan-review   PLAN_REVIEW.md (<date>)
⏳ /sriflow-design        IN PROGRESS
⬜ /sriflow-build
⬜ /sriflow-code-review
⬜ /sriflow-test
⬜ /sriflow-ship
⬜ /sriflow-reflect

Next: /sriflow-design
```

Rules:
- Show date next to ✅ stages in `(YYYY-MM-DD)` format.
- Show `IN PROGRESS` next to ⏳ stage.
- If no artifacts and no memory: all ⬜ except `/sriflow-plan` which is ⏳.
- If all artifacts exist: all ✅, `Next: /sriflow-reflect` (or "Pipeline complete" if RETRO.md exists).
- `/sriflow-browser` and `/sriflow-memory` are not pipeline stages — omit from status. They are utilities available at any stage.
- `/sriflow-trim` is always-on — omit from status.

### Help listing (triggered by: "help", "what skills", "what can sriflow do", "/sriflow help")

```
SRIFLOW SKILLS

Pipeline (run in order):
  /sriflow-plan         BA pipeline — idea to PLAN.md (6 phases: Discovery → Elicitation → Use Cases → Requirements → UI & Data → Architecture)
  /sriflow-plan-review  Three-lens review — CEO, Design, Eng. Scores 0-10. Blocks ship if any lens < 7.
  /sriflow-design       Wireframes → DESIGN.md → HTML mockups. Iterative review loop.
  /sriflow-build        Implement the approved design. Pre-build safety check. sriflow-trim enforces minimal code.
  /sriflow-code-review  Diff review — security, correctness, complexity. CRITICAL findings block ship.
  /sriflow-test         QA — golden path, edge cases, error states, regression. Produces QA_REPORT.md.
  /sriflow-ship         Deploy — gate check, merge PR, wait for CI, smoke test.
  /sriflow-reflect      Retro — metrics, lessons learned, RETRO.md. Updates memory.

Utilities (available any stage):
  /sriflow-browser      Headless Chromium — screenshots, navigation, scraping, automation. ~100ms/command.
  /sriflow-memory       Context — read, write, compress SRIFLOW_MEMORY.md.
  /sriflow-trim         Always-on — compressed speech + minimal code enforcement (ponytail mode).

Notes:
  /sriflow-think → now merged into /sriflow-plan. Both route the same way.
  Run /sriflow (this skill) any time to get status or routing help.
```

### Upgrade check (triggered by: "upgrade", "update sriflow", "check for updates")

```bash
_SRIFLOW_VERSION=$(cat VERSION 2>/dev/null || echo "0.0.0")
_REMOTE_VERSION=$(timeout 2 git ls-remote --tags origin 2>/dev/null | grep -oP 'refs/tags/v\K[0-9.]+$' | tail -1 || echo "")
```

Compare `_SRIFLOW_VERSION` (installed) against `_REMOTE_VERSION` (latest tag on origin).

```
SRIFLOW VERSION CHECK

Installed: v<_SRIFLOW_VERSION>
Latest:    v<_REMOTE_VERSION>

<If same:>
✓ Up to date.

<If remote is newer:>
Update available: v<_SRIFLOW_VERSION> → v<_REMOTE_VERSION>
To upgrade: cd <project-root> && git pull origin main

<If remote check failed (offline/private repo):>
Could not reach remote. Installed v<_SRIFLOW_VERSION>. Run 'git fetch --tags' when online.
```

Rules:
- Version check runs in preamble (non-blocking, 2s timeout). If it succeeds,
  show result. If it fails silently, skip upgrade section.
- Do not auto-upgrade. Always show the command for the user to run.
- If VERSION file is missing: show "VERSION: unknown" and skip check.

---

## Step 4 — Unclear intent (AUQ D1)

If the user's request does not match the routing table and is not a status or help request, use AskUserQuestion before doing anything else.

Show current pipeline status first (same format as Step 3), then:

```
D1 — Where do you want to go?
Branch: <_BRANCH>
ELI10: SriFlow has one skill per pipeline stage. Running the right one keeps your artifacts in sync and prevents stale plan/design/code mismatches. I couldn't match your request to a known stage — pick the closest below.
Stakes if wrong: Wrong skill generates artifacts for the wrong stage; downstream skills may reject them or overwrite good work.
Recommendation: A) Continue from current stage because you're mid-pipeline with work already done.
Completeness: A=9/10, B=8/10, C=6/10
A) Continue from current stage — run /sriflow-<current_stage> (recommended)
  ✅ Picks up exactly where you left off, artifacts stay consistent
  ❌ Wrong if you need to revisit an earlier stage
B) Jump to a specific stage — tell me which one
  ✅ Flexible, covers mid-pipeline corrections and reruns
  ❌ Skipping stages can leave artifacts inconsistent
C) Show help — list all skills so I can pick
  ✅ Full overview if you're not sure what each skill does
  ❌ Takes an extra turn before you start working
Net: If you're mid-pipeline, A. If you backtracked or made a correction, B. If you're new here, C.
```

Fill `<current_stage>` from `_CURRENT_STAGE`. If `_CURRENT_STAGE` is `not-started`, recommend option B with `/sriflow-plan`.

## AskUserQuestion Format

Every AskUserQuestion is a decision brief:

```
D<N> — <one-line question title>
Branch: <_BRANCH value>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro, ≥40 chars>
  ❌ <con, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment per question in session.
ELI10 always present. Recommendation always present. `(recommended)` on exactly one option.

If AskUserQuestion is unavailable: render as prose with same fields (ELI10, completeness, recommendation), then STOP.

## Voice

SriFlow voice: direct, builder-to-builder, compressed for runtime.

- Lead with the point. What it does, why it matters, what changes.
- Be concrete. Name files, functions, line numbers, commands.
- Never corporate, academic, or hype. No filler.
- Sound like a builder talking to a builder.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted.
- The user has context you do not. Cross-model agreement is a recommendation, not a decision.
- Never narrate what code does. Only comment when the WHY is non-obvious.

Good: "PLAN.md exists, PLAN_REVIEW.md missing. Run /sriflow-plan-review next."
Bad: "I've analyzed your pipeline state and identified that you may wish to proceed with the plan review phase."

## Completeness Principle

Do the complete thing. The only out-of-scope is genuinely unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence.
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS: <status> | REASON: <one line> | ATTEMPTED: <one line> | RECOMMENDATION: <one line>`

## Memory Write (run last)

After workflow completion, append to `SRIFLOW_MEMORY.md`:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Routed to: DESTINATION
MEMEOF
```

Replace `OUTCOME` with actual outcome (done/blocked/concerns). Replace `DESTINATION` with the skill routed to, or `status`/`help` if that's what was shown.

Only write memory if something happened worth recording (routing decision, status shown for mid-pipeline project). Do not write memory for a simple `/sriflow help` on a fresh project.

## Context Recovery

At session start or after context compaction:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

If memory found: give a 2-sentence summary of current state. If a next skill is implied by the current stage, suggest it once.

If no memory found: say "No SRIFLOW_MEMORY.md found. Run /sriflow-plan to start a new project."

## Confusion Protocol

For high-stakes ambiguity (architecture decisions, destructive scope, missing context that changes the routing): STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Do not use for routine routing or obvious intent matches.

## Stage Artifact Reference

| Stage | Artifact | Notes |
|-------|----------|-------|
| /sriflow-plan | `PLAN.md` | BA pipeline output |
| /sriflow-plan-review | `PLAN_REVIEW.md` | Three-lens review scores |
| /sriflow-design | `DESIGN.md` or `design/` directory | Wireframes + HTML mockups |
| /sriflow-build | no single artifact — check git diff | Code is in the working tree |
| /sriflow-code-review | `CODE_REVIEW.md` | Diff review findings |
| /sriflow-test | `QA_REPORT.md` | QA findings report |
| /sriflow-ship | no artifact — check CI/deployment logs | Shipped = in prod |
| /sriflow-reflect | `RETRO.md` | Retrospective output |

Build and Ship leave no markdown artifact. For these stages, rely on `Current Stage:` in `SRIFLOW_MEMORY.md` for the ⏳ marker. If SRIFLOW_MEMORY.md shows `Current Stage: build` but no `CODE_REVIEW.md` exists, mark build as ⏳.

## Routing Edge Cases

**User invokes `/sriflow-think`:** Route to `/sriflow-plan`. Output:
```
→ /sriflow-plan
sriflow-think is now merged into sriflow-plan — same pipeline, one fewer step.
```

**User says "next":** Check pipeline status. Route to the first ⏳ stage, or the first ⬜ stage after the last ✅ stage.

**User says "start over":** Do not wipe artifacts. Ask D1 with options: A) archive existing artifacts and restart `/sriflow-plan`, B) keep artifacts and restart from a specific stage.

**User mentions a specific file (e.g. "look at PLAN.md"):** Read the file, summarize it in 2-3 sentences, then ask if they want to continue from that stage or route somewhere else.

**User asks about sriflow itself:** Answer from this SKILL.md. Do not invent features not listed here.

**Multiple intents in one message (e.g. "review the plan and start building"):** Route to the earlier stage first. Output:
```
→ /sriflow-plan-review (first)
After that passes: /sriflow-build
Reason: plan review gates build — run in order.
```

## Quick Reference Card

```
/sriflow              This skill. Status, routing, help.
/sriflow-plan         Idea → PLAN.md (also: /sriflow-think)
/sriflow-plan-review  PLAN.md → reviewed, scored, approved
/sriflow-design       Approved plan → DESIGN.md + HTML mockups
/sriflow-build        DESIGN.md → working code
/sriflow-code-review  Working code → CODE_REVIEW.md
/sriflow-test         Code → QA_REPORT.md
/sriflow-ship         Passing tests → deployed
/sriflow-reflect      Post-ship → RETRO.md + lessons in memory

Utilities (any stage):
/sriflow-browser      Headless Chrome — screenshots, scraping, automation
/sriflow-memory       Read/write/compress SRIFLOW_MEMORY.md
/sriflow-trim         Always-on ponytail — minimal code + compressed speech
```
