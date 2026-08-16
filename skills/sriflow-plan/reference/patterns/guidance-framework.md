# Pattern — Guidance (Compile → Enforce → Prove → Evolve)

The guidance control plane, used as the discipline layer over the whole plan. Four stages that turn a spec from prose into a maintained, proven contract. Apply across the plan lifecycle — the plan skill owns stages 1-2, later skills own 3-4, and every stage writes back to the plan.

## The cycle

```
Compile → Enforce → Prove → Evolve → (loop)
```

## 1. Compile

Gather the authoritative spec into one place before anything is built.

- Collect: PLAN.md, DESIGN.md, ADRs, story cards, NFRs, use cases.
- Resolve contradictions at compile time (a contradiction left in compile surfaces at build as a guess).
- Produce a single source of truth with a version and a change log. "Where is the spec?" must have exactly one answer.

**Plan-skill action:** after Phase 6, run a compile pass — every NFR traced to a story, every story traced to a use case, every decision to an ADR. Missing traces are compile warnings.

## 2. Enforce

Make the spec mechanical so it cannot drift. A rule that relies on memory is not enforced.

- Enforceable: schema validation, lint rules, contract tests, CI gates, type checking, feature flags.
- Not enforceable (needs review): prose intent, design taste, prioritization.

**Plan-skill action:** for each rule in the plan, mark it `[enforced]` or `[reviewed]`. The enforced ones name the tool that enforces them (eslint, contract test, schema check). Reviewed ones name the review lens that checks them.

## 3. Prove

Prove the spec is true, not just written. Evidence beats assertion.

- For behavior: tests (golden path, edge, error).
- For non-functional claims: benchmarks, load tests, latency budgets.
- For decisions: the ADR's Validation section — the observable outcome that confirms the choice.

**Hand-off:** the test skill proves behavior, the ship skill proves deployability, the reflect skill proves the plan's estimates. All three feed their evidence back as plan corrections.

## 4. Evolve

The spec is a living contract — it changes with evidence.

- When reality contradicts the spec, the spec is wrong until proven otherwise. Fix the spec or document the deviation as a decision.
- Changes go through the same stages: re-compile (update the source of truth), re-enforce (update the guard), re-prove (update the tests).
- Never evolve silently — every change is logged in the spec's change log and the project decisions log.

## Rules

1. **One source of truth.** Duplicated specs diverge; the newest copy wins and the oldest is silently wrong.
2. **Compile before enforce.** A guard on a wrong spec enforces the wrong thing faster.
3. **Prove what you claim.** An NFR without a number and a test is an aspiration, not a requirement.
4. **Evolve deliberately.** A spec change without a logged decision is a revert waiting to happen.
5. **Close the loop.** Evidence from build/test/ship that contradicts the plan gets written back into the plan and into the retro's lessons.

## Plan-review integration

The guidance lens in `/sriflow-plan-review` scores the plan on all four stages:

- **Compile** — is there one source of truth? Are traces complete?
- **Enforce** — are the plan's rules mechanical or aspirational?
- **Prove** — does every NFR have a testable number?
- **Evolve** — is there a change log and a decisions log?