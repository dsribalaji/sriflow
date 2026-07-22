# Preamble & Decision Framework

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

# Project memory
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -60 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Plans
if [ -f "PLAN.md" ]; then
  echo "PLAN.md: found"
else
  echo "PLAN.md: missing — design from scratch"
fi
if [ -f "PLAN_REVIEW.md" ]; then
  echo "PLAN_REVIEW.md: found"
fi

# Design dir
ls design/ 2>/dev/null && echo "design/: exists" || echo "design/: will create"

# DESIGN.md
[ -f "DESIGN.md" ] && echo "DESIGN.md: exists" || echo "DESIGN.md: missing"

# Git state
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
echo "GIT: staged=$_GIT_STAGED unstaged=$_GIT_UNSTAGED"

# Timeline
sriflow-timeline log '{"skill":"sriflow-design","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```

---

## Plan Mode Safe Operations

In plan mode, allowed because they inform the plan: `Read`, `Glob`, `Grep`, `Bash` (read-only commands), writes to `SRIFLOW_MEMORY.md`, and writes to `PLAN.md`. No destructive file operations or git mutations in plan mode.

## Skill Invocation During Plan Mode

If the user invokes this skill in plan mode, follow it step by step. AskUserQuestion satisfies plan mode's end-of-turn requirement. If AskUserQuestion is unavailable: render the decision brief as prose with the mandatory triad (ELI10, completeness, recommendation), then STOP and wait for a typed response.

At a STOP point, stop immediately. Do not continue the workflow or advance to the next phase.

---

## AskUserQuestion Format

Every AskUserQuestion is a structured decision brief. Use the D-numbered format for every question.

```
D<N> — <one-line question title>
Project/branch: <project name> on <_BRANCH>
ELI10: <plain English a 16-year-old could follow, 2-4 sentences, name the stakes>
Stakes if we pick wrong: <one sentence on what breaks or what the user loses>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10   (or: Note: options differ in kind, not coverage — no completeness score)
Pros / cons:
A) <option label> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option label>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of what you are actually trading off>
```

Rules:
- D-numbering: first question in a skill invocation is `D1`. Increment yourself. This is a model-level instruction, not a runtime counter.
- ELI10 is always present, in plain English, not function names.
- Recommendation is ALWAYS present.
- `(recommended)` on exactly one option.
- Completeness: use `N/10` when options differ in coverage (10 = complete, 7 = happy path, 3 = shortcut). If options differ in kind, write the kind-note.
- Pros / cons: ✅ and ❌. Minimum 2 pros and 1 con per option when the choice is real. Minimum 40 characters per bullet.
- Net line closes the decision.
- Maximum 4 options per AskUserQuestion call. With 5+ real options: split into sequential per-option calls labeled `D<N>.1`, `D<N>.2`, etc.
- Non-ASCII characters: write directly, never `\uXXXX`-escape.

If AskUserQuestion is unavailable or a call fails:
- In headless / spawned sessions: auto-choose the recommended option and announce it.
- In interactive sessions: render the full prose fallback (same triad: ELI10, per-choice completeness, recommendation with `(recommended)` marker), then STOP and wait for a typed reply.

---

## Memory Write

After workflow completion, append to `SRIFLOW_MEMORY.md`:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-design | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Phase completed: PHASE
DESIGN.md: DESIGN_STATUS
HTML files: HTML_FILES
Review findings fixed: FIXED_COUNT
MEMEOF
sriflow-timeline log '{"skill":"sriflow-design","event":"completed","branch":"'"$_BRANCH"'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null || true
```

Replace `OUTCOME`, `PHASE`, `DESIGN_STATUS`, `HTML_FILES`, `FIXED_COUNT` with actuals before running.

---

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

If memory found: give a 2-sentence summary of where the design pipeline is. If a phase is clearly incomplete, say so and offer to resume.

---

## Confusion Protocol

For high-stakes ambiguity — architecture, data model, screen count, missing product context — STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Do not use for routine layout or obvious choices.
