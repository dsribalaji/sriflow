# US-01: Log Expense

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-01
## INVEST: ✅

---

## User Story

As a member, I want to log an expense so I can track my spending.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Successful expense entry**
- Given I am a logged-in member
- When I enter date, amount, category, and description
- Then the expense is saved and I see a confirmation message

**Scenario 2: Invalid input**
- Given I am a logged-in member
- When I enter invalid data (negative amount, future date, empty description)
- Then I see an error message and the expense is not saved

**Scenario 3: Duplicate entry**
- Given I am a logged-in member
- When I enter an expense that matches an existing entry
- Then I see a warning and can choose to save or cancel

---

## Technical Notes

- Form fields: date (date picker), amount (number input), category (dropdown), description (text input)
- Validation: client-side + server-side
- Storage: SQLite database

---

## Estimation

- Story Points: 3
- Effort: 1-2 days

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
