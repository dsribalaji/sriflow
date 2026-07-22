# Data Dictionary

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28

---

## Entities

### 1. User

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | UUID | Required, unique | Primary key |
| name | String(100) | Required | User's full name |
| email | String(255) | Required, unique, valid email | Login identifier |
| role | Enum | Required: admin, manager, member, auditor | Permission level |
| created_at | Timestamp | Auto-generated | Account creation |
| updated_at | Timestamp | Auto-generated | Last modification |

### 2. Category

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | UUID | Required, unique | Primary key |
| name | String(50) | Required, unique | Category name |
| icon | String(50) | Optional | Icon identifier |
| color | String(7) | Optional, valid hex color | Display color |
| order | Integer | Required, ≥ 0 | Display ordering |
| created_at | Timestamp | Auto-generated | Creation time |
| updated_at | Timestamp | Auto-generated | Last modification |

### 3. Expense

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | UUID | Required, unique | Primary key |
| user_id | UUID | Required, foreign key → User | Expense owner |
| category_id | UUID | Required, foreign key → Category | Expense category |
| amount | Decimal(10,2) | Required, > 0 | Expense amount |
| date | Date | Required, ≤ today | Expense date |
| description | String(255) | Required, min 3 chars | Expense description |
| receipt_path | String(500) | Optional | Receipt file path |
| created_at | Timestamp | Auto-generated | Entry creation |
| updated_at | Timestamp | Auto-generated | Last modification |

### 4. Budget

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | UUID | Required, unique | Primary key |
| category_id | UUID | Required, foreign key → Category | Budget category |
| amount | Decimal(10,2) | Required, > 0 | Budget amount |
| period | Enum | Required: monthly, quarterly, annual | Budget period |
| start_date | Date | Required | Budget start |
| end_date | Date | Required, ≥ start_date | Budget end |
| created_by | UUID | Required, foreign key → User | Budget creator |
| created_at | Timestamp | Auto-generated | Creation time |
| updated_at | Timestamp | Auto-generated | Last modification |

### 5. Approval

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | UUID | Required, unique | Primary key |
| requester_id | UUID | Required, foreign key → User | Request creator |
| approver_id | UUID | Optional, foreign key → User | Approval decision maker |
| category_id | UUID | Required, foreign key → Category | Budget category |
| amount | Decimal(10,2) | Required, > 0 | Requested amount |
| justification | Text | Required | Request reason |
| status | Enum | Required: pending, approved, rejected | Decision status |
| notes | Text | Optional | Approval/rejection notes |
| created_at | Timestamp | Auto-generated | Request creation |
| decided_at | Timestamp | Optional | Decision time |

### 6. AuditLog

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | UUID | Required, unique | Primary key |
| user_id | UUID | Required, foreign key → User | Action actor |
| action | String(100) | Required | Action performed |
| entity_type | String(50) | Required | Entity affected |
| entity_id | UUID | Required | Entity identifier |
| details | JSON | Optional | Action details |
| created_at | Timestamp | Auto-generated | Action time |

---

## Relationships

```
User 1 ──── * Expense
User 1 ──── * Budget
User 1 ──── * Approval (as requester)
User 1 ──── * Approval (as approver)
User 1 ──── * AuditLog
Category 1 ──── * Expense
Category 1 ──── * Budget
Category 1 ──── * Approval
```

---

## Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| Expense | user_id | B-tree | User expense queries |
| Expense | category_id | B-tree | Category expense queries |
| Expense | date | B-tree | Date range queries |
| Budget | category_id | B-tree | Category budget queries |
| Budget | period | B-tree | Period queries |
| Approval | status | B-tree | Pending request queries |
| AuditLog | user_id | B-tree | User audit queries |
| AuditLog | created_at | B-tree | Time-based queries |

---

## Constraints

| Table | Constraint | Type | Description |
|-------|------------|------|-------------|
| Expense | amount > 0 | Check | Positive amount only |
| Expense | date ≤ today | Check | No future expenses |
| Budget | amount > 0 | Check | Positive budget only |
| Budget | end_date ≥ start_date | Check | Valid date range |
| Approval | status IN (pending, approved, rejected) | Check | Valid status |

---

## Status

- [x] All entities defined
- [x] All fields specified with type, validation, description
- [x] Relationships documented
- [x] Indexes defined
- [x] Constraints documented
