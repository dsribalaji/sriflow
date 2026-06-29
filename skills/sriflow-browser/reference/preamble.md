# Preamble Script

Run this before any browse command. Sets shell variables used throughout the skill.

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
else
  echo "MEMORY: missing"
fi

# Git state
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
echo "GIT_STAGED: $_GIT_STAGED | UNSTAGED: $_GIT_UNSTAGED"

# Pipeline stage
_CURRENT_STAGE=$(grep "^## Current Stage:" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/## Current Stage: //' || echo "unknown")
echo "PIPELINE_STAGE: $_CURRENT_STAGE"
```
