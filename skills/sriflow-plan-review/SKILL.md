---
name: sriflow-plan-review
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-plan, sriflow-design
description: "Multi-lens plan review. 3 mandatory lenses (CEO + Design + Eng) + optional DX + optional Council. Absorbs: gstack 4-lens, ECC 67-agent council, ruflo guidance control plane. Not for: code review — use sriflow-code-review. Not for: implementation — use sriflow-build."
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
  - review the plan
  - is this plan good
  - check the plan
  - plan review
  - /sriflow-plan-review
prerequisite: /sriflow-plan — PLAN.md must exist
next-skill: /sriflow-design
outputs:
  - PLAN_REVIEW.md
gate:
  rule: All mandatory lenses must score >= 7 before proceeding
  signal: DONE when all lenses pass
---

# /sriflow-plan-review — Multi-Lens Plan Review

## When to invoke

After `/sriflow-plan`. Reviews PLAN.md through multiple lenses. Each lens scores 0-10. Hard block if any mandatory lens < 7. Iterative loop until all pass or user overrides.

## Reference files

| File | What it covers |
|------|---------------|
| `reference/01-preamble.md` | Shell preamble, plan mode |
| `reference/02-voice-completeness.md` | Voice rules + completeness scoring |
| `reference/03-pre-flight.md` | Pre-flight audit checklist |
| `reference/04-ceo-lens.md` | CEO lens (Q1-Q9) — gstack CEO review patterns |
| `reference/05-design-lens.md` | Design lens (Q9-Q16) — gstack design review patterns |
| `reference/06-eng-lens.md` | Engineering lens (Q17-Q24) — gstack eng review patterns |
| `reference/07-score-gate.md` | Score gate + loop logic |
| `reference/08-write-review.md` | PLAN_REVIEW.md template |
| `reference/09-council.md` | Adversarial council (Skeptic + Pragmatist + Critic) |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **gstack plan-ceo-review** | 9 CEO questions: inversion, focus, beachhead, why-now | Absorbed into CEO lens |
| **gstack plan-eng-review** | Blast radius, boring-by-default, sequencing, build-vs-buy | Absorbed into Eng lens |
| **gstack plan-design-review** | 10-dimension design scoring rubric | Absorbed into Design lens |
| **gstack plan-devex-review** | TTHW (Time To Hello World), friction points, persona traces | Added as optional DX lens (Small skips) |
| **ECC council** | Skeptic + Pragmatist + Critic adversarial voices | Expanded council with 3 distinct personas |
| **ECC 67-agent library** | Domain-specific review checklists | `reference/council/*.md` — 24 domain lenses |
| **ruflo guidance** | "Compile, enforce, prove, evolve" framework | Post-review: prove decisions with evidence |

### Domain lens library (absorbed from ECC's 67 agents)

| File | Domain |
|------|--------|
| `reference/council/security-review.md` | Security lens (OWASP Top 10 + STRIDE) |
| `reference/council/database-review.md` | PostgreSQL/Supabase schema, queries, indexes |
| `reference/council/typescript-review.md` | TypeScript/JS type safety, async patterns |
| `reference/council/python-review.md` | Python patterns, typing, performance |
| `reference/council/go-review.md` | Go idioms, error handling, concurrency |
| `reference/council/rust-review.md` | Rust ownership, borrow checker, unsafe |
| `reference/council/java-review.md` | Java/Spring Boot patterns, DI, transactions |
| `reference/council/kotlin-review.md` | Kotlin coroutines, null safety, Compose |
| `reference/council/cpp-review.md` | C++ memory management, RAII, templates |
| `reference/council/mle-review.md` | ML pipeline, serving, monitoring, rollback |
| `reference/council/pytorch-review.md` | PyTorch CUDA, training, distributed |

## Workflow
1. **Preamble** → shell init, git state, memory
2. **Pre-flight** → read PLAN.md, gather git context
3. **CEO lens** → Q1-Q9, score 0-10
4. **Design lens** → Q9-Q16, score 0-10
5. **Engineering lens** → Q17-Q24, score 0-10
6. **Optional DX lens** (Medium/Enterprise) → TTHW, friction points
7. **Council** → Enterprise always, Medium if any lens < 8, Small skips
8. **Score gate** → all mandatory ≥ 7? If not, loop
9. **Write PLAN_REVIEW.md** → scores, findings, loop history
10. **Memory write** → append to SRIFLOW_MEMORY.md

## Voice
Principal product reviewer. BA mode — full detail, complete sentences.

## Completion Status
- **DONE** — all mandatory lenses ≥ 7, PLAN_REVIEW.md written.
- **DONE_WITH_CONCERNS** — user overrode sub-7 lens.
- **BLOCKED** — cannot proceed.
