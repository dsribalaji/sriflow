# Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

# Prepend sriflow bin/ dirs to PATH for fallback CLIs
export PATH="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)/bin:$PATH"
export PATH="$HOME/.sriflow/bin:$PATH"

# Detect plan mode
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
elif [ "${SRIFLOW_PLAN_MODE:-}" = "active" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="inactive"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Session type
_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# BA pipeline: trim disabled — BA output demands full detail
echo "TRIM: disabled (BA pipeline active)"

# Project memory check
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -80 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Git working-tree state
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
echo "GIT_STAGED: $_GIT_STAGED | UNSTAGED: $_GIT_UNSTAGED | UNTRACKED: $_GIT_UNTRACKED"

# Track pipeline stage
_CURRENT_STAGE=$(grep "^## Current Stage:" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/## Current Stage: //' || echo "unknown")
echo "PIPELINE_STAGE: $_CURRENT_STAGE"

# Read config values
_PROACTIVE=$(sriflow-config get proactive 2>/dev/null || echo "true")
_TELEMETRY=$(sriflow-config get telemetry 2>/dev/null || echo "off")
_EXPLAIN_LEVEL=$(sriflow-config get explain_level 2>/dev/null || echo "default")
echo "PROACTIVE: $_PROACTIVE"
echo "TELEMETRY: $_TELEMETRY"
echo "EXPLAIN_LEVEL: $_EXPLAIN_LEVEL"

# Restore session context
if sriflow-context show 2>/dev/null | grep -q "branch"; then
  echo "CONTEXT: restored"
  sriflow-context show 2>/dev/null
else
  echo "CONTEXT: fresh session"
fi

# Learnings count
_LEARN_COUNT=$(sriflow-learnings count 2>/dev/null || echo "0")
echo "LEARNINGS: $_LEARN_COUNT entries"

# Decisions count
_DECISION_COUNT=$(sriflow-decisions count 2>/dev/null || echo "0")
echo "DECISIONS: $_DECISION_COUNT entries"

# Timeline event
sriflow-timeline log '{"skill":"sriflow-think","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```

## Plan Mode Safe Operations

While plan mode is active, only these are permitted: `Bash` in read-only form, `Read`, `Glob`, `Grep`, writing to `SRIFLOW_MEMORY.md`, and writing to the plan file. Destructive file operations and git mutations are off-limits in plan mode.

## Skill Invocation During Plan Mode

When the skill is launched inside plan mode, walk it step by step from Step 1 onward. AskUserQuestion covers plan mode's end-of-turn requirement. At any STOP point, halt immediately. Call ExitPlanMode only once the skill workflow finishes.

When `SRIFLOW_PLAN_MODE` is `"active"`, run no destructive operations. Read files, analyze, report findings, and write to the plan file.

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

When memory exists, summarize the current state in two sentences. If the current stage points to a next skill, propose it a single time.

## Confusion Protocol

For ambiguity that carries high stakes (architecture, data model, destructive scope, missing context), STOP. State the problem in one sentence, lay out 2-3 options with their tradeoffs, then ask. Do not reach for this on routine coding or clear-cut changes.

## Memory Write (run last)

After the workflow finishes, append to `SRIFLOW_MEMORY.md`:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-think | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Scale: $SCALE_TIER
Stakeholders mapped: [count]
Tier 1 uncertainties: [count]
MEMEOF

sriflow-timeline log '{"skill":"sriflow-think","event":"completed","branch":"'"$_BRANCH"'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","scale":"'"$SCALE_TIER"'"}' 2>/dev/null
```

Swap `OUTCOME` for the real result (done/blocked/concerns).