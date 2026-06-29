# SriFlow — Implementation Plan

A fully custom Claude Code skill stack. No runtime dependency on gstack.
Name: **sriflow**. All skills invoked as `/sriflow-<stage>`.

---

## Pipeline Overview

```
idea/think → plan → review → design → build → review → test → ship → reflect
```

Each stage is a standalone `/sriflow-*` skill. Skills are written one at a time,
with a personalization Q&A before each one is written.

---

## Skills to Build

> Each skill lists the gstack/ba-toolkit source(s) used as reference, what is kept,
> and what is stripped before customization begins.

---

### 1. `/sriflow-think` — Idea & Discovery

**Reference sources:**
- ba-toolkit: `discover`, `elicit`, `usecase`, `audit-brd`, `story`, `nfr` (all 6 phases)
- gstack: `office-hours` (forcing-question logic only)

**Keep from sources:**
- All 6 BA phase structures and gate logic
- office-hours: the 6 forcing questions (startup + builder modes)

**Strip:**
- gstack preamble scripts (`gstack-update-check`, `gstack-config`, gbrain queries)
- office-hours: design doc saving to `~/.gstack/` paths
- Any reference to gstack binary calls or session tracking

**What it does:**
Runs all 6 BA phases sequentially, pausing for approval between each, then closes
with office-hours forcing questions. Outputs a complete ideation package consumed by plan.

**Phases (pause + approval between each):**
1. `discover` — scope the problem, validate the idea
2. `elicit` — stakeholder interview prep, questionnaire
3. `usecase` — scope gate: convert notes into structured use cases
4. `audit-brd` — review/write the Business Requirements Document
5. `story` — write User Stories from approved Use Cases
6. `nfr` — non-functional requirements gate before architecture
7. **Office-hours close** — 6 forcing questions challenging assumptions

**Personalization questions to ask before writing:**
- How formal should the BA output be? (startup lean vs. enterprise structured)
- Should it auto-generate a summary doc at the end of all phases?
- Any phases you want to skip or combine by default?

---

### 2. `/sriflow-plan` — Planning

**Reference sources:**
- gstack: `spec` (spec-writing logic)
- gstack: `autoplan` (sequential review pipeline concept)

**Keep from sources:**
- `spec`: five-phase intent-to-spec structure
- `autoplan`: idea of running multiple review types in sequence with auto-decisions

**Strip:**
- `spec`: GitHub issue filing, worktree spawning, gstack binary preamble
- `autoplan`: reads skill files from disk via `~/.claude/skills/gstack/` paths — rewrite logic natively
- All gstack session/conductor/headless checks

**What it does:**
Takes ideation output, produces structured implementation plan: architecture decisions,
sequencing, tech stack, risk flags.

**Personalization questions to ask before writing:**
- What format do you want plans in? (markdown doc, bullet list, table)
- Should it always ask about tech stack or infer from context?
- How opinionated should it be — recommend one path or present options?

---

### 3. `/sriflow-plan-review` — Plan Review

**Reference sources:**
- gstack: `plan-ceo-review` (CEO lens — 10-star product thinking)
- gstack: `plan-design-review` (design dimension scoring 0-10)
- gstack: `plan-eng-review` (architecture, risks, sequencing)

**Keep from sources:**
- All three review lenses and their scoring logic
- The 0-10 rating framework from `plan-design-review`
- Risk and sequencing checks from `plan-eng-review`

**Strip:**
- gstack preamble scripts and binary calls from all three
- gbrain context queries
- Conductor/headless session checks

**What it does:**
Reviews plan through three sequential lenses. Rates each 0-10. Blocks proceeding if any < 7.

**Personalization questions to ask before writing:**
- Which lenses matter most for your work? (all three, or drop one)
- Hard block at < 7, or advisory warning?
- Should it produce a revised plan or just flag issues?

---

### 4. `/sriflow-design` — Design

**Reference sources:**
- gstack: `design-shotgun` (multiple candidates fast)
- gstack: `design-consultation` (DESIGN.md as source of truth)
- gstack: `design-html` (mockup → production HTML)
- gstack: `design-review` (iterative fix loop)

**Keep from sources:**
- `design-shotgun`: multi-candidate generation approach
- `design-consultation`: DESIGN.md structure
- `design-html`: mockup-to-HTML conversion logic
- `design-review`: iterative issue-fix loop

**Strip:**
- All four: gstack preamble scripts, binary calls, gbrain queries
- `design-html`: dependency on `/plan-ceo-review` output paths — read from sriflow-plan output instead

**What it does:**
Progressive skill: generates candidates → pick one → produce DESIGN.md → convert to HTML → review loop.

**Personalization questions to ask before writing:**
- Output format: HTML mockups, ASCII wireframes, or Excalidraw diagrams?
- How many candidates by default? (2 or 3)
- Should it enforce a design system / brand guide if one exists in the project?

---

### 5. `/sriflow-build` — Build / Code

**Reference sources:**
- gstack: `guard` (pre-build safety — wraps `careful`)

**Keep from sources:**
- `guard`: warning logic before destructive ops (rm -rf, DROP TABLE, force-push)

**Strip:**
- `guard`: gstack preamble, binary calls, `careful` delegation (rewrite inline)

**What it does:**
Pre-build safety check, then implements the approved design. sriflow-trim handles
code minimalism. Checks for existing code/utils before writing new ones.

**Personalization questions to ask before writing:**
- Should it always run a pre-build check (type check, lint) before starting?
- How should it handle ambiguity mid-build — stop and ask or make a call?
- Preferred test style: assert-based self-checks, or test files?

---

### 6. `/sriflow-code-review` — Code Review

**Reference sources:**
- gstack: `review` (diff review: SQL safety, LLM trust, correctness)
- gstack: `devex-review` (DX audit via browser — scoring logic only)
- ~~gstack: `codex`~~ — **dropped** (OpenAI Codex CLI wrapper, not applicable)

**Keep from sources:**
- `review`: full diff analysis logic — SQL safety, security, LLM trust boundaries, correctness
- `devex-review`: DX scoring criteria (pulled in as optional lens, not full browser audit)

**Strip:**
- `review`: gstack preamble, binary calls
- `devex-review`: browser navigation steps, all gstack binary preamble — keep scoring rubric only

**What it does:**
Diff review after build. Findings one per line, severity-tagged. Blocks ship on CRITICAL.

**Personalization questions to ask before writing:**
- Severity tags: CRITICAL / WARN / NITPICK, or custom?
- Should it auto-apply fixable findings or just report?
- Include a "what trim would delete" section?

---

### 7. `/sriflow-test` — Test

**Reference sources:**
- gstack: `qa` (full QA with browser)
- gstack: `qa-only` (report-only, no fixes)

**Keep from sources:**
- `qa`: systematic test case structure (golden path, edge cases, error states)
- `qa-only`: report format (pass/fail per case)
- Merge both: run tests + produce report + optional fix mode

**Strip:**
- Both: gstack preamble, binary calls, gbrain context queries

**What it does:**
Tests built feature: golden path, edge cases, error states, regression check.
Produces QA report. Opens sriflow-browser for visual cases.

**Personalization questions to ask before writing:**
- Browser-based testing, unit tests, or both?
- Should it open sriflow-browser automatically for visual testing?
- Format of QA report: checklist, table, or narrative?

---

### 8. `/sriflow-ship` — Ship / Deploy

**Reference sources:**
- gstack: `ship` (deploy trigger)
- gstack: `land-and-deploy` (merge PR → wait for CI → confirm live)

**Keep from sources:**
- `ship`: deploy intent detection and trigger logic
- `land-and-deploy`: merge → CI wait → live confirmation → smoke test sequence

**Strip:**
- Both: gstack preamble, binary calls, `landing-report` integration (gstack-specific)
- `land-and-deploy`: `VERSION` slot system (gstack-specific)

**What it does:**
Handles both "just deploy" and "merge then deploy" flows. Waits for CI, confirms live,
runs smoke test. Writes deploy event to SRIFLOW_MEMORY.md.

**Personalization questions to ask before writing:**
- Deploy targets: Vercel, Railway, Fly.io, custom server, or detect from project?
- Require all tests to pass before merging, or allow override?
- Post-deploy smoke test: hit root URL only, or run a checklist?

---

### 9. `/sriflow-reflect` — Retrospective

**Reference sources:**
- gstack: `retro` (commit history analysis, work patterns, contributor notes)

**Keep from sources:**
- Commit history analysis logic
- Work pattern detection
- Structured retro output format

**Strip:**
- `retro`: per-contributor team framing (this is solo) — focus on product cycle instead
- gstack preamble, binary calls, gbrain context queries

**What it does:**
Analyzes the completed cycle: what was built, decisions, what went wrong, carry-forward.
Reads SRIFLOW_MEMORY.md for full context. Updates memory with lessons learned.

**Personalization questions to ask before writing:**
- Length: short (bullet list) or thorough (full retro doc)?
- Should it score the cycle (velocity, quality, decision quality)?
- Auto-open a PR with the retro doc, or write it locally?

---

### 10. `/sriflow-browser` — Custom Browser

**Reference sources:**
- gstack: `browse` (URL navigation, page interaction)
- gstack: `scrape` (scrape flow prototyping)

**Keep from sources:**
- `browse`: core navigation and interaction logic
- `scrape`: intent-based flow prototyping approach

**Strip:**
- Both: gstack preamble, binary calls
- `scrape`: skillify integration (saves scrape as new gstack skill) — not needed

**What it does:**
Dual-mode. Auto-detects from context:
- **Dev mode** — localhost, fast preview, hot-reload visibility
- **Automation mode** — real sites, forms, scraping, auth

Token-efficient: returns only what's needed (screenshot, extracted text, action result).

**Personalization questions to ask before writing:**
- Default viewport size?
- Dev mode: auto-detect local port from project config (package.json etc.)?
- Automation mode: stealth headers by default, or only when requested?

---

### 11. `/sriflow-memory` — Memory System

**Reference sources:**
- gstack: `context-save` (captures git state + decisions)
- gstack: `context-restore` (loads last saved context)

**Keep from sources:**
- `context-save`: git state capture, decision logging
- `context-restore`: context loading and surfacing logic

**Strip:**
- Both: gstack preamble, binary calls, `~/.gstack/` path dependencies — rewrite to use `SRIFLOW_MEMORY.md` in project root

**What it does:**
Per-project memory. File: `SRIFLOW_MEMORY.md` in project root.

Structure:
- **Summary** (auto-updated) — goal, stack, key decisions, current pipeline stage
- **Log** (append-only) — timestamped entry per prompt
- **Auto-compress** — log > 50 entries → summarise oldest 40 into Summary

Auto-triggered by all other sriflow skills on completion. Standalone: read context or force compress.

**Personalization questions to ask before writing:**
- Every skill auto-updates memory, or only key ones (ship, reflect, plan)?
- Max log entries before auto-compress triggers?
- Flag when context is getting long (token budget warning)?

---

### 12. `/sriflow-trim` — Token Optimization ✅ DONE

**Status:** Written. No gstack reference — fully custom.

Combined caveman (compressed speech) + ponytail (minimal code). Auto-activates every prompt.
Sri's rules: never narrate code, always question the task, no headers in chat replies.
`// trim:` comment tag for deliberate shortcuts.

---

### 13. `/sriflow` — Router / Front Door

**Reference sources:**
- gstack: `gstack` (router skill — routes intent to correct sub-skill)

**Keep from sources:**
- Intent detection and routing logic
- Help/status output structure

**Strip:**
- gstack preamble, binary calls, all `~/.claude/skills/gstack/` path references
- Conductor/headless session handling

**What it does:**
Single entry point. Routes any intent to the correct sriflow-* skill.
Also handles: pipeline status, memory read, help listing.

---

## Build Order

Skills built in this sequence (each preceded by personalization Q&A):

| # | Skill | Why this order |
|---|---|---|
| 1 | `/sriflow-memory` | Foundation — all other skills write to it |
| 2 | `/sriflow-trim` | Token layer — active in every skill, always-on |
| 3 | `/sriflow-think` | Ideation first — most complex, sets the tone |
| 4 | `/sriflow-plan` | Depends on think output format |
| 5 | `/sriflow-plan-review` | Depends on plan output format |
| 6 | `/sriflow-design` | Mid-pipeline |
| 7 | `/sriflow-build` | Core coding stage |
| 8 | `/sriflow-code-review` | Depends on build diff format |
| 9 | `/sriflow-test` | Depends on build output |
| 10 | `/sriflow-browser` | Needed by test and design |
| 11 | `/sriflow-ship` | Terminal stage |
| 12 | `/sriflow-reflect` | Reads memory, closes the loop |
| 13 | `/sriflow` | Router last — needs all skills defined |

---

## File Layout (end state)

```
sriflow/
├── gstack/                        # reference clone — read-only
├── ba-toolkit/                    # reference — read-only
├── my-stack/
│   ├── README.md
│   └── skills/
│       ├── sriflow/               # router
│       ├── sriflow-think/
│       ├── sriflow-plan/
│       ├── sriflow-plan-review/
│       ├── sriflow-design/
│       ├── sriflow-build/
│       ├── sriflow-code-review/
│       ├── sriflow-test/
│       ├── sriflow-browser/
│       ├── sriflow-ship/
│       ├── sriflow-reflect/
│       ├── sriflow-memory/
│       └── sriflow-trim/
├── AGENTS.md
├── SKILLS_INVENTORY.md
├── IMPLEMENTATION_PLAN.md         # this file
└── SRIFLOW_MEMORY.md              # auto-created when first product session starts
```

---

## Rules That Apply to Every Skill

- All skills written from scratch — no gstack runtime dependency
- caveman (full) + ponytail (full) active in every skill by default
- Every skill writes a completion entry to `SRIFLOW_MEMORY.md`
- Every skill prefixes output with current pipeline stage and memory summary
- Personalization Q&A happens before each skill is written — no batch writing
- Skills are installed into `my-stack/skills/` only, never globally

---

## What Is NOT in Scope (this run)

- CI/CD pipeline configuration
- Team/multi-user support
- gstack-gbrain or gbrain integration
- Any skill not listed above
