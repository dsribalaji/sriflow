# Appendix E: Diff Size Handling

Large diffs require a different strategy than small ones.

## Small diff (< 50 files, < 2000 lines changed)
Run all 6 lenses against the full diff in one pass. No special handling needed.

## Medium diff (50-200 files, 2000-10000 lines changed)
1. Run `git diff <base>...HEAD --stat` to identify the highest-churn files.
2. Run all 6 lenses against the top 20 highest-churn files first.
3. Run all 6 lenses against any file touching auth, database, API handlers, or LLM integration, regardless of line count.
4. For remaining files, run Lens 1 (Correctness) and Lens 3 (Security) only — Lens 2, 4, 5, 6 on a config or test file is lower value than focused attention on the hot paths.
5. Note in CODE_REVIEW.md: `Note: large diff — full 6-lens review applied to top 20 files and all auth/DB/API/LLM paths. Remaining files reviewed for correctness and security only.`

## Large diff (200+ files, 10000+ lines changed)
1. AskUserQuestion before starting:

```
D1 — This diff is very large (<N> files, <M> lines). How should the review be scoped?
Branch: <_BRANCH>
ELI10: The diff covers a large amount of code. A full 6-lens review of everything would take significant time and context. We can focus on the highest-risk paths (auth, DB, API, LLM) or scope down to a specific subdirectory.
Stakes if wrong: A broad-but-shallow review might miss a critical finding in a lower-priority area. A narrow-but-deep review might leave high-risk paths unreviewed.
Recommendation: A because auth and DB paths are where critical findings live.
Completeness: A=8/10, B=7/10, C=6/10
A) Review auth, DB, API handlers, and LLM paths — 6 lenses on these, stat-only on the rest (recommended)
  ✅ Covers the highest-risk code with full depth
  ❌ Other paths get minimal coverage
B) Review a specific subdirectory I name
  ✅ Deep coverage where you need it most
  ❌ Requires you to know which paths matter
C) Review everything — accept it will take longer
  ✅ Full coverage
  ❌ Long runtime, context pressure may reduce finding quality
Net: Depth on high-risk paths beats breadth on low-risk files.
```

2. Proceed based on answer.
3. Always note the scope limitation in CODE_REVIEW.md.
