# UC-02: View Monthly Summary

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Status: GREEN

---

## Primary Actor
Member, Manager, Admin

## Trigger
User wants to see spending summary for a month.

## Preconditions
- User is logged in
- Expenses exist for the selected month
- User has permission to view summaries

## Basic Flow (Happy Path)
1. User clicks "Monthly Summary" tab
2. System displays current month summary by default
3. User can select different month via date picker
4. System displays: total spending, spending by category, budget vs actual
5. User can click category to see individual expenses
6. System displays expense list for that category

## Alternate Flows

### AF-1: No Data
- User selects month with no expenses
- System displays: "No expenses for this month"
- System offers to show previous month with data

### AF-2: Compare Months
- User selects "Compare" option
- System displays side-by-side comparison of two months
- System highlights differences in spending

## Exception Flows

### EF-1: Invalid Date Range
- **Trigger:** User selects invalid date range (end before start)
- **System Behavior:** Display error, reset to current month
- **Error Message:** "Invalid date range. Showing current month."

### EF-2: Data Loading Failed
- **Trigger:** System fails to load summary data
- **System Behavior:** Display error, offer retry
- **Error Message:** "Failed to load summary. Try again?"

## Business Rules
- BR-01: Summary shows all expenses for selected month
- BR-02: Categories are sorted by total spending (highest first)
- BR-03: Budget vs actual shows percentage used
- BR-04: User can drill down from category to individual expenses

## Postconditions (Success)
- User sees complete monthly summary
- User can navigate to individual expenses
- User can compare months

## Postconditions (Failure)
- No summary is displayed
- Error message is shown
- User remains on summary page

---

## Verdict: GREEN

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Goal level correct (Sea Level) | ✅ | View data, clear goal |
| Basic flow complete | ✅ | 6 steps, end-to-end |
| Alternate flows covered (≥2) | ✅ | 2 alternate flows |
| Exception flows specified | ✅ | 2 exception flows |
| Preconditions testable | ✅ | All 4 preconditions verifiable |
| Postconditions observable | ✅ | Success and failure states defined |
| Business rules explicit | ✅ | 4 business rules documented |
| No open questions | ✅ | All decisions made |
| Traces to BRD | ✅ | Maps to U1 (Feature set) |

---

## Output

- Individual use case file (this file)
- Part of UC Inventory
