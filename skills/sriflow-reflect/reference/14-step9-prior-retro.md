# Step 9: Prior retro comparison

Before writing RETRO.md, check whether a prior RETRO.md exists in the project history:

```bash
# Check for prior retro in git history (not the working tree — that's the current one being written)
git log --oneline --diff-filter=A -- RETRO.md 2>/dev/null | head -5

# Also check for a dated retro archive if the project uses one
ls RETRO-*.md 2>/dev/null | sort | tail -3
```

If a prior retro exists in git history:
1. Read it: `git show HEAD~1:RETRO.md 2>/dev/null` (or the specific commit from the log above)
2. Extract its carry-forward items (§ 7) and lessons (§ 8)
3. In RETRO.md § 2 (What Was Planned But Didn't Ship), also check whether prior carry-forward items landed this cycle
4. Add a **Prior Carry-Forward Resolution** section immediately after § 2:

```markdown
## 2b. Prior Carry-Forward Resolution

Items from the last retro's carry-forward list — did they ship this cycle?

| Item | Shipped? | Notes |
|------|---------|-------|
| <prior CF item 1> | yes/no/partial | <what happened> |
| <prior CF item 2> | yes/no/partial | <what happened> |
| <prior CF item 3> | yes/no/partial | <what happened> |

<1 sentence: what carry-forward resolution rate tells you about follow-through.
If < 1/3 carried forward items shipped: this is a pattern to name in § 8 Lessons.>
```

If no prior retro is found (first retro for this project): skip this step. Note in § 8 Lessons: "This is the first retro — run again after the next cycle to see trends."

**Trend summary.** If a prior retro exists, add a one-line trend summary at the top of RETRO.md after the generated-date line:

```
Trend vs last retro: commits [↑↓→] N% | LOC [↑↓→] N% | sessions [↑↓→] N | QA pass rate [↑↓→] N%
```

Use ↑ for improvement, ↓ for regression, → for within 10% of prior. If prior data is unavailable for a metric, omit that metric from the trend line.
