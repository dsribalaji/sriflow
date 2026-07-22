---
name: sriflow-reflect
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-ship, sriflow-memory
description: "End-of-cycle retrospective. 8 sections, tier-based depth. Absorbs: gstack retro (per-person breakdowns, trends), ECC continuous learning (instinct system), ruflo eval framework."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - retro
  - retrospective
  - what did we learn
  - reflect on this cycle
  - end of sprint
  - /sriflow-reflect
next-skill: /sriflow-think (next cycle)
---

# /sriflow-reflect — Retrospective with Continuous Learning

## When to invoke

After ship completes. Reads SRIFLOW_MEMORY.md, PLAN.md, QA_REPORT.md, CODE_REVIEW.md, git log. Produces RETRO.md with 8 mandatory sections. Updates memory with lessons and next priority.

## Reference files

| Step | File | Content |
|------|------|---------|
| Preamble | `reference/01-preamble.md` | Shell init, time window, stale base guard |
| Arguments | `reference/02-arguments.md` | Argument parsing, midnight-aligned windows |
| Window | `reference/03-step0-detect-window.md` | Time window, stale base guard |
| Context | `reference/04-step1-read-context.md` | Read all project artifacts |
| Git data | `reference/05-step2-git-data.md` | 10 git commands, hotspots, sessions |
| Metrics | `reference/06-step3-metrics.md` | Raw CYCLE METRICS block |
| Pipeline analysis | `reference/07-step4-pipeline-analysis.md` | Stage reconstruction table |
| Template | `reference/08-step5-retro-template.md` | 8-section RETRO.md template |
| Memory update | `reference/09-step6-update-memory.md` | Compression + lessons |
| Announce | `reference/10-step7-announce.md` | Completion summary |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **gstack retro** | Per-person breakdowns, shipping streaks, trend lines | `reference/patterns/gstack-retro.md` |
| **gstack retro** | Commit histogram, session cadence | Step 2 enhanced |
| **ECC continuous learning** | Instinct creation, observation extraction | `reference/insights/ecc-continuous-learning.md` |
| **ECC continuous learning** | Confidence scoring (0-100), evolution rules | Instinct system: observe → score → evolve |
| **ruflo eval framework** | Metrics-driven improvement, quality checks | `reference/patterns/eval-framework.md` |

### Insight system (absorbed from ECC)

| File | Content |
|------|---------|
| `reference/insights/observation-template.md` | How to log an observation |
| `reference/insights/instinct-types.md` | Types: process, tech, communication, tooling |
| `reference/insights/confidence-scoring.md` | Score 0-100, evolution rules |
| `reference/insights/retro-patterns.md` | Common retro patterns to detect |

## Tier-based depth

| Tier | Depth | Steps run |
|------|-------|-----------|
| Small | Quick | Pre-flight → Context → Git (5 cmds) → Metrics → RETRO.md → Memory |
| Medium | Standard | All except cadence + prior retro |
| Enterprise | Full | All 11 steps + cadence + prior retro + archive + continuous learning |

## 8 RETRO.md sections
1. Shipped — what went out
2. Planned vs Shipped — scope variance
3. Time — actual vs estimated
4. Decisions — D-numbered key decisions
5. Code Quality — findings, rework ratio
6. Broke — what went wrong
7. Carry-Forward — what to do next cycle
8. Lessons — named, actionable, specific

## Workflow
1. Pre-flight → Context read → Git data → Metrics
2. Pipeline analysis → Depth preference (D1)
3. Write RETRO.md (8 sections)
4. Memory update (compress if >50, append lessons)
5. Continuous learning (1 observation minimum)
6. Announce

## Voice
Direct, builder-to-builder, compressed for runtime.

## Completion Status
- **DONE** — RETRO.md written, memory updated.
- **DONE_WITH_CONCERNS** — completed with concerns.
- **BLOCKED** — cannot proceed.
