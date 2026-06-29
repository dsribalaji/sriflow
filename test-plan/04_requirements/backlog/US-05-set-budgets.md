# US-05: Set Budgets

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-03
## INVEST: ✅

---

## User Story

As a manager, I want to set budgets so I can control spending.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Set new budget**
- Given I am a logged-in manager
- When I enter budget amounts for categories
- Then the budgets are saved and displayed on the summary page

**Scenario 2: Edit existing budget**
- Given I am a logged-in manager
- When I modify existing budget amounts
- Then the changes are saved and the summary page updates

**Scenario 3: Invalid amount**
- Given I am a logged-in manager
- When I enter a negative or zero amount
- Then I see an error message and the budget is not saved

---

## Technical Notes

- Budget periods: monthly, quarterly, annual
- Validation: positive amounts only
- History: preserve all budget versions

---

## Estimation

- Story Points: 3
- Effort: 1-2 days

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
