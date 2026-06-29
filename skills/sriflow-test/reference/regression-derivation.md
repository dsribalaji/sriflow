# Regression Test Derivation

When no previous QA_REPORT.md exists, derive regression tests from PLAN.md
using these heuristics.

## Shared code surface

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

## Shared routes or API endpoints

If the feature adds or modifies a route, check whether any adjacent feature
uses the same URL namespace, middleware, or router. Routes that share a
middleware chain must be regression tested — middleware bugs affect all routes.

## Shared database tables

If the feature writes to a table, check which other features read or write the
same table. A schema migration or changed query can break other features silently.

## Shared state (frontend)

If the feature reads or writes global state (Redux store, Zustand, React context,
localStorage, cookies), identify every other component that reads the same state
slice. Those components must be regression tested.

## Priority order for regression test selection

1. **Features that share database tables with the changed feature** — highest risk
2. **Features that import changed utility functions or services** — high risk
3. **Features that share the same route namespace or middleware** — medium risk
4. **Features that share UI state** — medium risk
5. **Unrelated features on the same page as the changed component** — low risk

Write at least one regression test per priority-1 and priority-2 candidate.
Write at least one regression test per priority-3 candidate if time allows.
