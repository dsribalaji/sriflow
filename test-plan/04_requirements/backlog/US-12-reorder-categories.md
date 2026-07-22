# US-12: Reorder Categories

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-06
## INVEST: ✅

---

## User Story

As an admin, I want to reorder categories so I can prioritize display.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Drag to reorder**
- Given I am a logged-in admin on the category management page
- When I drag a category to a new position
- Then the display order is updated and saved

**Scenario 2: Reset to default**
- Given I am a logged-in admin
- When I click "Reset Order"
- Then categories return to default alphabetical order

---

## Technical Notes

- Drag-and-drop: use HTML5 drag API or library
- Persistence: save order to database
- Display: order affects dropdown menus and summary pages

---

## Estimation

- Story Points: 1
- Effort: 0.5 days

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
