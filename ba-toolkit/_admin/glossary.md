---
title: Project Glossary
phase: _admin
status: ACTIVE
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Project Glossary — [Project Name]

**Purpose:** Single source of truth for every term used in this project's requirements.
**Rule:** If a term appears in a BRD, Use Case, User Story, or stakeholder interview — it belongs here.
**Conflict resolution:** When two stakeholders use the same term differently, this glossary records the
agreed definition after the Disagreement Diagnostic is run. The Disagreement Log links here.

---

## Domain Terms

| Term | Definition | Source | Date confirmed | Notes |
|------|-----------|--------|---------------|-------|
| [Term] | [Precise definition as agreed by stakeholders — not a dictionary definition] | [Stakeholder name, or document reference] | [YYYY-MM-DD] | [If the term has a different meaning in a specific context — note it here] |
| [Term] | [Definition] | [Source] | [Date] | [Notes] |

**Example entries:**

| Term | Definition | Source | Date confirmed | Notes |
|------|-----------|--------|---------------|-------|
| Active Account | An account with status = 'Active' in the accounts table AND at least one user login in the past 90 days | Finance Manager [Name], Legal [Name] | [Date] | Marketing uses "active" to mean "any non-cancelled account" — the two definitions differ; this one applies to the system |
| Proposal | A formal quotation document submitted to a client, with a defined validity period and approval workflow | Commercial Director [Name] | [Date] | Distinguish from "Quote" (informal, no workflow) and "Contract" (signed, legally binding) |
| Manager | A user with the 'manager' role in the system — can view all team records, approve submissions, and generate reports. Does NOT mean anyone with a management title in the org. | IT Lead [Name], HR Lead [Name] | [Date] | Scope: system role only, not HR job title |

---

## Abbreviations & Acronyms

| Acronym | Expansion | Context |
|---------|-----------|---------|
| [Acronym] | [Full form] | [Where / when this is used] |
| BRD | Business Requirements Document | The structured requirements artifact produced in Phase 4a |
| UC | Use Case | The functional scope artifact produced in Phase 3 |
| US | User Story | The sprint-ready story produced in Phase 4b |
| NFR | Non-Functional Requirement | Quality constraints produced in Phase 6 |
| DoR | Definition of Ready | The checklist that determines if a story is sprint-ready |
| GWT | Given-When-Then | The required structure for all Acceptance Criteria |
| INVEST | Independent Negotiable Valuable Estimable Small Testable | The User Story quality standard |
| PII | Personally Identifiable Information | Data that can identify a specific individual |
| RPO | Recovery Point Objective | Maximum acceptable data loss in a disaster |
| RTO | Recovery Time Objective | Maximum acceptable time to restore service after failure |

---

## Disputed / Resolved Terms

*When a term was disputed between stakeholders and the Disagreement Diagnostic was run:*

| Term | Was disputed between | Resolution | Documented in |
|------|---------------------|------------|---------------|
| [Term] | [Stakeholder A] and [Stakeholder B] | [Agreed definition] | DIS-### in disagreement-log.md |

---

## Notes

**[YYYY-MM-DD]:** [Note about glossary update — e.g., "Added 'active account' definition after DIS-001 resolved"]
