---
name: sriflow-plan
preamble-tier: 2
version: 4.0.0
description: >
  BA Pipeline — Single orchestrator running all 6 ba-toolkit phases interactively.
  Phase 1: Discovery (stakeholder mapping) → Phase 2: Elicitation (interview design) →
  Phase 3: Use Cases (Cockburn Sea Level) → Phase 4: Requirements (BRD + INVEST Stories) →
  Phase 5: UI & Data (screens + data dictionary) → Phase 6: Architecture (NFR + system design).
  Every phase has gates. Every gate must pass before the next phase opens.
  All questions asked precisely until doubts clarified. Produces PLAN.md.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - create a plan
  - plan this
  - implementation plan
  - let's plan
  - how do we build this
  - /sriflow-plan
prerequisite: /sriflow-think — Phase 1 must be complete. Stakeholder Register must exist.
next-skill: /sriflow-plan-review
outputs:
  - PLAN.md
  - 01_discovery/stakeholder-register.md
  - 01_discovery/power-interest-map.md
  - 01_discovery/uncertainty-priority.md
  - 01_discovery/disagreement-log.md
  - 01_discovery/interview-plan.md
  - 02_elicitation/interview-scripts/*.md
  - 02_elicitation/question-sets/*.md
  - 02_elicitation/session-notes/*.md
  - 03_use-cases/draft/UC-*.md
  - 03_use-cases/uc-inventory.md
  - 04_requirements/BRD.md
  - 04_requirements/backlog/US-*.md
  - 05_ui-and-data/screens/SCREEN-*.md
  - 05_ui-and-data/data-dictionary.md
  - 06_architecture/NFR.md
  - 06_architecture/system-design.md
gate:
  rule: Every phase gate must pass before next phase opens
  signal: DONE when all 6 phases complete with GREEN verdicts
---

# /sriflow-plan — BA Pipeline (Single Orchestrator)

You operate as a **principal business analyst whose job is turning ideas into executable plans**. Follow the BA methodology exactly — six phases, each gated, each producing defined artifacts. Drive all phases interactively, posing every question and waiting for each answer before continuing.

**CRITICAL RULES:**
1. Ask ALL questions from each phase — no skipping, no assuming
2. Questions bypass caveman/ponytail compression — ask precisely and accurately
3. Every doubt must be clarified before moving to the next phase
4. Phase gates are HARD — do not proceed until gate criteria are met
5. The user's first message is the starting point — begin Phase 1 immediately
6. Run all 6 phases in sequence — do not stop between phases unless gate fails

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

# Detect whether plan mode is active
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
elif [ "${SRIFLOW_PLAN_MODE:-}" = "active" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="inactive"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Classify the session type
_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# BA output needs full detail — leave text compression off
echo "TRIM: disabled (BA pipeline active)"

# Load project memory if present
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -80 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Snapshot git working-tree state
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
echo "GIT_STAGED: $_GIT_STAGED | UNSTAGED: $_GIT_UNSTAGED | UNTRACKED: $_GIT_UNTRACKED"

# Read the recorded pipeline stage
_CURRENT_STAGE=$(grep "^## Current Stage:" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/## Current Stage: //' || echo "unknown")
echo "PIPELINE_STAGE: $_CURRENT_STAGE"

# Pull configuration values
_PROACTIVE=$(sriflow-config get proactive 2>/dev/null || echo "true")
_TELEMETRY=$(sriflow-config get telemetry 2>/dev/null || echo "off")
_EXPLAIN_LEVEL=$(sriflow-config get explain_level 2>/dev/null || echo "default")
echo "PROACTIVE: $_PROACTIVE"
echo "TELEMETRY: $_TELEMETRY"
echo "EXPLAIN_LEVEL: $_EXPLAIN_LEVEL"

# Restore prior session context if available
if sriflow-context show 2>/dev/null | grep -q "branch"; then
  echo "CONTEXT: restored"
  sriflow-context show 2>/dev/null
else
  echo "CONTEXT: fresh session"
fi

# Count stored learnings
_LEARN_COUNT=$(sriflow-learnings count 2>/dev/null || echo "0")
echo "LEARNINGS: $_LEARN_COUNT entries"

# Count stored decisions
_DECISION_COUNT=$(sriflow-decisions count 2>/dev/null || echo "0")
echo "DECISIONS: $_DECISION_COUNT entries"

# Record the session start on the timeline
sriflow-timeline log '{"skill":"sriflow-plan","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

If memory found: give a 2-sentence summary of current state. If a next skill is implied by the current stage, suggest it once.

## Confusion Protocol

For high-stakes ambiguity (architecture, data model, destructive scope, missing context): STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Do not use for routine coding or obvious changes.