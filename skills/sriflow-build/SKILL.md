---
name: sriflow-build
preamble-tier: 2
version: 2.0.0
description: Implements the approved design. Pre-build safety, sriflow-trim code ladder, reuse-first. Writes minimal code that works. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - build this
  - implement this
  - start coding
  - write the code
  - /sriflow-build
  - debug this
  - fix this bug
  - why is this broken
  - root cause analysis
  - investigate this error
---

## When to invoke this skill

Use when it is time to implement: after a plan is approved, a design is locked,
or the user says "build this", "implement this", "start coding", "write the code",
or "/sriflow-build". Also use for "debug this", "fix this bug", "why is this broken",
"root cause analysis", "investigate this error" — runs systematic debugging workflow
(Iron Law: no fixes without root cause first). See reference/investigate-workflow.md.
Runs a pre-build safety check, loads context, scans for
reusable code, implements using sriflow-trim ladder. Progress written to
SRIFLOW_MEMORY.md after each logical unit. One smoke check at the end.

# /sriflow-build — Build Stage

Run the init block from `reference/init-block.md`. Set `_BRANCH`, `_SESSION_ID`,
`_TEL_START`, detect `SRIFLOW_PLAN_MODE`, read memory/plan/design presence, check
git status, detect pipeline stage.

---

## Plan Mode Safe Operations

In plan mode (`SRIFLOW_PLAN_MODE=active`): read, analyze, report. No destructive
operations, no git mutations, no code written. AskUserQuestion satisfies the
end-of-turn requirement.

---

## AskUserQuestion Format

Decision brief format: `D<N>`, Branch, ELI10, Stakes, Recommendation, Completeness,
options with pros/cons, Net. Read `reference/askuserq-format.md` for the full
template. D-numbering: D1 first, increment per question. If unavailable: render as
prose with same triad, then STOP.

---

## Voice

Direct, builder-to-builder, compressed. Lead with the point. Be concrete. No filler,
no em dashes, no AI vocabulary. Never narrate what code does. Only comment WHY when
non-obvious.

---

## Completeness Principle

Do the complete thing. Tests, edge cases, error paths. Never use "out of scope" as
shortcut excuse. `Completeness: X/10` when options differ in coverage.

---

## Completion Status Protocol

End with: **DONE** (with evidence), **DONE_WITH_CONCERNS** (concerns listed),
**BLOCKED** (state blocker), or **NEEDS_CONTEXT** (state what's needed).

---

## Confusion Protocol

High-stakes ambiguity: STOP, name it, present 2-3 options via AskUserQuestion.
Threshold: >2 reasonable interpretations producing materially different code.

---

# Build Steps

Five steps. Complete each before next. Never skip. Never write code before Step 2.

---

## Step 0 — Pre-Build Safety Check

Scan for destructive operations before any mutation. Read `reference/safety-checks.md`
for patterns, safe exceptions, D0 format. Plan mode: skip destructive ops, analyze only.

---

## Step 1 — Context Load

Read in order: PLAN.md (sequence, criteria), DESIGN.md (components, contracts,
locked decisions), SRIFLOW_MEMORY.md (progress — skip completed units).

No plan found → AskUserQuestion (D1) for scope. STOP. Don't write code until scope provided.
Partial context → PLAN only: build from plan. DESIGN only: extract sequence.
Partial build → resume from last incomplete unit.

---

## Step 2 — Existing Code Scan

Before ANY new code: scan for existing utilities, types, helpers. Read
`reference/code-reuse.md` for scan commands and recording format.
Only proceed to Step 3 when scan is complete and findings recorded.

---

## Step 3 — sriflow-trim Code Ladder

Walk ladder in order, stop at first rung that holds. Read `reference/trim-ladder.md`
for the 7 rungs, `// trim:` marking rules, and mid-build ambiguity handling.

---

## Step 4 — Build Loop (per logical unit)

Repeat for each unit in PLAN.md. Read `reference/build-loop.md` for full loop body
(4a-4g), self-check rules, memory write format, AUQ threshold.

Default order: models → storage → services → routes → CLI/UI → config → tests.

---

## Step 5 — Final Smoke Check

One command exercising happy path end to end. Read `reference/smoke-check.md` for
finding, running, and recording the check. Fix failures before declaring DONE.

---

## Hard Rules

- Never narrate what code does. Only comment WHY when non-obvious.
- Never write code that could already exist. Step 2 mandatory.
- Shortest diff wins. Edit existing before creating new.
- No speculative features. Build exactly PLAN.md scope.
- Bug fix = root cause. Grep every caller, fix shared function once.
- Irreversible actions require D0 AskUserQuestion. Absolute.
- Security/validation never shortcuts. Build fully, always.
- Accessibility not shortcuts. alt, semantic HTML, keyboard nav.

---

## Post-Build

Verify: all units implemented, self-checks passing, no duplicate code, no
unauthorized deps, no speculative features, trim comments on shortcuts, smoke check
passed. Read `reference/build-guide.md` Post-Build Checklist section.

End with status. Suggest next skill once. Don't auto-invoke.
