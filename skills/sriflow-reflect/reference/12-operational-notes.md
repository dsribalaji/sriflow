# Operational Notes

**No git writes.** This skill is read-only on git. It reads `git log` and `git fetch` but never commits, branches, or pushes.

**Overwrite policy.** RETRO.md is always overwritten. If RETRO.md exists from a prior run, it is replaced entirely. SRIFLOW_MEMORY.md is append-only (except for the compression step and stage/priority line updates — those are surgical edits, not rewrites).

**Missing files are not errors.** If PLAN.md, QA_REPORT.md, CODE_REVIEW.md, or TODOS.md don't exist, note their absence in the relevant RETRO.md section. Never block on a missing file — synthesize best-effort from what's available and make the gap explicit.

**Zero commits in window.** If the git window returns no commits, say: "No commits found in the `<window>` window ending <today>. Either nothing shipped this cycle or the branch is stale. Try `/sriflow-reflect cycle` to review the full project history, or check `git log` manually." Do not write an empty RETRO.md.

**Stale branch (>30 days since last commit).** Warn at the top of the retro output (before RETRO.md content): "Last commit was <date>, more than 30 days ago. This retro reflects a stale branch — findings may not match the current state of the codebase."

**If SRIFLOW_MEMORY.md has no log entries.** The project memory exists but has no stage records. Proceed with git-only analysis. Note in RETRO.md § 4 (Decision Quality): "No pipeline log entries found in SRIFLOW_MEMORY.md. Run /sriflow-plan to start structured cycle tracking."

**Lessons quality gate.** Do not write generic lessons. Before writing § 8 Lessons, verify each lesson against this checklist:
- [ ] Names a specific file, stage, tool, or pattern from THIS cycle
- [ ] Actionable in the next cycle (someone could do something different based on it)
- [ ] Not a restatement of a lesson already in SRIFLOW_MEMORY.md

If you can't generate 3 non-generic lessons from the available data, write as many as the data supports and note: "Only N lessons generated from available data — more pipeline tracking would improve this."
