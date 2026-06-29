# Pipeline Stage Analysis, Prior Retro, Quality Check, and Archive

Reference details for Steps 4, 9, 10, and 11 of `/sriflow-reflect`.

---

## Step 4: Pipeline Stage Analysis

From SRIFLOW_MEMORY.md log entries, reconstruct which pipeline stages ran this cycle.

Look for log entries matching `### <timestamp> | sriflow-<skill> | <status> | <duration>s`. Parse each:
- Skill name maps to pipeline stage (e.g., `sriflow-plan` → `plan`, `sriflow-build` → `build`)
- Status: `DONE`, `DONE_WITH_CONCERNS`, `BLOCKED`, `NEEDS_CONTEXT`
- Duration: in seconds, convert to minutes for display

For each pipeline stage, determine:
1. **Did it run?** (yes / no / partial — no log entry means not run)
2. **How long?** (sum of durations across all runs of that stage)
3. **Rework?** (count commits or memory entries that explicitly revise the stage output — look for `fix:`, `rework:`, `revise:` commit prefixes touching stage-related files)
4. **Notes** — any BLOCKED or DONE_WITH_CONCERNS status, any skipped stage with rationale from memory

Present as a table, then 2-3 sentences on which stage consumed the most time and which had the most rework:

| Stage | Ran? | Time spent | Rework | Notes |
|-------|------|-----------|--------|-------|
| plan | yes | Xmin | N commits | ... |
| design | yes/no | Xmin | N commits | ... |
| build | yes | Xmin | N commits | ... |
| qa | yes/no | Xmin | N commits | ... |
| review | yes/no | Xmin | N commits | ... |
| ship | yes/no | Xmin | N commits | ... |

If a stage has no evidence (no log entry, no commits touching its artifact), mark it `no` and note it was skipped.

---

## Step 9: Prior Retro Comparison

Before writing RETRO.md, check whether a prior RETRO.md exists in the project history:

```bash
# Check for prior retro in git history (not the working tree)
git log --oneline --diff-filter=A -- RETRO.md 2>/dev/null | head -5

# Also check for a dated retro archive
ls RETRO-*.md 2>/dev/null | sort | tail -3
```

If a prior retro exists in git history:
1. Read it: `git show HEAD~1:RETRO.md 2>/dev/null` (or the specific commit from the log)
2. Extract its carry-forward items (§ 7) and lessons (§ 8)
3. In RETRO.md § 2, check whether prior carry-forward items landed this cycle
4. Add a **Prior Carry-Forward Resolution** section (§ 2b) — see `retro-template.md`

If no prior retro found (first retro for this project): skip. Note in § 8 Lessons: "This is the first retro — run again after the next cycle to see trends."

**Trend summary.** If prior retro exists, add one-line trend at top of RETRO.md:
```
Trend vs last retro: commits [↑↓→] N% | LOC [↑↓→] N% | sessions [↑↓→] N | QA pass rate [↑↓→] N%
```
↑ = improvement, ↓ = regression, → = within 10% of prior. Omit unavailable metrics.

---

## Step 10: RETRO.md Quality Check

After writing RETRO.md, run self-check:

**Completeness check:**
- [ ] § 1 What Shipped: every item names a specific artifact (file, endpoint, feature name) — not a vague action
- [ ] § 2 What Was Planned: compared against PLAN.md (or noted PLAN.md was missing)
- [ ] § 3 Where Time Went: table present with at least one row showing time > 0
- [ ] § 4 Decision Quality: all D-numbered decisions from SRIFLOW_MEMORY.md reviewed (or "none found" noted)
- [ ] § 5 Code Quality Signals: file hotspot table present (even if empty)
- [ ] § 6 What Broke: QA findings present (or "QA not run" noted)
- [ ] § 7 Carry-Forward: exactly 3 items, each specific and actionable
- [ ] § 8 Lessons: 3 lessons, none of which are generic platitudes

**Lesson quality check.** For each lesson in § 8:
- Does it name something specific from THIS cycle? (file path, stage name, specific failure)
- Is it actionable? (Does it suggest a behavior change, not just an observation?)
- Is it different from lessons already in SRIFLOW_MEMORY.md?

If any lesson fails the check, rewrite it. A rewritten lesson that is more specific but still factual is always better than a passing-but-generic one.

**Carry-forward quality check.** For each item in § 7:
- Does it have a clear done condition? ("Add auth timeout test" is done when the test exists. "Improve auth" never has a done condition.)
- Is it scoped to the next cycle? (Not "someday" — something achievable in the next 1-2 weeks.)
- Is it the right priority? (The top item should be the thing that, if not done, most threatens the next cycle's quality.)

If a carry-forward item is vague, rewrite it to be specific. If you cannot make it specific from available data, note the gap.

---

## Step 11: Save Retro Snapshot

If the project has a `retros/` directory or a pattern of dated retro files (`RETRO-YYYY-MM-DD.md`), save a copy:

```bash
ls -d retros/ 2>/dev/null || echo "no retros dir"
ls RETRO-*.md 2>/dev/null | head -3 || echo "no dated retros"
```

- If `retros/` directory exists: copy RETRO.md to `retros/RETRO-<today>.md`
- If dated retro files exist in root: copy RETRO.md to `RETRO-<today>.md`
- If neither pattern: skip. Note: "No retro archive pattern detected. To enable retro history, create a `retros/` directory."

Do NOT create the archive directory or pattern speculatively. Only use patterns already established in the project.

---

## Self-Improvement Notes

When this skill runs, log one operational observation if you discovered something non-obvious about the project's development pattern. Write it to SRIFLOW_MEMORY.md as part of the lessons block, prefixed with `[reflect-observation]:`:

```
[reflect-observation]: Build phase consistently runs 3x longer than plan phase — consider breaking large build tasks into smaller milestones
```

Good observations:
- Recurring pipeline stage that consistently runs long (suggest breaking it up)
- A file that appears in every session's commits (might be a God Object — suggest refactor)
- QA pass rate trending down over multiple retros (systemic quality issue)
- Carry-forward completion rate < 50% across 2+ retros (systemic follow-through issue)
- Commits heavily concentrated in one hour of the day (possible context: only working during a specific window)

Bad observations (do not log):
- Generic "tests are important" type observations
- Observations that repeat what's already in the lessons block
- Observations the user obviously already knows (e.g., "this project uses TypeScript")

Only log 1 observation per retro run. If nothing non-obvious was discovered, skip it.

---

## Worked Examples

### Minimal project, first retro, quick depth

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

### Mature project, full cycle retro, thorough depth

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
