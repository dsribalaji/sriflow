# Stakeholder Register

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Author: Sri (BA)

---

## Stakeholder Table

| ID | Name | Role | Power | Interest | Top Uncertainty |
|----|------|------|-------|----------|-----------------|
| S1 | Sri | Sponsor, Builder, Admin | High | High | What's the minimum viable feature set for a 4-5 person team? |
| S2 | Team Member 1 | Manager | Medium | High | How do managers approve budgets without creating bottlenecks? |
| S3 | Team Member 2 | Manager | Medium | High | Same as S2 — approval workflow clarity |
| S4 | Team Member 3 | Member | Low | High | How easy is expense entry? Mobile support? |
| S5 | Team Member 4 | Member | Low | High | Same as S4 — entry UX and category management |
| S6 | External Auditor | Auditor (read-only) | Medium | Medium | What data do auditors need? Export format? |

---

## Role Definitions

### Admin (Sri)
- Full system access
- Manage users and roles
- Configure categories and budgets
- View all data and reports

### Manager (S2, S3)
- Approve budget allocations
- View team expenses
- Generate reports
- Cannot manage system settings

### Member (S4, S5)
- Log own expenses
- View own spending summaries
- Cannot approve budgets
- Cannot manage categories

### Auditor (S6)
- Read-only access to all expense data
- Export capabilities (CSV, PDF)
- Cannot modify any data
- Time-limited access (quarterly review)

---

## Assumptions

1. Team size: 4-5 people (3-tier roles: Admin, Manager, Member)
2. External auditors need periodic read-only access
3. No bank API integration — manual entry only
4. No compliance requirements mentioned (GDPR, HIPAA, etc.)
5. Self-hosted on Sri's laptop
6. No mobile app — web app only

---

## Status

- [x] Stakeholder Register complete
- [x] All Tier 1 stakeholders named
- [x] Top uncertainty documented for each
- [x] Role definitions clear
