# Pattern — E2E Test Patterns

Playwright-based end-to-end test patterns for the QA skill. E2E tests are the highest-cost, highest-signal layer: they prove the integrated system works as a user experiences it. This pattern defines how to write E2E tests that are fast enough to run, stable enough to trust, and specific enough to catch the bugs unit tests miss.

## When to use

- Web/Mobile projects (CLI projects use CLI-invocation patterns instead).
- After unit/integration tests pass — E2E is the final gate, not the first.
- Golden-path and critical-error-path coverage. E2E is too slow for exhaustive edge testing.

## Writing patterns

### 1. User-journey tests, not page-click tests

A test names the user's goal, not the click sequence:

```
BAD:  "click #submit, expect .toast"
GOOD: "user signs up and lands on the dashboard"
```

Structure: arrange (state setup) → act (the journey) → assert (the outcome the user cares about). Assert outcomes, not incidental DOM — asserting `#submit` exists doesn't test the signup worked.

### 2. Selectors: prefer roles and text over brittle CSS

- `getByRole`, `getByLabel`, `getByText`, `getByTestId` (only when the others can't express it).
- Never CSS paths like `#main > div.row > button.btn` — a class rename breaks the test with zero product signal.
- The accessibility first: a button you can't target by role is a button that fails a11y too.

### 3. Waits: auto-wait, never arbitrary sleep

Playwright auto-waits for elements. Rules:

- Use `expect(...).toBeVisible()` and actionability checks — never `page.waitForTimeout(2000)`.
- For async completion (a request finishing), wait on the outcome: `await expect(page.getByText('Saved')).toBeVisible()`.
- A fixed sleep in a test is a flake you haven't met yet.

### 4. Network mocking at the boundary

Mock the network seam, not internals:

- `page.route` to stub third-party services (payments, external APIs) so tests are deterministic and offline-safe.
- Never mock the app's own API for its own feature tests — that's testing mocks.
- Record/harness real fixtures once; replay them deterministically.

### 5. State setup for journey tests

Seed state before the journey (via API or DB fixture), not through the UI. Walking the UI to the "has data" state makes the test slow and brittle. A test that does 10 clicks to set up should instead seed 3 rows and start closer to the action.

### 6. Cross-viewport coverage

At least one journey at mobile width (375px) and one at desktop (1280px) — layout bugs are E2E's specialty. The responsive design check pattern covers layout; E2E covers interaction-at-that-layout.

## Stability patterns

- **Isolate tests:** each test runs against a fresh state (isolated DB or truncation between tests). Shared mutable state is the #1 E2E flake source.
- **Parallelize by file, not by test:** file-level parallelism keeps journeys independent.
- **Retry policy:** Playwright retries only `--retries`-flagged flaky tests; a test needing retries more than occasionally is a real bug — quarantine it (see `reference/13-test-reliability.md`) and fix the cause.
- **Trace on failure:** `--trace on-first-retry` captures the failure state — a failing E2E without a trace is a debugging hour lost.

## Coverage target

The QA skill's gate is 80%+ overall coverage, but E2E is judged by **journey coverage**, not line coverage: every user story from PLAN.md has at least one E2E journey test (GP-1..GP-4+ map directly). If a golden-path journey has no E2E test, the gate is not met even if line coverage passes.

## Failure triage

| Failure | Likely cause | Action |
|---------|--------------|--------|
| Element timeout on a real flow | Actual regression (feature broken) | Fix product or report bug |
| Element timeout in setup | Test-state setup broke | Fix seed/fixture, not the test body |
| Flaky under load | Shared state or race in test | Isolate state, add proper wait |
| Passes locally, fails in CI | Environment drift (viewport, timezone, seed) | Pin the environment in the config |

## Rules

1. Tests assert user outcomes, not DOM mechanics.
2. Auto-wait over sleeps, always.
3. Mock third-party seams, never the app's own logic.
4. Seed through API/fixtures, not UI clicking.
5. Every user story from the plan gets a journey test.
6. A flaky E2E is quarantined and fixed, not retried into silence.