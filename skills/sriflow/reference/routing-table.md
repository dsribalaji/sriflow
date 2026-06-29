# Full Routing Table

Intent patterns and their destinations:

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
| debug / fix bug / root cause / investigate error | `/sriflow-build` |
| code review / review my changes / review the diff | `/sriflow-code-review` |
| check the diff / security review / audit the code | `/sriflow-code-review` |
| security audit / OWASP / check for vulnerabilities | `/sriflow-code-review` |
| test / QA / does it work / check for bugs | `/sriflow-test` |
| run tests / verify / quality check | `/sriflow-test` |
| code health / quality dashboard / how healthy | `/sriflow-test` |
| browse / open in browser / check the site / navigate | `/sriflow-browser` |
| screenshot / scrape / open localhost / headless | `/sriflow-browser` |
| import cookies / setup browser cookies / login to site | `/sriflow-browser` |
| ship / deploy / release / go live / push to prod | `/sriflow-ship` |
| merge and deploy / CI / smoke test | `/sriflow-ship` |
| update docs after ship / document release / update changelog | `/sriflow-ship` |
| retro / reflect / what did we learn / retrospective | `/sriflow-reflect` |
| after-action / lessons learned / what worked | `/sriflow-reflect` |
| save context / read memory / update memory | `/sriflow-memory` |
| compress memory / what do we know / project state | `/sriflow-memory` |
| status / where am I / what stage / pipeline status | show status (Step 3) |
| help / what skills / what can sriflow do | show help (Step 3) |
| upgrade / update sriflow / check for updates | upgrade check (Step 3b) |
| /sriflow-think | `/sriflow-plan` (think merged into plan) |
