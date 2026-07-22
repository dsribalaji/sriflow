# Step 10 — Write QA_REPORT.md (Details)

Write the full report to `QA_REPORT.md` in the project root. Overwrite any
previous QA_REPORT.md.

If writing QA_REPORT.md fails (disk full, permissions, etc.), output the full
report to the terminal instead. The report must be captured somewhere — file or
terminal — even if the write fails.

## QA_REPORT.md Template

```markdown
# QA Report

**Feature:** <feature name from PLAN.md or user description>
**Date:** <ISO timestamp>
**Branch:** <_BRANCH>
**Mode:** <Full QA | Report Only | Regression Only>
**Tier:** <Quick | Standard | Exhaustive>
**QA Engineer:** sriflow-test v2.0.0

---

## Summary

| Category | Total | PASS | FAIL | SKIP |
|----------|-------|------|------|------|
| Golden Path | N | N | N | N |
| Edge Cases | N | N | N | N |
| Error States | N | N | N | N |
| Regression | N | N | N | N |
| **TOTAL** | **N** | **N** | **N** | **N** |

**Gate: SHIP-READY | DONE_WITH_CONCERNS | BLOCKED**

---

## Golden Path (must all pass to ship)

<For each Golden Path test, the full TC block with final Result>

---

## Edge Cases

<For each Edge Case test, the full TC block with final Result>

---

## Error States

<For each Error State test, the full TC block with final Result>

---

## Regression

<For each Regression test, the full TC block with final Result>

<If previous QA_REPORT.md existed:>

### Regression Delta
Previously passing: N tests
Still passing: N tests
REGRESSED (was PASS, now FAIL):
  - TC-NNN: <test name> — <what broke>
New tests added: N
Coverage delta: +N tests

---

## Failures Detail

<For each FAIL:>

### FAIL: TC-NNN — <test name>

**Category:** <GOLDEN_PATH | EDGE_CASE | ERROR_STATE | REGRESSION>
**Severity:** <Critical | High | Medium | Low>

**Input:**
<exact input used>

**Action:**
<exact action taken>

**Expected:**
<what should have happened>

**Actual:**
<what actually happened — exact error message, wrong output, crash, etc.>

**File / Line:**
<path/to/file.ts:47 if identified>

**Fix Applied:** <description of fix made> OR **Fix Suggestion:** <recommendation if report-only>

**Re-verified:** PASS after fix | Not re-verified (report-only)

**Disposition:** <Fix before ship | File as tech debt | Accept as known limitation>

---

## Gate

### <SHIP-READY | DONE_WITH_CONCERNS | BLOCKED>

<If SHIP-READY:>
All tests passed. No regressions detected. Cleared for /sriflow-ship.

<If DONE_WITH_CONCERNS:>
Golden Path: all pass. Non-golden-path failures exist and are documented above.
Review the failure detail section before shipping.

Concerns:
- <concern 1>
- <concern 2>

<If BLOCKED:>
Golden Path failure(s) detected. Ship is NOT recommended until Golden Path tests
pass. Fix the following before proceeding:

- TC-NNN: <test name> — <one-line description of failure>

Do not run /sriflow-ship until this report shows SHIP-READY or DONE_WITH_CONCERNS.

---

## Visual Evidence

<If sriflow-browser was used:>

<For each visual test:>
**<page or component name>**
- Before: <screenshot filename>
- After: <screenshot filename>
- Result: PASS / FAIL / SKIP
- Notes: <discrepancy from DESIGN.md if any>

<If sriflow-browser was not used:>
No visual tests run. Re-run with app live to verify UI states.

---

## Next Step

<If SHIP-READY:>
Run `/sriflow-ship` to deploy.

<If DONE_WITH_CONCERNS:>
Review concerns above. If acceptable, run `/sriflow-ship`. Otherwise fix and
re-run `/sriflow-test`.

<If BLOCKED:>
Fix Golden Path failures, then re-run `/sriflow-test` before shipping.
```
