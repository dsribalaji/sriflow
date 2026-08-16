# Planner Patterns

The expert planning pattern for complex
features and refactoring. sriflow-think adopts the **work breakdown**
discipline: deps → phases → risks. It is applied when ideation produces an
unresolved uncertainty that is really a planning problem in disguise.

## When to apply

The planner is triggered when the think session surfaces:

- A feature whose size is unclear ("how hard is this really?")
- A refactor or migration hidden inside a greenfield idea
- Dependency questions ("which of these things must exist first?")
- Risk that is really an ordering problem ("we can't build Y until X is
  known")

If a stakeholder's uncertainty is actually a *build-order* question, the
right output is a work breakdown, not an interview question.

## The planner method (condensed for think)

### 1. Requirements analysis
Restate the uncertain requirement as a success criterion and an assumption
list. If the criterion can't be stated, it's a Tier 1 uncertainty, not a
planning input.

### 2. Architecture review
Identify affected components from the sampled codebase (see
spec-miner). Similar existing implementations become the estimate
anchor: "we already do this in module X — same shape."

### 3. Step breakdown
For the uncertain feature, produce steps with:

- **Deps** — what must be complete first
- **Risk** — low/medium/high
- **Estimates** — derived from the dependency chain, not vibes

### 4. Implementation order
Order by dependencies, group related changes, minimize context switching,
enable incremental testing. A breakdown that can't be ordered is evidence the
uncertainty is unresolved — push it back to Tier 1.

## Output shape at think time

Lands in THINK_OUTPUT.md under `## Work Breakdown (planning input)`:

```markdown
## Work Breakdown (planning input)
### Phase 1: [Name]
1. [Step] — Deps: [none / step X] — Risk: [L/M/H]
2. [Step] — Deps: [step 1] — Risk: [M]
```

The full breakdown with file paths is sriflow-plan's job. Think produces the
dependency skeleton only — enough to know whether an uncertainty is
resolvable before build starts.

## Disagreement detector

The planner's "assumptions and constraints" list doubles as a disagreement
detector: if two stakeholders' answers imply contradictory assumptions
(e.g., "offline-first" vs "cloud-only"), that contradiction feeds Step 6's
disagreement diagnostic, not the plan.

## What sriflow-think keeps / drops

| Planner pattern | sriflow-think |
|-------------|---------------|
| Deps → phases → risks breakdown | ✅ Skeleton in THINK_OUTPUT.md |
| Estimate-by-similar-implementation | ✅ Architecture review pass |
| Full file-level plan | ➡️ sriflow-plan owns it |
| Success-criteria clarification | ➡️ Gates in sriflow-plan-review |