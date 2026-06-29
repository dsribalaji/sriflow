# Phase 3 — Use Cases (SCOPE GATE)

**Goal:** Convert elicitation findings into formal Use Cases at Sea Level (Cockburn framework).

---

## Step 3.1 — Confirm Elicitation Complete

**Q29:** Confirm: All Tier 1 clarity checks scored ≥ 8/10?

---

## Step 3.2 — Identify Use Cases

**Q30:** Based on the elicitation findings, what are the primary use cases? (List each as Verb + Noun, e.g., "Submit Expense Report", "Approve Budget")

---

## Step 3.3 — For Each Use Case, Specify

For [UC Name], ask:

**Q31:** Primary Actor: Who initiates this use case? (Specific role)

**Q32:** Trigger: What causes this use case to begin?

**Q33:** Preconditions: What must be true before this use case can run?

**Q34:** Basic Flow (Happy Path): Walk through step by step — what happens when everything goes right?

**Q35:** Alternate Flows: What variations still result in success? (Minimum 2 per UC)

**Q36:** Exception Flows: What failures, errors, and edge cases must be handled? (For each: trigger condition + system behavior + error message)

**Q37:** Business Rules: What rules must the system enforce during this use case?

**Q38:** Postconditions (Success): What is true when the use case completes successfully?

**Q39:** Postconditions (Failure): What is true when the use case fails or is abandoned?

---

## Step 3.4 — UC Verdict Scoring

Score each UC on 9 criteria:
- Goal level correct (Sea Level)?
- Basic flow complete?
- Alternate flows covered (≥2)?
- Exception flows specified?
- Preconditions testable?
- Postconditions observable?
- Business rules explicit?
- No open questions?
- Traces to BRD?

**GREEN = all checks pass. RED = any check fails.**

**Q40:** Does [UC Name] score GREEN? If RED, what's missing?

---

## Output

- `draft/UC-*.md` — individual use case files
- `uc-inventory.md` — master list of all use cases with status
