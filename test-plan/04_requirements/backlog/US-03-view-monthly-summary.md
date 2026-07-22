# US-03: View Monthly Summary

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-02
## INVEST: ✅

---

## User Story

As a user, I want to view monthly summaries so I can see spending patterns.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: View current month**
- Given I am a logged-in user
- When I navigate to the summary page
- Then I see the current month's total spending by category

**Scenario 2: Select different month**
- Given I am on the summary page
- When I select a different month via date picker
- Then I see that month's summary

**Scenario 3: No data**
- Given I am on the summary page
- When I select a month with no expenses
- Then I see "No expenses for this month" and can navigate to a month with data

---

## Technical Notes

- Summary data: cached for performance
- Drill-down: click category to see individual expenses
- Comparison: side-by-side month comparison (v2 feature)

---

## Estimation

- Story Points: 3
- Effort: 1-2 days

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
