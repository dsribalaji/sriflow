# UC-01: Log Expense

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Status: GREEN

---

## Primary Actor
Member (S4, S5)

## Trigger
Member wants to record a new expense.

## Preconditions
- Member is logged in
- Categories exist in the system
- Member has permission to log expenses

## Basic Flow (Happy Path)
1. Member clicks "Log Expense" button
2. System displays expense entry form
3. Member enters: date, amount, category, description
4. Member optionally uploads receipt photo
5. Member clicks "Save"
6. System validates input
7. System saves expense to database
8. System displays confirmation message
9. System updates member's expense list

## Alternate Flows

### AF-1: Quick Entry
- Same as basic flow, but system auto-fills category based on description keywords
- Member can override auto-filled category

### AF-2: Duplicate Entry
- Member enters expense that matches existing entry (same date, amount, category)
- System warns: "Similar expense exists. Save anyway?"
- Member confirms or cancels

## Exception Flows

### EF-1: Invalid Input
- **Trigger:** Member enters invalid data (negative amount, future date, empty required fields)
- **System Behavior:** Display error message, highlight invalid fields
- **Error Message:** "Please check: [field] is invalid"

### EF-2: Category Not Found
- **Trigger:** Member enters category that doesn't exist
- **System Behavior:** Offer to create new category or select existing one
- **Error Message:** "Category not found. Create new or select existing?"

### EF-3: Receipt Upload Failed
- **Trigger:** Receipt photo fails to upload (file too large, wrong format)
- **System Behavior:** Allow save without receipt, warn about upload failure
- **Error Message:** "Receipt upload failed. Save expense without receipt?"

## Business Rules
- BR-01: Amount must be positive number
- BR-02: Date cannot be in the future
- BR-03: Category must exist in system
- BR-04: Description is required (min 3 characters)
- BR-05: Receipt photo is optional (max 5MB, JPG/PNG only)

## Postconditions (Success)
- Expense is saved to database
- Member's expense list is updated
- Monthly summary is recalculated
- Budget status is updated

## Postconditions (Failure)
- No expense is saved
- Member remains on entry form
- Error message is displayed

---

## Verdict: GREEN

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Goal level correct (Sea Level) | ✅ | Single action, clear goal |
| Basic flow complete | ✅ | 9 steps, end-to-end |
| Alternate flows covered (≥2) | ✅ | 2 alternate flows |
| Exception flows specified | ✅ | 3 exception flows |
| Preconditions testable | ✅ | All 4 preconditions verifiable |
| Postconditions observable | ✅ | Success and failure states defined |
| Business rules explicit | ✅ | 5 business rules documented |
| No open questions | ✅ | All decisions made |
| Traces to BRD | ✅ | Maps to U3 (Entry UX) |

---

## Output

- Individual use case file (this file)
- Part of UC Inventory
