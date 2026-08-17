# Planner Patterns

An expert planning pattern for complex features and refactoring work.
sriflow-think takes up the **work breakdown** discipline: deps → phases →
risks. It applies when ideation surfaces an unresolved uncertainty that is
actually a planning problem in disguise.

## When to apply

The planner is triggered when the think session surfaces:

- A feature whose size is unclear ("how hard is this really?")
- A refactor or migration hidden inside a greenfield idea
- Dependency questions ("which of these things must exist first?")
- Risk that is really an ordering problem ("we can't build Y until X is
  known")

When a stakeholder's uncertainty is really a *build-order* question, the
correct output is a work breakdown, not an interview question.

## The planner method (condensed for think)

### 1. Requirements analysis
Restate the uncertain requirement as a success criterion plus an assumption
list. If the criterion cannot be stated, it is a Tier 1 uncertainty, not a
planning input.

### 2. Architecture review
Identify affected components from the sampled codebase (see the codebase
extraction pattern). Similar existing implementations become the estimate
anchor: "we already do this in module X — same shape."

### 3. Step breakdown
For the uncertain feature, produce steps with:

- **Deps** — what must be complete first
- **Risk** — low/medium/high
- **Estimates** — derived from the dependency chain, not vibes

### 4. Implementation order
Order by dependencies, group related changes, cut context switching,
and allow incremental testing. A breakdown that cannot be ordered is evidence
the uncertainty is still open — push it back to Tier 1.

## Output shape at think time

Record it in THINK_OUTPUT.md under `## Work Breakdown (planning input)`:

```markdown
## Work Breakdown (planning input)
### Phase 1: [Name]
1. [Step] — Deps: [none / step X] — Risk: [L/M/H]
2. [Step] — Deps: [step 1] — Risk: [M]
```

The full breakdown with file paths belongs to sriflow-plan. Think produces
the dependency skeleton only — enough to tell whether an uncertainty is
resolvable before build starts.

## Disagreement detector

The "assumptions and constraints" list doubles as a disagreement detector:
when two stakeholders' answers imply contradictory assumptions (for instance
"offline-first" vs "cloud-only"), that contradiction feeds Step 6's
disagreement diagnostic, not the plan.

## What sriflow-think keeps / drops

| Planner pattern | sriflow-think |
|-------------|---------------|
| Deps → phases → risks breakdown | Kept — skeleton in THINK_OUTPUT.md |
| Estimate-by-similar-implementation | Kept — architecture review pass |
| Full file-level plan | Delegated to sriflow-plan |
| Success-criteria clarification | Delegated to sriflow-plan-review gates |