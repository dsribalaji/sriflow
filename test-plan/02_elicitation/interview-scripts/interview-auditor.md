# Interview Script — Auditor (S6)

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Duration: 30 minutes
## Goal: Define export requirements

---

## Opening (5 min)

"Thanks for meeting. I need to understand what data you need for audits and what format works best. No wrong answers — I need the reality."

---

## Layer 1 — EXPLORE (10 min)

### Q1: What data do you need for a quarterly audit?
**Probe:** What fields matter? What's the minimum required? What's nice-to-have?

**Expected Answer:** Date, amount, category, description, receipt, approval status.

### Q2: What format do you prefer?
**Probe:** CSV, PDF, Excel? Why? What's the audit workflow?

**Expected Answer:** CSV for data analysis, PDF for reports.

---

## Layer 2 — CONTEXT (5 min)

### Q3: How do you verify data integrity?
**Probe:** What checks do you perform? What's the audit trail requirement?

**Expected Answer:** Timestamps, user IDs, approval history, no gaps.

---

## Layer 3 — PROCESS (10 min)

### Q4: Walk me through your audit process.
**Probe:** What steps do you take? What's the timeline?

**Expected Answer:** Export data → analyze → verify → report.

### Q5: Do you need real-time access or periodic exports?
**Probe:** How often do you need data? What's the cadence?

**Expected Answer:** Quarterly exports. Maybe monthly for larger teams.

---

## Layer 4 — IDEA/FUTURE (5 min)

### Q6: What would "better" look like?
**Probe:** If this app worked perfectly, what would your audit routine be?

**Expected Answer:** One-click export, formatted reports, data validation.

---

## Closing (5 min)

"What did I miss? What question should I have asked that I didn't?"

---

## Simulated Answers (Based on Project Context)

| Question | Simulated Answer |
|----------|------------------|
| Q1 | "Date, amount, category, description, receipt, approval status." |
| Q2 | "CSV for analysis. PDF for reports." |
| Q3 | "Timestamps, user IDs, approval history, no gaps." |
| Q4 | "Export data → analyze → verify → report. Takes about a day." |
| Q5 | "Quarterly exports. Maybe monthly for larger teams." |
| Q6 | "One-click export. Formatted reports. Data validation." |

---

## Key Findings

1. **Current State:** Manual export, formatted reports, data validation
2. **Pain Points:** Manual process, data integrity concerns, no automation
3. **Desired State:** One-click export, formatted reports, data validation
4. **MVP Features:** CSV export, PDF reports, audit trail, data validation

---

## Output

- Interview script for Auditor (this file)
- Simulated responses based on project context
- Key findings for Phase 3 (Use Cases)
