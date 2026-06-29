# Lens 3 — Engineering Review

## Cognitive frame: what a great staff engineer sees

- **Blast radius instinct** — Every decision evaluated through "what's the worst case and how many systems/people does it affect?"
- **Boring by default** — "Every company gets about three innovation tokens." Everything else should be proven technology. Challenge any new infrastructure choice.
- **Incremental over revolutionary** — Strangler fig, not big bang. Canary, not global rollout. Refactor, not rewrite.
- **Systems over heroes** — Design for tired humans at 3am, not your best engineer on their best day. If the plan requires heroics to operate, it will fail.
- **Reversibility preference** — Feature flags, incremental rollouts, soft deletes. Make the cost of being wrong low. Hard, irreversible decisions need extra scrutiny.
- **Essential vs accidental complexity** — Before accepting any new component: "Is this solving a real problem or one we created?" (Brooks, No Silver Bullet).
- **Make the change easy, then make the easy change** — Refactor first, implement second. Never structural + behavioral changes simultaneously.
- **Error paths are first-class** — Every operation that can fail must have a named failure mode, a named error response, and a named recovery path. "Handle errors" is not a plan.
- **Zero silent failures** — Every failure mode must be visible. If a failure can happen silently, that is a critical defect in the plan.

## Engineering question set

**Q17 — Architecture feasibility check**

Name the technology stack from the plan. Then evaluate:

- **Stack fit**: Is the proposed architecture achievable with this stack, or does it require capabilities the stack doesn't have natively? (Example: if the plan proposes server-sent events but the chosen backend framework has no SSE support, that is a blocker.)
- **Impedance mismatches**: Are there places where the plan's architecture fights the stack's natural patterns? (Example: the plan proposes a document-per-user approach in a relational database; the plan proposes fine-grained permissions in a system that doesn't support row-level security.)
- **Innovation token check**: "Every company gets about three innovation tokens" (Dan McKinley). Does the plan spend innovation tokens (new languages, new databases, new infrastructure categories) where proven technology would work? For every new infrastructure component, ask: what is the cost of being the first to use this in this codebase? Is it justified?
- **Boring by default**: Name every component in the plan that is not standard, proven technology for this domain. For each, evaluate whether the novel choice is justified or whether a boring alternative exists.
- **Component count**: If the architecture has more than 4 new components, flag it. More components mean more failure modes, more deployment complexity, and more surface area to debug. Is each component earning its place?
- **Data ownership**: Who owns each piece of data? Where is it stored? What happens if the store is unavailable? Are there shared mutable states that could cause race conditions?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q18 — Sequencing correctness check**

Walk through the implementation sequence as described in the plan step by step. For each step:

- **Circular dependencies**: Does this step require something that comes after it? (A requires B, B requires A.) Name any you find.
- **Foundation-first**: Are foundations built before features? Required sequence:
  - Data model / schema before queries that use it
  - Authentication before user-facing screens that require auth
  - Database migrations before code that reads the new schema
  - API contracts defined before both frontend and backend implement them
  - Infrastructure (queues, caches, external services) configured before code that depends on them
- **Parallel work risk**: Is the plan proposing to build UI and API in parallel without an agreed contract? This creates integration risk — both sides make assumptions that diverge. The fix is to define the API contract (even as a stub or mock) before splitting work.
- **Minimum viable sequence**: What is the minimum viable sequence that could ship something testable to a user? Does the plan match this, or does it build things in an order that delays the first testable milestone?
- **Bottleneck identification**: Is there a single step that everything else depends on? If that step is delayed, does the entire plan block? Name it and recommend parallelizing where possible.
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q19 — Top 3 technical blockers**

Name the 3 most likely technical blockers to this plan shipping on schedule. Be specific. Not "scaling" but "the event loop saturates at N concurrent users because the plan proposes synchronous processing of webhooks in the main thread." Not "database performance" but "the query in flow X will full-table-scan the events table once it exceeds 10K rows because no index is planned on the foreign key." Not "security risk" but "the plan proposes storing uploaded files in /tmp on the server, which means files are lost on every restart and are accessible across user sessions."

Good blocker descriptions have three parts:
1. What exactly will fail (the mechanism)
2. Under what conditions it fails (the trigger)
3. What the user sees when it fails (the impact)

If the plan is small enough that 3 distinct blockers don't exist, name the real ones and note the rest are low-risk.

Format:
```
BLOCKER 1: <specific technical blocker>
BLOCKER 2: <specific technical blocker>
BLOCKER 3: <specific technical blocker>
```

**Q19b — Build vs. buy decisions**

For every significant component in the plan:
- Is the plan building something that could be bought or adopted from a library/service?
- Is the plan adopting something that should be built for control, data ownership, or cost reasons?
- Are the build-vs-buy decisions explicit in the plan, or left implicit?
- For each implicit decision: name it and recommend which way it should go and why.
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q20 — Error handling and failure mode coverage**

For every operation in the plan that can fail (network calls, database writes, file I/O, external API calls, user input):
- Is there a named error class or failure type?
- Is there a named error response (what does the system return? what does the user see?)?
- Is there a named recovery path (retry, rollback, graceful degradation)?
- Are there any silent failure paths — operations that can fail without the system or user knowing?

Name every gap. "Handle errors gracefully" is not a failure mode. "The Stripe API call in step 3 returns 429 when rate-limited; the plan has no retry strategy and the user sees an unhandled exception" is a failure mode.

- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q21 — Testing strategy**

- Is there a testing strategy in the plan? If not, this is a gap.
- Are unit tests planned for business logic? Integration tests for flows that cross system boundaries? E2E tests for critical user paths?
- Are edge cases named in the test plan, or is the plan only testing the happy path?
- Does the plan include a way to test failure modes (not just success modes)?
- Is there a strategy for testing in staging/pre-prod before production?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q22 — Deploy path and rollback strategy**

- How is this plan deployed? Is the deploy path specified?
- Is there a rollback strategy if the deploy fails or causes regressions?
- Are there database migrations? If so, are they reversible?
- Are there feature flags or canary strategies for high-risk changes?
- Is the plan assuming an atomic deploy when the actual deploy will be distributed (partial deploys, rolling restarts)?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q23 — Technical debt risk**

- Does the plan introduce shortcuts that will become technical debt? Name them.
- Does the plan leave implicit contracts that future developers will need to infer? (Implicit sequencing, undocumented assumptions, magic values.)
- Does the plan touch areas of the codebase that are already high-debt? If so, does it address the debt or add to it?
- Is there a TODOS.md or equivalent? Does the plan create items that should go in it?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q24 — Engineering score**

Consider all Q16-Q23 findings. Score this plan 0-10 on the Engineering lens.

State:
```
ENG LENS: X/10 — <one-line verdict>
```

Include the full list of findings (BLOCKER, CONCERN, NOTE) in the output.
