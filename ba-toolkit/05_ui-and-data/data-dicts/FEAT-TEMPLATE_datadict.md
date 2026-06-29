---
id: FEAT-[Name]_datadict
title: "Feature Data Dictionary — [Feature Name]"
status: DRAFT
verdict: RED
agent: /data-map
traces:
  user-story: "US-001"
  use-case: "UC-001"
  mockup: "SCREEN-[Name]_mockup"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# Feature Data Dictionary — [Feature Name]

## Source Artifacts

| Artifact | ID | Status |
|----------|-----|--------|
| User Story | US-001 — [Title] | APPROVED |
| Use Case | UC-001 — [Title] | APPROVED |
| Screen Mockup | SCREEN-[Name]_mockup | APPROVED |

---

## Data Dictionary

| UI Element Label | Data Element Name | Data Type | Nullable? | Validation / Constraints | Business Rules / Source | PII? |
|:----------------|:-----------------|:----------|:---------|:------------------------|:------------------------|:-----|
| Proposal Title | proposal_title | String(150) | No | Min 3 chars; max 150 chars; unique per client_id | BR-001: Must be unique per client account. Source: user input. | No |
| Client | client_id | UUID | No | FK → clients.id; must be active client (status = 'active') | BR-002: Only active clients available. API: GET /api/clients?status=active | No |
| Contact | contact_id | UUID | Yes | FK → contacts.id; filtered by client_id; null if no contact selected | Contact list is filtered to selected client. Cleared when client changes. | No |
| Proposal Value | proposal_value | Decimal(10,2) | Yes | ≥ 0.00; max 9,999,999.99; two decimal places | Display with client currency symbol. Optional at DRAFT; required at SUBMITTED. | No |
| Valid Until | valid_until_date | Date | Yes | ≥ today; ≤ today + 365 days | BR-003: Status auto-changes to EXPIRED at midnight on this date. Default: today + 30 days | No |
| Status | proposal_status | Enum('DRAFT','SUBMITTED','APPROVED','REJECTED','EXPIRED') | No | Controlled by state machine; not directly editable | Transitions per UC-001. Default: 'DRAFT'. Display as coloured badge. | No |
| Notes | proposal_notes | String(2000) | Yes | Max 2,000 chars; strip HTML on save | Free text. Not searchable. Not displayed in list view. | No |
| Created By | created_by_user_id | UUID | No | FK → users.id; system-generated; not editable | Auto-populated on save. Used for ownership filtering. | Yes |
| Created At | created_at | DateTime | No | System-generated; UTC; not editable | ISO 8601 format. Display in user's timezone. | No |
| Updated At | updated_at | DateTime | No | System-generated; updated on every save | ISO 8601 format. | No |

---

## Derived / Calculated Fields

| UI Label | Data Element Name | Formula / Logic | Source Fields | When Calculated | Stored? |
|----------|------------------|----------------|---------------|----------------|---------|
| Days Remaining | days_remaining | valid_until_date − today() | valid_until_date | On display (not stored) | No |
| Status Badge Colour | (UI only) | DRAFT=grey, SUBMITTED=blue, APPROVED=green, REJECTED=red, EXPIRED=orange | proposal_status | On display | No |

---

## Permissions Matrix

| Data Element | Creator (own records) | Manager (team records) | Admin (all records) | Viewer (read-only) | API |
|-------------|----------------------|----------------------|--------------------|--------------------|-----|
| proposal_title | Read/Write | Read/Write | Read/Write | Read | Read |
| client_id | Write (on create only) | Read | Read/Write | Read | Read |
| proposal_value | Read/Write | Read/Write | Read/Write | No access | Read |
| proposal_status | Read (state machine only) | Read (state machine only) | Read/Write (override) | Read | Read |
| created_by_user_id | Read | Read | Read | No access | No access |

---

## PII Inventory

| Data Element Name | PII Type | Handling Required |
|------------------|----------|-------------------|
| created_by_user_id | Indirect identifier (links to user record) | Encrypted at rest (AES-256); FK → users table with own PII controls |

---

## Enum Values

| Field | Allowed Values | Default | Notes |
|-------|---------------|---------|-------|
| proposal_status | DRAFT, SUBMITTED, APPROVED, REJECTED, EXPIRED | DRAFT | See UC-001 state machine for valid transitions |

---

## Foreign Key Relationships

| Field | References | On Delete | On Update |
|-------|-----------|----------|----------|
| client_id | clients.id | RESTRICT (cannot delete client with proposals) | CASCADE |
| contact_id | contacts.id | SET NULL | CASCADE |
| created_by_user_id | users.id | RESTRICT | CASCADE |

---

## Definition of Ready (DoR) Checklist

- [ ] Every UI element from the screen mockup is mapped to a data element (or explicitly excluded)
- [ ] All `data_element_name` values are `lower_snake_case`
- [ ] All Decimal fields have explicit precision: `Decimal(10,2)` not `Decimal`
- [ ] All PII fields identified and marked `Yes` with handling requirements
- [ ] All required fields mapped to `Nullable: No`
- [ ] All Enum fields list every allowed value with the default
- [ ] All FK relationships documented with ON DELETE and ON UPDATE behavior
- [ ] All derived/calculated fields documented with formula
- [ ] Permissions matrix complete for all roles
- [ ] Traces to approved User Story, Use Case, and Screen Mockup

**Verdict:** 🔴 RED (checklist incomplete) / 🟢 GREEN (all items checked)
