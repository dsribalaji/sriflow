# UC-03: Set Budget

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Status: GREEN

---

## Primary Actor
Manager, Admin

## Trigger
Manager wants to set budget limits for categories.

## Preconditions
- Manager is logged in
- Categories exist in the system
- Manager has permission to set budgets

## Basic Flow (Happy Path)
1. Manager clicks "Set Budget" button
2. System displays budget form with category list
3. Manager enters budget amount for each category
4. Manager sets budget period (monthly/quarterly/annual)
5. Manager clicks "Save Budget"
6. System validates input
7. System saves budget to database
8. System displays confirmation message
9. System updates budget status on summary page

## Alternate Flows

### AF-1: Edit Existing Budget
- Manager selects existing budget
- System pre-fills current values
- Manager modifies amounts
- System saves changes

### AF-2: Copy Previous Budget
- Manager selects "Copy from last period"
- System loads previous budget amounts
- Manager can modify before saving

## Exception Flows

### EF-1: Invalid Amount
- **Trigger:** Manager enters negative or zero amount
- **System Behavior:** Display error, highlight invalid field
- **Error Message:** "Budget amount must be positive"

### EF-2: Budget Exceeds Limit
- **Trigger:** Total budgets exceed overall limit
- **System Behavior:** Display warning, require confirmation
- **Error Message:** "Total budgets exceed limit. Save anyway?"

## Business Rules
- BR-01: Budget amount must be positive
- BR-02: Budget period must be monthly, quarterly, or annual
- BR-03: Each category can have only one active budget
- BR-04: Budget changes take effect immediately
- BR-05: Budget history is preserved

## Postconditions (Success)
- Budget is saved to database
- Budget status is updated on summary page
- Alerts are configured based on new budget

## Postconditions (Failure)
- No budget is saved
- Manager remains on budget form
- Error message is displayed

---

## Verdict: GREEN

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Goal level correct (Sea Level) | ✅ | Set data, clear goal |
| Basic flow complete | ✅ | 9 steps, end-to-end |
| Alternate flows covered (≥2) | ✅ | 2 alternate flows |
| Exception flows specified | ✅ | 2 exception flows |
| Preconditions testable | ✅ | All 4 preconditions verifiable |
| Postconditions observable | ✅ | Success and failure states defined |
| Business rules explicit | ✅ | 5 business rules documented |
| No open questions | ✅ | All decisions made |
| Traces to BRD | ✅ | Maps to U2 (Approval workflow) |

---

## Output

- Individual use case file (this file)
- Part of UC Inventory
