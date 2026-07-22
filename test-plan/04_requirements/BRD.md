# BRD — Business Requirements Document

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Version: 1.0

---

## 1. Executive Summary

Personal finance tracker web app for a 4-5 person team with 3-tier roles (Admin, Manager, Member). Features: expense entry, categories, monthly summaries, budget alerts, approval workflow, CSV/PDF export.

---

## 2. Functional Requirements

### 2.1 Expense Management

| ID | Requirement | Source | Uncertainty Score |
|----|-------------|--------|-------------------|
| BRD-01.1 | System shall allow members to log expenses with date, amount, category, description | UC-01 | 9/10 |
| BRD-01.2 | System shall support optional receipt photo upload (max 5MB, JPG/PNG) | UC-01 | 8/10 |
| BRD-01.3 | System shall validate expense input (positive amount, future date, required fields) | UC-01 | 9/10 |
| BRD-01.4 | System shall auto-categorize expenses based on description keywords | UC-01 | 7/10 |
| BRD-01.5 | System shall warn about duplicate entries (same date, amount, category) | UC-01 | 6/10 |

### 2.2 Categories

| ID | Requirement | Source | Uncertainty Score |
|----|-------------|--------|-------------------|
| BRD-02.1 | System shall provide default categories: Food, Transport, Entertainment, Utilities, Other | UC-06 | 9/10 |
| BRD-02.2 | System shall allow admin to create, edit, delete categories | UC-06 | 9/10 |
| BRD-02.3 | System shall support category icons and colors | UC-06 | 7/0 |
| BRD-02.4 | System shall prevent deletion of categories with assigned expenses | UC-06 | 8/10 |

### 2.3 Monthly Summary

| ID | Requirement | Source | Uncertainty Score |
|----|-------------|--------|-------------------|
| BRD-03.1 | System shall display total spending by category for selected month | UC-02 | 9/10 |
| BRD-03.2 | System shall show budget vs actual comparison | UC-02 | 9/10 |
| BRD-03.3 | System shall allow drill-down from category to individual expenses | UC-02 | 8/10 |
| BRD-03.4 | System shall support month-to-month comparison | UC-02 | 6/10 |

### 2.4 Budget Management

| ID | Requirement | Source | Uncertainty Score |
|----|-------------|--------|-------------------|
| BRD-04.1 | System shall allow managers to set budget amounts per category | UC-03 | 9/10 |
| BRD-04.2 | System shall support monthly, quarterly, and annual budget periods | UC-03 | 8/10 |
| BRD-04.3 | System shall alert members when approaching budget limits | UC-03 | 8/10 |
| BRD-04.4 | System shall allow copying previous budget periods | UC-03 | 6/10 |

### 2.5 Approval Workflow

| ID | Requirement | Source | Uncertainty Score |
|----|-------------|--------|-------------------|
| BRD-05.1 | System shall require manager approval for budget requests | UC-04 | 9/10 |
| BRD-05.2 | System shall support one-click approve/reject | UC-04 | 9/10 |
| BRD-05.3 | System shall auto-approve after 48 hours if unavailable | UC-04 | 8/10 |
| BRD-05.4 | System shall preserve approval history (who, what, when) | UC-04 | 9/10 |
| BRD-05.5 | System shall support batch approval for multiple requests | UC-04 | 6/10 |

### 2.6 Export

| ID | Requirement | Source | Uncertainty Score |
|----|-------------|--------|-------------------|
| BRD-06.1 | System shall export data to CSV format | UC-05 | 9/10 |
| BRD-06.2 | System shall export data to PDF format | UC-05 | 8/10 |
| BRD-06.3 | System shall support filtered exports (date range, category) | UC-05 | 8/10 |
| BRD-06.4 | System shall log exports in audit trail | UC-05 | 7/10 |

---

## 3. Non-Functional Requirements (Preview)

| Category | Requirement |
|----------|-------------|
| Performance | Page load < 2s, API response < 200ms |
| Availability | 99.9% uptime |
| Security | Role-based access control, data encryption |
| Scalability | Support 10 concurrent users, 10,000 expenses |
| Cost | Self-hosted, no external services |

---

## 4. Assumptions

1. Manual entry only (no bank API for v1)
2. Web app only (mobile-responsive for v2)
3. Self-hosted on Sri's laptop
4. No compliance requirements (GDPR, HIPAA)
5. 4-5 person team with 3-tier roles

---

## 5. Dependencies

| Dependency | Type | Risk |
|------------|------|------|
| None | — | — |

---

## 6. Approval

| Stakeholder | Role | Status |
|-------------|------|--------|
| Sri | Sponsor/Builder | Approved |
| Managers | Budget Approvers | Approved |
| Members | Daily Users | Approved |
| Auditor | Read-only Access | Approved |

---

## Status

- [x] All functional requirements documented
- [x] All requirements trace to use cases
- [x] Uncertainty scores assigned
- [x] Assumptions documented
