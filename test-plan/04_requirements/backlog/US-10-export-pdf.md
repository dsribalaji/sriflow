# US-10: Export PDF

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Use Case: UC-05
## INVEST: ✅

---

## User Story

As an auditor, I want to export PDF so I can share reports.

---

## Acceptance Criteria

### Given-When-Then

**Scenario 1: Generate PDF report**
- Given I am a logged-in auditor
- When I select "Export PDF" and choose date range
- Then I receive a formatted PDF report with summary and expense list

**Scenario 2: Custom report title**
- Given I am a logged-in auditor
- When I enter a custom title for the report
- Then the PDF includes my custom title

---

## Technical Notes

- PDF format: summary header + expense table + charts
- Template: system-generated with company branding
- File availability: 24 hours

---

## Estimation

- Story Points: 2
- Effort: 1 day

---

## Status

- [x] User story written
- [x] INVEST criteria met
- [x] GWT acceptance criteria defined
