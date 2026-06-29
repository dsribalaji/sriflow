# Routing Edge Cases

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
