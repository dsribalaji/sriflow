# Worked examples

## Example: minimal project, first retro, quick depth

Context: A new project with 12 commits over 5 days. No PLAN.md. No QA_REPORT.md. CODE_REVIEW.md found with 3 warnings. One session in SRIFLOW_MEMORY.md (sriflow-build ran for 23 minutes, DONE).

Expected behavior:
- Step 0: pre-flight passes, window is 7d
- Step 1: reads memory (1 entry found), CODE_REVIEW.md (3 warns), all others missing
- Step 2: 12 commits, 340 LOC added, 80 LOC deleted, 3 sessions, 4 active days
- Step 3: emits metrics block with CODE_REVIEW: 0 critical, 3 warn, 0 nitpick; QA: not run
- Step 4: pipeline table shows build=yes (23min), plan/design/qa/review/ship all=no
- D1 asks depth preference — user picks quick
- Step 5: writes RETRO.md with § 1 listing the 12 commits by subject, § 2 noting "No PLAN.md found", § 3 showing 100% of time in build, § 4 "No D-numbered decisions found", § 5 showing 3 WARN findings, § 6 "QA not run", § 7 with 3 carry-forwards, § 8 with 3 lessons
- Step 6: appends to SRIFLOW_MEMORY.md, sets Current Stage: reflect-complete
- Step 7: prints summary

## Example: mature project, full cycle retro, thorough depth

Context: A 30-day `cycle` window. PLAN.md exists with 8 items. QA_REPORT.md: 47/50 checks passing. CODE_REVIEW.md: 2 critical, 8 warn. SRIFLOW_MEMORY.md has 45 log entries (under compression threshold). Prior RETRO.md in git history.

Expected behavior:
- Step 0: resolves `_RETRO_SINCE` from SRIFLOW_MEMORY.md project start date
- Step 9 (prior retro): reads prior RETRO.md, extracts 3 carry-forward items from last cycle, adds § 2b
- Step 2: larger git dataset — 80+ commits, multiple sessions
- Step 8: commit histogram shows bimodal pattern (9am-11am + 9pm-11pm); 15 sessions avg 42min
- D1: user picks thorough
- Step 5: § 1 cross-references PLAN.md items that shipped, § 2 lists 2 unshipped PLAN.md items with reasons, § 2b shows 2/3 prior carry-forward items shipped, § 4 has 6 D-numbered decisions reviewed with narrative, § 5 names 2 CRITICAL findings and their resolution status
- Step 6: 45 entries is under threshold — no compression; appends lessons normally
- RETRO.md gets trend line at top
