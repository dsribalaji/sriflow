---
title: UC Inventory
phase: 03_use-cases
status: DRAFT
agent: /usecase
verdict: RED
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Use Case Inventory — [Project Name]

**Purpose:** Master scoreboard of all Use Cases in the project. The single source of truth for scope.
**Gate rule:** No User Story enters `04_requirements/backlog/` without a traceable UC in `03_use-cases/approved/`.
**Living document:** Update immediately after any UC is created, modified, promoted, or deprecated.

---

## Inventory

| ID | Use Case Name | Goal Level | Primary Actor | Status | Linked Stories | Linked Screens | Verdict |
|----|---------------|-----------|---------------|--------|-----------------|-----------------|---------| 
| UC-001 | [Verb Noun — e.g., Submit Expense Report] | 🌊 Sea Level | [Role] | APPROVED | [US-001, US-002] | [SCREEN-ExpenseForm] | 🟢 GREEN |
| UC-002 | [Verb Noun] | 🌊 Sea Level | [Role] | DRAFT | [None] | [None] | 🔴 RED |
| UC-003 | [Verb Noun] | 🐟 Fish | [Role] | UNDER_REVIEW | [US-005] | [None] | 🟡 UNDER_REVIEW |

---

## Status Breakdown

| Status | Count |
|--------|-------|
| Approved (GREEN) | 0 |
| Under Review | 0 |
| Draft (RED) | 0 |
| Deprecated | 0 |
| **Total** | **0** |

---

## Traceability Check

Run before every sprint:

- [ ] All in-scope BRD requirements traced to at least one UC
- [ ] All approved UCs have at least one linked User Story
- [ ] All approved UCs link to at least one screen mockup
- [ ] No orphaned stories (all US-### trace back to a UC in this inventory)
- [ ] No UCs marked DRAFT have stories in `backlog/approved/`

---

## Scope Boundary

**In scope UCs (confirmed by stakeholders):**
- UC-001 — [Name]
- UC-002 — [Name]

**Explicitly out of scope:**
- [Feature/capability] — de-scoped by [Name] on [Date], reason: [Why]

---

## Notes

**[YYYY-MM-DD]:** [Note about UC status changes or scope decisions]
