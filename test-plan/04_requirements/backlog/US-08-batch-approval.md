# US-08: Batch Approval

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-04
## INVEST: ✅

---

## User Story

As a manager, I want batch approval so I can process multiple requests.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Approve multiple requests**
- Given I am a logged-in manager with multiple pending requests
- When I select multiple requests and click "Approve All"
- Then all selected requests are approved and each requester is notified

**Scenario 2: Reject multiple requests**
- Given I am a logged-in manager with multiple pending requests
- When I select multiple requests and click "Reject All"
- Then all selected requests are rejected and each requester is notified

---

## Technical Notes

- Selection: checkboxes for each request
- Confirmation: required before batch action
- Notification: individual notifications for each request

---

## Estimation

- Story Points: 2
- Effort: 1 day

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
