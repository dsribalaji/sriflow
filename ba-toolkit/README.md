# BA Toolkit — AI-Driven Requirements Engineering Pipeline

> "A single BA with AI can now produce what used to take a team of three analysts and a requirements workshop of twelve."

**Version:** 2.0.0 · **Compatible with:** GitHub Copilot Chat · Claude Code · Any AI coding assistant  
**License:** MIT

---

## What This Is

BA Toolkit is a **structured requirements engineering pipeline** encoded as slash-command skills for AI coding assistants. It is not a document generator — it is a methodology that enforces the right order of BA work, the right rigor at each phase, and the right traceability between every artifact.

Eight specialist skills cover the full lifecycle from zero stakeholder knowledge to a sprint-ready, fully-traced backlog:

```
/discover → /elicit → /usecase → /audit-brd → /story → /mockup → /data-map → /nfr
```

Each skill is a gated phase. The output of each phase is the required input for the next.

---

## Quick Start

### GitHub Copilot Chat
Skills are installed under `.copilot/skills/`. Invoke with:
```
@workspace /discover
@workspace /elicit
@workspace /usecase
```

### Claude Code
Skills are installed under `.claude/skills/`. Invoke with:
```
/discover
/elicit
/usecase
```

### First run — always start here
```
/discover    ← Map who holds uncertainty. Name every stakeholder.
```

---

## The Pipeline

```
Phase 1         Phase 2         Phase 3          Phase 4             Phase 5         Phase 6
DISCOVERY       ELICITATION     USE CASES        REQUIREMENTS        UI & DATA       ARCHITECTURE
────────────────────────────────────────────────────────────────────────────────────────────────
/discover  →   /elicit    →   /usecase    →   /audit-brd      →   /mockup    →   /nfr
                                          →   /story          →   /data-map
────────────────────────────────────────────────────────────────────────────────────────────────
"Who holds     "How do I       "What must       "Are these           "Is every      "What quality
uncertainty?"  get the truth   the system do,   requirements         screen         constraints
               out?"           for whom?"       sprint-ready?"       element        drive
                                                                     specified?"    architecture?"
```

### Phase gates — each phase unlocks the next

| Gate | Rule |
|------|------|
| **Discovery → Elicitation** | Every Tier 1 stakeholder named with top uncertainty |
| **Elicitation → Use Cases** | Tier 1 clarity checks scored ≥ 8/10 |
| **Use Cases → Requirements** | All UCs GREEN (exception flows complete) |
| **Requirements → UI & Data** | All stories pass INVEST + GWT; BRD scores ≥ 7 |
| **UI & Data → Architecture** | Every screen field has: type, validation, behavior, rule |
| **Architecture → Sprint** | NFRs are numeric, traced to business reasons, conflict-free |

---

## The 8 Skills

### Phase 1 — Discovery

| Skill | What it does |
|-------|-------------|
| `/discover` | Start here. Maps every stakeholder by name, power, interest, and top uncertainty. Runs the Disagreement Diagnostic on shared vague phrases. Produces: Stakeholder Register, Power/Interest Map, Tier 1/2/3 Priority ranking, Interview Plan. |

### Phase 2 — Elicitation

| Skill | What it does |
|-------|-------------|
| `/elicit` | Designs interview scripts, question sets, and questionnaires. Supports Black Box reverse engineering of existing systems/prototypes. Never generates questions without confirming the discovery goal and stakeholder tier first. |

### Phase 3 — Use Cases

| Skill | What it does |
|-------|-------------|
| `/usecase` | Converts elicitation findings into formal Use Cases at the correct Cockburn goal level (Sea Level primary). Covers basic flow, alternate flows, exception flows, pre/post-conditions. The SCOPE GATE — no stories without approved UCs. |

### Phase 4 — Requirements

| Skill | What it does |
|-------|-------------|
| `/audit-brd` | Scores every requirement on the Uncertainty Reduction Scale (0–10). Rewrites RED requirements. Minimum acceptable score before build: 7. |
| `/story` | Turns approved Use Cases into INVEST-compliant User Stories with Given-When-Then acceptance criteria. Enforces the Done = No More Questions standard. |

### Phase 5 — UI & Data

| Skill | What it does |
|-------|-------------|
| `/mockup` | Annotates UI screens against the Field + Value + Behavior + Rule standard. Every element must have: data type, validation, behavior, business rule. Zero open questions left for the developer. |
| `/data-map` | Maps approved stories + mockups to a Feature Data Dictionary — field name, data type, validation, business rule, PII flag. The technical handoff artifact. |

### Phase 6 — Architecture

| Skill | What it does |
|-------|-------------|
| `/nfr` | Discovers Non-Functional Requirements across performance, availability, security, scalability, compliance, and cost. Every NFR must be numeric and traced to a business reason. Surfaces conflicts and architecture implications. |

---

## Folder Structure

```
your-project/
├── .copilot/skills/         ← GitHub Copilot skill files
├── .claude/skills/          ← Claude Code skill files
│
├── 01_discovery/            ← stakeholder-register, power-interest-map, uncertainty-priority
├── 02_elicitation/          ← interview-scripts/, question-sets/, session-notes/, reverse-engineering/
├── 03_use-cases/            ← draft/, approved/
│   └── uc-inventory.md      ← master scoreboard of all UCs
├── 04_requirements/
│   ├── brd/                 ← BRD-v1.0.md, open-assumptions-register.md
│   └── backlog/             ← draft/, approved/, client-confirmations/
├── 05_ui-and-data/
│   ├── assets/              ← figma-links.md, design-system-refs.md
│   ├── prototypes/          ← SCREEN-[Name]_mockup.md per screen
│   └── data-dicts/          ← FEAT-[Name]_datadict.md per feature
├── 06_architecture/         ← nfr-specification.md, conflict-register.md, architecture-implications.md
│
└── _admin/                  ← decisions-log.md, glossary.md, README.md
```

---

## Naming Conventions

| Artifact type | Pattern | Example |
|---------------|---------|---------|
| Interview script | `INT-001_[Role]_[YYYY-MM-DD].md` | `INT-001_ProductOwner_2026-07-01.md` |
| Question set | `QS-001_[Topic].md` | `QS-001_UserOnboarding.md` |
| Session notes | `NOTES-001_[Role]_[YYYY-MM-DD].md` | `NOTES-001_CTO_2026-07-02.md` |
| Reverse engineering | `RE-001_[SystemName]_blackbox.md` | `RE-001_LegacyCRM_blackbox.md` |
| Use Case | `UC-001_[VerbNoun].md` | `UC-001_SubmitExpenseReport.md` |
| BRD | `BRD-v1.0_[ProjectName].md` | `BRD-v1.0_ExpensePortal.md` |
| User Story | `US-001_[VerbNoun].md` | `US-001_CreateExpenseReport.md` |
| Screen mockup | `SCREEN-[Name]_mockup.md` | `SCREEN-ExpenseForm_mockup.md` |
| Data dictionary | `FEAT-[Name]_datadict.md` | `FEAT-ExpenseSubmission_datadict.md` |

---

## Governance

Every artifact carries a YAML status header:

```yaml
---
status: DRAFT | UNDER_REVIEW | APPROVED | DEPRECATED
verdict: GREEN | RED | CONDITIONALLY_READY
agent: /discover | /elicit | /usecase | /audit-brd | /story | /mockup | /data-map | /nfr
traces: [UC-001, US-001, BRD-Req-1.1]
---
```

**The drift rule:** If the verdict in the header doesn't match the agent's actual output — the file has been hand-edited without re-running the agent. Re-run before it returns to `approved/`.

**The promotion rule:** A file moves from `draft/` to `approved/` only when its verdict is GREEN and its Definition of Ready checklist is fully checked.

---

## Traceability Chain

Every downstream artifact must link to the artifact that justified it:

```
Stakeholder uncertainty
  → BRD requirement (Req-1.1)
    → Use Case (UC-004)
      → User Story (US-004-03)
        → Screen mockup (SCREEN-CreateProposal)
          → Data dictionary (FEAT-ProposalSubmission_datadict)
```

A missing link is a blocking open item. A story without a UC link is out-of-scope until proven otherwise.

---

## Philosophy

Read `ETHOS.md` for the full principles. The short version:

1. **Measure doubt, not pages** — the only metric is: did uncertainty go down?
2. **Name the individual** — "users" is RED. Name the person, their role, their top uncertainty.
3. **Scope before screen** — Use Cases before mockups. Every time.
4. **User sovereignty** — the BA recommends; the human decides and confirms.
5. **Done = no more questions** — a requirement is done when a developer can build it without asking.

---

## CHAT-PROMPTS.md

See `_admin/CHAT-PROMPTS.md` for the exact prompt sequences used to run each skill, copy-pasteable
for your own project.
