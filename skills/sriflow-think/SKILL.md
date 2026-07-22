---
name: sriflow-think
preamble-tier: 2
version: 2.0.0
category: pipeline
related: sriflow-plan, sriflow-plan-review
description: "Ideation & stakeholder discovery. BA Phase 1-6: from raw idea to stakeholder map, uncertainty register, interview plan. Absorbs: gstack office-hours, ECC spec-miner, ruflo governance thinking. Not for: full planning — use sriflow-plan. Not for: implementation — use sriflow-build."
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

Re-run `/sriflow-think` to update THINK_OUTPUT.md. Use `update mode` to preserve existing answers. Fresh start deletes all artifacts and re-runs.

# /sriflow-think — Ideation (Absorbing gstack office-hours + ECC spec-miner + ruflo governance)

## When to invoke

Phase 1 of the sriflow pipeline. Starting any project from zero, when a requirement is attributed to a group label ("the business," "users," "leadership"), when stakeholders disagree, or before any elicitation session. Invoke proactively before any requirements workshop.

## Reference files

| Phase | File | What it covers |
|-------|------|---------------|
| **Preamble** | `reference/01-preamble.md` | Shell preamble, PATH setup, plan mode, memory, git state |
| **Questions** | `reference/02-questions.md` | D-numbered decision brief format |
| **Scale** | `reference/03-scale-detection.md` | Tier detection with effort estimation cross-check |
| **Context** | `reference/04-step1-context.md` | Q2-Q4 project phase + docs + prior discovery |
| **Market** | `reference/04b-market-research.md` | Competitive landscape, 3 searches max (gstack patterns) |
| **Stakeholders** | `reference/05-step2-identify.md` | 6-category stakeholder discovery |
| **Power/Interest** | `reference/06-step3-map.md` | Power + interest + uncertainty mapping |
| **Register** | `reference/07-step4-register.md` | Full stakeholder register + Red/Green classification |
| **Uncertainty** | `reference/07b-uncertainty-priority.md` | Tier 1/2/3 uncertainty prioritization |
| **Disagreement** | `reference/08-step6-disagreement.md` | Vague phrase detection, diagnostic questions |
| **Interview** | `reference/09-step7-interview.md` | 5-part interview structure |
| **Output** | `reference/10-output-templates.md` | Small/Medium/Enterprise THINK_OUTPUT.md templates |
| **Gates** | `reference/11-gates-anti-patterns.md` | Phase gate, expand handler, clarity check |

### Absorbed patterns

| Source | Pattern | sriflow integration |
|--------|---------|-------------------|
| **gstack office-hours** | YC-style forcing questions | `reference/patterns/gstack-office-hours.md` |
| **gstack office-hours** | 10-star thinking (what's the 10x version?) | Added to Q3 in Think workflow |
| **gstack office-hours** | Inversion: "what would make this fail?" | Added to uncertainty mapping |
| **ECC spec-miner** | Brownfield project extraction | `reference/patterns/ecc-spec-miner.md` |
| **ECC spec-miner** | Existing codebase → spec extraction | Context step: detect brownfield, run extraction |
| **ECC planner** | Work breakdown: deps → phases → risks | `reference/patterns/ecc-planner.md` |
| **ruflo governance** | "Compile, enforce, prove, evolve" framework | `reference/patterns/ruflo-governance.md` |
| **ruflo ADRs** | Decision documentation template | Uncertainty resolution → ADR entry |

## Workflow

1. **Preamble** → Read `reference/01-preamble.md`
2. **Questions format** → Read `reference/02-questions.md`
3. **Scale detection** → Read `reference/03-scale-detection.md` — effort estimation cross-check
4. **Step 1 — Project context** → Read `reference/04-step1-context.md` (Q2-Q4)
5. **Step 1b — Market research** → Read `reference/04b-market-research.md` (3 searches max)
6. **Step 2 — Identify stakeholders** → Read `reference/05-step2-identify.md`
7. **Step 3 — Map power/interest/uncertainty** → Read `reference/06-step3-map.md`
8. **Step 4 — Stakeholder register** → Read `reference/07-step4-register.md`
9. **Step 5 — Uncertainty priority** → Read `reference/07b-uncertainty-priority.md`
10. **Step 6 — Disagreement diagnostic** → Read `reference/08-step6-disagreement.md`
11. **Step 7 — Interview plan** → Read `reference/09-step7-interview.md`
12. **Output** → Write THINK_OUTPUT.md from `reference/10-output-templates.md`
13. **Gates** → Read `reference/11-gates-anti-patterns.md`

## Voice
Direct, builder-to-builder. BA mode — full detail, complete sentences. No caveman. No AI vocabulary.

## Completion Status
- **DONE** — THINK_OUTPUT.md written, all Tier 1 uncertainties mapped.
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker.
