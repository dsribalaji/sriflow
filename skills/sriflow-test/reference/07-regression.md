# Step 6 — Category 4: Regression (Details)

Regression tests check that the new feature did not break adjacent functionality.

## If QA_REPORT.md exists (previous baseline)

This is Regression Mode's primary path. Load the previous QA_REPORT.md and:

1. List every test from the previous report that was PASS.
2. For each previously-passing test, re-run it. Mark new result.
3. Flag any test that was PASS in the previous report and is now FAIL. These are
   regressions — name them explicitly.
4. Note any tests that are new in this run (coverage delta).

Report format:
```
## Regression Delta
Previously passing: N tests
Still passing: N tests
REGRESSED (was PASS, now FAIL):
  - TC-NNN: <test name> — <what broke>
New tests added: N (not in previous report)
Coverage delta: +N tests
```

## If no QA_REPORT.md exists (first run)

Derive adjacent features from PLAN.md. Adjacent means: shares code, routes,
state, database tables, or API contracts with the feature being tested.

Before deriving regression tests, scan the codebase to identify implemented features.
Only derive regression tests for implemented adjacent features. Mark unimplemented
adjacent features as SKIP with note "feature not implemented — re-run after build".

For each adjacent feature, run its primary happy path:

```
TC-NNN | <adjacent feature> primary happy path | REGRESSION
Input:    <typical valid input for adjacent feature>
Action:   <primary action of adjacent feature>
Expected: <same behavior as before — feature unchanged>
Result:   TBD
Notes:
```

Minimum: 3 regression tests. More if the feature touches shared infrastructure
(auth, database, routing, shared components).

## Regression Test Derivation

When no previous QA_REPORT.md exists, derive regression tests using these heuristics:

### Shared code surface

Read the feature's source files. Note every import, every utility function,
every shared component or service it touches. For each shared item, ask:
"What other features also use this?" Those features are regression candidates.

```bash
# Find files changed in this branch
git diff main...HEAD --name-only 2>/dev/null

# For each changed file, find what else imports it
grep -r "from.*<changed-file>" --include="*.ts" --include="*.tsx" --include="*.js" .
```

Every file that imports a changed module is a regression candidate.

### Shared routes or API endpoints

If the feature adds or modifies a route, check whether any adjacent feature
uses the same URL namespace, middleware, or router. Routes that share a
middleware chain must be regression tested.

### Shared database tables

If the feature writes to a table, check which other features read or write the
same table. A schema migration or changed query can break other features silently.

### Shared state (frontend)

If the feature reads or writes global state (Redux store, Zustand, React context,
localStorage, cookies), identify every other component that reads the same state
slice. Those components must be regression tested.

### Priority order for regression test selection

1. **Features that share database tables** — highest risk
2. **Features that import changed utility functions** — high risk
3. **Features that share route namespace or middleware** — medium risk
4. **Features that share UI state** — medium risk
5. **Unrelated features on the same page** — low risk

Write at least one regression test per priority-1 and priority-2 candidate.

## Regression Mode Details

When mode is **Regression Only** (option C from D1):

1. Skip Categories 1, 2, and 3 entirely.
2. Derive adjacent features from PLAN.md or ask the user.
3. Run at minimum 5 regression tests covering adjacent features.
4. If QA_REPORT.md exists: load it, diff old vs new results, flag regressions.
5. Write a focused QA_REPORT.md showing only regression results and delta.
6. Gate: any regression FAIL → BLOCKED. All pass → SHIP-READY.

Regression-only mode is for: post-refactor checks, dependency upgrades,
infrastructure changes, or any change that claims "no behavior change".
