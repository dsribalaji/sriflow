# 07 — Artifacts, Edge Cases & Quick Reference

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

## Routing Edge Cases

**User invokes `/sriflow-think`:** Route to `/sriflow-plan`. Output:
```
→ /sriflow-plan
sriflow-think is now merged into sriflow-plan — same pipeline, one fewer step.
```

**User says "next":** Check pipeline status. Route to the first ⏳ stage, or the first ⬜ stage after the last ✅ stage.

**User says "start over":** Do not wipe artifacts. Ask D1 with options: A) archive existing artifacts and restart `/sriflow-plan`, B) keep artifacts and restart from a specific stage.

**User mentions a specific file (e.g. "look at PLAN.md"):** Read the file, summarize it in 2-3 sentences, then ask if they want to continue from that stage or route somewhere else.

**User asks about sriflow itself:** Answer from this SKILL.md. Do not invent features not listed here.

**Multiple intents in one message (e.g. "review the plan and start building"):** Route to the earlier stage first. Output:
```
→ /sriflow-plan-review (first)
After that passes: /sriflow-build
Reason: plan review gates build — run in order.
```

## Quick Reference Card

```
/sriflow              This skill. Status, routing, help.
/sriflow-plan         Idea → PLAN.md (also: /sriflow-think)
/sriflow-plan-review  PLAN.md → reviewed, scored, approved
/sriflow-design       Approved plan → DESIGN.md + HTML mockups
/sriflow-build        DESIGN.md → working code
/sriflow-code-review  Working code → CODE_REVIEW.md
/sriflow-test         Code → QA_REPORT.md
/sriflow-ship         Passing tests → deployed
/sriflow-reflect      Post-ship → RETRO.md + lessons in memory

Utilities (any stage):
/sriflow-browser      Headless Chrome — screenshots, scraping, automation
/sriflow-memory       Read/write/compress SRIFLOW_MEMORY.md
/sriflow-trim         Always-on ponytail — minimal code + compressed speech
```
