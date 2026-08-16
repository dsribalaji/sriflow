# ADR Template — Architecture

Extends `ADR-template.md`. Use for system-level decisions: overall style, boundaries, communication, deployment shape. Add these blocks between base sections 1 (Context) and 4 (Decision).

## 1. Context — architecture additions

Add:

- Scale target: users, throughput, data volume, growth curve (as numbers, not adjectives).
- Existing architecture and what changes are in scope.
- Hard constraints: compliance, on-prem requirement, latency budget, offline capability.
- The system's boundaries (what is in vs out of this decision).

## 2. Decision Drivers — architecture specific

Order matters. If cost drives, say so first. If correctness dominates (financial/medical), it must be rank 1. Typical architecture drivers:

- Reliability / availability target
- Scalability (horizontal vs vertical)
- Deployment model (cloud, edge, on-prem, hybrid)
- Operational simplicity
- Team size and skill
- Regulatory constraints

## 3. Considered Options — architectural styles

Name the styles evaluated. Template per option:

```
### <Style name — e.g. Monolith, Modular Monolith, Microservices, Serverless>
Topology: <one diagram or list of components and how they talk>
Scale ceiling: <where it starts to hurt>
Operational cost: <what must be operated>
Migration from current state: <effort, risk>
Pros / Cons: <bullets>
```

## 4. Decision — architecture additions

State:

- The chosen style.
- Component inventory: each component, its responsibility, and its data ownership.
- Communication: sync (REST/gRPC) vs async (queue/topic) per interaction. Default to sync unless a durability or decoupling requirement forces async.
- Data ownership: which component owns which data store. No two writers to one store without an explicit reason.

## 5. Consequences — architecture additions

Add to the standard lists:

- Failure modes introduced (network partitions, partial failure, degraded mode).
- Operational burden (observability, deployment tooling, on-call surface).
- Team structure implications (conway's law — the system will mirror the org).

## 6. Validation — architecture additions

- Load test target with pass/fail numbers.
- Failure injection tests (kill a node, kill the queue) before production sign-off.
- "Can we still ship weekly?" as a standing question — architecture that blocks deploy cadence is failing.

## Checklist before acceptance

- [ ] Every component has a single owner
- [ ] No circular dependency between components
- [ ] Each data store has exactly one writer
- [ ] Degraded mode defined for each external dependency (what does the UI show when X is down?)
- [ ] Scale path is incremental — you can go from monolith to split without a rewrite
- [ ] Rollback path for each deploy unit