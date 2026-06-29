# Status Display Format

Triggered by: "status", "where am I", "what stage", "pipeline status"

Read artifact detection output from Step 0. Read `_CURRENT_STAGE` from preamble. Compute markers:

- ✅ = artifact file for this stage exists on disk
- ⏳ = this is the current stage per `SRIFLOW_MEMORY.md` (or first stage without artifact if memory absent)
- ⬜ = not yet started

## Render format

```
SRIFLOW PIPELINE — <_PROJECT_NAME>
Branch: <_BRANCH>

✅ /sriflow-plan          PLAN.md (<date>)
✅ /sriflow-plan-review   PLAN_REVIEW.md (<date>)
⏳ /sriflow-design        IN PROGRESS
⬜ /sriflow-build
⬜ /sriflow-code-review
⬜ /sriflow-test
⬜ /sriflow-ship
⬜ /sriflow-reflect

Next: /sriflow-design
```

## Rules

- Show date next to ✅ stages in `(YYYY-MM-DD)` format.
- Show `IN PROGRESS` next to ⏳ stage.
- If no artifacts and no memory: all ⬜ except `/sriflow-plan` which is ⏳.
- If all artifacts exist: all ✅, `Next: /sriflow-reflect` (or "Pipeline complete" if RETRO.md exists).
- `/sriflow-browser` and `/sriflow-memory` are not pipeline stages — omit from status. They are utilities available at any stage.
- `/sriflow-trim` is always-on — omit from status.

## Stage Artifact Reference

| Stage | Artifact | Notes |
|-------|----------|-------|
| /sriflow-plan | `PLAN.md` | BA pipeline output |
| /sriflow-plan-review | `PLAN_REVIEW.md` | Three-lens review scores |
| /sriflow-design | `DESIGN.md` or `design/` directory | Wireframes + HTML mockups |
| /sriflow-build | no single artifact — check git diff | Code is in the working tree |
| /sriflow-code-review | `CODE_REVIEW.md` | Diff review findings |
| /sriflow-test | `QA_REPORT.md` | QA findings report |
| /sriflow-ship | no artifact — check CI/deployment logs | Shipped = in prod |
| /sriflow-reflect | `RETRO.md` | Retrospective output |

Build and Ship leave no markdown artifact. For these stages, rely on `Current Stage:` in `SRIFLOW_MEMORY.md` for the ⏳ marker. If SRIFLOW_MEMORY.md shows `Current Stage: build` but no `CODE_REVIEW.md` exists, mark build as ⏳.
