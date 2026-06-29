# Session Notes — Simulated Interviews

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Note: Simulated based on stakeholder answers

---

## Session 1 — Sri (Admin/Builder)

**Date:** 2026-06-28 (Simulated)
**Duration:** 60 minutes
**Interviewer:** BA (AI)
**Interviewee:** Sri

### Key Takeaways

1. **Current State:** Manual Google Sheet, updated weekly (sometimes bi-weekly)
2. **Pain Points:**
   - Data entry is tedious (2-3 minutes per entry)
   - Forgets to log expenses for 2-3 weeks
   - Inconsistent categorization (10 informal categories)
   - No visual summaries or trends
3. **Desired State:**
   - Quick entry (< 30 seconds)
   - Auto-categorization
   - Visual charts and summaries
   - Budget alerts
   - CSV export for taxes
4. **MVP Features:**
   - Expense entry (date, amount, category, description)
   - Predefined categories (manageable by admin)
   - Monthly summaries (total by category, budget vs actual)
   - Budget alerts (when close to limit)
   - CSV export

### Decisions Made

- Manual entry only (no bank API for v1)
- Web app only (mobile-responsive for v2)
- Single-user initially, team features later

### Action Items

- [ ] Define category list in Phase 5 (UI & Data)
- [ ] Design budget alert logic in Phase 4 (Requirements)
- [ ] Plan CSV export format in Phase 4 (Requirements)

---

## Session 2 — Managers (S2, S3)

**Date:** 2026-06-28 (Simulated)
**Duration:** 45 minutes
**Interviewer:** BA (AI)
**Interviewees:** Managers (S2, S3)

### Key Takeaways

1. **Current State:** Informal message-based approval (email, chat)
2. **Pain Points:**
   - Forgets to check messages for approvals
   - No visibility into team spending
   - Slow turnaround (1-2 days)
   - No audit trail
3. **Desired State:**
   - Push notifications for approval requests
   - One-click approve/reject
   - Clear approval history
   - Budget dashboards
   - Mobile approval
4. **MVP Features:**
   - Approval workflow (request → approve/reject)
   - Notifications (in-app for v1, email for v2)
   - Audit trail (who, what, when, who approved)
   - Batch approve (for multiple requests)

### Decisions Made

- Two managers split approval by category
- Auto-approve after 48 hours if unavailable
- Both managers can approve any request

### Action Items

- [ ] Design approval workflow in Phase 3 (Use Cases)
- [ ] Define notification system in Phase 4 (Requirements)
- [ ] Plan audit trail schema in Phase 5 (UI & Data)

---

## Session 3 — Members (S4, S5)

**Date:** 2026-06-28 (Simulated)
**Duration:** 45 minutes
**Interviewer:** BA (AI)
**Interviewees:** Members (S4, S5)

### Key Takeaways

1. **Current State:** Manual spreadsheet entry, weekly batch
2. **Pain Points:**
   - Tedium (2-3 minutes per entry)
   - Forgets to log expenses
   - Inconsistent categorization
   - No mobile access
3. **Desired State:**
   - Quick entry (< 30 seconds)
   - Auto-categorization
   - Mobile-friendly interface
   - Receipt photo (optional)
   - Smart suggestions
4. **MVP Features:**
   - Quick entry form
   - Predefined categories with defaults
   - Mobile-responsive design
   - Receipt photo upload (optional)

### Decisions Made

- Minimum viable entry: date, amount, category, description
- Receipt photo is optional (nice-to-have for v2)
- Mobile-responsive is priority over native mobile app

### Action Items

- [ ] Design entry form in Phase 5 (UI & Data)
- [ ] Plan category defaults in Phase 5 (UI & Data)
- [ ] Define mobile-responsive breakpoints in Phase 5 (UI & Data)

---

## Session 4 — Auditor (S6)

**Date:** 2026-06-28 (Simulated)
**Duration:** 30 minutes
**Interviewer:** BA (AI)
**Interviewee:** Auditor (S6)

### Key Takeaways

1. **Current State:** Manual export, formatted reports
2. **Pain Points:**
   - Manual process (takes a day)
   - Data integrity concerns
   - No automation
3. **Desired State:**
   - One-click export (CSV, PDF)
   - Formatted reports
   - Data validation
   - Audit trail
4. **MVP Features:**
   - CSV export (all fields)
   - PDF report (formatted summary)
   - Audit trail (timestamps, user IDs, approval history)
   - Data validation (no gaps, consistent format)

### Decisions Made

- Quarterly exports (not real-time)
- CSV for data analysis, PDF for reports
- Read-only access for auditors

### Action Items

- [ ] Design CSV export format in Phase 4 (Requirements)
- [ ] Plan PDF report template in Phase 4 (Requirements)
- [ ] Define data validation rules in Phase 5 (UI & Data)

---

## Cross-Session Insights

### Common Pain Points
1. **Manual entry is tedious** → Quick entry form needed
2. **Inconsistent categorization** → Predefined categories needed
3. **No visual summaries** → Charts and dashboards needed
4. **No mobile access** → Mobile-responsive design needed

### Common Desires
1. **Quick entry** → < 30 seconds per expense
2. **Auto-categorization** → Smart suggestions based on history
3. **Visual summaries** → Charts, trends, dashboards
4. **Budget alerts** → Notifications when close to limits

### MVP Feature List (Consolidated)
1. Expense entry (date, amount, category, description)
2. Predefined categories (manageable by admin)
3. Monthly summaries (total by category, budget vs actual)
4. Budget alerts (when close to limit)
5. CSV export (all fields)
6. PDF report (formatted summary)
7. Approval workflow (request → approve/reject)
8. Notifications (in-app for v1)
9. Audit trail (who, what, when, who approved)
10. Mobile-responsive design

---

## Status

- [x] All Tier 1 interviews completed (simulated)
- [x] Key findings documented
- [x] MVP feature list consolidated
- [x] Action items defined for each phase
