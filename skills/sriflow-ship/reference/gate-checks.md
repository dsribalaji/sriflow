# Gate Checks — Step 0

This step reads CODE_REVIEW.md and QA_REPORT.md and determines if it is safe to ship. Two outcomes: hard block (CRITICAL findings) or risk-acknowledged proceed (QA failures).

## 0a — CODE_REVIEW.md gate

Read CODE_REVIEW.md if it exists. Count lines matching `🔴 CRITICAL`.

**If CODE_REVIEW.md does not exist:**

```
BLOCKED — No code review found.

Shipping without a code review means no one has checked this code for correctness, security
issues, SQL safety, race conditions, or critical bugs. Every one of those can reach production.

Run /sriflow-code-review first, then re-run /sriflow-ship.
```

Do not proceed. Do not AskUserQuestion. Absence of a review is a hard block.

**If CODE_REVIEW.md exists but has zero CRITICAL findings:** pass this gate silently. Continue to 0b.

**If CODE_REVIEW.md exists and has any `🔴 CRITICAL` findings:**

List every CRITICAL finding verbatim from CODE_REVIEW.md, formatted as a numbered list.

Then output:

```
BLOCKED — N CRITICAL finding(s) in CODE_REVIEW.md.

These issues will reach production if you ship now. Shipping with known CRITICAL issues is not
a risk to acknowledge — it is a defect you are choosing to deploy.

Fix every CRITICAL finding listed above, then run /sriflow-code-review again to verify the fixes,
then re-run /sriflow-ship.
```

Do not proceed. Do not AskUserQuestion. CRITICAL is a hard block.

## 0b — QA_REPORT.md gate

Read QA_REPORT.md if it exists. Extract the Verdict line. Count FAIL / ❌ entries.

**If QA_REPORT.md does not exist:** AskUserQuestion D0a.

```
D0a — No QA report found. Ship without QA?
Branch: <_BRANCH>
ELI10: There is no QA_REPORT.md in this project. That means no one has run the golden path
flow, edge cases, or error states against this code. Shipping without QA means production
is the first real test. If there is a regression, users find it before you do.
Stakes if wrong: Users hit untested flows. Bugs that a 5-minute QA run would have caught
reach production.
Recommendation: B) Block because one QA run is cheap relative to a production incident.
Completeness: A=3/10, B=10/10
A) Ship without QA
  ✅ Deploys immediately without waiting for a QA run to complete
  ❌ Untested code reaches production; any regression is user-discovered
B) Run /sriflow-test first (recommended)
  ✅ Production ships with at least a golden path verification on every critical flow
  ❌ Adds 10-30 minutes before deploy depending on test suite size
Net: QA is cheap insurance. Only ship without it if you are certain this is a low-risk
change with no user-facing flows at risk.
```

If the user picks A: proceed, but note "QA skipped (user acknowledged)" in the deploy record.
If the user picks B: STOP. "Run /sriflow-test then re-run /sriflow-ship."

**If QA_REPORT.md exists and Verdict is PASS:** pass this gate silently. Continue to Step 1.

**If QA_REPORT.md exists and Verdict is FAIL:** AskUserQuestion D0b.

Before presenting D0b, extract and show every failing test from QA_REPORT.md:

```
The following tests are FAILING in QA_REPORT.md:
<list each ❌ line verbatim>
```

Then:

```
D0b — QA failures detected. Ship with known failures?
Branch: <_BRANCH>
ELI10: QA_REPORT.md shows failing tests. These are flows that broke since the last passing run.
Shipping means those failures are live in production, affecting real users. The failures might
be flaky tests, or they might be real regressions — you need to know which before shipping.
Stakes if wrong: Real regressions reach production. Users hit broken flows. You find out
from a support ticket, not a test.
Recommendation: B) Block because you cannot distinguish flaky from real without investigating.
Completeness: A=2/10, B=10/10
A) Ship anyway — I know these failures are flaky or acceptable
  ✅ Unblocks the deploy if failures are genuinely known-flaky and confirmed safe
  ❌ If any failure is a real regression, it ships to production with no warning
B) Fix failures first, then re-run /sriflow-test (recommended)
  ✅ Production ships with every QA check green; no known regressions in flight
  ❌ Adds time before deploy while the failures are investigated and fixed
Net: Picking A requires you to know, concretely, that each listed failure is safe. If you
cannot name why each failure is acceptable, pick B.
```

If the user picks A: proceed, but append each failing test name to the deploy record under
"QA_RISK: shipped with known failures". Continue to Step 1.

If the user picks B: STOP. "Fix QA failures, re-run /sriflow-test, then re-run /sriflow-ship."
