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

## When to invoke

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

if command -v git >/dev/null 2>&1; then
  _REMOTE_VERSION=$(timeout 2 git ls-remote --tags origin 2>/dev/null | grep -oP 'refs/tags/v\K[0-9.]+$' | tail -1 || echo "")
  if [ -n "$_REMOTE_VERSION" ] && [ "$_REMOTE_VERSION" != "$_SRIFLOW_VERSION" ]; then
    echo "UPDATE: available v$_REMOTE_VERSION (installed v$_SRIFLOW_VERSION)"
  fi
fi
```

## Plan Mode Safe Operations

In plan mode, allowed: `Bash` (read-only), `Read`, `Glob`, `Grep`, writes to `SRIFLOW_MEMORY.md`. No destructive file operations or git mutations.

If `SRIFLOW_PLAN_MODE` is `"active"`: read files, analyze, report findings. Do not run destructive ops.

## Step 0 — Detect pipeline position

```bash
_PLAN_DONE=0; _PLAN_REVIEW_DONE=0; _DESIGN_DONE=0
_BUILD_DONE=0; _CODE_REVIEW_DONE=0; _TEST_DONE=0
_SHIP_DONE=0; _REFLECT_DONE=0

[ -f "PLAN.md" ] && _PLAN_DONE=1 && echo "STAGE: plan=done"
[ -f "PLAN_REVIEW.md" ] && _PLAN_REVIEW_DONE=1 && echo "STAGE: plan-review=done"
[ -f "DESIGN.md" ] || [ -d "design" ] && _DESIGN_DONE=1 && echo "STAGE: design=done"
[ -f "CODE_REVIEW.md" ] && _CODE_REVIEW_DONE=1 && echo "STAGE: code-review=done"
[ -f "QA_REPORT.md" ] && _TEST_DONE=1 && echo "STAGE: test=done"
[ -f "RETRO.md" ] && _REFLECT_DONE=1 && echo "STAGE: reflect=done"

for f in PLAN.md PLAN_REVIEW.md DESIGN.md CODE_REVIEW.md QA_REPORT.md RETRO.md; do
  [ -f "$f" ] && stat -c "%y" "$f" 2>/dev/null | cut -d' ' -f1
done
```

If `SRIFLOW_MEMORY.md` exists with a `Current Stage:` line, that overrides artifact inference for the ⏳ marker.

## Step 1 — Identify intent

Read the user's message. Match against the routing table in `reference/routing-table.md`. If matched, proceed to Step 2. If not matched, proceed to Step 3 (AUQ).

Read `reference/routing-table.md` for full intent→skill mapping.

## Step 2 — Route

When intent is matched, output exactly this format:

```
→ /sriflow-<skill>
<One sentence: what that skill will do for you right now.>
```

Do not execute the destination skill. Do not plan ahead. One routing message, then stop.

If `/sriflow-think` is invoked explicitly, route to `/sriflow-plan` and note once: "sriflow-think is now merged into sriflow-plan."

## Step 3 — Status, Help, Upgrade

- **Status** ("status", "where am I", "what stage"): Read `reference/status-display.md` for format and rules.
- **Help** ("help", "what skills"): Read `reference/help-listing.md` for skill listing.
- **Upgrade** ("upgrade", "check for updates"): Read `reference/upgrade-handler.md` for version check logic.

## Step 4 — Unclear intent (AUQ)

If request doesn't match routing table and isn't status/help, read `reference/auq-templates.md` for the D1 decision brief format and AskUserQuestion rules.

## Routing Edge Cases

Read `reference/routing-edge-cases.md` for handling: `/sriflow-think`, "next", "start over", file references, multiple intents.

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

At session start or after context compaction: `cat SRIFLOW_MEMORY.md` if exists. Give 2-sentence summary, suggest next skill once. If missing: "No SRIFLOW_MEMORY.md found. Run /sriflow-plan to start a new project."

## Confusion Protocol

High-stakes ambiguity (architecture decisions, destructive scope, missing context): STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Not for routine routing or obvious intent matches.
