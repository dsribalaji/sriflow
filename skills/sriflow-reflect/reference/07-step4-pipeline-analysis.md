# Step 4: Pipeline stage analysis

From SRIFLOW_MEMORY.md log entries, reconstruct which pipeline stages ran this cycle.

Look for log entries matching the pattern `### <timestamp> | sriflow-<skill> | <status> | <duration>s`. Parse each entry:
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
