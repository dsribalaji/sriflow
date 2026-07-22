---
name: usecase
version: 2.0.0
phase: "03 — Use Cases (SCOPE GATE)"
description: >
  Use Case Driven Discovery — Phase 3 of the BA pipeline and the SCOPE GATE. Converts elicitation
  findings into formal Use Cases at the correct Cockburn goal level. Covers basic flow, alternate
  flows, and exception flows. No User Story enters the backlog without a traceable, approved UC.
  Apply BEFORE user-story-standards and prototyping-mockup-standards.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - write a use case
  - define use case scenarios
  - document basic flow
  - what are the use cases for this system
  - map this requirement to a use case
  - /usecase
prerequisite: /elicit — Phase 2 must be complete. Tier 1 clarity checks must score ≥ 8/10.
next-skill: /audit-brd and /story
outputs:
  - 03_use-cases/draft/UC-001_[VerbNoun].md
  - 03_use-cases/uc-inventory.md
gate:
  rule: All primary UCs GREEN (exception flows complete) before stories are written
  signal: DONE when UC scores GREEN and is moved to 03_use-cases/approved/
---

# /usecase — Use Case Driven Discovery

## When to invoke this skill

Phase 3 of the BA pipeline — the SCOPE GATE. Use when converting elicitation notes into structured
functional scope, writing a Use Case for any feature or system capability, reviewing a Use Case for
completeness, or confirming scope before sprint planning begins.

**The rule:** No User Story enters `04_requirements/backlog/` without a traceable UC in `03_use-cases/approved/`.
If a story is requested without a UC — run `/usecase` first.

## Core Principle: Scope Before Screen, Flow Before Field

> "A Use Case is not a feature list. It is a contract between an actor and the system — describing what the system must do, for whom, under what conditions, and what constitutes success or failure."

Use Cases occupy the critical space **between stakeholder elicitation and User Story writing**. Their job is to define **what** the system must do — not how it looks, not how it's coded, not which button the user clicks.

---

## Step 1 — Confirm the Goal Level (Cockburn Framework)

Every Use Case must be written at the correct goal level. The wrong level produces either vague summaries (too high) or implementation details disguised as requirements (too low).

```
☁  CLOUD     — Enterprise/Organisation level. "Manage customers."
               Very high summary. 3–5 per organisation. Rarely written in full.

🪁 KITE      — Business Unit level. "Manage Customer Returns."
               Summary goal. Multiple user goals contained inside.
               Written as brief UC; expanded UCs live below it.

🌊 SEA LEVEL — User Goal level. "Submit an Expense Report."   ← PRIMARY WRITING LEVEL
               "Can the primary actor go away happy after doing this?"
               One sitting. 2–20 minutes of user activity. Write here.

🐟 FISH      — Sub-function level. "Validate expense amount against policy."
               Part of a sea-level UC's alternate/exception flow.
               Written only when a sub-step needs its own detailed specification.

🐚 CLAM      — Implementation level. API calls, database queries, component logic.
               NOT a BA artifact. Belongs to the technical design team.
```

**The BA rule:** Write all primary Use Cases at **Sea Level (🌊)**.

**The test for Sea Level:** "Can the primary actor go away satisfied having completed this — in one sitting — without needing to do anything else?" If yes: Sea Level.

---

## Step 2 — Use Case Specification Template

```markdown
---
title: UC-[###]_[VerbNoun]
phase: 03_use-cases
status: DRAFT | UNDER_REVIEW | APPROVED | DEPRECATED
verdict: RED | CONDITIONALLY_READY | GREEN
agent: /usecase
traces:
  - BRD-Req-[###]
  - stakeholder: [Name]
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# UC-[###] — [Verb Noun: e.g., Submit Expense Report]

## Header

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-[###] |
| **Goal Level** | 🌊 Sea Level / 🪁 Kite / 🐟 Fish |
| **Primary Actor** | [Who initiates this UC — specific role] |
| **Supporting Actors** | [Other roles involved — or "None"] |
| **Trigger** | [What causes this UC to begin] |
| **Preconditions** | [What must be true before this UC can run] |
| **Postconditions (Success)** | [What is true when the UC completes successfully] |
| **Postconditions (Failure)** | [What is true when the UC fails or is abandoned] |
| **Priority** | P0 / P1 / P2 |
| **Frequency** | [How often this UC runs — daily/weekly/per-transaction] |
| **Traces to** | [BRD-Req-### / Stakeholder name] |

---

## Basic Flow (Happy Path)

The sequence of steps when everything goes right.

1. **[Step 1]:** [Actor] [does action].
2. **[Step 2]:** System [responds with].
3. **[Step 3]:** [Actor] [does next action].
4. **[Step N]:** Use Case ends with [Postcondition success].

---

## Alternate Flows

Variations that still result in success.

### AF-1 — [Alternate Flow Name]
*Branches from Step [N]:*
1. [What triggers this alternate path]
2. [Steps in the alternate path]
3. Rejoins basic flow at Step [N], OR Use Case ends with [specific outcome].

### AF-2 — [Alternate Flow Name]
*Branches from Step [N]:*
1. [Description]

---

## Exception Flows

Failures, errors, and edge cases that must be handled explicitly.

### EF-1 — [Exception Name: e.g., Invalid Input]
*Triggers when:* [Exact condition that causes this exception]
1. System [detects / displays / blocks].
2. [Actor] [is shown / receives / can].
3. Use Case [resumes at Step N / ends with failure / offers retry].
**Error message displayed:** "[Exact error message text]"

### EF-2 — [Exception Name]
*Triggers when:* [Condition]
1. [Steps]
**Error message displayed:** "[Message]"

### EF-3 — [Exception Name]
*Triggers when:* [Condition]

---

## Business Rules

Rules the system must enforce during this Use Case.

| ID | Rule | Source |
|----|------|--------|
| BR-001 | [Business rule statement] | [Stakeholder / regulatory source] |
| BR-002 | [Business rule statement] | [Source] |

---

## Open Questions

Unresolved items that must be answered before this UC can be promoted to approved.

| ID | Question | Assigned to | Target date |
|----|----------|-------------|-------------|
| Q-001 | [Open question] | [Name] | [Date] |

---

## Linked Artifacts

| Artifact | ID / Link |
|----------|-----------|
| BRD Requirements | [Req-1.1, Req-1.2] |
| User Stories | [US-###, US-###] (populated after /story runs) |
| Screen Mockups | [SCREEN-Name] (populated after /mockup runs) |
| Data Dictionary | [FEAT-Name_datadict] (populated after /data-map runs) |
```

---

## Step 3 — RED/GREEN Verdict Scoring

Score every Use Case before promoting to `approved/`:

| Check | GREEN | RED |
|-------|-------|-----|
| Goal level correct? | Sea Level or explicitly justified Kite/Fish | Wrong level — too broad or too detailed |
| Basic flow complete? | All steps specified, numbered, actor + system action clear | Missing steps, vague actors, no system response |
| Alternate flows covered? | At least 2 alt flows OR justified absence | No alt flows, or just named without steps |
| Exception flows specified? | All named exceptions have: trigger condition + system behavior + error message | Named but not specified ("handle errors appropriately") |
| Preconditions listed? | Specific, testable conditions | "System is running" (not testable) |
| Postconditions listed? | Observable success AND failure states | Missing or untestable |
| Business rules explicit? | Named, numbered, sourced | Embedded in flow steps without explicit rule declaration |
| No open questions? | All Q-# resolved or on a plan | Unresolved questions with no assigned owner |
| Traces to BRD? | BRD requirement ID referenced | No traceability link |

**GREEN = all checks pass. RED = any check fails.**

---

## Step 4 — UC Inventory Update

After every UC is created or updated, update `03_use-cases/uc-inventory.md`:

```markdown
| ID | Use Case Name | Goal Level | Primary Actor | Status | Linked Stories | Linked Screens | Verdict |
|----|---------------|-----------|---------------|--------|-----------------|-----------------|---------| 
| UC-001 | [Verb Noun] | 🌊 Sea Level | [Role] | APPROVED | [US-001, US-002] | [SCREEN-Name] | 🟢 GREEN |
| UC-002 | [Verb Noun] | 🌊 Sea Level | [Role] | DRAFT | [None] | [None] | 🔴 RED |
```

**The UC Inventory is the master scoreboard.** Update it after every UC change.

---

## Common Use Case Patterns

### CRUD Pattern (most common for business data management)

| UC | Basic Flow | Key Exception Flows |
|----|-----------|---------------------|
| Create [Entity] | Actor fills form → validates → system saves → confirmation | Validation failure; duplicate detected; required field missing |
| View [Entity] List | Actor navigates to list → system displays records → actor views/searches | No records found; search returns no results |
| Edit [Entity] | Actor selects record → edits fields → saves | Concurrent edit conflict; validation failure; unauthorized edit |
| Delete [Entity] | Actor selects record → confirms → system removes | Confirm dialog declined; record has dependencies; unauthorized delete |

### Lifecycle/Status Change Pattern

```
Create → [Status A] → [Status B] → [Status C] → Complete/Archive
                    ↘ Cancelled
```

Each status transition = one alternate or exception flow.

### Search/Filter Pattern

Basic Flow: Actor enters criteria → system filters → results displayed
AF-1: No results found → system shows empty state with suggestions
AF-2: Too many results → system paginates
EF-1: Invalid search syntax → system highlights error with correction hint

---

## Phase Gate

**DONE signal:** All primary Use Cases for in-scope features are GREEN and in `03_use-cases/approved/`. The UC Inventory is up to date. No open questions remain unassigned.

**Next skills:**
- `/audit-brd` — audit the BRD requirements against the confirmed UCs
- `/story` — write User Stories from the approved UCs
