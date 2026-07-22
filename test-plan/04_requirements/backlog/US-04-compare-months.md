# US-04: Compare Months

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-02
## INVEST: ✅

---

## User Story

As a user, I want to compare months so I can track changes.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Side-by-side comparison**
- Given I am on the summary page
- When I select "Compare" and choose two months
- Then I see side-by-side spending by category with differences highlighted

**Scenario 2: Single month selected**
- Given I am on the comparison page
- When I select only one month
- Then I see a prompt to select a second month

---

## Technical Notes

- Comparison view: two columns with delta indicators
- Highlight: green for decrease, red for increase
- Export: comparison can be exported as PDF

---

## Estimation

- Story Points: 2
- Effort: 1 day

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
