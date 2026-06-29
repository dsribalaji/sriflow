# US-06: Budget Alerts

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-03
## INVEST: ✅

---

## User Story

As a manager, I want budget alerts so I can act before overspending.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Alert at 80%**
- Given a budget is set for a category
- When spending reaches 80% of budget
- Then I receive an alert notification

**Scenario 2: Alert at 100%**
- Given a budget is set for a category
- When spending reaches 100% of budget
- Then I receive a critical alert notification

**Scenario 3: No budget set**
- Given no budget is set for a category
- When expenses are logged
- Then no alert is triggered

---

## Technical Notes

- Alert thresholds: 80% (warning), 100% (critical)
- Notification: in-app for v1, email for v2
- Alert history: preserve all alerts

---

## Estimation

- Story Points: 2
- Effort: 1 day

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
