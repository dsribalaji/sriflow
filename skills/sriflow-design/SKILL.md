---
name: sriflow-design
preamble-tier: 2
version: 2.1.0
description: Progressive design pipeline — wireframes → DESIGN.md → HTML mockups → review loop. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - AskUserQuestion
triggers:
  - design this
  - create mockups
  - wireframe
  - design the UI
  - build the interface
  - /sriflow-design
---

## When to invoke

Four-phase design pipeline. Phase 1: ASCII wireframe candidates. Phase 2: DESIGN.md. Phase 3: HTML mockups. Phase 4: audit-and-fix loop.

Run on: "design this", "create mockups", "wireframe", "design the UI", "build the interface", `/sriflow-design`.

---

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH=$_BRANCH SESSION=$_SESSION_ID"
[ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ] && SRIFLOW_PLAN_MODE="active" || SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
[ -f "SRIFLOW_MEMORY.md" ] && head -60 SRIFLOW_MEMORY.md || echo "MEMORY: missing"
[ -f "PLAN.md" ] && echo "PLAN.md: found" || echo "PLAN.md: missing"
[ -f "DESIGN.md" ] && echo "DESIGN.md: found" || echo "DESIGN.md: missing"
ls design/ 2>/dev/null || echo "design/: will create"
sriflow-timeline log '{"skill":"sriflow-design","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```

---

## Plan Mode

Allowed: `Read`, `Glob`, `Grep`, `Bash` (read-only), `SRIFLOW_MEMORY.md`/`PLAN.md` writes. No destructive ops or git mutations.

In plan mode: follow step by step. AskUserQuestion satisfies end-of-turn. If unavailable: render prose with triad (ELI10, completeness, recommendation), then STOP.

---

## AskUserQuestion Format

D-numbered. First question = D1. Increment yourself.

```
D<N> — <title>
Project/branch: <name> on <_BRANCH>
ELI10: <plain English, 2-4 sentences, name stakes>
Stakes if we pick wrong: <one sentence>
Recommendation: <choice> because <reason>
Completeness: A=X/10, B=Y/10
A) <label> (recommended)  ✅ <pro ≥40 chars>  ❌ <con ≥40 chars>
B) <label>  ✅ <pro>  ❌ <con>
Net: <one-line synthesis>
```

Max 4 options/call. 5+ = split D<N>.1/2. Min 2 pros 1 con. One `(recommended)`. Unavailable: headless = auto-choose; interactive = prose + STOP.

---

## Voice

Direct, builder-to-builder. Name files, line numbers. No AI vocab (delve, crucial, robust, comprehensive, nuanced, furthermore, moreover, pivotal, tapestry, underscore, foster, showcase, intricate, vibrant, fundamental, significant). No em dashes. Never narrate code.

## Completeness

All states, screens, edge cases. No "out of scope" shortcuts. Coverage diff = `X/10`. Kind diff = `Note: options differ in kind, not coverage`.

## Completion Status

End every run: **DONE** / **DONE_WITH_CONCERNS** / **BLOCKED** / **NEEDS_CONTEXT**. Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

---

## Pre-flight

Read `PLAN.md`, `PLAN_REVIEW.md`, `DESIGN.md` if they exist. Extract: key screens, user type, product tone, constraints. If no plan context: ask D0 ("Describe product" vs "Generic wireframes"). Always recommend describing.
## Phase 1 — Wireframe Candidates

Generate exactly **2 ASCII wireframe candidates** per key screen. Read `reference/wireframes.md` for format rules, ASCII examples, documentation requirements.

Candidates must be genuinely different — not same layout with different labels. Display both, call D1 (see `reference/wireframes.md`). User has own wireframe: use D1b.

STOP. Wait for selection.
## Phase 2 — DESIGN.md

Write `DESIGN.md` to project root. Read `reference/design-template.md` for exact 6-section template (System Components, Design Tokens, Component Library, User Flows, Data Flow, State Management).

Single source of truth for Phase 3. Gaps here = gaps in HTML.

Call D2 (see `reference/design-template.md`). Revise if requested, re-call D2.

STOP. Wait for approval.
## Phase 3 — HTML Mockups

Convert `DESIGN.md` to self-contained HTML mockups. One file per key screen. Read `reference/html-rules.md` for generation rules, document structure, AI slop blacklist.

```bash
mkdir -p design/
```

Naming: `design/<screen-slug>.html`. Before writing: state name, screen, states, accessibility decisions.

Write all files, call D3 (see `reference/html-rules.md`). Changes requested: apply, re-call D3.

STOP. Wait for approval.
## Phase 4 — Review Loop

Audit every `design/*.html` against `DESIGN.md`. Read `reference/review-loop.md` for categories, report format, auto-fix. Read `reference/accessibility.md` for WCAG checklist.

4 categories: A11Y, CONSISTENCY, RESPONSIVE, STATE. Fix every finding. Loop until clean.

Auto-fix ≤5. If >5: ask D4 (see `reference/review-loop.md`). Max 5 loops.

Clean pass → `CLEAR TO /sriflow-build`.

---

## Output Summary

```
/sriflow-design complete.
DESIGN.md: <path>  HTML: <list>  Findings fixed: <N>
Result: CLEAN (or DONE_WITH_CONCERNS)
CLEAR TO /sriflow-build
```

---

## Memory Write

```bash
_TEL_END=$(date +%s); _TEL_DUR=$((_TEL_END - _TEL_START))
cat >> SRIFLOW_MEMORY.md << MEMEOF
### $(date -u +%Y-%m-%dT%H:%M:%SZ) | sriflow-design | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH | Session: $_SESSION_ID
Phase: PHASE | DESIGN: DESIGN_STATUS | HTML: HTML_FILES | Fixed: FIXED_COUNT
MEMEOF
sriflow-timeline log '{"skill":"sriflow-design","event":"completed","branch":"'"$_BRANCH"'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'"}' 2>/dev/null || true
```

---

## Context Recovery

```bash
[ -f "SRIFLOW_MEMORY.md" ] && cat SRIFLOW_MEMORY.md
```

2-sentence summary. If phase incomplete: say so, offer resume.

---

## Confusion Protocol

High-stakes ambiguity (architecture, data model, screen count): STOP. One sentence. 2-3 options. Ask. Not for routine layout.

---

## UX Principles

**Scan > read.** Hierarchy = importance. **Satisfice.** First reasonable option wins. **Thinking > clicks.** **Mobile.** No hover. 44px min. **Goodwill.** Friction drains, clarity replenishes. **Clarity > consistency.**

---

## Phase Resumption

Check `SRIFLOW_MEMORY.md` + `design/`: No DESIGN.md/design/ → Phase 1. DESIGN.md, no design/ → Phase 3. HTML + memory=Phase 3 → Phase 4. Memory=Phase 4 → ask re-run or build. Announce: "Resuming at Phase <N>: <reason>."
