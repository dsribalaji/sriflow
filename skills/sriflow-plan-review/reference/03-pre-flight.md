# 03 — Pre-Flight, Scoring & Core Rules

## Core rules

1. Read PLAN.md in full before evaluating any lens. Do not evaluate from a summary.
2. Ask ALL questions from each lens. No skipping, no combining.
3. Show exact scores after each lens with a one-line verdict.
4. If any lens < 7: present specific fixes, ask the user which changes to make, apply them to PLAN.md, re-score. Loop.
5. The user decides when to stop. You do not stop early.
6. These questions bypass caveman/ponytail compression. Ask precisely — the plan's quality depends on it.

---

## Pre-Flight System Audit

Before evaluating any lens, gather context about the project state. This is not the review — it is the context you need to review intelligently.

```bash
# Recent history — understand what's in flight
git log --oneline -20 2>/dev/null || echo "no git history"

# What's already changed on this branch
git diff HEAD~1 --stat 2>/dev/null || true

# Any TODO/FIXME comments that touch the plan's scope
grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.md" -l 2>/dev/null | head -10

# Stashed work
git stash list 2>/dev/null | head -5
```

Then read (if they exist):
- `SRIFLOW_MEMORY.md` — prior session context, previous review iterations
- `TODOS.md` — any deferred work this plan touches, blocks, or unlocks
- `CLAUDE.md` — project conventions and constraints

Map before reviewing:
- What is the current project state? (Early, mid-build, pre-launch?)
- Is there any work in flight that intersects this plan?
- Are there known pain points (from TODOS or memory) that this plan should address?
- Are there prior review entries in SRIFLOW_MEMORY.md? If yes, this may be a re-review. Note what changed since the last review.

Report findings in one paragraph before proceeding to Step 0.

---

## Pre-Flight Check — Step 0: Locate and read PLAN.md

PLAN.md must exist to proceed.

```bash
if [ -f "PLAN.md" ]; then
  echo "PLAN_FOUND: yes ($(wc -l < PLAN.md | tr -d ' ') lines)"
else
  echo "PLAN_FOUND: no"
  find . -maxdepth 4 -name "PLAN.md" 2>/dev/null
fi
```

If PLAN.md is not found:
- Report NEEDS_CONTEXT
- Tell the user: "PLAN.md is required for this review. If it exists at a different path, paste that path. If the plan has not been created yet, run /sriflow-plan first."
- STOP. Do not proceed.

If PLAN.md is found: Read it in full using the Read tool. Do not skip any section. Do not proceed to lens evaluation until you have read the entire file.

---

## Scoring Philosophy

The 0-10 scale is not a rubric where you award points for features present. It is a signal about the **probability of a good outcome if this plan is built as written**. A plan that is 80% complete but missing the key failure mode handling scores 4/10 on engineering — not 8/10 — because the missing 20% is where the plan will fail in production.

Score what the plan says, not what you assume the team will figure out. If the plan says "handle errors" without specifying how, the error handling does not exist in the plan. A plan is only as good as what is written.

**The scoring bar:**
- 7 is the minimum viable plan for this lens. Not great — solid. Enough to build from.
- 8 means you feel good about the plan in this area.
- 9-10 means you would hold this plan up as an example.
- 6 means you can see the core idea but significant gaps will cause friction.
- 5 means you are uncertain whether the plan will produce a good outcome.
- 4 and below means you have serious doubts.

**The key question at each tier:**
- 7+: "If a team built exactly what this plan says, would the result be good?"
- 5-6: "If a team built exactly what this plan says, would significant problems emerge?"
- 4 and below: "If a team built exactly what this plan says, would it fail?"

---

## How Scoring Works

Each lens scores 0-10. Meanings:

| Score | Meaning |
|-------|---------|
| 0-2   | Fundamental problems. This area of the plan is missing or incoherent. |
| 3-4   | Serious gaps. Will produce bad outcomes if built as-is. |
| 5-6   | Needs work. Core idea present but execution gaps exist that will cause friction. |
| 7-8   | Solid. Main gaps addressed; minor issues present but manageable. |
| 9-10  | Exceptional. Would be hard to improve. |

The threshold for proceeding is **7** on all three lenses. A 6 is not "close enough" — a 6 means the plan will produce problems.

**Score output format after each lens:**

```
<LENS> LENS: X/10 — <one-line verdict>
```

Example: `CEO LENS: 6/10 — Problem is real but the wedge is too wide to test the core hypothesis cheaply.`

**Finding format within each lens:**

```
[BLOCKER]: <finding>. Fix: <specific action>.
[CONCERN]: <finding>. Fix: <specific action>.
[NOTE]: <finding>. No fix required — awareness only.
```

- BLOCKER: Will prevent the plan from succeeding or will produce a product that doesn't work. Must be fixed before score can reach 7.
- CONCERN: Will create friction, rework, or a worse product. Should be fixed.
- NOTE: Worth knowing. Optional to address.

---

## Context Recovery

If SRIFLOW_MEMORY.md was printed by the preamble and it shows a recent `sriflow-plan-review` entry, check whether this is a continuation of a prior session. If so, greet the user with a 2-sentence summary of where the last session ended and what iteration we were on.

---

## Confusion Protocol

For high-stakes ambiguity — which version of PLAN.md to review, whether a user-proposed change resolves a finding, whether an override is intentional — STOP. Name the ambiguity in one sentence, present 2-3 options with tradeoffs, and ask. Do not guess.
