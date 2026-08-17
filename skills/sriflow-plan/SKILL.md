---
name: sriflow-plan
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-think, sriflow-plan-review, sriflow-design
description: "Structured implementation plan. 6 BA phases + ADR-driven architecture. Not for: stakeholder discovery — use sriflow-think. Not for: plan review — use sriflow-plan-review."
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
  - create a plan
  - plan this
  - implementation plan
  - let's plan
  - how do we build this
  - /sriflow-plan
prerequisite: /sriflow-think — THINK_OUTPUT.md must exist
next-skill: /sriflow-plan-review
outputs:
  - PLAN.md
  - 01_discovery/* (stakeholder assets)
  - 02_elicitation/* (interview scripts)
  - 03_use-cases/* (UC inventory)
  - 04_requirements/* (BRD + backlog)
  - 05_ui-and-data/* (screens / CLI commands / data dict)
  - 06_architecture/* (NFRs, system design, ADRs)
gate:
  rule: All 6 phases complete with GREEN verdicts
  signal: DONE when 6 phases complete within tier scope
---

# /sriflow-plan — BA Pipeline + ADR-Driven Planning

## When to invoke

Run phases 2–6 of the pipeline. Invoke after `/sriflow-think`; THINK_OUTPUT.md must already exist. Execute the sequence Discovery → Elicitation → Use Cases → Requirements → UI & Data → Architecture. Deliver PLAN.md plus every phase artifact.

## Reference files

| Step | File | Content |
|------|------|---------|
| Preamble | `reference/01-preamble.md` | Shell setup, plan mode, PATH |
| Scale | `reference/03-scale-detection.md` | Tier detection with cross-check |
| Phase 1-Discovery | `reference/05-phase1-discovery.md` | Stakeholder mapping |
| Phase 2-Elicitation | `reference/06-phase2-elicitation.md` | Interview scripts |
| Phase 3-Use Cases | `reference/07-phase3-usecases.md` | Cockburn Sea Level |
| Phase 4-Requirements | `reference/08-phase4-requirements.md` | BRD + INVEST stories |
| Phase 5-UI & Data | `reference/09-phase5-ui-data.md` | Screens or CLI commands |
| Phase 6-Architecture | `reference/10-phase6-architecture.md` | NFRs + system design |
| Output templates | `reference/11-output-templates.md` | Per-tier + per-project-type |
| Post-plan | `reference/12-post-plan.md` | Expand handler, memory write |
| Nested structure | `reference/04-nested-structure.md` | Phases subdirectory layout |

### Pattern libraries

The pipeline composes several reusable technique sets, documented in the pattern library and the ADR template set below.

| Pattern set | Role in the pipeline |
|-------------|---------------------|
| Orchestration protocol | Runs the six phases as sequential subagents, fanning out to parallel workers where phases stay independent | `reference/patterns/orchestration-protocol.md` |
| Dependency graph | Builds the task dependency graph, risk matrix, and phased delivery sequence | `reference/patterns/dependency-graph.md` |
| Guidance framework | Compiles planning guidance into enforceable rules, then proves and evolves them per phase | `reference/patterns/guidance-framework.md` |
| ADR system | Records each architecture decision as Context → Decision → Consequences across six template types |

### ADR templates

| File | Template type |
|------|-------------|
| `reference/adrs/ADR-template.md` | Generic ADR (Context → Decision → Consequences) |
| `reference/adrs/ADR-architecture.md` | Architecture decision template |
| `reference/adrs/ADR-security.md` | Security decision template |
| `reference/adrs/ADR-data-model.md` | Data model decision template |
| `reference/adrs/ADR-api-design.md` | API design decision template |
| `reference/adrs/ADR-tooling.md` | Tooling/infra decision template |

## Workflow
1. Preamble → Read `reference/01-preamble.md`
2. Scale detection → Read `reference/03-scale-detection.md`
3. Branch by tier (Small/Medium/Enterprise)
4. Phase 1: Discovery (stakeholder mapping)
5. Phase 2: Elicitation (interview scripts)
6. Phase 3: Use Cases (Cockburn Sea Level)
7. Phase 4: Requirements (BRD + INVEST stories with GWT)
8. Phase 5: UI & Data (screens or CLI command tree)
9. Phase 6: Architecture (NFRs + system design + ADRs)
10. Write PLAN.md from tier-matched template
11. Post-plan: expand handler, memory write

## Voice
Direct, builder-to-builder. BA mode — full detail.

## Completion Status
- **DONE** — PLAN.md written, all phases GREEN.
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker.