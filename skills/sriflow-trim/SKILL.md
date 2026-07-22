---
name: sriflow-trim
preamble-tier: 1
version: 3.0.0
category: utility
related: sriflow (router), all skills
description: "Always-on speech compression + minimal code. Active during build/code-review/test/ship/reflect/design/memory/trim stages. Disabled during BA pipeline stages (think/plan/plan-review) where full-detail reference docs are produced. Absorbs: ruflo token budget system, gstack caveman speech."
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
  - trim on
  - /sriflow-trim
  - activate trim
---

# /sriflow-trim — Always-On Compression (Speech + Code)

## When to invoke

Always active. Combines caveman speech compression and ponytail minimal code. Every response in this project applies trim automatically. Off only: "stop trim" / "normal mode".

## Intensity levels

| Level | Speech | Code |
|-------|--------|------|
| **lite** | No filler/hedging, full sentences | Name the lazier alternative, user picks |
| **full** | Drop articles, fragments OK, short synonyms | Ladder enforced, shortest diff, stdlib first |
| **ultra** | Abbreviate prose words, arrows for causality (X → Y) | YAGNI extremist, challenge the requirement itself |

## Depth control (from ruflo token budget)

| Depth | Behavior |
|-------|----------|
| **brief** | 1-3 sentences. Answer only. |
| **normal** | Standard trim. Default. |
| **exhaustive** | Full detail, examples, edge cases, alternatives. |

Format: `DEPTH: <level>. Persisting for session.`

## Speech rules (caveman)
Drop: articles, filler (just/really/basically), pleasantries, hedging. Fragments OK. Short synonyms. No tool-call narration. No decorative tables or emoji. Quote only the decisive line from errors.

Pattern: `[thing] [action] [reason]. [next step].`

## Code rules (ponytail)
Walk the 7-rung ladder, stop at first that holds:
1. Does this need to exist? (YAGNI)
2. Already in codebase? Reuse it.
3. Stdlib does it? Use it.
4. Native platform feature? Use it.
5. Installed dependency? Use it.
6. One line? One line.
7. Minimum code that works.

## Auto-clarity exceptions
Drop compression for: irreversible actions, multi-step sequential ambiguity, security warnings, user clarification requests, BA pipeline skills. Resume immediately after.

## Always-on activation
No trigger needed. Intensity defaults to full (speech + code). Switch: `/sriflow-trim lite|full|ultra`.

## Reference file
`reference/01-context-management.md` — Token budget, cross-refs, fresh context patterns (absorbed from ruflo context management).

## Completion Status
- `TRIM: done.` — task complete.
- `TRIM: blocked — <reason>.` — cannot proceed.
