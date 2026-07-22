# Self-improvement notes

When this skill runs and produces output, log one operational observation if you discovered something non-obvious about the project's development pattern. Write it to SRIFLOW_MEMORY.md as part of the lessons block, prefixed with `[reflect-observation]:`:

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
