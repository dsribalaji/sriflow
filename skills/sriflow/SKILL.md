---
name: sriflow
preamble-tier: 3
version: 3.0.0
category: utility
related: all skills
description: "Routes intent to correct pipeline skill. Not for: specific skill execution — use the skill directly."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - sriflow
  - what stage am I on
  - where are we
  - sriflow help
  - /sriflow
---

## When to invoke

Entry point for the whole SriFlow pipeline. Call it when you invoke `/sriflow` with no skill in mind, when you want to know where the pipeline stands, when you need routing help, or when no skill seems to fit. It never executes the destination skill itself, it only names which one to run.

## Workflow

### Step 0 — Detect pipeline position

Run the preamble script to collect branch, session id, memory state, artifact files, git status, and version. The stage artifacts (PLAN.md, PLAN_REVIEW.md, DESIGN.md, CODE_REVIEW.md, QA_REPORT.md, RETRO.md) pin down the current pipeline stage. A `Current Stage:` value in `SRIFLOW_MEMORY.md` overrides artifact inference for the ⏳ marker.

`Read reference/01-preamble.md` for the preamble script and plan-mode rules.
`Read reference/02-detect-position.md` for the artifact detection script.

### Step 1 — Identify intent

Compare the user message against the routing table. A match sends you to Step 2; no match sends you to Step 4 (AUQ).

Main routes: idea/think → `/sriflow-plan`. Plan review → `/sriflow-plan-review`. Design → `/sriflow-design`. Build → `/sriflow-build`. Code review → `/sriflow-code-review`. Test → `/sriflow-test`. Ship → `/sriflow-ship`. Retro → `/sriflow-reflect`. Browse/memory/trim → utilities, available at any stage. Status/help → Step 3.

`Read reference/03-routing-table.md` for the full routing table and examples.

### Step 2 — Route

Print exactly:
```
→ /sriflow-<skill>
<One sentence: what that skill will do for you right now.>
```
Do not run the destination. Emit one routing message, then stop. `/sriflow-think` routes to `/sriflow-plan` and carries a note that think is merged into plan.

`Read reference/03-routing-table.md` for the output format and examples.

### Step 3 — Status and Help

**Status** — fires on "status", "where am I", "what stage": render the pipeline with ✅/⏳/⬜ markers. Dates sit next to each ✅. `IN PROGRESS` sits next to the ⏳. Browser/memory/trim are omitted from the status view.

**Help** — fires on "help", "what skills": list every pipeline skill and utility with a one-line description each.

**Upgrade** — fires on "upgrade", "check for updates": compare VERSION against remote tags. Never auto-upgrade.

`Read reference/04-status-help.md` for the render formats, rules, and upgrade check.

### Step 4 — Unclear intent (AUQ)

When intent matches nothing in the routing table: show status first, then AskUserQuestion D1 with three options — A) continue the current stage, B) jump to a specific stage, C) show help. Always include a recommendation; always score completeness.

`Read reference/05-auq-unclear.md` for the AUQ format and AskUserQuestion template.

### Post-workflow

**Memory Write** — append a session log entry to `SRIFLOW_MEMORY.md`, only when something is worth recording.
**Context Recovery** — at session start, read memory and give a two-sentence summary.
**Confusion Protocol** — for high-stakes ambiguity: STOP, name it, present options.

`Read reference/06-memory-context.md` for the memory write script, context recovery, and confusion protocol.

### Reference: artifacts, edge cases, quick card

`Read reference/07-artifacts-edge-cases.md` for the stage artifact table, routing edge cases, and quick reference card.

## Voice

Terse, peer-to-peer, built for runtime. Open with the point. Get concrete: cite files, functions, line numbers, commands. Never corporate, academic, or hype. No filler. No em dashes. No AI buzzwords (delve, crucial, robust, comprehensive, nuanced, multifaceted). Never narrate what code does, comment only when the reasoning behind it is non-obvious.

Good: "PLAN.md is on disk, PLAN_REVIEW.md is not. Run /sriflow-plan-review next."
Bad: "After analyzing your pipeline state, I've determined that you might want to proceed with the plan review stage."

## Completeness Principle

Finish the whole job. The only out-of-scope work is genuinely unrelated work. Never hide a shortcut behind "out of scope".

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

Close every skill run with one of:
- **DONE** — finished, backed by evidence.
- **DONE_WITH_CONCERNS** — finished, concerns listed.
- **BLOCKED** — cannot proceed; state the blocker and what was tried.
- **NEEDS_CONTEXT** — information missing; state exactly what is needed.

Format: `STATUS: <status> | REASON: <one line> | ATTEMPTED: <one line> | RECOMMENDATION: <one line>`