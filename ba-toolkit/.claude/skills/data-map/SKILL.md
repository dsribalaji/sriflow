---
name: data-map
version: 2.0.0
phase: "05b — Feature Data Dictionary"
description: >
  Story-Mockup-Data Mapper — Phase 5b of the BA pipeline. Maps approved User Stories and annotated
  UI screens to a Feature Data Dictionary — the technical handoff artifact bridging requirements
  to database design. Produces: field name (snake_case), data type, validation/constraints,
  business rules, and PII flag for every UI element that touches persisted data.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - build a data dictionary
  - map this to a data schema
  - what are the data fields for this feature
  - story mockup data mapper
  - feature data dictionary
  - /data-map
prerequisite: /mockup — Approved screen mockup specs must exist with GREEN verdict
next-skill: /nfr
outputs:
  - 05_ui-and-data/data-dicts/FEAT-[Name]_datadict.md
gate:
  rule: Every data-bearing UI element is mapped to a field spec before /nfr runs
  signal: DONE when DoR checklist is complete and all PII fields are identified and flagged
---

# /data-map — Feature Data Dictionary

## When to invoke this skill

Phase 5b of the BA pipeline. Use when a User Story + Screen Mockup exist and you need to produce
the Feature Data Dictionary — the technical handoff artifact that bridges requirements to database design.

**Prerequisite:** Approved screen mockups in `05_ui-and-data/prototypes/` with GREEN verdict.
Also requires the approved User Story and Use Case for the feature.

## Core Principle: Bridge Product Requirements to Developer Execution

> "The Feature Data Dictionary is where product intent becomes database schema — every ambiguity here costs a sprint."

The Data Dictionary answers the question every developer has when reading a mockup: *"What exactly goes in that field, and what are the rules?"* Without it, developers make their own guesses about field length, naming, data type, and validation. Some guesses are right. Some aren't. The ones that aren't show up as bugs in UAT or data incidents in production.

---

## Step 1 — UI/UX Component Audit

Scan the screen mockup left-to-right, top-to-bottom. For each element, classify:

**Input elements (user-facing, data captured):**
- Form fields, dropdowns, text areas, date pickers, radio buttons, checkboxes, file upload zones

**Output elements (system-facing, data displayed):**
- Dynamic text fields, table grids, metric tiles, KPI headers, status badges, computed/calculated fields

**Ignore for data mapping:**
- Static labels, decorative icons, navigation items, structural dividers

---

## Step 2 — User Story Business Rule Extraction

Scan the User Story's Acceptance Criteria for explicit and implicit business rules:

**Rule triggers to look for:**
- "must validate" → validation constraint
- "must match" → cross-field validation
- "only allowed to see" → permission-based display rule
- "calculated based on" → derived field formula
- "cannot exceed" → maximum constraint
- "must be unique" → uniqueness constraint

**Role-based rules:**
- Map each role mentioned (Admin, Manager, User) to what they can see, edit, or trigger on this screen.

---

## Step 3 — Feature Data Dictionary Template

```markdown
---
id: FEAT-[Name]_datadict
title: Feature Data Dictionary — [Feature Name]
status: DRAFT | UNDER_REVIEW | APPROVED
verdict: RED | CONDITIONALLY_READY | GREEN
agent: /data-map
traces:
  user-story: US-[###]
  use-case: UC-[###]
  mockup: SCREEN-[Name]_mockup
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# Feature Data Dictionary — [Feature Name]

## Source Artifacts

| Artifact | ID |
|----------|-----|
| User Story | US-[###] — [Title] |
| Use Case | UC-[###] — [Title] |
| Screen Mockup | SCREEN-[Name]_mockup |

---

## Data Dictionary

| UI Element Label | Data Element Name | Data Type | Nullable? | Validation / Constraints | Business Rules / Source | PII? |
|:----------------|:-----------------|:----------|:---------|:------------------------|:------------------------|:-----|
| *Label seen on screen* | *snake_case_field_name* | *String / Int / Decimal / Date / Boolean / Enum* | *Yes / No* | *Length, format, range, uniqueness* | *Formula, logic, state, source table* | *Yes / No* |
```

### Column definitions

| Column | Rules |
|--------|-------|
| **UI Element Label** | Exact label text as shown on the screen |
| **Data Element Name** | `lower_snake_case`. Must be unique per feature. Becomes the database column name. |
| **Data Type** | String(N), Integer, Decimal(precision,scale), Date, DateTime, Boolean, Enum([values]), UUID |
| **Nullable?** | Yes = optional / No = required (maps to NOT NULL constraint) |
| **Validation / Constraints** | Length limits, format regex, range, uniqueness, cross-field dependency |
| **Business Rules / Source** | Formula for calculated fields; source table for FK relationships; BR-### reference |
| **PII?** | Yes = personal data requiring encryption, masking, or retention limits. No = non-PII. |

---

## Step 4 — Completed Example (Generic CRM — Account Form)

| UI Element Label | Data Element Name | Data Type | Nullable? | Validation / Constraints | Business Rules / Source | PII? |
|:----------------|:-----------------|:----------|:---------|:------------------------|:------------------------|:-----|
| Account Name | account_name | String(150) | No | Min 2 chars, max 150 chars, unique per organisation | Cannot duplicate existing account in same org. Source: user input. | No |
| Contact Email | contact_email | String(254) | No | RFC 5322 email format; max 254 chars; unique per account | BR-001: Must be verified via confirmation email before account is active. | Yes |
| Phone Number | phone_number | String(20) | Yes | E.164 format (+[country][number]); max 20 chars | Display formatted; store raw digits only. | Yes |
| Account Type | account_type | Enum('Standard','Premium','Enterprise') | No | Must be one of the 3 allowed values | Default: 'Standard'. Determines feature access tier. BR-012. | No |
| Contract Start | contract_start_date | Date | No | Cannot be in the past on creation; format DD/MM/YYYY | BR-015: If blank at account activation, defaults to today. | No |
| Monthly Value | monthly_value | Decimal(10,2) | Yes | Must be ≥ 0.00; two decimal places | Calculated: sum of active subscriptions. Displayed read-only. | No |
| Notes | account_notes | String(2000) | Yes | Max 2,000 characters | Free text. No HTML. Strip on save. | No |
| Created By | created_by_user_id | UUID | No | System-generated; FK → users.id | Auto-populated on save; not editable by user. | Yes |
| Status | account_status | Enum('Active','Inactive','Suspended') | No | Controlled by system state machine | Default: 'Inactive'. Transitions: UC-003. Display: coloured badge. | No |

---

## Step 5 — Calculated / Derived Fields

Document any fields that are computed, not directly entered:

```markdown
## Derived Field Specifications

| Field Name | Formula / Logic | Source Fields | When Calculated |
|-----------|----------------|---------------|----------------|
| total_value | SUM(monthly_value) × contract_term_months | monthly_value, contract_term_months | On save / on display |
| days_remaining | contract_end_date − today() | contract_end_date | On display (not stored) |
| completion_pct | (tasks_completed / tasks_total) × 100 | tasks_completed, tasks_total | Real-time on screen |
```

---

## Step 6 — Permissions Matrix

Map which roles can see, edit, or trigger each data element:

```markdown
## Field Permissions

| Data Element Name | Admin | Manager | Standard User | API |
|------------------|-------|---------|---------------|-----|
| account_name | Read/Write | Read/Write | Read only | Read |
| contact_email | Read/Write | Read/Write | No access | Read |
| monthly_value | Read | Read | No access | No access |
| account_status | Read/Write | Read only | No access | Read |
```

---

## Step 7 — Definition of Ready (DoR) Checklist

- [ ] Every UI element on the screen is mapped to a data element (or explicitly excluded as non-data)
- [ ] All `Data Element Name` values are `lower_snake_case`
- [ ] Numeric precision stated for all Decimal fields (e.g., `Decimal(10,2)`)
- [ ] All PII fields identified and marked `Yes`
- [ ] All required vs. optional fields mapped to Nullable: Yes / No
- [ ] All Enum fields list every allowed value
- [ ] All foreign key relationships documented in Business Rules column
- [ ] All calculated fields documented with formula and source fields
- [ ] Permissions matrix complete
- [ ] Traces to approved User Story, Use Case, and Screen Mockup

**Verdict:** 🟢 GREEN / 🔴 RED

---

## Engineering Constraints

1. **Naming standard:** All `Data Element Name` values MUST be `lower_snake_case`. No exceptions.
2. **Numeric precision:** Decimal fields MUST specify scale: `Decimal(10,2)` not just `Decimal`.
3. **Data privacy:** ALL names, emails, phone numbers, IP addresses, location data, and government IDs are PII = Yes.
4. **Error alignment:** For every input validation constraint, confirm the screen mockup shows the corresponding error message.
5. **No UI elements as data elements:** Icons, decorative images, dividers = do not map. Only elements that hold or display data.

---

## Phase Gate

**DONE signal:** Every data-bearing UI element is mapped with a complete field spec. All PII flagged. DoR checklist complete. Verdict = GREEN.

**Next skill:** `/nfr` — discover the Non-Functional Requirements that govern how this data is stored, secured, and accessed at scale.
