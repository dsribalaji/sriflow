# Pattern — TDD Workflow (RED → GREEN → IMPROVE)

The test-first discipline applied by the QA skill. The cycle is not "write tests then code" — it is a constant rhythm of writing a failing test, making it pass minimally, then improving. TDD is a design tool as much as a verification tool: it forces the interface before the implementation.

## The cycle

```
RED → GREEN → IMPROVE → (repeat)
```

### RED — write a failing test first

- Write one test for one behavior, derived from the spec (never from the code).
- The test must fail for the right reason: the behavior is missing. A test that fails for a syntax error is not a RED, it's noise.
- If the test can't be written yet (no interface), write the interface in the test's shape first — the test defines the contract.

### GREEN — make it pass minimally

- Write the minimum code that makes the test pass. No extra features, no "while I'm here" refactors.
- The goal is a green bar as fast as possible — design decisions belong in IMPROVE.
- If green requires a hack, that's fine for one step — the hack will be surfaced and fixed in IMPROVE, not buried.

### IMPROVE — refactor under the safety net

- Now that green holds, improve: remove duplication, rename, extract, fix the hack.
- The test suite is the safety net — refactor aggressively, re-run to prove behavior is unchanged.
- This is where the code earns its quality. Skipping IMPROVE is "test-driven" in name only — it produces a wall of passing tests and a codebase that rots.

## Applying it in the QA skill

The QA skill runs the full QA sequence (golden path → edges → errors → regression), but every **fix** during QA follows the TDD cycle:

1. A failing check is a RED — write/run the minimal reproduction first (see `reference/14-bug-reproduction.md`).
2. Fix the code minimally — GREEN.
3. Refactor and re-run the full category — IMPROVE.
4. Regression: re-run previously passing tests to prove the fix didn't break anything.

## Rules

1. Test first, always — a test written after the code has already been validated by the code's shape, not the spec's.
2. One behavior per test; a test asserting three things fails without saying which.
3. GREEN is minimal — resist the urge to over-build in the fix step.
4. IMPROVE is mandatory, not optional — a green suite with unreviewed code is a debt ledger.
5. Derive expected behavior from the spec (PLAN.md stories), never from the code under test.
6. When a bug is reported, write the failing test that reproduces it before fixing — the test is the bug's permanent memory.

## Common failure modes

| Mode | Symptom | Fix |
|------|---------|-----|
| Skipped RED | Tests written after code, always pass | Back to test-first; delete tests that never saw RED |
| Over-built GREEN | The fix includes unrelated refactors | Split: fix only what the failing test demands |
| Skipped IMPROVE | Passing tests, accumulating debt | Force an IMPROVE pass per cycle |
| Test-derived tests | Tests assert what the code does, not what it should | Re-derive from the spec |
| Test-and-forget | Test passes but the fix is never regression-checked | Re-run the category after every fix |

## Evidence

TDD's value is in the record: the RED test that caught the bug, the minimal fix, the regression run. The QA report records each fix as: bug → reproduction test → fix → regression pass. That chain is the difference between "QA passed" and "QA is trustworthy".