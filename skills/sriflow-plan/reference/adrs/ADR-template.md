# ADR Template — Generic

Generic Architecture Decision Record. Every ADR written by the plan skill follows this shape. Domain variants (`ADR-architecture`, `ADR-api-design`, `ADR-data-model`, `ADR-security`, `ADR-tooling`) add section blocks on top of this base — never remove the base sections.

## Metadata

```
---
title: <short decision name — the choice made, not the problem>
status: <Proposed | Accepted | Superseded | Deprecated>
date: <YYYY-MM-DD>
deciders: <who decided — role or name>
technical-story: <optional: tracker or issue ref>
---
```

## Status lifecycle

- **Proposed** — written during Phase 6, not yet approved.
- **Accepted** — the option chosen; implement against it.
- **Superseded** — replaced by a newer ADR; link the replacement in Context.
- **Deprecated** — no longer valid; do not implement new work against it.

One ADR per decision. If a decision has two independent parts, split it. Merge/rename is forbidden once accepted — supersede instead.

## 1. Context

The situation that forced the decision. Include:

- What problem is being solved (not the solution).
- Constraining facts: existing systems, licenses, team skill, budget, time, platform.
- Assumptions being made — flag the uncertain ones.
- Any ADRs this one supersedes or depends on.

Write in present tense, third person. The reader must understand the problem without reading the PLAN.md.

## 2. Decision Drivers

The forces that matter for choosing. Ranked, most binding first. Typical drivers: cost, time-to-ship, scalability, security, maintainability, team expertise, ecosystem maturity, migration risk.

## 3. Considered Options

For each option considered (minimum 2 — "do nothing" is always an option):

```
### Option A: <name>
Pros:
- <advantage>
- <advantage>
Cons:
- <disadvantage>
- <disadvantage>
Assessment: <fits drivers X/Y, fails driver Z because...>
```

Options must be real alternatives, not strawmen. If only one option was viable, say so and state why the others were eliminated.

## 4. Decision

The choice, stated so a builder can implement it without re-deriving it. One or two sentences, imperative and specific:

> We will use <option>. Specifically: <the concrete contract a builder follows>.

No hedging, no "consider using". If the decision has limits (e.g. "X for services under 5 req/s; Y above"), state the threshold.

## 5. Consequences

Three lists:

**Positive** — what improves: velocity, safety, operability, debuggability.
**Negative** — what you give up: cost, complexity, lock-in, migration burden.
**Neutral** — facts that are simply true now: "team must learn X", "X must be migrated over Q3".

Every consequence is a prediction about the future. If a consequence is later shown wrong, say so in a follow-up note — do not rewrite history.

## 6. Validation

How to prove the decision was right, concretely:

- What observable outcome confirms it (e.g. "p99 under 200ms at 1k rps").
- When to re-evaluate (trigger event or calendar check).
- Rollback path if it fails.

## Rules

1. Write ADRs during Phase 6, before PLAN.md is finalized.
2. Every plan decision with a non-obvious tradeoff gets an ADR. Obvious choices (language already in use) do not.
3. ADRs live in `06_architecture/adrs/`. Reference each ADR from the relevant PLAN.md section.
4. Enterprise plans: every ADR must name its business-traced requirement. Medium: at least one ADR for the riskiest decision. Small: skip ADRs, inline the decision in PLAN.md.