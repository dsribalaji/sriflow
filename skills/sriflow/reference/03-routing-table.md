# 03 — Routing Table

## Step 1 — Identify intent

Read the user message and compare it against the routing table. A match moves you to Step 2; otherwise go to Step 4 (AUQ).

Intent patterns the router recognizes:

| Intent | Route |
|--------|-------|
| new idea / I have an idea / plan this / think through this | `/sriflow-plan` |
| ideate / brainstorm / /sriflow-think | `/sriflow-plan` |
| let me think / explore this idea / what should I build | `/sriflow-plan` |
| review the plan / is this plan good / plan review | `/sriflow-plan-review` |
| audit the plan / check the plan before building | `/sriflow-plan-review` |
| design / wireframe / mockup / UI spec | `/sriflow-design` |
| layout / screens / draw the interface | `/sriflow-design` |
| build / implement / code / write the code | `/sriflow-build` |
| start coding / make it / create the feature | `/sriflow-build` |
| code review / review my changes / review the diff | `/sriflow-code-review` |
| check the diff / security review / audit the code | `/sriflow-code-review` |
| test / QA / does it work / check for bugs | `/sriflow-test` |
| run tests / verify / quality check | `/sriflow-test` |
| browse / open in browser / check the site / navigate | `/sriflow-browser` |
| screenshot / scrape / open localhost / headless | `/sriflow-browser` |
| ship / deploy / release / go live / push to prod | `/sriflow-ship` |
| merge and deploy / CI / smoke test | `/sriflow-ship` |
| retro / reflect / what did we learn / retrospective | `/sriflow-reflect` |
| after-action / lessons learned / what worked | `/sriflow-reflect` |
| save context / read memory / update memory | `/sriflow-memory` |
| compress memory / what do we know / project state | `/sriflow-memory` |
| validate skills / check skill format / spec compliance | `/sriflow-validate` |
| status / where am I / what stage / pipeline status | show status (Step 3) |
| help / what skills / what can sriflow do | show help (Step 3) |
| upgrade / update sriflow / check for updates | upgrade check (Step 3b) |
| /sriflow-think | `/sriflow-plan` (think merged into plan) |

## Step 2 — Route

Once intent matches, print exactly this format:

```
→ /sriflow-<skill>
<One sentence: what that skill will do for you right now.>
```

Don't run the destination skill. Don't plan beyond the route. Emit one routing message, then stop.

Examples:

- Intent "I have an idea for a new feature":
  ```
  → /sriflow-plan
  Runs the 6-phase BA pipeline to shape your idea into a structured PLAN.md.
  ```

- Intent "review the plan":
  ```
  → /sriflow-plan-review
  Three-lens review (CEO, Design, Eng) — each lens scored 0-10, blocks when any lens lands below 7.
  ```

- Intent "build it":
  ```
  → /sriflow-build
  Implements the approved DESIGN.md — runs a pre-build safety check, then writes code.
  ```

When `/sriflow-think` is called by name, route to `/sriflow-plan` and say once: "sriflow-think is now merged into sriflow-plan."