# Step 2 — Test Case Derivation (Details)

Before running anything, write out the full test matrix.

Before deriving test cases, scan the codebase to identify implemented features.
Check for source files, routes, handlers, and components that correspond to each
user story in PLAN.md. Only derive tests for implemented features. Mark unimplemented
features as SKIP with note "feature not implemented — re-run after build".

Derive test cases from PLAN.md user stories. For each **implemented** user story, generate:
- At least one Golden Path test (the primary success scenario)
- At least two Edge Case tests (boundary and empty input for each input the
  story involves)
- At least one Error State test (what happens when the story's external dependency
  fails)

Use this format for every test case:

```
TC-NNN | <test name> | <GOLDEN_PATH | EDGE_CASE | ERROR_STATE | REGRESSION>
Input:    <exact input, state, or precondition>
Action:   <what to do — what to call, what to click, what to submit>
Expected: <exact expected output, response, or state change>
Result:   PASS ✅ / FAIL ❌ / SKIP ⏭️
Notes:    <if FAIL: actual vs expected; if SKIP: reason>
```

Number from TC-001. Never reuse numbers within a session.

Minimum test counts per tier:

| Category | Quick | Standard | Exhaustive |
|----------|-------|----------|------------|
| Golden Path | ≥3 | ≥3 | ≥5 |
| Edge Cases | 0 (skip) | ≥6 | ≥12 |
| Error States | 0 (skip) | ≥4 | ≥8 |
| Regression | 0 (skip) | ≥3 | ≥5 |
| Visual | 0 (skip) | If UI | All UI |
| Concurrency | 0 (skip) | 0 (skip) | If applicable |

In Quick tier: skip Categories 2, 3, and 4 entirely. Only run Golden Path.
In Standard tier: run all four categories. Skip visual if no UI.
In Exhaustive tier: run all categories including visual and concurrency.

Write all test cases to the working section below before running any of them.
This makes the plan reviewable before execution.

## Test Case Format Reference

Use this format for every single test case, without exception:

```
TC-NNN | <descriptive test name> | <GOLDEN_PATH | EDGE_CASE | ERROR_STATE | REGRESSION>
Input:    <exact input value, system state, or precondition — be specific>
Action:   <what to invoke, submit, click, or call — name the function, endpoint, or UI>
Expected: <exact expected output, response code, state change, or UI display>
Result:   PASS ✅ / FAIL ❌ / SKIP ⏭️
Notes:    <if FAIL: "Actual: <exact what happened>" — if SKIP: "<reason for skip>">
```

Rules:
- TC numbers are sequential, never reused in a session.
- Input must be exact — no "some valid input". Name the value.
- Expected must be verifiable — no "should work". Name the observable outcome.
- Notes on FAIL must include the exact actual output or error message.
- Notes on SKIP must explain why (test not applicable, tooling unavailable, etc.).
