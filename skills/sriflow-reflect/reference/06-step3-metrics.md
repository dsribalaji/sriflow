# Step 3: Emit cycle metrics block

Before writing RETRO.md, emit the metrics block directly to the conversation so the user sees raw numbers:

```
CYCLE METRICS (<window>: <since> to <today>):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commits:       N (no merges)
LOC:           +X added / -Y deleted / Z net
Test LOC:      N added (X% of total)
Files:         N unique files touched
Active days:   N of <window-days> days
Sessions:      N detected (avg Xmin, longest Xmin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline ran:  [plan] [design] [build] [qa] [review] [ship]
Code review:   N critical, N warn, N nitpick
QA:            N/N checks passing (N categories with failures)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backlog:       N open (X P0/P1) · N closed this cycle
AI-assisted:   N commits with Co-Authored-By trailers
```

If CODE_REVIEW.md was not found: show `Code review: not run this cycle`.
If QA_REPORT.md was not found: show `QA: not run this cycle`.
If TODOS.md was not found: show `Backlog: no TODOS.md found`.
