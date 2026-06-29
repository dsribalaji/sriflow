# Severity Classification

Use these definitions consistently in QA_REPORT.md failure sections.

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
- Error shown but message is confusing or missing detail
- Edge case inputs produce wrong output
- Performance significantly degraded

**Low**
- Minor visual inconsistency with DESIGN.md
- Non-critical warning in logs
- Edge case that users are unlikely to hit
- Cosmetic text or label issue

# Gate Decision Tree

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

# Regression Mode Details

When mode is **Regression Only** (option C from D1):

1. Skip Categories 1, 2, and 3 entirely.
2. Derive adjacent features from PLAN.md or ask the user.
3. Run at minimum 5 regression tests covering adjacent features.
4. If QA_REPORT.md exists: load it, diff old vs new results, flag regressions.
5. Write a focused QA_REPORT.md showing only regression results and delta.
6. Gate: any regression FAIL → BLOCKED. All pass → SHIP-READY.

Regression-only mode is for: post-refactor checks, dependency upgrades,
infrastructure changes, or any change that claims "no behavior change".

# Full QA vs Report Only Differences

| Step | Full QA | Report Only |
|------|---------|-------------|
| Read PLAN.md, DESIGN.md, CODE_REVIEW.md | Yes | Yes |
| Derive test cases | Yes | Yes |
| Run all four categories | Yes | Yes |
| Mark pass/fail | Yes | Yes |
| Fix inline on FAIL | Yes (with D2 confirmation) | No — never |
| Re-verify after fix | Yes | Not applicable |
| Write QA_REPORT.md | Yes | Yes |
| Gate determination | Yes | Yes |
| Code changes | Yes (minimal, targeted) | None |

Report Only is a pure audit. It finds and documents. It never edits.
