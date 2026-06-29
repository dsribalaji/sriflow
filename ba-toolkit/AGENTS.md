# BA Toolkit — AI Requirements Engineering Pipeline

BA Toolkit is a collection of SKILL.md files that give AI agents structured roles for
business analysis. Each skill is a specialist: stakeholder mapper, elicitation designer,
use case author, BRD auditor, story writer, mockup annotator, data mapper, and NFR discoverer.

## Available Skills

Skills live in `.copilot/skills/` (GitHub Copilot) or `.claude/skills/` (Claude Code).
Invoke them by name.

### Phase 1 — Discovery

| Skill | What it does |
|-------|-------------|
| `/discover` | Start here. Maps every named stakeholder by power, interest, and top uncertainty. Runs the Disagreement Diagnostic on shared vague phrases. Produces the Stakeholder Register, Power/Interest Map, and Interview Plan. |

### Phase 2 — Elicitation

| Skill | What it does |
|-------|-------------|
| `/elicit` | Plans and designs stakeholder interviews, questionnaires, and Black Box reverse engineering sessions. Modes: Generate, Review, Script, Reverse Engineer, Simulate. Never generates questions without confirming the discovery goal first. |

### Phase 3 — Use Cases ← SCOPE GATE

| Skill | What it does |
|-------|-------------|
| `/usecase` | Converts elicitation findings into formal Use Cases (basic flow, alternate flows, exception flows). Enforces Cockburn Sea Level goal writing. The scope gate — no User Story enters the backlog without a traceable UC in `approved/`. |

### Phase 4 — Requirements

| Skill | What it does |
|-------|-------------|
| `/audit-brd` | Scores every BRD requirement on the Uncertainty Reduction Scale (0–10). Diagnoses Type 1/2/3 uncertainty. Rewrites RED requirements. Minimum score to build: 7. |
| `/story` | Turns approved Use Cases into INVEST-compliant User Stories with Given-When-Then acceptance criteria. Enforces Done = No More Questions. Runs the 15-second estimate test. |

### Phase 5 — UI & Data

| Skill | What it does |
|-------|-------------|
| `/mockup` | Annotates UI screens using the Field + Value + Behavior + Rule standard. Every element must answer: data type, validation, behavior, business rule. No open questions left for the developer. |
| `/data-map` | Maps approved stories + mockup specs to a Feature Data Dictionary — field name, type, validation, business rule, PII flag. The technical handoff artifact bridging requirements to database design. |

### Phase 6 — Architecture

| Skill | What it does |
|-------|-------------|
| `/nfr` | Discovers Non-Functional Requirements across performance, availability, security, scalability, compliance, and cost. All NFRs must be numeric and traced to a business reason. Surfaces conflicts and architecture implications. Runs after BRD and stakeholder discovery — NFRs are derived, not invented. |

---

## Pipeline Sequence

```
/discover → /elicit → /usecase → /audit-brd → /story → /mockup → /data-map → /nfr
```

Run skills in this order. Each phase gate must pass before the next phase opens.

| Phase Gate | Rule |
|------------|------|
| Discovery → Elicitation | Every Tier 1 stakeholder named with top uncertainty |
| Elicitation → Use Cases | Tier 1 clarity checks ≥ 8/10 |
| Use Cases → Requirements | All primary UCs GREEN (exception flows specified) |
| Requirements → UI & Data | Stories pass INVEST + GWT; BRD scores ≥ 7 |
| UI & Data → Architecture | Every field has type, validation, behavior, rule |
| Architecture → Sprint | NFRs numeric, business-traced, conflicts resolved |

---

## Artifact Governance

Every artifact header:

```yaml
---
status: DRAFT | UNDER_REVIEW | APPROVED | DEPRECATED
verdict: GREEN | RED | CONDITIONALLY_READY
agent: /discover | /elicit | /usecase | /audit-brd | /story | /mockup | /data-map | /nfr
traces: [BRD-Req-1.1, UC-004, US-004-03]
---
```

**Drift rule:** If the verdict doesn't match the agent's actual output, the file was hand-edited.
Re-run the agent before promoting to `approved/`.

---

## Installation

### GitHub Copilot
```bash
# Skills are already in .copilot/skills/
# Invoke from GitHub Copilot Chat:
@workspace /discover
```

### Claude Code
```bash
# Skills are already in .claude/skills/
# Invoke from Claude Code:
/discover
```

### Copy-Paste Setup (any AI assistant)
Paste the contents of any `SKILL.md` into your AI assistant's system prompt or custom instructions.

---

## Key Conventions

- **Folder = phase. File = artifact. Name = findable without opening it.**
- SKILL.md files contain the full agent prompt — skills are self-contained and reusable across projects.
- Naming uses type-prefix + sequence + topic + date for elicitation artifacts (sortable, identifiable).
- `draft/` = work in progress. `approved/` = GREEN verdict + Definition of Ready complete.
- The UC Inventory (`03_use-cases/uc-inventory.md`) is the master scoreboard — update it after every UC change.
- The Disagreement Log and Decisions Log are living documents — update them throughout the project.
