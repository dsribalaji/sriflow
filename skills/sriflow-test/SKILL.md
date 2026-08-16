---
name: sriflow-test
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-build, sriflow-code-review, sriflow-ship
description: "Systematic QA with TDD workflow. Golden path → edges → errors → regression → visual. Not for: code review — use sriflow-code-review. Not for: deployment — use sriflow-ship."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - test this
  - run QA
  - check for bugs
  - qa
  - test the feature
  - /sriflow-test
next-skill: /sriflow-ship
---

# /sriflow-test — QA with TDD Workflow + Eval Framework

## When to invoke

After code review. Runs golden path, edge cases, error states, and regression. Detects project medium for CLI-appropriate test patterns (no visual checks for CLI projects). Outputs QA_REPORT.md. CLEAR TO /sriflow-ship only on SHIP-READY.

## Reference files

| Step | File | Content |
|------|------|---------|
| Context | `reference/01-context-read.md` | Read PLAN.md, DESIGN.md, CODE_REVIEW.md |
| Mode/Tier | `reference/02-mode-tier.md` | Full QA / Report Only / Regression Only |
| Derivation | `reference/03-test-derivation.md` | TC-NNN test case numbering |
| Golden Path | `reference/04-golden-path.md` | GP-1 (primary) through GP-4+ |
| Edge Cases | `reference/05-edge-cases.md` | String, numeric, file, date, concurrent |
| Error States | `reference/06-error-states.md` | Network, auth, invalid input, server errors |
| Regression | `reference/07-regression.md` | Previous QA_REPORT.md baseline |
| Visual | `reference/08-visual.md` | Browser screenshots (Web/Mobile only) |
| Tally/Gate | `reference/09-tally-gate.md` | PASS/FAIL/SKIP tally, gate logic |
| Report | `reference/10-qa-report.md` | QA_REPORT.md template |
| Risk matrix | `reference/12-risk-based-testing.md` | 5×5 risk matrix, prioritization |
| Flake mgmt | `reference/13-test-reliability.md` | Flake classification, quarantine |
| Bug repro | `reference/14-bug-reproduction.md` | Repro loop, bisect |
| Safety | `reference/15-test-safety.md` | Production DB guard, env isolation |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **TDD workflow** | RED → GREEN → IMPROVE cycle | `reference/patterns/tdd-workflow.md` |
| **E2E runner** | Playwright E2E patterns | `reference/patterns/e2e-test-patterns.md` |
| **80% coverage** | Minimum coverage requirement | Added to gate logic |
| **QA patterns** | 14 QA patterns (verify page, test flow, visual diff, etc.) | Already present in browser refs |
| **QA-only mode** | Report-only mode (for audit) | Mode tier: Report Only option |
| **Eval framework** | 75 integration tests, performance benchmarks | `reference/patterns/eval-framework.md` |
| **Test infrastructure** | Vitest, fixtures, mock data | `reference/patterns/test-infrastructure.md` |
| **qa-skills bug repro** | Repro loop with bisect | `reference/14-bug-reproduction.md` |
| **qa-skills flake quarantine** | Flake classification and quarantine | `reference/13-test-reliability.md` |

## Workflow
1. **Phase 0** — Medium detection (CLI skips visual)
2. **Step 0** — Context read (PLAN.md, DESIGN.md, CODE_REVIEW.md)
3. **Step 1** — Mode selection (Full QA / Report Only / Regression Only)
4. **Step 1b** — Tier selection (Quick / Standard / Exhaustive)
5. **Step 2** — Test case derivation from user stories (TC-NNN)
6. **Step 3** — Golden path (GP-1 through GP-4+)
7. **Step 4** — Edge cases (full checklist)
8. **Step 5** — Error states (full checklist)
9. **Step 6** — Regression (baseline from prior QA_REPORT.md)
10. **Step 7** — Visual cases (Web/Mobile only, CLI skipped)
11. **Step 8** — Tally results
12. **Step 9** — Fix or report (AUQ D2)
13. **Step 10** — Write QA_REPORT.md
14. **Step 11** — Memory write

## Hard rules
1. Golden Path failure = BLOCKED, always
2. Derive expected from spec, not code
3. Exact inputs, exact outputs
4. Document before fixing
5. 80%+ coverage required
6. Regressions are Critical by default
7. CLEAR TO /sriflow-ship only on SHIP-READY

## Voice
Direct, builder-to-builder, compressed.

## Completion Status
- **DONE** — SHIP-READY.
- **DONE_WITH_CONCERNS** — non-golden-path failures exist.
- **BLOCKED** — golden path failed.
