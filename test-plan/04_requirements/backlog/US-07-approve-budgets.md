# US-07: Approve Budgets

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-04
## INVEST: ✅

---

## User Story

As a manager, I want to approve budgets so I can control spending.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Approve request**
- Given I am a logged-in manager
- When I click "Approve" on a budget request
- Then the request is approved and the requester is notified

**Scenario 2: Reject request**
- Given I am a logged-in manager
- When I click "Reject" on a budget request
- Then the request is rejected and the requester is notified

**Scenario 3: Auto-approve**
- Given a budget request is pending for 48 hours
- When the manager is unavailable
- Then the request is auto-approved and the requester is notified

---

## Technical Notes

- Approval workflow: request → approve/reject → notify
- Auto-approve: 48-hour timeout
- Audit trail: preserve all decisions

---

## Estimation

- Story Points: 3
- Effort: 1-2 days

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
