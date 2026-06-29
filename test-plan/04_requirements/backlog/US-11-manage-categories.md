# US-11: Manage Categories

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-06
## INVEST: ✅

---

## User Story

As an admin, I want to manage categories so I can organize expenses.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Create category**
- Given I am a logged-in admin
- When I enter category name, icon, and color
- Then the category is created and available for expense entry

**Scenario 2: Edit category**
- Given I am a logged-in admin
- When I modify category details
- Then the changes are saved and reflected everywhere

**Scenario 3: Delete category**
- Given I am a logged-in admin
- When I try to delete a category with no expenses
- Then the category is deleted

**Scenario 4: Delete category with expenses**
- Given I am a logged-in admin
- When I try to delete a category with assigned expenses
- Then I see "Category has [N] expenses. Reassign before deleting."

---

## Technical Notes

- Default categories: Food, Transport, Entertainment, Utilities, Other
- Icons: system-provided set
- Colors: color picker

---

## Estimation

- Story Points: 2
- Effort: 1 day

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
