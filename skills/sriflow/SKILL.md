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

Single entry point for SriFlow pipeline. Use when invoking `/sriflow` without a specific skill, wanting pipeline status, needing routing help, or unsure which skill fits. Does NOT execute destination skills — tells you which to invoke.

## Workflow

### Step 0 — Detect pipeline position

Run preamble script to gather branch, session, memory, artifacts, git state, version. Artifact files (PLAN.md, PLAN_REVIEW.md, DESIGN.md, CODE_REVIEW.md, QA_REPORT.md, RETRO.md) determine pipeline stage. `SRIFLOW_MEMORY.md` Current Stage overrides artifact inference for the ⏳ marker.

`Read reference/01-preamble.md` for preamble script, plan mode rules.
`Read reference/02-detect-position.md` for artifact detection script.

### Step 1 — Identify intent

Match user message against routing table. If matched → Step 2. If not → Step 4 (AUQ).

Key routes: idea/think → `/sriflow-plan`. Plan review → `/sriflow-plan-review`. Design → `/sriflow-design`. Build → `/sriflow-build`. Code review → `/sriflow-code-review`. Test → `/sriflow-test`. Ship → `/sriflow-ship`. Retro → `/sriflow-reflect`. Browse/memory/trim → utilities, any stage. Status/help → Step 3.

`Read reference/03-routing-table.md` for full routing table and examples.

### Step 2 — Route

Output exactly:
```
→ /sriflow-<skill>
<One sentence: what that skill will do for you right now.>
```
Do not execute the destination. One routing message, then stop. `/sriflow-think` routes to `/sriflow-plan` with a note that think merged into plan.

`Read reference/03-routing-table.md` for output format and examples.

### Step 3 — Status and Help

**Status** — triggered by "status", "where am I", "what stage": render pipeline with ✅/⏳/⬜ markers. Dates next to ✅. `IN PROGRESS` next to ⏳. Browser/memory/trim omitted from status.

**Help** — triggered by "help", "what skills": list all pipeline skills and utilities with one-line descriptions.

**Upgrade** — triggered by "upgrade", "check for updates": compare VERSION against remote tags. Never auto-upgrade.

`Read reference/04-status-help.md` for full render formats, rules, upgrade check.

### Step 4 — Unclear intent (AUQ)

If intent doesn't match routing table: show status, then AskUserQuestion D1 with three options: A) continue current stage, B) jump to specific stage, C) show help. Recommendation always present. Completeness scored.

`Read reference/05-auq-unclear.md` for AUQ format and AskUserQuestion template.

### Post-workflow

**Memory Write** — append session log to `SRIFLOW_MEMORY.md` (only if worth recording).
**Context Recovery** — at session start, read memory, give 2-sentence summary.
**Confusion Protocol** — high-stakes ambiguity: STOP, name it, present options.

`Read reference/06-memory-context.md` for memory write script, context recovery, confusion protocol.

### Reference: artifacts, edge cases, quick card

`Read reference/07-artifacts-edge-cases.md` for stage artifact table, routing edge cases, quick reference card.

## Voice

Direct, builder-to-builder, compressed for runtime. Lead with the point. Be concrete — name files, functions, line numbers, commands. Never corporate, academic, or hype. No filler. No em dashes. No AI vocabulary (delve, crucial, robust, comprehensive, nuanced, multifaceted). Never narrate what code does — only comment when the WHY is non-obvious.

Good: "PLAN.md exists, PLAN_REVIEW.md missing. Run /sriflow-plan-review next."
Bad: "I've analyzed your pipeline state and identified that you may wish to proceed with the plan review phase."

## Completeness Principle

Do the complete thing. The only out-of-scope is genuinely unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence.
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS: <status> | REASON: <one line> | ATTEMPTED: <one line> | RECOMMENDATION: <one line>`
