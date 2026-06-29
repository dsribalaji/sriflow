---
name: audit-brd
version: 2.0.0
phase: "04a — BRD Uncertainty Audit"
description: >
  BRD Uncertainty Audit — Phase 4a of the BA pipeline. Scores every BRD requirement on the
  Uncertainty Reduction Scale (0–10). Diagnoses Type 1/2/3 uncertainty. Rewrites RED requirements
  (score < 7) to GREEN standard. Minimum acceptable score before starting to build: 7.
  Run after Use Cases are approved. Run before User Stories are written.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - review my BRD
  - is this requirement clear
  - audit requirements
  - score this BRD
  - what's missing from this spec
  - can we start building from this
  - /audit-brd
prerequisite: /usecase — Approved UCs must exist. BRD requirements should trace to confirmed UCs.
next-skill: /story
outputs:
  - 04_requirements/brd/BRD-v1.0_[ProjectName].md
  - 04_requirements/brd/open-assumptions-register.md
gate:
  rule: All BRD requirements score ≥ 7 on Uncertainty Reduction Scale before stories are written
  signal: DONE when every requirement in scope has a GREEN score and all open assumptions are assigned
---

# /audit-brd — BRD Uncertainty Audit

## When to invoke this skill

Phase 4a of the BA pipeline. Use when reviewing, writing, auditing, or improving a Business
Requirements Document. Triggers on any request to review a BRD, assess requirements quality,
score a requirement, or check if requirements are ready for sprint.

**Prerequisite:** Approved Use Cases from `/usecase` should exist. The BRD requirements should
trace back to confirmed stakeholder needs.

## Core Principle: Measure Doubt, Not Pages

> "Your job is not to write documents. It's to eliminate what stakeholders don't know."

A BRD is **good** when someone now knows something they didn't know before, and can **decide** something they couldn't decide before. The only valid test: **did uncertainty go down?**

**Minimum score to build:** 7 out of 10 on the Uncertainty Reduction Scale.

---

## Step 1 — Diagnose Uncertainty Type

Every unclear requirement fails in one of three ways. Identify the type before rewriting.

| Type | The Question It Fails | Failure Signal |
|------|-----------------------|----------------|
| **Type 1 — Business Uncertainty** | *What problem are we actually solving?* | Stakeholders describe the solution before the problem. Agreement in the room is actually three people hearing three different things. |
| **Type 2 — Solution Uncertainty** | *How should we solve it?* | The problem is agreed but the approach is unresolved — or locked in by momentum, not analysis. |
| **Type 3 — Implementation Uncertainty** | *Can we actually build this?* | Estimates come with "it depends." Developers need to "research it first." Data assumptions are untested. |

**They are sequential.** Resolve Type 1 first. Then Type 2. Then Type 3.

---

## Step 2 — The Uncertainty Reduction Scale (0–10)

Score every requirement. This is the primary metric.

| Score | Meaning | Build-readiness |
|-------|---------|-----------------|
| **0–2** | Vague intent; near-total uncertainty | ❌ Do not build |
| **3–4** | Direction clear, but critical decisions unresolved | ❌ Do not build |
| **5–6** | Most gaps named; some still open | ⚠️ Build only if gaps are documented risk |
| **7–8** | Developer could build with minimal questions | ✅ Acceptable for sprint |
| **9–10** | Developer could build tomorrow, zero blockers | ✅ Ready |

### Scoring Calibration Examples

| Statement | Score | Why |
|-----------|-------|-----|
| "The system should be user-friendly." | ~1 | No behavior, no metric, no user defined |
| "The dashboard will show key metrics." | ~3 | Which metrics? For whom? At what refresh rate? |
| "Users can export data." | ~4 | What data? Which format? Triggered how? By whom? |
| "Managers can export proposal data as CSV, limited to records they own, within a 5MB file size cap." | ~8 | Role, format, scope, and constraint are all explicit |
| "A Manager can export proposals they own as CSV. The export is triggered from the list view toolbar. All columns are included. File size is capped at 5MB; if exceeded, the system emails the file to the user's registered address within 60 seconds." | ~10 | Actor, trigger, scope, constraint, exception behavior — all specified |

---

## Step 3 — The Requirement Audit Checklist

Run every requirement through this checklist before scoring:

| Check | Question | RED flag |
|-------|----------|----------|
| **Actor named?** | Is the requirement attributed to a specific role? | "Users," "the system," "stakeholders" without a role |
| **Verb-Noun structure?** | Does the requirement state an action (verb) on a thing (noun)? | Noun-only statements: "A dashboard," "A report" |
| **Trigger specified?** | What event causes this requirement to activate? | "The system should..." with no trigger condition |
| **Scope bounded?** | Is in-scope explicitly stated and out-of-scope explicitly excluded? | "And related features" / "etc." / "and other items" |
| **Measurable?** | Is there a number, time, percentage, count, or specific behavior? | "Fast," "accurate," "easy," "robust" without thresholds |
| **Traceable?** | Does this requirement trace to a UC and/or stakeholder uncertainty? | No trace link — requirement appeared from nowhere |
| **Testable?** | Could QA write a pass/fail test for this? | Cannot be verified by observation or measurement |
| **Conflict-free?** | Does this contradict another requirement in the BRD? | Implicit contradictions between requirements in different sections |

---

## Step 4 — BRD Template

Produce or audit the BRD using this structure:

```markdown
---
title: Business Requirements Document
name: BRD-v1.0_[ProjectName]
version: 1.0
phase: 04_requirements
status: DRAFT | UNDER_REVIEW | APPROVED
verdict: RED | CONDITIONALLY_READY | GREEN
agent: /audit-brd
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# BRD — [Project Name]

**Project:** [Project Name]
**Version:** 1.0
**Status:** DRAFT

---

## Executive Summary

[2–3 sentences: what system, who it serves, why it exists, and what business outcome it drives.]

**Example:**
The Customer Portal replaces the current email-based support process for accounts with more than
50 users. It serves Support Managers (who triage cases) and Enterprise Clients (who submit and
track cases). Success is measured by: ≥ 30% reduction in average case resolution time within 90
days of launch.

---

## Business Context

### Problem Statement

**Current state:** [What happens today, specifically. Quantify if possible.]
**Pain:** [Who is affected, how often, at what cost or consequence.]
**Root cause:** [Why this problem exists — process gap, missing feature, outdated system.]

**Example:**
Current state: Support tickets are submitted via email. Triage is manual; a support manager
reads each email and routes it to the correct team in Slack. Average routing time: 4 hours.
Pain: Enterprise clients complain of response time SLA misses (3 of 5 accounts in Q1).
Root cause: No structured intake — email subject lines are inconsistent and priority is not captured at submission.

### Stakeholders & Their Needs

| Stakeholder | Need | Priority |
|-------------|------|----------|
| [Role, Name] | [Specific need from the Stakeholder Register] | Tier 1 / 2 / 3 |

### Success Metrics

| Metric | Baseline (Current) | Target | How Measured | Owner |
|--------|-------------------|--------|--------------|-------|
| [KPI] | [Current value] | [Target value] | [Measurement method] | [Name] |

---

## Functional Requirements

### Section 1: [Feature Area — e.g., Case Submission]

**Req-1.1:** Submit Support Case — A Support Contact with an active Enterprise account can submit
a new support case by providing: case title (max 120 chars), priority level (Critical / High / Medium / Low),
description (max 2,000 chars), and up to 3 attachments (PDF, DOCX, PNG; each ≤ 10MB). Submission
triggers an auto-assigned case number and confirmation email to the submitter within 60 seconds.

- **Priority:** P0
- **Traces to:** UC-001 (Basic Flow, Steps 1–4)
- **BRD score:** 9/10
- **Uncertainty type:** N/A (fully specified)

**Req-1.2:** [Verb-Noun] — [Full requirement text]

- **Priority:** P0 / P1 / P2
- **Traces to:** UC-###
- **BRD score:** [0–10]
- **Uncertainty type:** Type 1 / 2 / 3 (if score < 7)

---

## Out of Scope

Explicitly list what this project does NOT include to prevent scope creep:

- [Feature/capability explicitly excluded] — *Why: [reason — deferred to Phase 2 / not requested by stakeholders / separate project]*
- [Feature/capability explicitly excluded]

---

## Open Assumptions Register

| ID | Assumption | Owner | Review date | Risk if wrong |
|----|-----------|-------|-------------|---------------|
| A-001 | [What we are assuming to be true without full confirmation] | [Name] | [Date] | [What breaks if this assumption is wrong] |
```

---

## Step 5 — Audit Report Output

After auditing an existing BRD, produce a structured audit report:

```markdown
# BRD Audit Report — [Project Name]
**Date:** [YYYY-MM-DD]
**Auditor:** BA Toolkit /audit-brd v2.0

## Summary

| Metric | Count |
|--------|-------|
| Total requirements audited | [N] |
| Score ≥ 7 (GREEN — build-ready) | [N] |
| Score 5–6 (AMBER — documented risk) | [N] |
| Score < 5 (RED — do not build) | [N] |

## Red Requirements (Must Rewrite Before Sprint)

### Req-[###]: [Original text]
- **Score:** [X/10]
- **Uncertainty type:** Type [1/2/3]
- **Failures:** [List which checks failed]
- **Rewritten version:** [Full rewrite that would score ≥ 8]

## Assumptions Added to Open Assumptions Register

| ID | Assumption surfaced during audit | Owner needed |
|----|----------------------------------|-------------|
| A-001 | [New assumption] | [Role to assign] |

## Next Actions

- [ ] Rewrite RED requirements listed above
- [ ] Resolve Open Assumptions (assign owners, set review dates)
- [ ] Re-run /audit-brd after rewrites
- [ ] Promote to APPROVED when all requirements score ≥ 7
```

---

## Phase Gate

**DONE signal:** Every BRD requirement scores ≥ 7. All open assumptions have assigned owners and review dates. BRD status is APPROVED.

**Next skill:** `/story` — write INVEST-compliant User Stories from the approved BRD requirements and UCs.
