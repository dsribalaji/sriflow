# Init Block

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -60 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

if [ -f "PLAN.md" ]; then echo "PLAN.md: found"; else echo "PLAN.md: MISSING — cannot build without plan"; fi
if [ -f "DESIGN.md" ]; then echo "DESIGN.md: found"; else echo "DESIGN.md: missing — building from plan only"; fi

_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
echo "GIT_STAGED: $_GIT_STAGED | UNSTAGED: $_GIT_UNSTAGED"

_CURRENT_STAGE=$(grep -i "Current Stage" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/.*Current Stage[^:]*: *//' | sed 's/\*//g' | tr -d ' ' || echo "unknown")
echo "PIPELINE_STAGE: $_CURRENT_STAGE"
```
