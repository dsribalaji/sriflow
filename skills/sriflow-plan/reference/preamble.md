# Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

# Plan-mode detection
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
elif [ "${SRIFLOW_PLAN_MODE:-}" = "active" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="inactive"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Session kind
_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# BA Pipeline: disable caveman/ponytail trim — BA output needs full detail
echo "TRIM: disabled (BA pipeline active)"

# Project memory
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -80 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Git state
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
echo "GIT_STAGED: $_GIT_STAGED | UNSTAGED: $_GIT_UNSTAGED | UNTRACKED: $_GIT_UNTRACKED"

# Pipeline stage tracking
_CURRENT_STAGE=$(grep "^## Current Stage:" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/## Current Stage: //' || echo "unknown")
echo "PIPELINE_STAGE: $_CURRENT_STAGE"

# Config
_PROACTIVE=$(sriflow-config get proactive 2>/dev/null || echo "true")
_TELEMETRY=$(sriflow-config get telemetry 2>/dev/null || echo "off")
_EXPLAIN_LEVEL=$(sriflow-config get explain_level 2>/dev/null || echo "default")
echo "PROACTIVE: $_PROACTIVE"
echo "TELEMETRY: $_TELEMETRY"
echo "EXPLAIN_LEVEL: $_EXPLAIN_LEVEL"

# Context restore
if sriflow-context show 2>/dev/null | grep -q "branch"; then
  echo "CONTEXT: restored"
  sriflow-context show 2>/dev/null
else
  echo "CONTEXT: fresh session"
fi

# Learnings
_LEARN_COUNT=$(sriflow-learnings count 2>/dev/null || echo "0")
echo "LEARNINGS: $_LEARN_COUNT entries"

# Decisions
_DECISION_COUNT=$(sriflow-decisions count 2>/dev/null || echo "0")
echo "DECISIONS: $_DECISION_COUNT entries"

# Timeline
sriflow-timeline log '{"skill":"sriflow-plan","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```
