# Preamble & Infrastructure

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

# Plan-mode detection
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Session kind
_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# Project memory
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -60 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Gate files
if [ -f "CODE_REVIEW.md" ]; then
  echo "CODE_REVIEW.md: found"
  _CRITICAL_COUNT=$(grep -c "🔴 CRITICAL" CODE_REVIEW.md 2>/dev/null || echo "0")
  echo "CRITICAL_FINDINGS: $_CRITICAL_COUNT"
  if [ "$_CRITICAL_COUNT" -gt 0 ]; then
    echo "--- CRITICAL FINDINGS ---"
    grep "🔴 CRITICAL" CODE_REVIEW.md
    echo "--- END CRITICAL FINDINGS ---"
  fi
else
  echo "CODE_REVIEW.md: not found"
  _CRITICAL_COUNT=0
fi

if [ -f "QA_REPORT.md" ]; then
  echo "QA_REPORT.md: found"
  grep "Verdict:" QA_REPORT.md 2>/dev/null || echo "Verdict: (not found)"
  _QA_FAILS=$(grep -c "FAIL\|❌" QA_REPORT.md 2>/dev/null || echo "0")
  echo "QA_FAILURES: $_QA_FAILS"
else
  echo "QA_REPORT.md: not found"
  _QA_FAILS=0
fi

# PR state
_PR=$(gh pr view --json number,state,baseRefName -q '"\(.number) [\(.state)] → \(.baseRefName)"' 2>/dev/null || echo "none")
echo "PR: $_PR"

# Deploy target detection
_DEPLOY_TARGET="unknown"
[ -f "vercel.json" ] && _DEPLOY_TARGET="vercel"
[ -f "fly.toml" ] && _DEPLOY_TARGET="fly"
[ -f "railway.json" ] && _DEPLOY_TARGET="railway"
[ -f "Dockerfile" ] && [ "$_DEPLOY_TARGET" = "unknown" ] && _DEPLOY_TARGET="docker"
_GHA_DEPLOY=$(ls .github/workflows/*.yml 2>/dev/null | xargs grep -l -i "deploy\|production\|release" 2>/dev/null | head -1 || echo "")
if [ -n "$_GHA_DEPLOY" ]; then
  if [ "$_DEPLOY_TARGET" = "unknown" ]; then
    _DEPLOY_TARGET="github-actions"
  else
    _DEPLOY_TARGET="${_DEPLOY_TARGET}+github-actions"
  fi
fi
echo "DEPLOY_TARGET: $_DEPLOY_TARGET"

# Git state
_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
_DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "SHA: $_SHA | DIRTY_FILES: $_DIRTY"
```

## Plan Mode Safe Operations

In plan mode, allowed: `Bash` (read-only inspection), `Read`, `Glob`, `Grep`, writes to
`SRIFLOW_MEMORY.md`, and writes to the plan file. No git mutations, no deploys, no merges
in plan mode.

## Skill Invocation During Plan Mode

If the user invokes this skill in plan mode, treat the skill file as executable instructions.
Follow it step by step starting from Step 0. AskUserQuestion satisfies plan mode's end-of-turn
requirement. If AskUserQuestion is unavailable, follow the prose fallback below and STOP. At any
STOP point, stop immediately — do not continue. Call ExitPlanMode only after the skill workflow
completes, or if the user cancels.

## AskUserQuestion Format

### Tool resolution

Prefer `mcp__*__AskUserQuestion` if it appears in your tool list. Use native AskUserQuestion
otherwise. If both are unavailable, or if a call fails, render the prose fallback (same triad
structure as the tool format), then STOP and wait for a typed reply.

### Format

Every AskUserQuestion is a decision brief. Must be a tool call, not prose, unless the fallback
applies:

```
D<N> — <one-line question title>
Branch: <_BRANCH>
ELI10: <plain English a 16-year-old can follow, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks, what users see, what's lost>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10   (or: Note: options differ in kind, not coverage — no completeness score)
A) <option label> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option label>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment per question. ELI10 always present. Recommendation
always present. `(recommended)` on exactly one option. Completeness scores when options differ in
coverage; kind-note when they differ in kind. Every option has ≥2 ✅ and ≥1 ❌ each ≥40 chars.

**Prose fallback (when AskUserQuestion unavailable):** Surface the mandatory triad — plain-English
issue, per-choice completeness, recommendation with `(recommended)` — as paragraphs, then STOP
and wait. Require explicit letter for one-way/destructive gates.

**One-way destructive confirmations:** Require explicit typed letter. "ok" or "sure" is not
confirmation. Re-ask on ambiguity. Never proceed without the explicit letter.
