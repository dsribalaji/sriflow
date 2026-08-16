# 04 — Usage Examples per Data File

Real-shaped records for each file. Copy the shape, change the values.

## context.json (overwrite, single object)

```json
{
  "branch": "feature/checkout",
  "session": "48231-20260816",
  "saved_at": "2026-08-16T14:20:00Z",
  "saved_context": "Midway through sriflow-plan on checkout flow. Tier 1
   uncertainty: payment gateway choice. Next: interview plan."
}
```

## learnings.jsonl (append)

```json
{"id":"L-042","ts":"2026-08-16T14:20:00Z","domain":"testing",
 "learning":"vitest mocks must be restored in afterEach to avoid cross-test bleed",
 "source":"sriflow-test run on orders module","confidence":0.8}
```

## decisions.jsonl (append)

```json
{"id":"D-012","ts":"2026-08-15T09:00:00Z","decision":"adopt CRDT-based sync",
 "rationale":"offline-first requirement; last-write-wins loses edits",
 "evidence":"interview: Priya (FE lead), 2026-08-14; ADR-051 pattern",
 "status":"resolved","related":["D-010"],"superseded_by":null}
```

## timeline.jsonl (append)

```json
{"event":"sriflow-plan:started","ts":"2026-08-16T14:05:00Z",
 "branch":"feature/checkout","session":"48231-20260816","duration_s":null}
{"event":"sriflow-plan:completed","ts":"2026-08-16T14:40:00Z",
 "branch":"feature/checkout","session":"48231-20260816","outcome":"done","duration_s":2100}
```

## questions.jsonl (append)

```json
{"id":"Q-007","ts":"2026-08-14T11:00:00Z","question":"Which payment
 provider?","asked_of":"CEO","answers":[{"by":"Sri","answer":"Stripe,
   primary; Adyen as fallback","certainty":"high"}],"resolved":true}
```

## preferences.jsonl (append)

```json
{"ts":"2026-08-12T08:00:00Z","key":"language","value":"python",
 "note":"prefer FastAPI over Django unless admin-heavy"}
```

## analytics.jsonl (append, opt-in only)

```json
{"ts":"2026-08-16T14:05:00Z","skill":"sriflow-plan","event":"run",
 "branch":"feature/checkout","session":"48231-20260816","duration_s":2100}
```

## eureka.jsonl (append)

```json
{"id":"E-003","ts":"2026-08-13T16:00:00Z","insight":"The offline queue
 isn't a feature — it's the sync primitive. Build it first, everything else
 layers on.",
 "source":"reflect after build phase","related":["D-012"]}
```

## reviews.jsonl (append)

```json
{"id":"R-021","ts":"2026-08-16T13:00:00Z","scope":"checkout",
 "branch":"feature/checkout","findings":{"critical":0,"major":1,"minor":3},
 "summary":"Unhandled void path leaves DB row in limbo","blocking":true}
```

## instincts.jsonl (append — confidence 0-100)

```json
{"id":"I-008","ts":"2026-08-16T15:00:00Z","trigger":"when adding a new
 route","action":"add a health check to the new router",
 "confidence":62,"domain":"code-patterns","evidence":"observed 4 routes
 added without health checks in a row","promoted":false}
```

## SRIFLOW_MEMORY.md log entry (in-repo projection)

```markdown
### 2026-08-16T14:40:00Z | sriflow-plan | done | 2100s
Branch: feature/checkout
Key output: PLAN.md with 6 phases; D-012 decision on sync
Next: /sriflow-plan-review
```