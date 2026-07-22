# 01 — Preamble & Plan Mode

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
