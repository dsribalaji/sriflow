# Screen Specifications

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28

---

## SCREEN-01: Dashboard

### Purpose
Main landing page showing overview of spending and budget status.

### Components
1. **Header:** App name, user menu, logout
2. **Summary Card:** Total spending this month, budget remaining
3. **Category Breakdown:** Pie chart or bar chart of spending by category
4. **Recent Expenses:** Last 5 expenses with quick entry button
5. **Budget Alerts:** List of active alerts (if any)

### Fields
| Field | Type | Validation | Behavior | Rule |
|-------|------|------------|----------|------|
| Total Spending | Currency | ≥ 0 | Auto-calculated | Sum of all expenses this month |
| Budget Remaining | Currency | ≥ 0 | Auto-calculated | Budget - Spending |
| Category Breakdown | Chart | N/A | Auto-generated | Group by category |
| Recent Expenses | List | N/A | Auto-populated | Last 5, sorted by date desc |

### Navigation
- Click category → Category detail page
- Click expense → Expense detail page
- Click "Log Expense" → Expense entry form

---

## SCREEN-02: Expense Entry

### Purpose
Form for logging new expenses.

### Components
1. **Date Picker:** Select expense date
2. **Amount Input:** Enter expense amount
3. **Category Dropdown:** Select category
4. **Description Input:** Enter expense description
5. **Receipt Upload:** Optional photo upload
6. **Save Button:** Submit expense
7. **Cancel Button:** Return to dashboard

### Fields
| Field | Type | Validation | Behavior | Rule |
|-------|------|------------|----------|------|
| Date | Date | ≤ today, required | Default: today | Cannot be future date |
| Amount | Number | > 0, required | Two decimal places | Must be positive |
| Category | Dropdown | Required, from list | Auto-fill from description | Must exist in system |
| Description | Text | Min 3 chars, required | Auto-suggest categories | Free text |
| Receipt | File | Optional, ≤ 5MB, JPG/PNG | Preview thumbnail | Stored securely |

### Business Rules
- BR-01: Date cannot be in the future
- BR-02: Amount must be positive
- BR-03: Category must exist
- BR-04: Description is required
- BR-05: Receipt is optional

---

## SCREEN-03: Monthly Summary

### Purpose
Detailed view of spending for a specific month.

### Components
1. **Month Selector:** Choose month to view
2. **Total Spending:** Sum of all expenses
3. **Category Table:** Spending by category with budget comparison
4. **Expense List:** All expenses for the month
5. **Export Button:** Export data (CSV/PDF)

### Fields
| Field | Type | Validation | Behavior | Rule |
|-------|------|------------|----------|------|
| Month | Date | Valid month required | Default: current month | Select via date picker |
| Total Spending | Currency | ≥ 0 | Auto-calculated | Sum of expenses |
| Category Spending | Currency | ≥ 0 | Auto-calculated | Group by category |
| Budget Actual | Currency | ≥ 0 | Auto-calculated | From budget settings |
| Budget Variance | Currency | Any | Auto-calculated | Budget - Actual |

### Navigation
- Click category → Category detail page
- Click expense → Expense detail page
- Click "Export" → Export options

---

## SCREEN-04: Budget Management

### Purpose
Set and manage budget limits per category.

### Components
1. **Budget Form:** Enter budget amounts per category
2. **Period Selector:** Monthly, quarterly, annual
3. **Save Button:** Save budget settings
4. **Copy Button:** Copy from previous period
5. **History Button:** View budget history

### Fields
| Field | Type | Validation | Behavior | Rule |
|-------|------|------------|----------|------|
| Category | Dropdown | Required | From category list | Must exist |
| Amount | Number | > 0, required | Two decimal places | Must be positive |
| Period | Select | Required | Monthly/Quarterly/Annual | Default: monthly |
| Start Date | Date | Required | Default: first of month | Budget start |
| End Date | Date | ≥ start date | Auto-calculated | Based on period |

### Business Rules
- BR-01: Amount must be positive
- BR-02: Period must be valid
- BR-03: Each category has one active budget
- BR-04: Changes take effect immediately

---

## SCREEN-05: Approval Queue

### Purpose
Manager view of pending budget approval requests.

### Components
1. **Request List:** Pending requests with details
2. **Approve Button:** Approve selected request
3. **Reject Button:** Reject selected request
4. **Batch Select:** Select multiple requests
5. **Filter:** Filter by requester, category, date

### Fields
| Field | Type | Validation | Behavior | Rule |
|-------|------|------------|----------|------|
| Requester | Text | Required | Display only | From user list |
| Category | Dropdown | Required | Display only | Must exist |
| Amount | Currency | > 0 | Display only | Must be positive |
| Justification | Text | Required | Display only | Free text |
| Status | Select | Required | Pending/Approved/Rejected | Default: pending |

### Business Rules
- BR-01: Only managers can approve
- BR-02: Each request needs one approval
- BR-03: Auto-approve after 48 hours
- BR-04: History is preserved

---

## SCREEN-06: Export

### Purpose
Export expense data in various formats.

### Components
1. **Format Selector:** CSV or PDF
2. **Date Range Picker:** Select start and end dates
3. **Category Filter:** Filter by category (optional)
4. **Export Button:** Generate and download file
5. **History:** Previous exports with download links

### Fields
| Field | Type | Validation | Behavior | Rule |
|-------|------|------------|----------|------|
| Format | Select | Required | CSV/PDF | Default: CSV |
| Start Date | Date | Required | Default: first of month | Export start |
| End Date | Date | ≥ start date | Default: today | Export end |
| Category | Dropdown | Optional | All or specific | Filter expenses |

### Business Rules
- BR-01: CSV includes all fields
- BR-02: PDF includes formatted report
- BR-03: Export logged in audit trail
- BR-04: Maximum 10,000 records

---

## SCREEN-07: Category Management

### Purpose
Admin interface for managing expense categories.

### Components
1. **Category List:** All categories with icons and colors
2. **Add Button:** Create new category
3. **Edit Button:** Modify existing category
4. **Delete Button:** Remove category (if no expenses)
5. **Reorder:** Drag to reorder categories

### Fields
| Field | Type | Validation | Behavior | Rule |
|-------|------|------------|----------|------|
| Name | Text | ≤ 50 chars, required, unique | Free text | Must be unique |
| Icon | Select | Optional | From icon set | System provides defaults |
| Color | Color | Optional | Color picker | System provides defaults |
| Order | Number | Required | Auto-assigned | For display ordering |

### Business Rules
- BR-01: Name is required and unique
- BR-02: Icon is optional
- BR-03: Color is optional
- BR-04: Cannot delete category with expenses

---

## Status

- [x] All screens defined
- [x] All fields specified with type, validation, behavior, rule
- [x] Navigation defined
- [x] Business rules documented
