---
name: sriflow-think
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-plan, sriflow-plan-review
description: "Ideation & stakeholder discovery. BA Phase 1-6: from raw idea to stakeholder map, uncertainty register, interview plan. Not for: full planning — use sriflow-plan. Not for: implementation — use sriflow-build."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - AskUserQuestion
triggers:
  - I have an idea
  - think through this
  - start a new product
  - ideate
  - help me think
  - who are the stakeholders
  - /sriflow-think
next-skill: /sriflow-plan
outputs:
  - THINK_OUTPUT.md
  - 01_discovery/stakeholder-register.md
  - 01_discovery/uncertainty-map.md
  - 01_discovery/disagreement-log.md
  - 01_discovery/interview-plan.md
  - 01_discovery/competitive-landscape.md
gate:
  rule: Tier 1 stakeholders named with top uncertainty resolved
  signal: DONE when all Tier 1 uncertainties have clarity check ≥ 8/10
---

## Pipeline backtracking

Call `/sriflow-think` again to refresh THINK_OUTPUT.md. Choose `update mode` to keep answers already recorded. A fresh start wipes every artifact and runs the whole pass from the top.

# /sriflow-think — Ideation

## When to invoke

Runs as Phase 1 of the sriflow pipeline. Start it when a project is greenfield with nothing built yet, when a requirement is pinned to a group label ("the business," "users," "leadership"), when stakeholders are in conflict, or ahead of any elicitation session. Launch it proactively before a requirements workshop begins.

## Reference files

| Phase | File | What it covers |
|-------|------|---------------|
| **Preamble** | `reference/01-preamble.md` | Shell preamble, PATH setup, plan mode, memory, git state |
| **Questions** | `reference/02-questions.md` | D-numbered decision brief format |
| **Scale** | `reference/03-scale-detection.md` | Tier detection with effort estimation cross-check |
| **Context** | `reference/04-step1-context.md` | Q2-Q4 project phase + docs + prior discovery |
| **Market** | `reference/04b-market-research.md` | Competitive landscape, 3 searches max |
| **Stakeholders** | `reference/05-step2-identify.md` | 6-category stakeholder discovery |
| **Power/Interest** | `reference/06-step3-map.md` | Power + interest + uncertainty mapping |
| **Register** | `reference/07-step4-register.md` | Full stakeholder register + Red/Green classification |
| **Uncertainty** | `reference/07b-uncertainty-priority.md` | Tier 1/2/3 uncertainty prioritization |
| **Disagreement** | `reference/08-step6-disagreement.md` | Vague phrase detection, diagnostic questions |
| **Interview** | `reference/09-step7-interview.md` | 5-part interview structure |
| **Output** | `reference/10-output-templates.md` | Small/Medium/Enterprise THINK_OUTPUT.md templates |
| **Gates** | `reference/11-gates-anti-patterns.md` | Phase gate, expand handler, clarity check |

### Pattern integration

| Pattern | sriflow integration |
|---------|---------------------|
| Forcing questions (startup diagnostic) | `reference/patterns/forcing-questions.md` |
| 10-star thinking (what's the 10x version?) | Added to Q3 in Think workflow |
| Inversion: "what would make this fail?" | Added to uncertainty mapping |
| Brownfield project extraction | `reference/patterns/brownfield-extraction.md` |
| Existing codebase → spec extraction | Context step: detect brownfield, run extraction |
| Work breakdown: deps → phases → risks | `reference/patterns/planner.md` |
| "Compile, enforce, prove, evolve" framework | `reference/patterns/governance.md` |
| Decision documentation template | Uncertainty resolution → ADR entry |

## Workflow

1. **Preamble** — read `reference/01-preamble.md`
2. **Questions format** — read `reference/02-questions.md`
3. **Scale detection** — read `reference/03-scale-detection.md`; effort estimation cross-check
4. **Step 1 — Project context** — read `reference/04-step1-context.md` (Q2-Q4)
5. **Step 1b — Market research** — read `reference/04b-market-research.md` (3 searches max)
6. **Step 2 — Identify stakeholders** — read `reference/05-step2-identify.md`
7. **Step 3 — Map power/interest/uncertainty** — read `reference/06-step3-map.md`
8. **Step 4 — Stakeholder register** — read `reference/07-step4-register.md`
9. **Step 5 — Uncertainty priority** — read `reference/07b-uncertainty-priority.md`
10. **Step 6 — Disagreement diagnostic** — read `reference/08-step6-disagreement.md`
11. **Step 7 — Interview plan** — read `reference/09-step7-interview.md`
12. **Output** — write THINK_OUTPUT.md from `reference/10-output-templates.md`
13. **Gates** — read `reference/11-gates-anti-patterns.md`

## Voice
Speak directly, builder to builder. BA mode — full detail, complete sentences. No caveman. No AI vocabulary.

## Completion Status
- **DONE** — THINK_OUTPUT.md written and every Tier 1 uncertainty mapped.
- **DONE_WITH_CONCERNS** — finished, with concerns logged.
- **BLOCKED** — cannot continue; name the blocker.