# US-02: Auto-Categorize Expenses

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-01
## INVEST: ✅

---

## User Story

As a member, I want to auto-categorize expenses so entry is faster.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Successful auto-categorization**
- Given I am a logged-in member
- When I enter a description containing category keywords
- Then the system suggests the appropriate category

**Scenario 2: No match found**
- Given I am a logged-in member
- When I enter a description with no matching keywords
- Then the system leaves the category field empty for manual selection

**Scenario 3: Override suggestion**
- Given I am a logged-in member
- When the system suggests a category
- Then I can override the suggestion with a different category

---

## Technical Notes

- Keyword mapping: maintain a dictionary of keywords → categories
- Machine learning: v2 feature (not MVP)
- Fallback: manual category selection

---

## Estimation

- Story Points: 2
- Effort: 1 day

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
