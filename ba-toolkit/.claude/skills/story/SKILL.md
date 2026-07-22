---
name: story
version: 2.0.0
phase: "04b — User Story Standards"
description: >
  User Story Standards — Phase 4b of the BA pipeline. Turns approved Use Cases into
  INVEST-compliant User Stories with Given-When-Then acceptance criteria. Enforces the
  Done = No More Questions standard. Runs the 15-second estimate test on every story.
  No story enters approved/ without a traceable UC in approved/.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - write user stories
  - review a backlog
  - assess acceptance criteria
  - split stories
  - check story quality
  - is this story done
  - /story
prerequisite: /usecase — Approved UCs must exist in 03_use-cases/approved/
next-skill: /mockup and /data-map
outputs:
  - 04_requirements/backlog/draft/US-001_[VerbNoun].md
  - 04_requirements/backlog/approved/US-001_[VerbNoun].md (after DoR passes)
gate:
  rule: Stories pass all 6 INVEST checks + GWT criteria are testable + DoR checklist complete
  signal: DONE when verdict = GREEN and story is moved to backlog/approved/
---

# /story — User Story Standards

## When to invoke this skill

Phase 4b of the BA pipeline. Use when writing new User Stories from approved Use Cases, reviewing
a backlog for quality, assessing acceptance criteria, splitting oversized stories, or checking
whether a story is sprint-ready.

**Prerequisite:** Approved Use Cases in `03_use-cases/approved/`. No story is written without a
traceable, approved UC. If the UC doesn't exist — run `/usecase` first.

## Core Principle: Done = No More Questions

> "If a developer reads your story and has a question, it isn't done."

A story is **done** when a competent developer can build it without asking a single blocking question.
Not when it has the right format. Not when it passed review. **Zero blocking questions remaining.**

### The 15-Second Estimate Test
Hand the story to a developer. If they give a rough estimate in **15 seconds** — the story is clear
enough to build. If they say *"well, it depends on…"* — every word after "depends" is a question
you left unanswered inside the story.

---

## Step 1 — Story Format

Every story follows this format:

```
As a [specific role — never "user"],
I want [specific action or capability],
so that [business value or outcome for that role].
```

**Good:**
> As a **Sales Manager**, I want to **export the proposal list as CSV**, so that **I can analyse win rates in Excel without manual data entry**.

**Bad:**
> As a **user**, I want to **manage proposals**, so that **it's easier**.

The bad example fails because: "user" is not a role, "manage" hides 5+ behaviors, "easier" is unmeasurable.

---

## Step 2 — INVEST Quality Checklist

Run every story through all six letters before calling it done. **Failed letters = your fix list.**

| Letter | Question to Ask | Failure Signal |
|--------|----------------|----------------|
| **I**ndependent | Can it be built and shipped on its own, without waiting on another story? | Story requires another story to be done first |
| **N**egotiable | Does it state the *need*, leaving the *how* to the team? | Story over-specifies implementation details (e.g., "use a blue dropdown") |
| **V**aluable | Does it deliver value to a user or the business (not just a technical task)? | Story describes a task, not an outcome |
| **E**stimable | Can a developer size it in ~15 seconds? | Vague scope; developer says "it depends" |
| **S**mall | Does it fit comfortably within a sprint (ideally ≤ 3 days of effort)? | Story bundles multiple behaviors |
| **T**estable | Can QA write a test that proves it works? | No measurable, observable outcome defined |

**If a story fails INVEST, it is not done. Fix all failures before moving to the sprint.**

---

## Step 3 — Acceptance Criteria: Given-When-Then (GWT)

Every acceptance criterion must follow this structure:

```
Given [a starting context — who, in what state]
When  [an action or trigger — specific, concrete]
Then  [an observable, measurable result — verifiable by QA]
```

**Example:**

```
Given a Sales Manager with at least one proposal in their owned list
When  they click "Export CSV" in the proposal list toolbar
Then  a CSV file downloads within 5 seconds, containing only their owned proposals,
      with all visible columns, named "proposals_[YYYY-MM-DD].csv"
```

### Testability Rule
Every AC must pass: *Could QA write an automated or manual test for this right now?*

- ❌ "The system should be fast" → untestable opinion
- ✅ "Page loads in under 2 seconds on a standard 4G connection" → testable
- Replace every adjective (fast, intuitive, robust, user-friendly) with **a number, count, time, percentage, or specific behavior**

### AC Coverage — Happy Path + Edge Cases

Every story needs at least:
1. **Happy path AC** — what happens when everything goes right
2. **Boundary AC** — what happens at the edges of the allowed range
3. **Error/exception AC** — what happens when the user does something wrong (traces to an EF in the UC)

---

## Step 4 — User Story Template

```markdown
---
id: US-[###]
title: [Verb Noun — e.g., Export Proposal List as CSV]
status: DRAFT | UNDER_REVIEW | APPROVED | DEPRECATED
verdict: RED | CONDITIONALLY_READY | GREEN
priority: P0 | P1 | P2
agent: /story
traces:
  uc: UC-[###]
  brd: BRD-Req-[###]
  mockup: SCREEN-[Name] (added after /mockup runs)
  data-dict: FEAT-[Name]_datadict (added after /data-map runs)
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
version: 1.0
---

# US-[###] — [Verb Noun]

## Story

**As a** [specific role],
**I want** [specific action],
**so that** [business value].

**Why this matters:** [1–2 sentence business context — the "why" behind the what]

---

## INVEST Check

| Letter | ✅ / ❌ | Notes |
|--------|--------|-------|
| Independent | | |
| Negotiable | | |
| Valuable | | |
| Estimable | | |
| Small | | |
| Testable | | |

**Result:** GREEN (all ✅) / RED (fix required)

---

## Acceptance Criteria

### AC-1 — [Happy Path Name]
```
Given [context]
When  [action]
Then  [observable result with measurable threshold]
```

### AC-2 — [Boundary or Variation Name]
```
Given [context]
When  [action]
Then  [result]
```

### AC-3 — [Error/Exception Name — traces to UC EF-#]
```
Given [context]
When  [action or invalid input]
Then  [system behavior — error message text, state change, or blocked action]
```
**Error message:** "[Exact text displayed to the user]"

---

## Definition of Ready (DoR) Checklist

- [ ] Story is Independent — can be built without another story being done first
- [ ] INVEST passes all 6 letters
- [ ] Acceptance criteria are written in GWT format
- [ ] Every AC is testable (no adjectives without measurable thresholds)
- [ ] All dependencies declared explicitly
- [ ] Traces to an approved UC (`03_use-cases/approved/UC-[###]`)
- [ ] Mockup linked (`05_ui-and-data/prototypes/SCREEN-[Name]_mockup.md`) ← added by /mockup
- [ ] Data dictionary linked (`05_ui-and-data/data-dicts/FEAT-[Name]_datadict.md`) ← added by /data-map

**DoR status:** [ ] NOT READY [ ] READY

---

## Dependencies

| Depends on | Type | Notes |
|-----------|------|-------|
| US-[###] | Story | [Why this must be done first] |
| [System/Integration] | Technical | [What must exist in the environment] |

---

## Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| Q-001 | [Question that must be answered before this story is sprint-ready] | [Name] | OPEN |

---

## SME Confirmations

| Confirmation | Confirmed by | Date |
|-------------|--------------|------|
| [What was confirmed] | [Name] | [Date] |
```

---

## Step 5 — Story Splitting Guide

When a story is too large (fails the **S** in INVEST), split it:

### Split by flow type (from the UC)
One story per UC flow: basic flow, each alternate flow, each critical exception flow.

### Split by role / actor
If multiple roles use the same feature differently — one story per role.

### Split by data scope
"View all proposals" vs "View my proposals" vs "View team proposals" = three stories.

### Split at "and"
Every "and" in a story is a split point. *"...so that I can export and email the report"* = two stories.

### Never split by technical layer
❌ "Backend: create export API" + "Frontend: build export button" — these are tasks, not stories. Stories deliver value to a user. Technical tasks are implementation details inside a story.

---

## Phase Gate

**DONE signal:** Every story passes all 6 INVEST checks, has GWT acceptance criteria with measurable thresholds, has no open questions, and has a completed DoR checklist. Verdict = GREEN.

**Promotion:** Move from `04_requirements/backlog/draft/` to `04_requirements/backlog/approved/` when all DoR items are checked (including mockup and data dictionary links, added by later skills).

**Next skills:**
- `/mockup` — annotate the UI screens for each approved story
- `/data-map` — build the feature data dictionary from the story + mockup

---

## Anti-Patterns to Reject

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| `"As a user, I want to manage [X]"` | "User" is not a role; "manage" hides 5–10 behaviors | Name the role; split by discrete behavior |
| AC: "The system should be fast/intuitive/robust" | Untestable adjective; no measurable threshold | Replace with: `< 2 seconds`, `completes in 1 step`, `zero unhandled errors` |
| AC that assumes another story is complete | Hidden dependency; sprint landmine | Declare: `(depends on US-###)` explicitly |
| Story with "and" in the action | Multiple behaviors bundled | Split at every "and" |
| Story with no acceptance criteria | "Done" is undefined; QA cannot test | Add GWT criteria: happy path + 2 edge cases minimum |
| Story in `approved/` with RED verdict in YAML | Governance drift — promoted without review | Re-run /story; fix failures; re-promote |
