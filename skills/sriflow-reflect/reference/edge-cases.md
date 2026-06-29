# Edge Cases and Error Handling

All edge cases for `/sriflow-reflect`. Skill must handle gracefully without blocking.

---

## Project has git history but no SRIFLOW_MEMORY.md

The project is using git but hasn't started structured pipeline tracking. Proceed with git-only analysis. At the end of RETRO.md § 8 Lessons, add: "This project has no SRIFLOW_MEMORY.md. Run /sriflow-plan to start structured cycle tracking — it will initialize memory and improve future retro signal significantly."

---

## SRIFLOW_MEMORY.md exists but is malformed

Lines don't match expected patterns. Do not fail — read the raw content, extract what you can (any line with a timestamp counts as evidence of activity), and note at the top of the retro: "SRIFLOW_MEMORY.md format appears non-standard — pipeline analysis may be incomplete."

---

## Very large git log (> 500 commits in window)

Cap git log at 500 commits for analysis. Note: "Analysis capped at 500 commits — window may cover more commits than shown." Use `--max-count=500` in git log commands.

---

## Binary files in hotspot analysis

The file hotspot list from git log may include binary files (images, compiled assets, lock files). Filter out common binary and generated file extensions before presenting the hotspot table:
- Filter: `package-lock.json`, `yarn.lock`, `*.lock`, `dist/`, `build/`, `*.png`, `*.jpg`, `*.svg`, `*.ico`, `*.wasm`, `*.map`
- Note at bottom of hotspot table: "Lock files, dist/, and binary assets excluded."

---

## Multiple branches in window

`git log --since=<date>` includes commits from ALL local branches by default. This can inflate commit counts if multiple branches have been worked on. For accurate cross-branch metrics, use `git log --since=<date> HEAD` (HEAD branch only) or `git log --since=<date> --branches` with explicit filtering. Note the branch scope at the top of the metrics block: "Metrics scope: HEAD branch only (`<_BRANCH>`)."

---

## Clock drift or containerized environment

The preamble echoes `_TEL_START=$(date +%s)`. If the system clock is wrong, durations will be wrong. Do not use `date` output to infer "today" for the retro window — use the `currentDate` from the session context reminder if available. The git log timestamps are from the commits themselves and are reliable.

---

## PLAN.md has a format that doesn't enumerate items clearly

Some PLAN.md files are prose documents without a clear checklist format. In this case: extract the stated goals from PLAN.md using your best reading, match them to commit subjects and CODE_REVIEW.md sections, and note in § 2: "PLAN.md uses prose format — goal matching is approximate." Do not invent unshipped items.

---

## QA_REPORT.md has a non-standard format

Different sriflow projects may have different QA report formats. Look for: pass/fail counts near the top, headings like "## Failures", "## Passing", "## Open Issues". Extract what you can. If the format is unrecognizable, quote the first 10 lines of QA_REPORT.md in § 6 and note: "QA report format unrecognized — manual review needed."

---

## CODE_REVIEW.md severity labels

Look for these severity markers: `CRITICAL`, `🔴`, `[CRIT]`, `[ERROR]` for critical; `WARN`, `⚠️`, `[WARN]`, `WARNING` for warnings; `NITPICK`, `💬`, `[NIT]`, `NOTE` for nitpicks. If the code review uses a different labeling scheme, try to map it: anything blocking ship = critical, anything that should be fixed soon = warn, anything optional = nitpick. Note the mapping if it differs from standard.

---

## Zero commits in window

If the git window returns no commits, say: "No commits found in the `<window>` window ending <today>. Either nothing shipped this cycle or the branch is stale. Try `/sriflow-reflect cycle` to review the full project history, or check `git log` manually." Do not write an empty RETRO.md.

---

## Stale branch (>30 days since last commit)

Warn at the top of the retro output (before RETRO.md content): "Last commit was <date>, more than 30 days ago. This retro reflects a stale branch — findings may not match the current state of the codebase."

---

## SRIFLOW_MEMORY.md has no log entries

The project memory exists but has no stage records. Proceed with git-only analysis. Note in RETRO.md § 4 (Decision Quality): "No pipeline log entries found in SRIFLOW_MEMORY.md. Run /sriflow-plan to start structured cycle tracking."
