---
name: mockup
version: 2.0.0
phase: "05a — UI Prototyping & Mockup Standards"
description: >
  UI Prototyping & Mockup Standards — Phase 5a of the BA pipeline. Annotates UI screens using
  the Field + Value + Behavior + Rule standard. Every UI element must answer: data type, validation,
  behavior, and business rule. A mockup is only done when zero open questions remain for the developer.
  Requires a linked User Story and approved UC before any screen can be specified.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - design a screen
  - annotate a mockup
  - wireframe this
  - specify the UI
  - what fields are on this screen
  - review my prototype
  - /mockup
prerequisite: /story — Approved User Stories must exist with GREEN verdict
next-skill: /data-map
outputs:
  - 05_ui-and-data/prototypes/SCREEN-[Name]_mockup.md
gate:
  rule: Every field has type + validation + behavior + business rule before /data-map runs
  signal: DONE when all screen elements are specified with zero [TBD] placeholders remaining
---

# /mockup — UI Prototyping & Mockup Standards

## When to invoke this skill

Phase 5a of the BA pipeline. Use when creating, reviewing, or annotating UI screens, wireframes,
mockups, or prototypes for any approved User Story. Invoke before `/data-map`.

**Prerequisite:** Approved User Stories in `04_requirements/backlog/approved/` with GREEN verdict.
A mockup without a linked User Story and UC is incomplete — always trace each screen back.

**Important rule:** Never introduce UI design at the very start of a project. Mockups belong here,
in Phase 5, after the scope is confirmed via Use Cases and the stories are written.

## Core Principle: A Picture Generates Questions, Not Just Answers

> "A mockup's job is to expose low-level requirements — data fields, validations, business rules, and assumptions — before development starts."

Every element on a screen carries questions. The mockup annotation's job is to answer all of them before a developer touches code. An unanswered field = an open question = a risk that surfaces mid-sprint.

**Standard:** Field + Value + Behavior + Rule

- **Field** = a variable UI element that holds user input or system-generated data
- **Value** = the actual data or options displayed in the field
- **Behavior** = what the element does in response to user action or system state
- **Rule** = the business rule enforced by this field's validation or display logic

---

## Step 1 — Screen Inventory (Scan Left-to-Right, Top-to-Bottom)

Before annotating, produce a complete inventory of every element on the screen.

**Element categories:**

| Control | Behavior | Questions to Answer |
|---------|----------|---------------------|
| **Label** | Read-only text | Is this a persistent label or a placeholder (disappears on input)? |
| **Text Box / Input** | Free user input | Type? Max length? Special characters allowed? Required or optional? |
| **Text Area** | Multi-line user input | Max characters? Min required? Counter displayed? |
| **Dropdown / Select** | Predefined value selection | Static list or dynamic (from DB)? Single or multi-select? Default value? |
| **Date Picker** | Date selection | Format: dd/mm/yyyy or mm/dd/yyyy? Past only, future only, or any date? |
| **Radio Buttons** | Single selection from group | Which option is pre-selected (if any)? Can selection be cleared? |
| **Checkboxes** | Multiple selection from group | Minimum / maximum selections? Default checked state? |
| **Button** | Triggers an event | Exact caption text? Icon + text, text only? Disabled conditions? |
| **Grid / Table** | Displays rows of data | Columns? Sortable? Filterable? Paginated? Row actions? |
| **Tab / Accordion** | Structural navigation | How many tabs? Which is default-active? Can tabs be hidden by role? |
| **Modal / Dialog** | Overlay UI | Trigger condition? Can it be closed without action? What's the backdrop behavior? |
| **File Upload** | Attachment | Accepted file types? Max file size? Max number of files? |
| **Status / Badge** | Read-only state display | What states exist? What triggers each state? Color coding? |
| **Search Bar** | Filter/query | Searches which fields? Real-time or on Enter? Min characters to trigger? |

---

## Step 2 — The 12-Question Annotation Checklist (Per Field)

For every input field or UI element, answer these 12 questions:

| # | Question | Why It Matters |
|---|----------|----------------|
| 1 | What is the field's **exact label** (as it appears on screen)? | Developers use exact labels; variations cause confusion |
| 2 | What **data type** does it hold? (String, Integer, Decimal, Date, Boolean, Enum) | Determines database column type |
| 3 | What is the **maximum length** or size? | Database column sizing; client-side validation |
| 4 | Is it **required** or optional? | Prevents submission when empty |
| 5 | What is the **default value** (if any)? | Pre-populated fields affect validation logic |
| 6 | What **validation** applies? (Format, range, regex, cross-field) | Determines client + server validation rules |
| 7 | What **error message** is shown if validation fails? (Exact text) | Copywriting is a dev task without this spec |
| 8 | Is it **editable** for all roles, or read-only for some? | Permission model for this field |
| 9 | Does it **trigger behavior** in other fields? (e.g., Country selection shows/hides State) | Conditional display logic |
| 10 | Are its **values sourced** from a database, config, or static list? | Determines whether a lookup API is needed |
| 11 | Does it carry **PII** (Personally Identifiable Information)? | Privacy compliance — encryption, masking, audit trail |
| 12 | What **business rule** does this field enforce? | Traces to the BRD and UC business rules |

---

## Step 3 — Screen Mockup Template

```markdown
---
id: SCREEN-[Name]
title: [Screen Name — e.g., Create Proposal Form]
status: DRAFT | UNDER_REVIEW | APPROVED
verdict: RED | CONDITIONALLY_READY | GREEN
agent: /mockup
traces:
  user-story: US-[###]
  use-case: UC-[###]
  data-dict: FEAT-[Name]_datadict (added after /data-map runs)
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# SCREEN — [Screen Name]

## Screen Context

| Field | Value |
|-------|-------|
| **Screen purpose** | [One sentence: what task does the user complete on this screen?] |
| **Primary actor** | [Role] |
| **Trigger** | [How does the user arrive here — link, button, navigation item?] |
| **Linked User Story** | US-[###] — [Title] |
| **Linked Use Case** | UC-[###] — [Title] |

---

## Layout Overview

[Optional: ASCII sketch or section list describing the screen layout]

```
+---------------------------------------+
| Header: [Title] | [Action Button(s)]  |
+-------------------+-------------------+
| Left: Form fields | Right: Summary    |
+-------------------+-------------------+
| Footer: Save | Cancel               |
+---------------------------------------+
```

---

## Element Specifications

### Section: [Form Section Name — e.g., Basic Information]

#### [Field Label]

| Property | Specification |
|----------|--------------|
| **Control type** | Text Input / Dropdown / Date Picker / Radio / Checkbox / etc. |
| **Data type** | String / Integer / Decimal / Date / Boolean / Enum |
| **Required?** | Yes — blocks submission if empty / No — optional |
| **Max length** | [N characters] |
| **Default value** | [Value or "None"] |
| **Validation** | [Rule: format, range, regex, cross-field dependency] |
| **Error message** | "[Exact error text shown when validation fails]" |
| **Editable by** | All roles / Admin only / Read-only for [Role] |
| **Triggers** | [Field B becomes visible when this = "X"] / None |
| **Data source** | Static value / API: [endpoint] / Database: [table.column] |
| **PII?** | Yes — [handling required] / No |
| **Business rule** | BR-[###]: [Rule text from UC] |

#### [Next Field Label]

[Repeat the table above for every field on the screen]

---

### Section: [Grid / Table Section Name — e.g., Proposal List]

| Column | Data Type | Sortable? | Default Sort? | Format | Notes |
|--------|-----------|-----------|--------------|--------|-------|
| [Column label] | [Type] | Yes / No | Primary asc | [Format] | [Notes] |

**Row actions:** [Edit / View / Delete / etc. — what appears per row and under what conditions]
**Pagination:** [Records per page? Default? Configurable?]
**Empty state:** [What is displayed when there are no rows?]

---

## Buttons & Actions

| Button | Caption | Position | Trigger | Enabled condition | Disabled state behavior |
|--------|---------|----------|---------|------------------|------------------------|
| Primary CTA | "[Exact caption]" | [Location] | [Action: submit, navigate, modal] | [Condition] | [Greyed out / hidden / tooltip] |
| Cancel | "Cancel" | [Location] | [Action: navigate back without saving] | Always enabled | N/A |

---

## Modal / Dialog Specifications

### [Modal Name — e.g., Delete Confirmation]

| Property | Specification |
|----------|--------------|
| **Trigger** | [What causes this modal to open?] |
| **Title** | "[Exact modal title text]" |
| **Body text** | "[Exact body text — including dynamic variable substitution e.g., 'Delete [Proposal Name]?']" |
| **Primary action** | "[Button caption]" → [What happens] |
| **Secondary action** | "[Button caption]" → [What happens] |
| **Can be dismissed?** | Yes (Esc / backdrop click) / No (must choose an action) |

---

## Conditional Display Logic

| Condition | Element(s) shown | Element(s) hidden | Notes |
|-----------|-----------------|------------------|-------|
| [Field A] = "[Value X]" | [Field B] | [Field C] | [Why] |
| User role = Admin | [Delete button] | — | [Permission rule] |

---

## Error States & Messages

| Scenario | Error location | Error message text |
|----------|---------------|-------------------|
| Required field empty on submit | Below [field label] | "[Exact error text]" |
| Invalid format | Below [field label] | "[Exact error text]" |
| Server error | Toast / Banner | "[Exact error text]" |

---

## Definition of Done (Mockup)

- [ ] Every field has: control type, data type, required/optional, validation, error message
- [ ] Every button has: caption, trigger, enabled condition
- [ ] Every grid has: columns, sort, pagination, empty state
- [ ] Conditional display logic is fully mapped
- [ ] All PII fields identified
- [ ] All business rules traced to UC/BRD
- [ ] Zero [TBD] placeholders remaining
- [ ] Linked to approved User Story (US-[###])
- [ ] Linked to approved Use Case (UC-[###])

**Verdict:** 🟢 GREEN / 🔴 RED
```

---

## Phase Gate

**DONE signal:** Every screen element is fully specified. Zero [TBD] placeholders remain. Every field answers all 12 questions. Verdict = GREEN.

**Next skill:** `/data-map` — build the Feature Data Dictionary from the approved screen specs.
