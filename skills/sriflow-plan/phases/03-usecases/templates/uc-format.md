# Use Case Format Template

## UC-[###] — [Verb Noun]

| Field | Value |
|-------|-------|
| Use Case ID | UC-[###] |
| Goal Level | 🌊 Sea Level |
| Primary Actor | [Specific role] |
| Trigger | [What causes this UC to begin] |
| Preconditions | [What must be true before this UC can run] |
| Postconditions (Success) | [What is true when UC completes successfully] |
| Postconditions (Failure) | [What is true when UC fails] |
| Priority | P0 / P1 / P2 |

---

## Basic Flow (Happy Path)

1. [Actor] [does action].
2. System [responds].
3. [Actor] [does next action].
N. Use Case ends with [success postcondition].

---

## Alternate Flows

### AF-1 — [Name]
*Branches from Step N:*
1. [Steps]
2. Rejoins basic flow at Step N, OR ends with [outcome].

---

## Exception Flows

### EF-1 — [Name]
*Triggers when:* [Exact condition]
1. System [detects / displays / blocks].
2. [Actor] [is shown / can].
3. Use Case [resumes / ends with failure].
**Error message:** "[Exact text]"

---

## Business Rules

| ID | Rule | Source |
|----|------|--------|
| BR-001 | [Rule statement] | [Stakeholder / source] |

---

## Open Questions

| ID | Question | Assigned to |
|----|----------|-------------|
| Q-001 | [Open question] | [Name] |
