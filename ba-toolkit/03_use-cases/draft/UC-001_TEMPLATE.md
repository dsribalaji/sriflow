---
title: UC-001_TEMPLATE
id: UC-001
phase: 03_use-cases
status: DRAFT
verdict: RED
agent: /usecase
traces:
  brd: "[BRD-Req-###]"
  stakeholder: "[Name]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# UC-001 — [Verb Noun: e.g., Submit Expense Report]

## Header

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-001 |
| **Goal Level** | 🌊 Sea Level |
| **Primary Actor** | [Specific role — e.g., Finance Manager, not "user"] |
| **Supporting Actors** | [Other roles involved, or "None"] |
| **Trigger** | [What causes this UC to begin — e.g., "Actor clicks 'New Expense' from the dashboard"] |
| **Preconditions** | [What must be true before this UC runs — e.g., "Actor is authenticated with Finance role"] |
| **Postconditions (Success)** | [Observable success state — e.g., "Expense report is saved with status DRAFT and a unique ID is assigned"] |
| **Postconditions (Failure)** | [Observable failure state — e.g., "No record is created; actor receives error message"] |
| **Priority** | P0 |
| **Frequency** | [How often — e.g., "Daily, average 50 submissions per day; peaks at month-end with 200/day"] |
| **Traces to** | BRD-Req-1.1; Stakeholder: [Name] |

---

## Basic Flow (Happy Path)

The sequence of steps when everything goes right.

1. **Actor initiates:** [Role] navigates to [location] and clicks "[Button/link text]."
2. **System responds:** System displays the [form/screen] with [pre-populated fields, if any].
3. **Actor inputs:** [Role] enters [list of required fields].
4. **Actor submits:** [Role] clicks "[Submit button text]."
5. **System validates:** System validates all required fields and business rules (see Business Rules).
6. **System saves:** System saves the record with status [status value] and generates [ID/confirmation].
7. **System confirms:** System displays [success message/confirmation/navigation to next screen].
8. **Use Case ends** with: [Postcondition success state].

---

## Alternate Flows

Variations that still result in success.

### AF-1 — [Alternate Flow Name: e.g., Pre-populated from Template]

*Branches from Step 2:*
1. Actor selects "Create from template" instead of starting blank.
2. System pre-populates all template fields in the form.
3. Actor reviews pre-populated values and modifies as needed.
4. Rejoins Basic Flow at Step 4.

### AF-2 — [Alternate Flow Name: e.g., Save as Draft]

*Branches from Step 4:*
1. Actor clicks "Save Draft" instead of "Submit."
2. System saves the record with status DRAFT (no validation of optional fields required).
3. System displays success message: "[Exact message text]."
4. Use Case ends with: Record saved as DRAFT, retrievable from [location].

---

## Exception Flows

Failures, errors, and edge cases — each must be fully specified.

### EF-1 — Required Field Missing

*Triggers when:* Actor attempts to submit (Step 4) with one or more required fields empty.

1. System highlights all empty required fields with a red border.
2. System displays inline error message below each empty required field: "This field is required."
3. System displays a summary banner: "Please complete all required fields before submitting."
4. Form remains on screen with Actor's entered data preserved.
5. Use Case resumes at Step 3 (Actor corrects the flagged fields).

**Error message:** "This field is required." (per field) + "Please complete all required fields before submitting." (banner)

### EF-2 — Validation Rule Failure

*Triggers when:* Actor submits (Step 4) with data that violates a business rule (see BR-001).

1. System highlights the violating field.
2. System displays field-level error: "[Specific rule violation message — see BR-001 for text]."
3. Form remains on screen.
4. Use Case resumes at Step 3.

**Error message:** "[Exact text — to be confirmed with stakeholder]"

### EF-3 — System / Network Error

*Triggers when:* System cannot save the record due to a backend or network failure.

1. System displays a banner: "We couldn't save your submission. Please try again."
2. Actor's entered data is preserved in the form.
3. Actor can retry (Use Case resumes at Step 4) or navigate away (data may be lost — system warns).

**Error message:** "We couldn't save your submission. Please try again."

---

## Business Rules

| ID | Rule | Source |
|----|------|--------|
| BR-001 | [Business rule — e.g., "Expense amount cannot exceed the actor's approved spending limit without a manager override"] | [Source: Finance Manager, [Name], [Date]] |
| BR-002 | [Business rule] | [Source] |

---

## Open Questions

| ID | Question | Assigned to | Target date | Status |
|----|----------|-------------|-------------|--------|
| Q-001 | [Question that must be answered before this UC can be promoted] | [Name] | [Date] | 🔴 OPEN |

---

## Linked Artifacts

| Artifact | ID / Link | Status |
|----------|-----------|--------|
| BRD Requirements | BRD-Req-1.1 | ✅ Linked |
| User Stories | [Populated after /story runs] | — |
| Screen Mockups | [Populated after /mockup runs] | — |
| Data Dictionary | [Populated after /data-map runs] | — |

---

## Verdict Checklist

- [ ] Goal level correct (Sea Level — actor can complete in one sitting)
- [ ] Basic flow complete (all steps specified with actor + system action)
- [ ] At least 2 alternate flows covered (or absence justified)
- [ ] All exception flows fully specified (trigger + behavior + exact error message)
- [ ] Preconditions specific and testable
- [ ] Postconditions cover both success and failure
- [ ] Business rules explicitly numbered and sourced
- [ ] No open questions unassigned
- [ ] Traces to BRD requirement

**Verdict:** 🔴 RED (open items remain) / 🟢 GREEN (all checks pass)
