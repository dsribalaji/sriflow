# Backend: Instinct Evolution

Concept doc for `instincts.jsonl`. The instinct system records atomic
observed behaviors with confidence scores (0.3-0.9) and evolves them:
confidence decay when contradicted, promotion when confirmed. sriflow-memory
adopts the model with **0-100** integer confidence.

## The instinct record

```json
{"id":"I-008","ts":"2026-08-16T15:00:00Z","trigger":"when adding a new
 route","action":"add a health check to the new router","confidence":62,
 "domain":"code-patterns","evidence":"observed 4 routes added without health
 checks in a row","promoted":false}
```

- **Atomic** — one trigger, one action.
- **Confidence** 0-100: <40 tentative, 40-70 established, >70 near-certain.
- **Domain-tagged** — code-style, testing, git, debugging, workflow.
- **Evidence-backed** — every confidence change appends evidence.
- **Project-scoped** by default; promotion moves it to a shared (global)
  scope.

## Confidence updates

### Promotion (confirmation)

Each time the behavior is observed working as predicted, confidence moves up
(recent observations are weighted more heavily):

```
confidence += (100 - confidence) * 0.15   # asymptotic toward 100
```

Append evidence: `{"evidence":"repeated successfully in orders module"}`.

### Decay (contradiction)

When a session contradicts the instinct:

```
confidence *= 0.5                          # halve, then re-evaluate
```

An instinct below **30** for two consecutive contradictions is **retired** —
marked `"retired":true` (never deleted, per append-only rules). A retired
instinct that re-proves itself later can be re-activated with a fresh record.

## Promotion: project → global

An instinct is promoted to the shared scope when **confirmed in 2+ projects**
(the two-project confirmation rule). Promotion:

1. Marks the project record `"promoted":true` with the global id.
2. Writes a copy to the shared instincts store
   (`~/.sriflow/instincts/global.jsonl`).
3. Cross-project confirmation is the only cross-project read
   sriflow-memory performs.

## Evolution → skill

The end state (instincts → cluster → skill): when a cluster of ≥3
related instincts at confidence >70 persists across a reflect cycle,
sriflow-reflect proposes promoting them into a reusable pattern doc or a
new skill. The proposal is always presented to Sri — instincts never
self-publish skills.

## Rules

1. Instincts are observations, not rules. They never override a gate or a
   decision — they inform sriflow-reflect proposals.
2. Confidence changes are append-only evidence, never in-place edits.
3. An instinct with no evidence string is not written.
4. Retired instincts stay readable in `instincts.jsonl` history.