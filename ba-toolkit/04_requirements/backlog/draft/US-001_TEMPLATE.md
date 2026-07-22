---
id: US-001
title: "[Verb Noun — e.g., Export Proposal List as CSV]"
status: DRAFT
verdict: RED
priority: P1
agent: /story
version: "1.0"
traces:
  uc: "UC-001"
  brd: "BRD-Req-1.1"
  mockup: "[SCREEN-Name_mockup — added after /mockup runs]"
  data-dict: "[FEAT-Name_datadict — added after /data-map runs]"
  jira_key: "[PROJECT-### — added after /backlog sync]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# US-001 — [Verb Noun]

## Story

**As a** [specific role — not "user"],
**I want** [specific, single action],
**so that** [business value or outcome for this role].

**Why this matters:** [1–2 sentence business context. What breaks without this? What does the business gain?]

---

## INVEST Check

| Letter | ✅ / ❌ | Notes |
|--------|--------|-------|
| Independent | ❌ | [Does it depend on another story? Name it: US-###] |
| Negotiable | ❌ | [Does it over-specify the how? e.g., "use a blue dropdown" should be removed] |
| Valuable | ❌ | [Does it deliver value to a user or business, not just a technical task?] |
| Estimable | ❌ | [Can a developer size it in 15 seconds? If not — what's still ambiguous?] |
| Small | ❌ | [Does it fit in a sprint? If "and" appears in the story — split it] |
| Testable | ❌ | [Can QA write a test? Are there measurable thresholds in the ACs?] |

**Result:** 🔴 RED — [Which letters failed and why. Fix before moving to sprint.]

---

## Acceptance Criteria

### AC-1 — [Happy Path Name: e.g., Successful CSV Export]

```
Given [context — who, in what state]
When  [specific action or trigger]
Then  [observable, measurable result — specify exact values, file names, timeouts, etc.]
```

**Example:**
```
Given a Sales Manager with at least one proposal in their owned list
When  they click "Export CSV" in the proposal list toolbar
Then  a file named "proposals_[YYYY-MM-DD].csv" downloads within 5 seconds,
      containing only their owned proposals, with all visible columns included
```

### AC-2 — [Boundary or Variation: e.g., Export with No Results]

```
Given [context — e.g., user has zero owned proposals]
When  [action]
Then  [system behavior — e.g., "Export CSV" button is disabled with tooltip: "No proposals to export"]
```

### AC-3 — [Error / Exception: traces to UC EF-#]

```
Given [context]
When  [triggering condition — invalid input, timeout, server error]
Then  [system behavior — error message, blocked action, preserved state]
```

**Error message displayed:** "[Exact text — must match the UC exception flow]"

---

## Definition of Ready (DoR) Checklist

- [ ] Story is Independent — can be built without another story being done first
- [ ] INVEST passes all 6 letters (all GREEN above)
- [ ] All ACs are in GWT format
- [ ] Every AC has a measurable, observable outcome (no adjectives without thresholds)
- [ ] All dependencies declared explicitly (no hidden "Given the user is logged in..." assumptions)
- [ ] Traces to an approved UC (`03_use-cases/approved/UC-001.md`) ✅
- [ ] Mockup linked (`05_ui-and-data/prototypes/SCREEN-[Name]_mockup.md`) — ⏳ Pending /mockup
- [ ] Data dictionary linked (`05_ui-and-data/data-dicts/FEAT-[Name]_datadict.md`) — ⏳ Pending /data-map

**DoR status:** [ ] NOT READY — [What's missing] [ ] READY

---

## Dependencies

| Depends on | Type | Why | Impact if not resolved |
|-----------|------|-----|----------------------|
| US-[###] | Story | [Why this must be done first] | [What breaks in this story without it] |
| [System/Integration] | Technical | [What must exist] | [Impact] |

---

## Open Questions

| ID | Question | Owner | Target date | Status |
|----|----------|-------|-------------|--------|
| Q-001 | [Question that blocks sprint readiness] | [Name] | [Date] | 🔴 OPEN |

---

## SME Confirmations

| Confirmation | Confirmed by | Date |
|-------------|--------------|------|
| [What specific business rule or behavior was confirmed] | [Name, Title] | [Date] |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial draft from UC-001 |
| 2.0 | [Date] | [e.g., "INVEST review — split from US-001; added boundary ACs"] |
