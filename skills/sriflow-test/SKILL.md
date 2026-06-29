---
name: sriflow-test
preamble-tier: 2
version: 3.0.0
description: Systematic QA — golden path, edge cases, error states, regression. Produces QA_REPORT.md. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - AskUserQuestion
triggers:
  - test this
  - run QA
  - check for bugs
  - qa
  - test the feature
  - /sriflow-test
---

## When to invoke

Tests the current feature before ship. Golden path, edge cases, error states,
regression. Produces `QA_REPORT.md`. Use for "test this", "run QA", "qa",
"check for bugs". Suggest after build completes or before ship.

## Preamble

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
[ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ] && export SRIFLOW_PLAN_MODE="active" || export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
for f in SRIFLOW_MEMORY.md PLAN.md DESIGN.md CODE_REVIEW.md QA_REPORT.md; do [ -f "$f" ] && echo "$f: found"; done
```

## Voice

Direct. No filler. Lead with the point. Name files, functions, line numbers.
No AI vocabulary (delve, crucial, robust, comprehensive). The user has context
you don't. Your finding is a recommendation, not a verdict.

## Completion Status

End every run with: `STATUS | REASON | ATTEMPTED | RECOMMENDATION`
- **DONE** — all tests ran, gate determined
- **DONE_WITH_CONCERNS** — non-golden-path failures exist
- **BLOCKED** — golden path failed
- **NEEDS_CONTEXT** — missing critical info

---

# Workflow

## Step 0 — Context Read

Read in order: PLAN.md (user stories), DESIGN.md (components), CODE_REVIEW.md
(risks), QA_REPORT.md (regression baseline). Write 2-4 sentence summary.

If PLAN.md missing: ask user to describe feature (AUQ D0) before proceeding.

## Step 1 — Mode Selection

| Mode | What it does |
|------|-------------|
| **Full QA** (recommended) | All 4 categories + inline fixes |
| **Report only** | All categories, no code changes |
| **Regression only** | Adjacent features only |

## Step 1b — Tier Selection

| Tier | Coverage | Time |
|------|----------|------|
| **Quick** | Golden path only | <5 min |
| **Standard** (recommended) | GP + edge + error + regression | 15-30 min |
| **Exhaustive** | All + visual + concurrency | 30+ min |

## Step 2 — Test Case Derivation

For each implemented user story from PLAN.md, generate:
- ≥1 Golden Path test (primary success)
- ≥2 Edge Case tests (boundary, empty input)
- ≥1 Error State test (dependency failure)

Format: `TC-NNN | <name> | <GOLDEN_PATH|EDGE_CASE|ERROR_STATE|REGRESSION>`

**Read `reference/edge-case-checklist.md` for input type coverage.**
**Read `reference/error-state-checklist.md` for dependency coverage.**

## Step 3 — Golden Path

Core happy paths. ALL must pass before other categories matter.
GP failure = BLOCKED. Do not ship. Number GP-1, GP-2, etc.

## Step 4 — Edge Cases

Systematic boundary testing. Failures documented but not blockers unless
they corrupt data or cause security issues.

## Step 5 — Error States

Verify failures are handled gracefully. Silent failures are worse than
visible errors.

## Step 6 — Regression

Check adjacent features. If QA_REPORT.md exists: re-run previous PASS tests,
flag regressions. If not: derive from shared code/routes/tables/state.

**Read `reference/regression-derivation.md` for derivation heuristics.**

## Step 7 — Visual Cases (sriflow-browser)

If DESIGN.md references UI, open browser for visual verification.
Screenshot before/after. Mark SKIP if browser unavailable.

## Step 8 — Tally + Gate

```
Any Golden Path FAIL?     → BLOCKED
Any Edge/Error/Regress?   → DONE_WITH_CONCERNS
All PASS/SKIP?            → SHIP-READY
```

**Read `reference/gate-and-severity.md` for severity definitions.**

## Step 9 — Fix or Report (Full QA only)

If failures found and mode is Full QA: ask fix inline vs report only.
Fix loop: root cause → minimal fix → re-verify → side effect check.
Max 2 attempts per failure. Fix ordering: GP → Critical → High → Medium → Low.

## Step 10 — Write QA_REPORT.md

Full report with summary table, test results, failure details, gate verdict.
Include: feature, date, branch, mode, tier, test counts, visual evidence.

## Step 11 — Memory Write

Append to SRIFLOW_MEMORY.md: timestamp, skill, gate, duration, branch, tests.

## Step 12 — Final Status

```
sriflow-test complete
Branch: <branch> | Mode: <mode> | Tier: <tier>
Tests: <pass/fail/skip> | Gate: <gate>
Report: QA_REPORT.md
STATUS: <status> | REASON: <reason> | ATTEMPTED: <N tests> | RECOMMENDATION: <next>
```

---

# Operational Rules

1. Golden Path failure = BLOCKED, always.
2. Derive expected from spec, not from code.
3. Exact inputs, exact outputs. No vague test cases.
4. Document before fixing. Record survives whether fix works or not.
5. One fix per failure. No refactoring while fixing.
6. Re-verify every fix. Unverified = guess.
7. Never swallow a SKIP silently. Every SKIP needs a reason.
8. Regressions are Critical by default.
9. The report is permanent. Write for reproducibility.
10. SHIP-READY only. No "probably fine".
