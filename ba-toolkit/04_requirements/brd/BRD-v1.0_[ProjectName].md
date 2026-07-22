---
title: Business Requirements Document
name: BRD-v1.0_[ProjectName]
version: "1.0"
phase: 04_requirements
status: DRAFT
verdict: RED
agent: /audit-brd
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# BRD — [Project Name]

**Project:** [Project Name]
**Version:** 1.0
**Date:** [YYYY-MM-DD]
**BA:** [Name]
**Status:** [ ] DRAFT [ ] UNDER_REVIEW [ ] APPROVED

---

## Executive Summary

[2–3 sentences: what system, who it serves, why it exists, what business outcome it drives.]

**Example to replace:**
The [System Name] replaces the current [manual/legacy] process for [business domain]. It serves
[Primary Role] (who [primary task]) and [Secondary Role] (who [secondary task]). Success is
measured by: [specific, numeric metric] within [timeframe] of launch.

---

## Business Context

### Problem Statement

**Current state:** [What happens today — specific and quantified if possible.]
- Volume: [How many transactions/events/records per day/month?]
- Time: [How long does the current process take?]
- Error rate: [How often does the current process fail or produce errors?]

**Pain:** [Who is affected, how often, at what cost or consequence.]
**Root cause:** [Why does this problem exist — process gap, missing feature, outdated system?]

**Example to replace:**
Current state: [Role] submit [requests] via email. Triage is manual: a [Role] reads each email
and routes it in [system]. Average routing time: [N hours].
Pain: [Role] complain of response SLA misses ([N] of [total] accounts in [period]).
Root cause: No structured intake — [field] is inconsistent and [critical field] is not captured at submission.

---

### Stakeholders & Their Needs

| Stakeholder | Role | Need | Priority Tier |
|-------------|------|------|---------------|
| [Full Name], [Title] | [Category from discovery] | [Specific need from Stakeholder Register] | Tier 1 |
| [Full Name], [Title] | [Category] | [Specific need] | Tier 2 |

---

### Success Metrics

| Metric | Baseline (Current) | Target | Timeframe | How Measured | Owner |
|--------|-------------------|--------|-----------|--------------|-------|
| [KPI — e.g., Average resolution time] | [Current value — e.g., 4 hours] | [Target — e.g., ≤ 1 hour] | [e.g., 90 days post-launch] | [How — e.g., Ticket analytics dashboard] | [Name] |
| [KPI] | [Baseline] | [Target] | [Timeframe] | [Method] | [Owner] |

---

## Functional Requirements

*Minimum BRD score to build: 7/10 on the Uncertainty Reduction Scale.*
*Every requirement must: name an actor, state a verb-noun action, specify a trigger, and be measurable.*

### Section 1: [Feature Area — e.g., Case Submission]

**Req-1.1:** [Verb Noun — e.g., Submit Support Case] — [Full requirement text. Include: who (role), what (action), when (trigger), constraints (limits, rules, edge cases).]

**Example to replace:**
A [Role] with an active [Account Type] account can submit a new [Entity] by providing: [field 1]
(max [N] chars), [field 2] ([options]), [field 3] (max [N] chars), and up to [N] attachments
([types]; each ≤ [size]MB). Submission triggers an auto-assigned [ID] and confirmation [email/notification]
to the submitter within [N] seconds.

- **Priority:** P0
- **Traces to:** UC-001 (Basic Flow, Steps 1–4)
- **BRD score:** [N]/10
- **Out of scope:** [Any related functionality explicitly excluded from this requirement]

**Req-1.2:** [Verb Noun] — [Requirement text]

- **Priority:** P1
- **Traces to:** UC-001 (AF-1)
- **BRD score:** [N]/10

---

### Section 2: [Feature Area — e.g., Case Management]

**Req-2.1:** [Verb Noun] — [Requirement text]

- **Priority:** P0
- **Traces to:** UC-002
- **BRD score:** [N]/10

---

## Out of Scope

Explicitly list what this project does NOT include. Prevents scope creep.

| Item | Why Excluded | Future Consideration? |
|------|-------------|----------------------|
| [Feature/capability] | [Reason — e.g., "Not requested by stakeholders," "Deferred to Phase 2," "Separate project"] | [Yes — Phase 2 Q3 / No] |
| [Feature/capability] | [Reason] | [Yes / No] |

---

## Dependencies & Assumptions

### Dependencies

| # | Dependency | Owner | Required by |
|---|-----------|-------|------------|
| 1 | [What must exist or be done before this project can complete] | [Team/Person] | [Date or milestone] |

### Assumptions

| ID | Assumption | Owner | Review date | Risk if wrong |
|----|-----------|-------|-------------|---------------|
| A-001 | [What we assume to be true without full confirmation] | [Name] | [Date] | [What breaks if this assumption is wrong] |

---

## Constraints

| Constraint Type | Description |
|----------------|-------------|
| Technical | [e.g., "Must integrate with existing [System] via REST API — no DB access"] |
| Budget | [e.g., "Infrastructure cost cap: $X/month"] |
| Timeline | [e.g., "Must be production-ready by [Date]"] |
| Regulatory | [e.g., "Must comply with [Regulation]"] |

---

## Glossary

| Term | Definition | Source |
|------|-----------|--------|
| [Term] | [Definition — specific to this project] | [Who defined it / which stakeholder] |

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [YYYY-MM-DD] | Initial draft | [Name] |
