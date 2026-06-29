# User Story Format Template

## US-[###] — [Verb Noun]

**As a** [specific role],
**I want** [specific action],
**so that** [business value].

**Why this matters:** [1-2 sentence business context]

---

## INVEST Check

| Letter | ✅ / ❌ | Notes |
|--------|--------|-------|
| Independent | | |
| Negotiable | | |
| Valuable | | |
| Estimable | | |
| Small | | |
| Testable | | |

**Result:** GREEN (all ✅) / RED (fix required)

---

## Acceptance Criteria

### AC-1 — Happy Path
Given [context]
When  [action]
Then  [observable result with measurable threshold]

### AC-2 — Boundary
Given [context]
When  [action]
Then  [result]

### AC-3 — Error/Exception (traces to UC EF-#)
Given [context]
When  [action or invalid input]
Then  [system behavior — error message text, state change, or blocked action]

---

## Traces to
- UC: UC-[###]
- BRD: Req-[###]
