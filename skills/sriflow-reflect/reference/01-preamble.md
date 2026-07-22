# Preamble + Plan Mode + AskUserQuestion Format

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
