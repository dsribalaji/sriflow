# BA Toolkit — Claude Code Setup

## Skills location

```
.claude/skills/
├── discover/SKILL.md     ← /discover
├── elicit/SKILL.md       ← /elicit
├── usecase/SKILL.md      ← /usecase
├── audit-brd/SKILL.md    ← /audit-brd
├── story/SKILL.md        ← /story
├── mockup/SKILL.md       ← /mockup
├── data-map/SKILL.md     ← /data-map
├── nfr/SKILL.md          ← /nfr
└── backlog/SKILL.md      ← /backlog (Jira/Confluence sync)
```

## Commands

Invoke any skill by its slash-command name in the Claude Code interface:

```
/discover        # Phase 1 — map stakeholders and their uncertainties
/elicit          # Phase 2 — design interviews, questionnaires, reverse engineering
/usecase         # Phase 3 — write use cases (SCOPE GATE)
/audit-brd       # Phase 4a — score and audit BRD requirements
/story           # Phase 4b — write INVEST-compliant user stories
/mockup          # Phase 5a — annotate UI screens (Field + Value + Behavior + Rule)
/data-map        # Phase 5b — build feature data dictionaries
/nfr             # Phase 6 — discover non-functional requirements
/backlog         # Optional — sync approved stories to Jira/Confluence
```

## Pipeline

Always run in this order:

```
/discover → /elicit → /usecase → /audit-brd → /story → /mockup → /data-map → /nfr
```

## Project structure

```
your-project/
├── .claude/skills/          ← skill files (this toolkit)
├── 01_discovery/            ← stakeholder register, power-interest map, interview plan
├── 02_elicitation/          ← interview scripts, question sets, session notes, RE reports
├── 03_use-cases/            ← draft/, approved/, uc-inventory.md
├── 04_requirements/
│   ├── brd/                 ← BRD-v1.0.md, open-assumptions-register.md
│   └── backlog/             ← draft/, approved/, client-confirmations/
├── 05_ui-and-data/          ← assets/, prototypes/, data-dicts/
├── 06_architecture/         ← nfr-specification.md, conflict-register.md
└── _admin/                  ← decisions-log.md, glossary.md, CHAT-PROMPTS.md
```

## Key conventions

- **Phase gate rule:** The next phase cannot open until the current phase is GREEN.
- **Scope gate:** No story enters the backlog without a traceable, approved UC.
- **Drift rule:** If a file's YAML verdict doesn't match actual content → re-run the agent.
- **Promotion rule:** `draft/` → `approved/` only when verdict = GREEN and DoR checklist is complete.
- **Traceability rule:** Every artifact must link to the upstream artifact that justified it.

## Ethos

Read `ETHOS.md` for the full philosophy. Short version:
1. Measure doubt, not pages.
2. Name the individual — never "users" or "leadership."
3. Scope before screen — use cases before mockups.
4. User sovereignty — the BA recommends, the human decides.
5. Done = no more questions.
