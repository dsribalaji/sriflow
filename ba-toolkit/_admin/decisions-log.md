---
title: Decisions Log
phase: _admin
status: ACTIVE
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Decisions Log — [Project Name]

**Purpose:** Immutable record of every significant BA decision made during the project.
**Rule:** Any decision that affects scope, requirements, or stakeholder expectations must be logged here.
**Format:** Newest entries at the top. Never delete or overwrite old entries — append only.

---

## Decision Log

### DEC-001 — [Decision Title]
**Date:** [YYYY-MM-DD]
**Phase:** [01_discovery / 02_elicitation / 03_use-cases / 04_requirements / 05_ui-and-data / 06_architecture]
**Decision:** [What was decided — specific and unambiguous]
**Context:** [Why this decision was needed — what triggered it]
**Options considered:**
- Option A: [Description] — Pros: [X]. Cons: [Y].
- Option B: [Description] — Pros: [X]. Cons: [Y].
**Rationale:** [Why this option was chosen over the alternatives]
**Decided by:** [Name(s) and role(s)]
**Impact:** [What changes as a result of this decision — which artifacts are affected]
**Review date:** [Date when this decision should be re-evaluated, if applicable]

---

### DEC-002 — [Decision Title]
**Date:** [YYYY-MM-DD]
**Phase:** [Phase]
**Decision:** [What was decided]
**Context:** [Why]
**Options considered:**
- Option A: [Description]
- Option B: [Description]
**Rationale:** [Why]
**Decided by:** [Names]
**Impact:** [Artifacts affected]
**Review date:** [Date or "No review needed"]

---

## Decision Categories

Use these tags to classify decisions for easier searching:

| Tag | Meaning |
|-----|---------|
| `[SCOPE]` | A feature or capability was added to or removed from scope |
| `[STAKEHOLDER]` | A stakeholder was added, removed, or their tier changed |
| `[REQUIREMENT]` | A BRD requirement was rewritten, split, or deprecated |
| `[UC]` | A Use Case was created, modified, merged, or deprecated |
| `[DESIGN]` | A UI/UX decision was made |
| `[DATA]` | A data model decision was made |
| `[NFR]` | An NFR target was set, revised, or a conflict was resolved |
| `[GOVERNANCE]` | A process or standards decision |
| `[JIRA-SYNC]` | A backlog sync event (stories filed to Jira) |

---

## Notes

*This log is the project's institutional memory. Future team members, auditors, and the next BA on this project will read it to understand why decisions were made, not just what was decided.*
