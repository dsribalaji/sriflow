# Steps 8-9 — Tally Results & Fix/Report (Details)

## Step 8 — Tally Results

After all test categories complete, tally:

```
Category        | Total | PASS | FAIL | SKIP
----------------|-------|------|------|-----
Golden Path     |   N   |  N   |  N   |  N
Edge Cases      |   N   |  N   |  N   |  N
Error States    |   N   |  N   |  N   |  N
Regression      |   N   |  N   |  N   |  N
TOTAL           |   N   |  N   |  N   |  N
```

Then apply gate logic:

- Any **Golden Path FAIL** → gate = **BLOCKED**
  Ship is not recommended. Must fix Golden Path before proceeding.

- No Golden Path FAIL, but any **Edge / Error / Regression FAIL** → gate = **DONE_WITH_CONCERNS**
  Can ship with caution. Each non-golden-path failure must be documented with
  severity (Critical / High / Medium / Low) and disposition (fix before ship,
  file as tech debt, accept as known limitation).

- All tests **PASS or SKIP** (no FAIL) → gate = **SHIP-READY**
  Cleared for `/sriflow-ship`.

## Step 9 — On Failures: Fix or Report? (AUQ D2)

If any test is FAIL and mode is Full QA, ask:

```
D2 — <N> tests failed. Fix inline or report only?
Branch: <_BRANCH>
ELI10: Found N failures. Fix inline attempts minimal targeted fixes and re-verifies
each one before moving on. Report only writes QA_REPORT.md with exact failure
details and fix suggestions, then stops without touching code.
Stakes if wrong: Fix inline is the faster path to ship-ready. Report only is
correct if you need a clean audit trail or want to review the failures yourself
before any code changes.
Recommendation: A if gate is DONE_WITH_CONCERNS; B if gate is BLOCKED (Golden Path
failures usually need architectural understanding before fixing).
Completeness: A=10/10, B=6/10
A) Fix inline (recommended for non-golden-path failures)
  ✅ Closes the loop in one pass; re-verification happens immediately
  ❌ Makes code changes; each fix must be minimal and targeted
B) Report only — write QA_REPORT.md with findings and stop
  ✅ No mutations; clean audit artifact; user reviews before any fix
  ❌ Leaves failures in place; requires a second pass
Net: Fix inline for edge/error failures. Report only for Golden Path failures
that need design input.
```

### If Fix Inline — Fix→Re-verify Loop

For each FAIL, run this exact cycle:

```
FAIL: TC-NNN — <test name>
  1. ROOT CAUSE: Read source. Find exact line. No guessing.
  2. FIX: Smallest change that resolves this failure. One fix per failure.
  3. RE-VERIFY: Re-run the exact same test case. Confirm PASS.
     - PASS → Mark "fixed", continue to next FAIL.
     - FAIL → Log what was tried. If first attempt: try once more with different approach.
     - FAIL twice → Mark "FAIL (unfixed)", document both attempts, move on.
  4. SIDE EFFECT CHECK: Re-run regression tests touching the same file.
     - Any regressed → Flag it. Do not auto-fix regressions from a fix.
```

**Max 2 attempts per failure.** After 2 failed fix attempts: stop, mark unfixed,
include both attempts in QA_REPORT.md. Do not loop indefinitely.

**Fix ordering:** Fix Golden Path failures first (they gate ship). Then Critical
severity. Then High. Medium and Low can wait.

## Gate Decision Tree

```
Are there any Golden Path FAILs?
  YES → Gate = BLOCKED
        Do not ship. Fix GP failures first.
        Next: Fix + re-run /sriflow-test

  NO  → Are there any Edge / Error / Regression FAILs?
          YES → Gate = DONE_WITH_CONCERNS
                Review failures. Set disposition per failure.
                If all dispositions acceptable: proceed to /sriflow-ship
                If any Critical or High severity unfixed: fix first.

          NO  → Gate = SHIP-READY
                CLEAR TO /sriflow-ship
```

## Severity Classification

**Critical**
- Feature cannot be used at all
- Data loss or corruption
- Security vulnerability (XSS, SQLi, auth bypass)
- Production crash

**High**
- Primary user workflow fails
- Error is not shown to the user (silent failure)
- Regression in previously-working feature
- Data written in incorrect state

**Medium**
- Non-primary flow fails
- Error shown but message is confusing
- Edge case inputs produce wrong output
- Performance significantly degraded

**Low**
- Minor visual inconsistency with DESIGN.md
- Non-critical warning in logs
- Edge case that users are unlikely to hit
- Cosmetic text or label issue
