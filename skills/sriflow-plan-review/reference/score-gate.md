# Score Gate and Loop Logic

## Score Gate and Loop Logic

### After all three lenses are scored:

Print the score summary:

```
--- REVIEW SCORES ---
CEO LENS:    X/10 — <verdict>
DESIGN LENS: X/10 — <verdict>
ENG LENS:    X/10 — <verdict>

Gate: 7/10 required on all lenses to proceed to /sriflow-design
```

### If any score < 7 — BLOCKED

The plan is blocked. Do not suggest proceeding. Do not ask the user if they want to continue anyway. Present the specific issues that caused the block.

For each lens that scored < 7, list its BLOCKERs and CONCERNs from the review above. Then use AskUserQuestion:

```
D1 — Plan blocked — one or more lenses scored below 7
Branch: <_BRANCH>
ELI10: The plan has gaps that would produce problems if built as-is. The scores
  below 7 identify specific areas where the plan is missing critical decisions,
  has architectural risks, or lacks design thinking. We need to fix these before
  moving to design and build. This is an improvement loop, not a rejection.
Stakes if wrong: Building from a weak plan produces rework, bad UX, or architectural
  debt that costs 5x more to fix after the fact.
Recommendation: A because fixing the plan now costs minutes; fixing it after
  implementation costs days.
Note: options differ in kind, not coverage — no completeness score.
A) Fix the plan — I'll tell you what changes to make (recommended)
  ✅ Plan enters design phase in a much stronger state, reducing rework
  ✅ Specific issues are resolved before they become implementation bugs
  ❌ Takes more time now before moving to /sriflow-design
B) Override and proceed — acknowledge risks, move forward anyway
  ✅ Faster to start designing and building
  ✅ Some teams learn better by building and discovering
  ❌ The specific gaps named above will likely surface as problems during build
  ❌ Override is recorded in PLAN_REVIEW.md and must be acknowledged explicitly
Net: Fix now for lower total cost, override now for faster start with known risk.
```

**If user chooses A (fix):**

The user will tell you what changes they want to make to PLAN.md. Apply those changes using the Edit tool. Do not paraphrase their instructions — apply them accurately. After applying, confirm the changes were made and proceed to re-score.

**If user chooses B (override):**

Record the override. Ask for explicit acknowledgment:

```
D2 — Override confirmation required
Branch: <_BRANCH>
ELI10: You are choosing to proceed despite one or more lenses scoring below 7.
  This means the specific gaps named in the review remain unresolved. The override
  will be documented in PLAN_REVIEW.md with the scores and the specific issues.
Stakes if wrong: The gaps may produce problems during build or design that require
  rework.
Recommendation: A because risk acknowledgment should be explicit, not assumed.
Note: options differ in kind, not coverage — no completeness score.
A) Confirmed — I acknowledge the risks, proceed with DONE_WITH_CONCERNS (recommended)
  ✅ Explicit consent recorded; no ambiguity about the decision
  ❌ The flagged gaps remain in the plan
B) Actually, let me fix the plan first — go back to improvement loop
  ✅ Plan enters design phase in a stronger state
  ❌ Takes more time
Net: Override is valid but must be explicit, not accidental.
```

If confirmed: set status to DONE_WITH_CONCERNS and proceed to write PLAN_REVIEW.md.
If declined: return to the fix loop.

### Re-scoring after fixes

After applying user changes, re-read PLAN.md in full before re-scoring. Do not score from memory.

Re-run only the lens questions that are relevant to the changes made. If the user changed a CEO-lens issue, re-run the full CEO lens. Do not re-run lenses where nothing changed.

Print the updated scores:

```
--- UPDATED SCORES (Iteration N) ---
CEO LENS:    X/10 — <verdict>
DESIGN LENS: X/10 — <verdict>
ENG LENS:    X/10 — <verdict>
```

If all scores are now >= 7: proceed to write PLAN_REVIEW.md.
If any score is still < 7: return to the gate. Present the remaining issues and ask what to change next.

**Loop rule:** Keep iterating until all lenses >= 7 OR user explicitly chooses the override path. Do not stop early. Do not accept a partial fix and silently declare a passing score.
