# Steps 1 + 1b — Mode & Tier Selection (Details)

## Step 1 — Mode Selection (AUQ D1)

```
D1 — Which QA mode?
Branch: <_BRANCH>
ELI10: Three modes. Full QA runs all four test categories and fixes failures
inline. Report only runs all categories but makes no code changes. Regression
only checks whether adjacent features still work after a change.
Stakes if wrong: Full QA before first ship. Report only for a clean audit before
a PR review. Regression only after a refactor that didn't change behavior.
Recommendation: A because it catches bugs and fixes them in one pass, which gets
you to ship-ready without a second loop.
Completeness: A=10/10, B=7/10, C=5/10
A) Full QA — golden path + edge cases + error states + regression (recommended)
  ✅ Covers all failure modes; inline fixes close the loop in one pass
  ❌ Makes code changes; slower than report-only
B) Report only — run all categories, produce report, make no changes
  ✅ Pure audit with no mutations; fast and safe before a code review
  ❌ Leaves failures in place; requires a separate fix pass
C) Regression only — check adjacent features for breakage
  ✅ Fastest; scoped to adjacency check after a refactor or rename
  ❌ Misses new feature bugs entirely; not suitable before first ship
Net: Full QA is the only mode that gets you to ship-ready in one pass.
```

Store the chosen mode. Reference it throughout.

## Step 1b — Tier Selection (AUQ D1b)

After selecting mode, select depth tier:

```
D1b — Which QA tier?
Branch: <_BRANCH>
ELI10: Three tiers control how deep QA goes. Quick catches showstoppers in
under 5 minutes. Standard covers the full test matrix. Exhaustive adds visual
testing, concurrency, and exhaustive edge cases.
Stakes if wrong: Quick before a demo catches blockers. Standard before a PR.
Exhaustive before a major release.
Recommendation: B because Standard covers all failure modes without the time
cost of Exhaustive.
Completeness: A=5/10, B=8/10, C=10/10
A) Quick — golden path only (recommended before demos)
  ✅ Fastest; catches blockers; under 5 minutes
  ❌ Misses edge cases and error states entirely
B) Standard — golden path + edge cases + error states (recommended)
  ✅ Covers all failure modes; 15-30 minutes depending on feature size
  ❌ Misses visual and concurrency edge cases
C) Exhaustive — all categories + visual + concurrency + full regression
  ✅ Maximum coverage; nothing slips through
  ❌ Slowest; 30+ minutes; diminishing returns on well-tested features
Net: Standard is the default for most situations.
```

Tier controls test matrix density:

| Category | Quick | Standard | Exhaustive |
|----------|-------|----------|------------|
| Golden Path | ≥3 | ≥3 | ≥5 |
| Edge Cases | 0 (skip) | ≥6 | ≥12 |
| Error States | 0 (skip) | ≥4 | ≥8 |
| Regression | 0 (skip) | ≥3 | ≥5 |
| Visual | 0 (skip) | If UI | All UI |
| Concurrency | 0 (skip) | 0 (skip) | If applicable |

Store the chosen tier. Reference it in test derivation.

## Full QA vs Report Only Differences

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
