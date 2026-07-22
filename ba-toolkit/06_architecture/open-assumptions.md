---
title: Open Assumptions Register
phase: 06_architecture
status: DRAFT
agent: /nfr
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Open Assumptions Register — [Project Name]

**Purpose:** Track every assumption made during NFR discovery that has not yet been confirmed.
**Rule:** Every Tier 1 assumption must be confirmed before architecture decisions are made.
An unconfirmed assumption in a Tier 1 NFR is a project risk, not a baseline.

---

## Active Assumptions

| ID | Assumption | NFR link | Risk if wrong | Owner | Confirmation method | Target date | Status |
|----|-----------|----------|---------------|-------|---------------------|-------------|--------|
| ASM-001 | Current peak load is ~200 concurrent users; projected to reach 400 in 12 months | NFR-SC01 | If actual peak is 800+, the 500-user target is insufficient and architecture must be re-evaluated before build | IT Lead + Product Owner | Pull actual concurrent session data from current system logs | [Date] | 🔴 UNCONFIRMED |
| ASM-002 | EU data residency applies because at least some users are EU residents | NFR-C01 | If no EU personal data is processed, this constraint is unnecessary (saves cost and complexity) | Legal | Legal to confirm which user jurisdictions are in scope | [Date] | 🔴 UNCONFIRMED |
| ASM-003 | 99.9% uptime SLA is required by Enterprise tier contracts | NFR-A01 | If actual SLA is 99.5%, multi-AZ requirement may be relaxed (significant cost saving) | Commercial Lead | Review Enterprise contract SLA clauses | [Date] | 🔴 UNCONFIRMED |
| ASM-004 | Monthly infrastructure budget cap is $[X,XXX] | NFR-CO01 | If budget is lower, some Tier 1 NFRs may be incompatible with the available spend | Finance | Finance to confirm approved budget for infrastructure | [Date] | 🔴 UNCONFIRMED |
| ASM-005 | GDPR compliance is required (not HIPAA, PCI-DSS, or other framework) | NFR-S01, NFR-C01 | Different compliance frameworks have different requirements; wrong framework = wrong security controls | Legal | Legal to confirm applicable compliance frameworks | [Date] | 🔴 UNCONFIRMED |

---

## Confirmed Assumptions

| ID | Assumption | Confirmed value | Confirmed by | Date |
|----|-----------|----------------|--------------|------|
| ASM-### | [Assumption] | [What was confirmed — actual value if different from assumption] | [Name, Title] | [Date] |

---

## Invalidated Assumptions

*When an assumption is confirmed to be wrong, record what was actually true and what changed as a result.*

| ID | Original assumption | Actual finding | Impact on NFRs | Changes made | Date |
|----|--------------------|--------------|--------------------|-------------|------|
| ASM-### | [What we assumed] | [What was actually true] | [Which NFRs changed] | [What was updated] | [Date] |

---

## Notes

**[YYYY-MM-DD]:** [Note about assumption discovery or confirmation activity]
