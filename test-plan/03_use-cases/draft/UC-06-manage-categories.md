# UC-06: Manage Categories

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Status: GREEN

---

## Primary Actor
Admin

## Trigger
Admin wants to create, edit, or delete expense categories.

## Preconditions
- Admin is logged in
- Admin has category management permission

## Basic Flow (Happy Path)
1. Admin clicks "Manage Categories" button
2. System displays category list
3. Admin can add new category (name, icon, color)
4. Admin can edit existing category
5. Admin can delete category (if no expenses assigned)
6. Admin clicks "Save Changes"
7. System validates input
8. System saves changes to database
9. System displays confirmation message

## Alternate Flows

### AF-1: Reorder Categories
- Admin drags categories to reorder
- System updates display order
- System saves new order

### AF-2: Merge Categories
- Admin selects two categories to merge
- System moves all expenses from one to the other
- System deletes empty category

## Exception Flows

### EF-1: Delete Category with Expenses
- **Trigger:** Admin tries to delete category with assigned expenses
- **System Behavior:** Display warning, require reassignment
- **Error Message:** "Category has [N] expenses. Reassign before deleting."

### EF-2: Duplicate Category Name
- **Trigger:** Admin creates category with existing name
- **System Behavior:** Display error, suggest similar names
- **Error Message:** "Category already exists. Choose different name."

## Business Rules
- BR-01: Category name is required (max 50 characters)
- BR-02: Category icon is optional (system provides defaults)
- BR-03: Category color is optional (system provides defaults)
- BR-04: Category with expenses cannot be deleted
- BR-05: Default categories: Food, Transport, Entertainment, Utilities, Other

## Postconditions (Success)
- Category changes are saved
- Category list is updated
- Expense entry form reflects new categories

## Postconditions (Failure)
- No changes are saved
- Admin remains on category management page
- Error message is displayed

---

## Verdict: GREEN

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Goal level correct (Sea Level) | ✅ | Manage data, clear goal |
| Basic flow complete | ✅ | 9 steps, end-to-end |
| Alternate flows covered (≥2) | ✅ | 2 alternate flows |
| Exception flows specified | ✅ | 2 exception flows |
| Preconditions testable | ✅ | All 3 preconditions verifiable |
| Postconditions observable | ✅ | Success and failure states defined |
| Business rules explicit | ✅ | 5 business rules documented |
| No open questions | ✅ | All decisions made |
| Traces to BRD | ✅ | Maps to U1 (Feature set) |

---

## Output

- Individual use case file (this file)
- Part of UC Inventory
