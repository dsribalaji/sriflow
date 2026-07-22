# UC-05: Export Data

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Status: GREEN

---

## Primary Actor
Auditor, Admin

## Trigger
User wants to export expense data for analysis or reporting.

## Preconditions
- User is logged in
- Expenses exist in the system
- User has export permission

## Basic Flow (Happy Path)
1. User clicks "Export" button
2. System displays export options (CSV, PDF)
3. User selects format and date range
4. User clicks "Export"
5. System generates export file
6. System provides download link
7. User downloads file
8. System logs export in audit trail

## Alternate Flows

### AF-1: Export All Data
- User selects "All Time" option
- System exports all expenses
- System warns about large file size

### AF-2: Export Filtered Data
- User applies filters (category, amount range, etc.)
- System exports only matching expenses
- System shows filter summary

## Exception Flows

### EF-1: No Data in Range
- **Trigger:** User selects date range with no expenses
- **System Behavior:** Display message, suggest different range
- **Error Message:** "No expenses found for selected range"

### EF-2: Export Failed
- **Trigger:** System fails to generate export file
- **System Behavior:** Display error, offer retry
- **Error Message:** "Export failed. Try again?"

## Business Rules
- BR-01: CSV export includes all fields (date, amount, category, description, receipt, approval status)
- BR-02: PDF export includes formatted summary and expense list
- BR-03: Export is logged in audit trail (who, when, what range)
- BR-04: Maximum export size is 10,000 records
- BR-05: Export files are available for 24 hours

## Postconditions (Success)
- Export file is generated
- User downloads file
- Export is logged in audit trail

## Postconditions (Failure)
- No export file is generated
- Error message is displayed
- User remains on export page

---

## Verdict: GREEN

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Goal level correct (Sea Level) | ✅ | Export data, clear goal |
| Basic flow complete | ✅ | 8 steps, end-to-end |
| Alternate flows covered (≥2) | ✅ | 2 alternate flows |
| Exception flows specified | ✅ | 2 exception flows |
| Preconditions testable | ✅ | All 4 preconditions verifiable |
| Postconditions observable | ✅ | Success and failure states defined |
| Business rules explicit | ✅ | 5 business rules documented |
| No open questions | ✅ | All decisions made |
| Traces to BRD | ✅ | Maps to U4 (Export format) |

---

## Output

- Individual use case file (this file)
- Part of UC Inventory
