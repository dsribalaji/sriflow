---
title: Black Box Reverse Engineering Report
id: RE-001
phase: 02_elicitation
status: DRAFT
agent: /elicit
verdict: RED
system-analyzed: "[System Name / Prototype Name]"
source-artifact: "[File name, URL, or description of what was analyzed]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# RE-001 — [System Name] Black Box Analysis

**System analyzed:** [Name of system, module, or prototype]
**Source artifact:** [e.g., "two HTML prototype files" / "legacy application screenshots" / "vendor demo recording"]
**Method:** Black Box — functional behavior inferred from UI observation, not source code access
**Status:** DRAFT (pending SME confirmation)

---

## Entities Identified

*What "things" does this system manage? List every data entity visible in the UI.*

| Entity | Description | Observed attributes |
|--------|-------------|-------------------|
| [Entity Name] | [What it represents in the business domain] | [Fields/columns visible in the UI] |
| [Entity Name] | [Description] | [Attributes] |

---

## Actions / CRUD Operations

*What can users do to each entity?*

| Entity | Create | Read | Update | Delete | Additional actions | Notes |
|--------|--------|------|--------|--------|-------------------|-------|
| [Entity] | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | [Status change / Export / Bulk] | [Constraints or conditions observed] |

---

## Confirmed Business Rules

*Rules that are clearly implemented in the UI (visible validation, error messages, disabled states).*

| ID | Rule | Evidence in UI |
|----|------|----------------|
| BR-001 | [Business rule statement] | [Where/how it appears in the UI — e.g., "Delete button is disabled for Approved records"] |
| BR-002 | [Rule] | [Evidence] |

---

## Inferred Business Rules (Needs SME Confirmation)

*Rules inferred from UI behavior but not explicitly stated. Mark confidence level.*

| ID | Inferred Rule | Basis for Inference | Confidence | SME Question |
|----|--------------|---------------------|------------|--------------|
| BR-INF-001 | [Inferred rule — e.g., "Only Admin role can access the Delete action"] | [What was observed — e.g., "Delete only appeared after switching to admin demo account"] | High / Medium / Low | "[Exact question: Is it correct that only Admins can delete [Entity]? If not, what roles can?]" |
| BR-INF-002 | [Inferred rule] | [Basis] | [Confidence] | "[Question]" |

---

## Lifecycle / Status Machine

*If the entity has a status or lifecycle — map the states and transitions.*

```
States observed:
[State A] → [State B] → [State C]
                      ↘ [State D — terminal/cancelled]

Transitions:
[State A] → [State B]: Triggered by [action observed]
[State B] → [State C]: Triggered by [action]
[State B] → [State D]: Triggered by [action]
```

*Inferred/unobserved transitions (mark as inferred):*
- [State B] → [State A]: Inferred reversal — not observed, may not be possible. **Needs confirmation.**

---

## Navigation & Flows

*How do screens connect? What are the key user flows?*

| Flow | Start | Steps | End |
|------|-------|-------|-----|
| [Flow name — e.g., "Create entity"] | [Entry point] | [Step 1 → 2 → 3] | [Outcome / screen] |
| [Flow name] | [Entry] | [Steps] | [Outcome] |

---

## Roles / Permissions (Observed)

| Role | Observed capabilities | Notes |
|------|-----------------------|-------|
| [Role name — e.g., Admin] | [What they can see and do] | [Source: observed in demo / stated by SME] |
| [Role name] | [Capabilities] | [Notes] |

---

## Ambiguities and Gaps

*Everything the UI does NOT reveal. These become questions for the SME.*

| ID | What Is Unclear | Why It Matters | SME Question |
|----|----------------|----------------|--------------|
| GAP-001 | [What is not visible or clear from the UI alone] | [What requirement decision this affects] | "[Exact question to ask the SME]" |
| GAP-002 | [Ambiguity] | [Impact] | "[Question]" |

---

## SME Confirmation Log

*Populated after SME review session.*

| Question ID | Question | Answer | Confirmed by | Date |
|-------------|----------|--------|--------------|------|
| GAP-001 | "[Question]" | "[Answer]" | [Name, Title] | [Date] |
| BR-INF-001 | "[Confirmation question]" | "[Answer]" | [Name] | [Date] |

---

## Summary of Confirmed Requirements

*After SME confirmation, produce a clean list of confirmed requirements from this RE pass.*

| ID | Requirement | Source | Priority |
|----|-------------|--------|----------|
| RE-REQ-001 | [Confirmed requirement statement — verb-noun] | RE-001 + [SME Name] | P0 / P1 / P2 |

---

## Status

- [ ] Initial black box analysis complete
- [ ] SME question list finalized
- [ ] SME review session conducted
- [ ] All inferred rules confirmed or corrected
- [ ] All ambiguities resolved
- [ ] Confirmed requirements list produced

**Verdict:** 🔴 RED (pending SME confirmation) / 🟢 GREEN (SME-confirmed)

**Next step:** Use confirmed requirements to populate `/usecase` for UC drafting.
