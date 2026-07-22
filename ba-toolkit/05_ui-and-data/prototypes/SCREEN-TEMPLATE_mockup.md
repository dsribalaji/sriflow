---
id: SCREEN-[Name]
title: "[Screen Name — e.g., Create Proposal Form]"
status: DRAFT
verdict: RED
agent: /mockup
traces:
  user-story: "US-001"
  use-case: "UC-001"
  data-dict: "[FEAT-Name_datadict — added after /data-map runs]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# SCREEN — [Screen Name]

## Screen Context

| Field | Value |
|-------|-------|
| **Screen purpose** | [One sentence: what task does the user complete on this screen?] |
| **Primary actor** | [Role] |
| **Trigger** | [How does the user arrive here — e.g., "Clicks 'New Proposal' from the dashboard"] |
| **Linked User Story** | US-001 — [Story title] |
| **Linked Use Case** | UC-001 — [UC title] |

---

## Layout Overview

```
+----------------------------------------------+
| [Page Title / Breadcrumb]                    |
+----------------------------------------------+
| [Section 1 — e.g., Basic Information]        |
|  Field A ___________  Field B ___________    |
|  Field C ___________                         |
+----------------------------------------------+
| [Section 2 — e.g., Details]                 |
|  Field D ___________  Field E ___________    |
+----------------------------------------------+
| [Action area]                                |
|  [Save]  [Save Draft]  [Cancel]              |
+----------------------------------------------+
```

---

## Element Specifications

### Section 1: [Section Name]

#### [Field Label — e.g., Proposal Title]

| Property | Specification |
|----------|--------------|
| **Control type** | Text Input |
| **Data type** | String |
| **Required?** | Yes — blocks submission if empty |
| **Max length** | 150 characters |
| **Default value** | None (blank) |
| **Validation** | Min 3 characters; no leading/trailing whitespace |
| **Error message** | "Please enter a proposal title (minimum 3 characters)." |
| **Editable by** | Creator role on creation; Manager role on edit; read-only for Viewer |
| **Triggers** | None |
| **Data source** | User input |
| **PII?** | No |
| **Business rule** | BR-001: Title must be unique per client account |

---

#### [Field Label — e.g., Client]

| Property | Specification |
|----------|--------------|
| **Control type** | Dropdown (searchable) |
| **Data type** | Enum (dynamic — from clients table) |
| **Required?** | Yes |
| **Max length** | N/A (selection from list) |
| **Default value** | None (placeholder: "Select a client...") |
| **Validation** | Must be a valid active client from the clients table |
| **Error message** | "Please select a client." |
| **Editable by** | Creator on creation; read-only after status = Submitted |
| **Triggers** | Selecting a client auto-populates the Contact dropdown below |
| **Data source** | API: GET /api/clients?status=active |
| **PII?** | No (company name, not personal data) |
| **Business rule** | BR-002: Only clients with status = Active are available for selection |

---

#### [Field Label — e.g., Proposal Value]

| Property | Specification |
|----------|--------------|
| **Control type** | Text Input (numeric) |
| **Data type** | Decimal(10,2) |
| **Required?** | No — optional at Draft stage; required at Submission |
| **Max length** | 13 characters (10 digits + decimal point + 2 decimal places) |
| **Default value** | None |
| **Validation** | Must be ≥ 0.00; max 9,999,999.99; two decimal places maximum |
| **Error message** | "Please enter a valid amount (e.g., 1234.56)." |
| **Editable by** | Creator and Manager |
| **Triggers** | None |
| **Data source** | User input |
| **PII?** | No |
| **Business rule** | Display with currency symbol [£/$] based on client account currency |

---

### Section 2: [Section Name — e.g., Dates]

#### [Field Label — e.g., Valid Until]

| Property | Specification |
|----------|--------------|
| **Control type** | Date Picker |
| **Data type** | Date |
| **Required?** | No — optional |
| **Format** | DD/MM/YYYY |
| **Default value** | Today + 30 days |
| **Validation** | Must be today or in the future; cannot be more than 365 days from today |
| **Error message** | "Please select a future date (within 365 days)." |
| **Editable by** | All roles |
| **Triggers** | None |
| **Data source** | User input via calendar widget |
| **PII?** | No |
| **Business rule** | BR-003: Proposals expire at midnight on this date (status auto-changes to Expired) |

---

## Buttons & Actions

| Button | Caption | Position | Trigger | Enabled condition | Disabled state |
|--------|---------|----------|---------|------------------|----------------|
| Primary CTA | "Submit Proposal" | Bottom right | Validates + submits form | All required fields filled + validation passes | Greyed out; tooltip: "Please complete all required fields" |
| Secondary | "Save Draft" | Bottom right, left of Submit | Saves with status DRAFT (no validation) | Always enabled | N/A |
| Tertiary | "Cancel" | Bottom left | Navigates back without saving | Always enabled | N/A |

---

## Modal / Dialog Specifications

### Cancel Confirmation Dialog

| Property | Value |
|----------|-------|
| **Trigger** | User clicks "Cancel" with unsaved changes in the form |
| **Title** | "Unsaved Changes" |
| **Body text** | "You have unsaved changes. If you leave this page, your changes will be lost." |
| **Primary action** | "Leave page" → Navigates away without saving |
| **Secondary action** | "Stay on page" → Closes dialog; form remains |
| **Can be dismissed?** | Yes (Esc key, backdrop click = Stay on page) |

---

## Conditional Display Logic

| Condition | Elements shown | Elements hidden | Notes |
|-----------|---------------|-----------------|-------|
| Client selected | Contact dropdown | — | Contact list is filtered to the selected client's contacts |
| Status = APPROVED | — | Submit button, Save Draft button | Approved proposals are read-only |
| Role = Viewer | All fields as read-only | Edit controls, action buttons | Viewers cannot modify any data |

---

## Error States & Messages

| Scenario | Error location | Error message text |
|----------|---------------|-------------------|
| Required field empty on Submit | Below the field | "[Field label] is required." |
| Invalid format | Below the field | "[Field-specific message as per each field spec above]" |
| Duplicate title | Below Title field | "A proposal with this title already exists for this client. Please use a different title." |
| Server error on save | Top banner | "We couldn't save your proposal. Please try again. If the issue persists, contact support." |

---

## Definition of Done (Mockup)

- [ ] Every field has: control type, data type, required/optional, validation, error message
- [ ] Every button has: caption, trigger, enabled condition
- [ ] All conditional display logic fully mapped
- [ ] All modal/dialog specs complete
- [ ] All PII fields identified
- [ ] All business rules traced to BR-### references
- [ ] Zero [TBD] or [PENDING] placeholders remaining
- [ ] Linked to approved User Story (US-001) ✅
- [ ] Linked to approved Use Case (UC-001) ✅

**Verdict:** 🔴 RED (spec incomplete) / 🟢 GREEN (all elements fully specified)
