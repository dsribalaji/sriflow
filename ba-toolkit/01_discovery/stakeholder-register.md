---
title: Stakeholder Register
phase: 01_discovery
status: DRAFT
agent: /discover
verdict: RED
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Stakeholder Register — [Project Name]

**Purpose:** Name every individual stakeholder, map their power/interest, and surface their top uncertainty.
**Rule:** Any generic group label ("leadership," "users," "the business") is automatically 🔴 RED. Name individuals only.
**Living document:** Update this register after every interview or discovery session.

---

## Stakeholder Inventory

| Name / Role | Category | Power | Interest | Top Uncertainty | Analysis Needed | Deliverable | Priority Tier |
|-------------|----------|-------|----------|----------------|----------------|-------------|---------------|
| [Full Name], [Title] | Decision-Maker | High | High | "Will this save or cost the business money?" | Cost-benefit analysis: manual process vs. new system | ROI showing ≥ 20% cost reduction | Tier 1 |
| [Full Name], [Title] | Subject Matter Expert | High | High | "Can we meet compliance requirements with this system?" | Compliance gap analysis against [Regulation] | Compliance specification with audit trail requirements | Tier 1 |
| [Full Name], [Title] | End User | Low | High | "Will this be harder to use than what we have today?" | UX time study: current vs. proposed workflow | Before/after time-per-task showing ≥ 15% improvement | Tier 2 |
| [Full Name], [Title] | Technical Gatekeeper | Medium | Medium | "Can we integrate with our existing [System] without custom middleware?" | Integration feasibility assessment | Confirmed integration path or identified gap with mitigation options | Tier 1 |
| [Full Name], [Title] | Affected Party | Low | Medium | "How will this change my team's workflow?" | Impact assessment for downstream process | Clear documented workflow change plan | Tier 3 |

---

## Category Legend

| Category | Description |
|----------|-------------|
| **Decision-Maker** | Final say on scope, priorities, go/no-go |
| **Subject Matter Expert** | Owns the domain knowledge |
| **End User** | Uses the system daily to do their job |
| **Technical Gatekeeper** | Controls architecture, data, or infrastructure |
| **Affected Party** | Impacted by the change but not a direct user |
| **Regulator / Auditor** | External compliance or governance requirement |

---

## RED / GREEN Status

| Stakeholder | Status | Reason if RED |
|-------------|--------|---------------|
| [Name] | 🟢 GREEN | Named, uncertainty documented, analysis planned, tier assigned |
| [Name] | 🔴 RED | [Reason: e.g., "Top uncertainty not yet identified — interview scheduled"] |
| [Name] | 🔴 RED | [Reason: e.g., "Referred to as 'the finance team' — need individual names"] |

**Overall register status:** 🔴 RED until every stakeholder is 🟢 GREEN.

---

## Unresolved: Generic Group Labels

List any groups that have been referenced but not yet resolved to named individuals:

| Group Label Used | Context Where Used | Action Required |
|-----------------|-------------------|-----------------|
| "Leadership" | Mentioned in project brief as approvers | Interview [Name] to identify who specifically approves |
| "The finance team" | Cited as needing audit reports | Contact [Name] to identify the right finance contact |
| "Users" | Requirements doc refers to "user needs" | Identify specific user roles and names from HR/Operations |

---

## Notes

*[Running notes from discovery sessions. Date every note.]*

**[YYYY-MM-DD]:** [Note from session or discovery activity]
