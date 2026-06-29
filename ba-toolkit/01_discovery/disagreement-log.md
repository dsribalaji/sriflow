---
title: Disagreement Log
phase: 01_discovery
status: DRAFT
agent: /discover
verdict: RED
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Disagreement Log — [Project Name]

**Purpose:** Track every case where two or more stakeholders use the same language to mean different things.
**Rule:** Any unresolved disagreement that affects requirements must be resolved before the BRD is written.
**Update:** Add a new row after every stakeholder interview where a divergence is detected.

---

## Active Disagreements (OPEN)

| ID | Phrase / Term | Stakeholder A | A's Meaning | Stakeholder B | B's Meaning | Implications | Status |
|----|--------------|---------------|------------|---------------|------------|-------------|--------|
| DIS-001 | "[Shared phrase]" | [Name, Role] | "[What A means by this]" | [Name, Role] | "[What B means — different product!]" | [Describes different features / architectures / metrics] | 🔴 OPEN |
| DIS-002 | "[Another phrase]" | [Name] | "[Meaning A]" | [Name] | "[Meaning B]" | [Impact on requirements] | 🔴 OPEN |

---

## Example: How a Typical Disagreement is Documented

| ID | Phrase | Stakeholder A | A's Meaning | Stakeholder B | B's Meaning | Implications | Status |
|----|--------|---------------|------------|---------------|------------|-------------|--------|
| DIS-EX1 | "Better visibility into operations" | COO, [Name] | Real-time operational dashboard with < 1hr data lag for daily decision-making | CFO, [Name] | Monthly reconciled board report aligned to the accounting close | These are two completely different products: one requires a real-time data pipeline; the other requires a batch reporting layer. They cannot share the same implementation. | 🔴 OPEN |

---

## Resolution Process

When a disagreement is detected:

1. **Capture both definitions verbatim** in the log above
2. **Run the Diagnostic:** Ask each stakeholder separately: *"When you say [phrase], are you trying to [Option A] or [Option B]?"*
3. **Present both interpretations** to both stakeholders together in a resolution session
4. **Document the decision** — who agreed, what was decided, and what was explicitly de-scoped

---

## Resolved Disagreements (Archive)

| ID | Phrase | Resolution | Decided by | Date |
|----|--------|------------|------------|------|
| DIS-### | "[Phrase]" | "[What was agreed — and what was explicitly excluded]" | [Names of stakeholders who agreed] | [Date] |

---

## Notes

*[Running notes — date each entry]*

**[YYYY-MM-DD]:** [Disagreement observed in session with [Name]]
