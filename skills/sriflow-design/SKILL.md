---
name: sriflow-design
preamble-tier: 2
version: 2.0.0
description: Progressive design pipeline — wireframes → DESIGN.md → HTML mockups → review loop. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - design this
  - create mockups
  - wireframe
  - design the UI
  - build the interface
  - /sriflow-design
---

## When to invoke this skill

Progressive four-phase design pipeline. Phase 1 generates two ASCII wireframe candidates
for every key screen, the user picks one, Phase 2 writes DESIGN.md (components, user flows,
data flow, API contracts), Phase 3 converts everything to self-contained HTML mockups in
the `design/` directory, and Phase 4 runs an audit-and-fix loop until the mockups are clean.

Run when the user says "design this", "create mockups", "wireframe", "design the UI",
"build the interface", or invokes `/sriflow-design`. Proactively suggest when starting
any UI feature with no existing design direction.

---

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

# Plan-mode detection
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Project memory
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -60 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Plans
if [ -f "PLAN.md" ]; then
  echo "PLAN.md: found"
else
  echo "PLAN.md: missing — design from scratch"
fi
if [ -f "PLAN_REVIEW.md" ]; then
  echo "PLAN_REVIEW.md: found"
fi

# Design dir
ls design/ 2>/dev/null && echo "design/: exists" || echo "design/: will create"

# DESIGN.md
[ -f "DESIGN.md" ] && echo "DESIGN.md: exists" || echo "DESIGN.md: missing"

# Git state
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
echo "GIT: staged=$_GIT_STAGED unstaged=$_GIT_UNSTAGED"

# Timeline
sriflow-timeline log '{"skill":"sriflow-design","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```

---

## Plan Mode Safe Operations

In plan mode, allowed because they inform the plan: `Read`, `Glob`, `Grep`, `Bash` (read-only commands), writes to `SRIFLOW_MEMORY.md`, and writes to `PLAN.md`. No destructive file operations or git mutations in plan mode.

## Skill Invocation During Plan Mode

If the user invokes this skill in plan mode, follow it step by step. AskUserQuestion satisfies plan mode's end-of-turn requirement. If AskUserQuestion is unavailable: render the decision brief as prose with the mandatory triad (ELI10, completeness, recommendation), then STOP and wait for a typed response.

At a STOP point, stop immediately. Do not continue the workflow or advance to the next phase.

---

## AskUserQuestion Format

Every AskUserQuestion is a structured decision brief. Use the D-numbered format for every question.

```
D<N> — <one-line question title>
Project/branch: <project name> on <_BRANCH>
ELI10: <plain English a 16-year-old could follow, 2-4 sentences, name the stakes>
Stakes if we pick wrong: <one sentence on what breaks or what the user loses>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10   (or: Note: options differ in kind, not coverage — no completeness score)
Pros / cons:
A) <option label> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option label>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of what you are actually trading off>
```

Rules:
- D-numbering: first question in a skill invocation is `D1`. Increment yourself. This is a model-level instruction, not a runtime counter.
- ELI10 is always present, in plain English, not function names.
- Recommendation is ALWAYS present.
- `(recommended)` on exactly one option.
- Completeness: use `N/10` when options differ in coverage (10 = complete, 7 = happy path, 3 = shortcut). If options differ in kind, write the kind-note.
- Pros / cons: ✅ and ❌. Minimum 2 pros and 1 con per option when the choice is real. Minimum 40 characters per bullet.
- Net line closes the decision.
- Maximum 4 options per AskUserQuestion call. With 5+ real options: split into sequential per-option calls labeled `D<N>.1`, `D<N>.2`, etc.
- Non-ASCII characters: write directly, never `\uXXXX`-escape.

If AskUserQuestion is unavailable or a call fails:
- In headless / spawned sessions: auto-choose the recommended option and announce it.
- In interactive sessions: render the full prose fallback (same triad: ELI10, per-choice completeness, recommendation with `(recommended)` marker), then STOP and wait for a typed reply.

---

## Voice

SriFlow voice: direct, builder-to-builder, compressed for runtime.

- Lead with the point. What it does, why it matters, what changes for the builder.
- Be concrete. Name files, line numbers, commands, outputs, real numbers.
- Tie choices to user outcomes: what the real user sees, loses, waits for, or can now do.
- Be direct about quality. Bugs matter. Edge cases matter. Fix the whole thing.
- Never corporate, academic, hype, or filler. No em dashes.
- No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted, furthermore, moreover, pivotal, tapestry, underscore, foster, showcase, intricate, vibrant, fundamental, significant.
- The user has context you do not. Make a recommendation, but the user decides.
- Never narrate what code does. Comment only when the WHY is non-obvious.

Good: `design/dashboard.html:47 uses #888 on #fff — fails WCAG AA. Fix: change to #595959.`
Bad: "I have identified a potential accessibility concern in the dashboard mockup file."

---

## Completeness Principle

Do the complete thing. All states, all screens, all edge cases. The only thing out of scope is genuinely unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases and states, 7 = happy path only, 3 = shortcut that will hurt later).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

---

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence (files listed, issues fixed).
- **DONE_WITH_CONCERNS** — completed, concerns listed explicitly.
- **BLOCKED** — cannot proceed; state the blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

---

## Memory Write

After workflow completion, append to `SRIFLOW_MEMORY.md`:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-design | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Phase completed: PHASE
DESIGN.md: DESIGN_STATUS
HTML files: HTML_FILES
Review findings fixed: FIXED_COUNT
MEMEOF
sriflow-timeline log '{"skill":"sriflow-design","event":"completed","branch":"'"$_BRANCH"'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null || true
```

Replace `OUTCOME`, `PHASE`, `DESIGN_STATUS`, `HTML_FILES`, `FIXED_COUNT` with actuals before running.

---

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

If memory found: give a 2-sentence summary of where the design pipeline is. If a phase is clearly incomplete, say so and offer to resume.

---

## Confusion Protocol

For high-stakes ambiguity — architecture, data model, screen count, missing product context — STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Do not use for routine layout or obvious choices.

---

# /sriflow-design — Progressive Design Pipeline

Four phases. Each phase requires explicit approval (via AskUserQuestion) before the next begins. You are acting as a senior product designer and front-end architect throughout.

Before starting Phase 1, run the pre-flight checks below.

---

## Pre-flight: Context Gathering

Read `PLAN.md` for project scope, screens, and user flows. If `PLAN.md` is missing, the design scope is unknown — ask the user to describe the product before proceeding.

```bash
if [ -f "PLAN.md" ]; then
  cat PLAN.md
fi
if [ -f "PLAN_REVIEW.md" ]; then
  cat PLAN_REVIEW.md
fi
if [ -f "DESIGN.md" ]; then
  echo "--- existing DESIGN.md ---"
  cat DESIGN.md
fi
```

Extract from the above:
- **Key screens** — what are the major screens or views? If not stated, infer from the product description.
- **User type** — who is the primary user? Technical, non-technical, internal, consumer?
- **Product tone** — what is the visual/emotional target? (Examples: "serious enterprise tool", "friendly consumer app", "developer dashboard", "marketing landing page")
- **Existing constraints** — any existing design tokens, brand colors, or framework?

If `PLAN.md` is present: summarize what you extracted in 3-5 bullet points before generating candidates. This makes your design rationale visible.

If `PLAN.md` is missing and the user has not described the product: call AskUserQuestion D0 before Phase 1.

**AskUserQuestion D0** (only if no plan context exists):

```
D0 — No plan context found — describe the product
Project/branch: <project name if known> on <_BRANCH>
ELI10: I have no product context to base the wireframes on. Without a description of what
       you're building, who uses it, and what they accomplish, the wireframes will be generic
       and unhelpful. This takes 30 seconds and saves an entire rework cycle.
Stakes if we pick wrong: Generic wireframes that don't fit the product require a full
                         Phase 1 redo after the product direction is clear.
Recommendation: A because a brief description costs 30 seconds and saves a rework cycle.
Note: options differ in kind, not coverage — no completeness score.
A) Describe the product (recommended)
  ✅ Wireframes will reflect the actual product: right screens, right user flows, right tone.
  ✅ DESIGN.md will map to real screens rather than placeholder examples.
  ❌ Requires 2-3 sentences from you before I can start.
B) Proceed with generic wireframes
  ✅ Starts immediately, no questions asked.
  ❌ Wireframes will be placeholder patterns not tied to your product; Phase 2 will require
     a full rewrite of component inventory and screen flows.
Net: A brief product description makes every subsequent phase faster and more accurate.
```

STOP. Wait for description before proceeding.

---

## Phase 1 — Wireframe Candidates

Generate exactly **2 ASCII wireframe candidates** for each key screen identified in pre-flight. For a product with multiple screens, present Candidate A and Candidate B for each screen as a set — not screen-by-screen in isolation.

### Wireframe Generation Rules

**Each candidate must:**

1. Cover all key screens identified in pre-flight (or stated by the user).
2. Show layout structure with ASCII box-drawing characters — not just a list of words.
3. Label every component with its name and approximate placement.
4. Show navigation pattern explicitly (topbar, sidebar, bottom nav, breadcrumbs, etc.).
5. Include a 3-sentence design rationale explaining the visual and interaction philosophy behind this direction.

**Candidate A and B must be genuinely different directions.** Not the same layout with different labels. If two candidates feel like siblings — same structural rhythm, same primary navigation placement, same content density — one of them failed. Regenerate the weaker one with a deliberately different direction.

Concrete test: if you could swap the navigation between the two candidates without noticing, they are too similar. Each candidate should feel like it came from a different design team.

### ASCII Wireframe Format

Use box-drawing characters for structure. Include dimensions as comments where they clarify intent. Label components in ALL CAPS inside the box. Show multiple states where layout differs (empty vs populated, mobile vs desktop).

Desktop layout example:

```
+------------------------------------------------------------------+  [1280px]
| LOGO                          NAV: Docs  Blog  Sign In  [CTA]   |  [56px]
+------------------------------------------------------------------+
|                                                                  |
|  +--------------------------+    +-----------------------------+ |
|  | SIDEBAR [240px]          |    | MAIN CONTENT               | |
|  |                          |    |                             | |
|  | [ Section A ]            |    |  SECTION HEADING            | |
|  | [ Section B ] <active>   |    |                             | |
|  | [ Section C ]            |    |  CARD GRID (3-col)          | |
|  |                          |    |  +------+ +------+ +------+ | |
|  | ──────────────           |    |  | ITEM | | ITEM | | ITEM | | |
|  | User Avatar  ▼           |    |  +------+ +------+ +------+ | |
|  +--------------------------+    +-----------------------------+ |
+------------------------------------------------------------------+
```

Mobile layout (375px) for the same screen:

```
+-------------------+  [375px]
| LOGO     ☰ MENU  |  [52px]
+-------------------+
|                   |
| SECTION HEADING   |
|                   |
| +---------------+ |
| | ITEM          | |
| +---------------+ |
| | ITEM          | |
| +---------------+ |
|                   |
| BOTTOM NAV        |
| [A] [B] [C] [D]   |
+-------------------+
```

### What Each Candidate Must Document

After the ASCII diagrams, include for each candidate:

**Design rationale** (3 sentences):
- Sentence 1: The visual thesis — what is the dominant organizing principle of this direction?
- Sentence 2: Why this navigation pattern fits the user type identified in pre-flight.
- Sentence 3: What feeling the user should have after 3 seconds on this screen.

**Component inventory** (flat list):
- Every major component visible in the wireframe, with state variants listed.
- Example: `NavigationSidebar — states: default, collapsed, hover-item, active-item`

**Color/typography direction** (2-3 sentences, no hex values yet — those come in Phase 2):
- Font personality (geometric sans, humanist serif, monospace, etc.)
- Color temperature (warm/cool/neutral) and density (spacious/dense)
- What design reference points this evokes (without naming them as copies)

### After Generating Both Candidates

Display both candidates in full. Then call AskUserQuestion D1:

```
D1 — Which design direction for <project name>?
Project/branch: <project name> on <_BRANCH>
ELI10: These are two different visual and interaction philosophies for <project>. Pick the
       one that feels right for your users — or blend specific elements from both. This
       decision locks the structural approach before we write DESIGN.md. Getting this wrong
       means a Phase 2 rewrite, which costs 20 minutes.
Stakes if we pick wrong: Wrong direction locks the wrong component architecture into
                         DESIGN.md. A rewrite is possible but costs a full Phase 2 cycle.
Recommendation: <A or B> because <one concrete reason tied to the product context from PLAN.md>.
Completeness: A=8/10, B=8/10
A) Candidate A (recommended if chosen)
  ✅ <specific structural strength of Candidate A, ≥40 chars>
  ✅ <specific interaction strength of Candidate A, ≥40 chars>
  ❌ <honest tradeoff of Candidate A, ≥40 chars>
B) Candidate B
  ✅ <specific structural strength of Candidate B, ≥40 chars>
  ✅ <specific interaction strength of Candidate B, ≥40 chars>
  ❌ <honest tradeoff of Candidate B, ≥40 chars>
C) Blend — take <specific element> from A and <specific element> from B
  ✅ Gets the strongest elements of each direction combined
  ❌ Requires synthesis judgment that may add 10 minutes to Phase 2
Net: <one sentence naming the core design tradeoff between A and B>
```

**If the user already has their own wireframe or design direction:**

Use AskUserQuestion D1b:

```
D1b — Use your wireframe as the design direction?
Project/branch: <project name> on <_BRANCH>
ELI10: You've brought an existing wireframe or design direction. I can proceed directly
       to DESIGN.md using it as the source of truth, or I can generate candidates first
       so you have alternatives to compare against.
Stakes if we pick wrong: Proceeding without candidates means you never see what
                         alternative directions might look like — could miss a better path.
Recommendation: A because your existing wireframe already represents a design decision.
Note: options differ in kind, not coverage — no completeness score.
A) Proceed with your wireframe (recommended)
  ✅ No time lost generating alternatives you may not need
  ✅ Your design intent is preserved without influence from generated candidates
  ❌ No comparison point if you want to revisit the direction later
B) Generate candidates anyway
  ✅ Gives you two alternative directions to compare against your existing one
  ❌ Adds 10-15 minutes before Phase 2 begins
Net: If you trust your wireframe, proceed directly. Generate candidates only if
     you want to see alternative directions before committing.
```

STOP. Wait for user answer before proceeding to Phase 2.

---

## Phase 2 — DESIGN.md

Based on the chosen candidate (and any blend instructions from the user), write `DESIGN.md` to the project root.

This document is the single source of truth for Phase 3. Every HTML mockup will faithfully mirror what is in DESIGN.md. Gaps here become gaps in the HTML. Be complete.

### DESIGN.md Structure

Write `DESIGN.md` with these exact sections, in this order:

---

```markdown
# Design System

> One-sentence description of the visual philosophy and target user feeling.

## 1. System Components

| Component | Responsibility | Tech choice | Rationale |
|-----------|---------------|-------------|-----------|
| <name> | <what this component does for the user> | <HTML element / CSS pattern> | <why this choice> |

<!-- One row per major UI component. Include: navigation, layout shells,
     data containers, interactive controls, feedback elements, empty states. -->

## 2. Design Tokens

### 2.1 Colors

| Token | Hex | Use |
|-------|-----|-----|
| --color-primary | #XXXXXX | Primary action, CTAs, active state |
| --color-primary-hover | #XXXXXX | Hover state on primary elements |
| --color-secondary | #XXXXXX | Secondary actions, borders |
| --color-background | #XXXXXX | Page background |
| --color-surface | #XXXXXX | Cards, panels, elevated surfaces |
| --color-surface-hover | #XXXXXX | Interactive surface hover |
| --color-text-primary | #XXXXXX | Main body text |
| --color-text-muted | #XXXXXX | Secondary text, captions, placeholders |
| --color-text-inverse | #XXXXXX | Text on dark backgrounds |
| --color-accent | #XXXXXX | Highlights, badges, notification dots |
| --color-error | #XXXXXX | Error states, destructive actions |
| --color-success | #XXXXXX | Success states, confirmations |
| --color-warning | #XXXXXX | Warning states, caution indicators |
| --color-border | #XXXXXX | Default border color |
| --color-border-focus | #XXXXXX | Focus ring color |

WCAG AA status:
- --color-text-primary on --color-background: <ratio>:1 — <PASS|FAIL>
- --color-text-muted on --color-background: <ratio>:1 — <PASS|FAIL>
- --color-text-inverse on --color-primary: <ratio>:1 — <PASS|FAIL>

### 2.2 Typography

| Token | Value | Use |
|-------|-------|-----|
| --font-heading | '<family>', <fallbacks> | All headings |
| --font-body | '<family>', <fallbacks> | Body text, UI labels |
| --font-code | '<family>', monospace | Code, technical strings |

Scale:
| Level | Size | Line height | Weight | Use |
|-------|------|-------------|--------|-----|
| --text-xs | <n>px | <n> | <weight> | Captions, labels |
| --text-sm | <n>px | <n> | <weight> | Secondary body |
| --text-base | <n>px | <n> | <weight> | Primary body |
| --text-lg | <n>px | <n> | <weight> | Lead text |
| --text-xl | <n>px | <n> | <weight> | h3 |
| --text-2xl | <n>px | <n> | <weight> | h2 |
| --text-3xl | <n>px | <n> | <weight> | h1 |
| --text-4xl | <n>px | <n> | <weight> | Display / hero |

### 2.3 Spacing

Base unit: <n>px

| Token | Value | Use |
|-------|-------|-----|
| --space-1 | <n>px | Tight inline gaps |
| --space-2 | <n>px | Small gaps |
| --space-3 | <n>px | Component internal padding |
| --space-4 | <n>px | Default padding |
| --space-6 | <n>px | Section internal padding |
| --space-8 | <n>px | Large sections |
| --space-12 | <n>px | Page sections |
| --space-16 | <n>px | Hero / feature sections |

### 2.4 Borders and Shadows

| Token | Value | Use |
|-------|-------|-----|
| --radius-sm | <n>px | Badges, small chips |
| --radius-md | <n>px | Buttons, inputs |
| --radius-lg | <n>px | Cards, panels |
| --radius-xl | <n>px | Modals, sheets |
| --shadow-sm | <css shadow value> | Elevated interactive elements |
| --shadow-md | <css shadow value> | Cards, dropdowns |
| --shadow-lg | <css shadow value> | Modals, overlays |

### 2.5 Breakpoints

| Breakpoint | Width | Layout change |
|------------|-------|---------------|
| Mobile | 375px | Single column, bottom nav |
| Tablet | 768px | Two column, sidebar collapses |
| Desktop | 1024px | Full layout with sidebar |
| Wide | 1440px | Max content width, centered |

## 3. Component Library

<!-- One section per major component. Include props, variants, and all states.
     Document every state that differs visually. -->

### <ComponentName>

**Purpose:** <one sentence on what problem this component solves for the user>

**Props / configuration:**
- `<prop>` — `<type>` — <description>

**Variants:** <list all variants — e.g., primary, secondary, ghost, destructive>

**States:** default | hover | active | focus | disabled | loading | error | empty | success

**Keyboard behavior:** <Tab, Enter, Escape, Arrow keys — what each does>

**ARIA:** `role="<role>"`, `aria-label`, `aria-expanded`, `aria-selected` as applicable

ASCII sketch (desktop):
```
<sketch>
```

ASCII sketch (mobile, if layout differs):
```
<sketch>
```

<!-- Repeat for each major component -->

## 4. User Flows

<!-- Number every flow. Document happy path in numbered steps.
     Document at least one alternate path and one error path per flow. -->

### Flow <N>: <Flow Name>

**User goal:** <what the user is trying to accomplish>
**Entry points:** <how the user reaches this flow>
**Exit points:** <where the user goes after completing or abandoning>

**Happy path:**
1. <step> — user sees: <what> / user does: <action>
2. <step> — user sees: <what> / user does: <action>
3. <step> — system response: <what changes>
4. <step> — confirmation: <what success looks like>

**Alternate path — <condition>:**
1. At step <N>, if <condition>:
2. <alternate step>
3. <resolution>

**Error path — <error type>:**
1. At step <N>, if <error>:
2. System shows: <error message / indicator>
3. Recovery: <what the user can do>

**Edge cases:**
- Empty state: <what the user sees when there is no data>
- Loading state: <what the user sees while data loads>
- Network error: <what the user sees when the request fails>

<!-- Repeat for each major user flow -->

## 5. Data Flow

<!-- Document how data moves through the UI. Distinguish server data,
     local state, and derived state. Document what triggers re-fetch. -->

### 5.1 Data Sources

| Source | Type | Transport | Refresh trigger |
|--------|------|-----------|-----------------|
| <API endpoint or data source> | <REST/GraphQL/WebSocket/local> | <protocol> | <event or polling interval> |

### 5.2 State Architecture

| State | Location | Scope | What updates it | What reads it |
|-------|----------|-------|-----------------|---------------|
| <state name> | <local component / page / global store> | <component / page / app> | <actions or events> | <components> |

### 5.3 Data Flow Diagram

```
[User Action]
     |
     v
[Component: <name>]  ---(API call)--->  [Endpoint: <path>]
     |                                         |
     v                                         v
[Local state update]                   [Response: <shape>]
     |                                         |
     v                                         v
[UI re-render]  <----(state diff)----  [Store: <name>]
```

### 5.4 API Contracts

For each endpoint the UI calls:

---

**<HTTP METHOD> <path>**

Purpose: <one sentence on what this endpoint does>

Request:
```json
{
  "<field>": "<type> — <description>",
  "<field>": "<type> — <description>"
}
```

Response (success — HTTP 200):
```json
{
  "<field>": "<type> — <description>",
  "<field>": "<type> — <description>"
}
```

Response (error):
| Status | Condition | UI response |
|--------|-----------|-------------|
| 400 | <condition> | <what the UI shows> |
| 401 | Unauthenticated | Redirect to login |
| 403 | Unauthorized | Show permission error |
| 404 | Not found | Show empty state |
| 500 | Server error | Show retry prompt |

---

<!-- Repeat for each endpoint -->

## 6. State Management Approach

**Pattern:** <component-local state / context API / external store / server state library>

**Rationale:** <why this pattern fits the complexity of this product>

**Global state:** <list items that must live in global state and why>

**Server state:** <list items fetched from the server, caching strategy>

**Local state:** <list items that live only in the component that uses them>

**Derived state:** <list computed values and what they derive from>
```

---

After writing `DESIGN.md`, call AskUserQuestion D2:

```
D2 — DESIGN.md complete — approve before HTML?
Project/branch: <project name> on <_BRANCH>
ELI10: DESIGN.md is now the source of truth for the HTML phase. Every HTML file will
       be generated to match it exactly. If there is anything wrong in DESIGN.md —
       wrong screens, missing components, incorrect color tokens — it will be embedded
       in the HTML. Review it now before 3+ files get generated from it.
Stakes if we pick wrong: Approving a gap in DESIGN.md means that gap ships in every
                         HTML mockup. Fixing it after HTML requires editing multiple files.
Recommendation: A because reviewing a text document costs 2 minutes; revising 4 HTML
                files costs 20 minutes.
Completeness: A=10/10, B=7/10
A) Approve DESIGN.md — proceed to HTML (recommended)
  ✅ DESIGN.md is complete and correct — move to Phase 3 immediately
  ✅ User flows, components, tokens, and API contracts are all documented
  ❌ Any gap discovered in Phase 3 will require both DESIGN.md and HTML revisions
B) Revise DESIGN.md first
  ✅ Catch issues before HTML generation — cheaper fix
  ✅ Opportunity to add missing screens, components, or API contracts
  ❌ Delays Phase 3; Phase 2 repeats from this point after revision
Net: Approve now if DESIGN.md reflects the complete design intent. Revise if
     anything is missing, wrong, or uncertain.
```

If the user chooses to revise: make the requested changes, then call D2 again. Repeat until approved.

STOP. Wait for user approval before proceeding to Phase 3.

---

## Phase 3 — HTML Mockups

Convert `DESIGN.md` into production-quality HTML mockups. One HTML file per key screen documented in `## 4. User Flows` or `## 2. Screen Inventory` (whichever is present in DESIGN.md).

Create the `design/` directory if it does not exist:

```bash
mkdir -p design/
```

### HTML File Naming

`design/<screen-slug>.html` — derive slug from the screen name (lowercase, hyphens, no spaces).

Examples:
- "Dashboard" → `design/dashboard.html`
- "User Settings" → `design/user-settings.html`
- "Login / Sign Up" → `design/login.html`
- "Empty State" → `design/empty-state.html`

### HTML Generation Rules — Non-Negotiable

Every HTML file must comply with all of the following:

**Self-contained:**
- Inline all CSS in a single `<style>` block at the top.
- Zero external dependencies. No CDN links. No `<link rel="stylesheet">` to external hosts.
- No JavaScript frameworks. No React, Vue, Svelte, Alpine, HTMX.
- Fonts: either inline as base64 data URIs (for exact fidelity) or use CSS `font-family` stacks with system fallbacks. If using Google Fonts, note that the file requires internet access — prefer system stacks for true zero-dependency behavior.
- All images: `<div>` or `<svg>` placeholders. No `<img src="...">` pointing to external URLs.
- Icon placeholders: simple CSS shapes, SVG inline, or Unicode symbols. No icon libraries.

**Responsive:**
- Mobile-first CSS. Base styles target 375px. Use `@media (min-width: <breakpoint>)` to progressively enhance.
- Use CSS Grid and Flexbox. No fixed-width layouts that break at mobile.
- Every layout must be usable and navigable at 375px, 768px, and 1280px minimum.
- No horizontal scroll on any viewport. Content reflows, does not overflow.
- Touch targets: minimum 44×44px on mobile for all interactive elements.

**Accessible — WCAG 2.1 AA minimum:**
- Semantic HTML5: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`. Use these elements for their meaning, not for styling.
- Heading hierarchy: one `<h1>` per page. `<h2>` for major sections. `<h3>` for subsections. Do not skip levels.
- Every image placeholder: `alt="<description of what the image would show>"`.
- Every form input: associated `<label>` via `for` attribute. No floating labels without visible label text.
- Every icon-only button: `aria-label="<action name>"`.
- Every interactive control: keyboard navigable via Tab. Visible `:focus` ring in CSS. Not `outline: none` without a replacement.
- Color contrast: verify every text color against its background. WCAG AA requires 4.5:1 for body text, 3:1 for large text (18px+ or 14px+ bold). Use the token values from DESIGN.md.
- `aria-expanded`, `aria-selected`, `aria-current` on interactive components that have expanded/selected/active states.
- Do not convey information by color alone. Use text, icons, or patterns alongside color.
- Skip link: `<a href="#main-content" class="skip-link">Skip to main content</a>` as the first focusable element on pages with navigation.

**Design-accurate:**
- Use exact hex values from DESIGN.md `## 2.1 Colors`. Do not approximate or guess.
- Use exact font families, weights, and sizes from `## 2.2 Typography`.
- Use exact spacing values from `## 2.3 Spacing`.
- Use exact border-radius and shadow values from `## 2.4 Borders and Shadows`.
- CSS custom properties: define all design tokens as CSS variables on `:root`. Reference them throughout. Never hardcode a color or spacing value that is in DESIGN.md.

**States — every interactive component must show all applicable states:**
- `:hover` — CSS pseudo-class on all clickable elements
- `:focus`, `:focus-visible` — visible ring, not `outline: none`
- `:active` — press state on buttons and links
- `[disabled]` or `.disabled` — greyed out, not clickable, `cursor: not-allowed`
- `.loading` — spinner or skeleton placeholder
- `.error` — error color, error message or icon
- `.empty` — empty state with actionable message ("No items yet. Add your first →")
- `.success` — confirmation state with success color

**States per screen:** Include at least one section of the mockup that demonstrates the empty state and one that demonstrates the loading or error state. Do not generate only the happy-path populated view.

**Readable source:**
- Clean indentation (2 spaces).
- HTML section comments: `<!-- SECTION: Navigation -->`, `<!-- SECTION: Main Content -->`, etc.
- CSS section comments: `/* === RESET === */`, `/* === TOKENS === */`, `/* === LAYOUT === */`, `/* === COMPONENTS === */`, `/* === STATES === */`, `/* === RESPONSIVE === */`.
- No minification. No generated class names. Human-readable class names that describe their purpose.

### AI Slop Blacklist — Never Include

Do not include any of the following unless they appear in the actual DESIGN.md or user flow:

- Purple or blue gradients as default decoration
- Generic 3-column feature grids with icon + heading + text
- Center-everything layouts with no visual hierarchy
- Decorative blobs, waves, or abstract shapes not specified in the design
- "Get Started" / "Learn More" generic CTA text not from the product spec
- Rounded-corner cards with drop shadows as the only component pattern
- Cookie-cutter hero sections (left text, right image/illustration)
- Stock photo placeholder `<img>` tags pointing to external URLs
- Lorem ipsum placeholder text — use realistic content from PLAN.md or invent product-appropriate content
- Emoji as the primary visual element of a component
- Generic testimonial/review carousels
- Footer with generic "Company / Product / Legal / Social" columns not matching the actual product

### HTML Document Structure

Every HTML file follows this structure exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><Screen Name> — <Product Name></title>
  <style>
    /* === RESET === */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    img, svg { display: block; max-width: 100%; }

    /* === TOKENS === */
    :root {
      /* Colors — from DESIGN.md § 2.1 */
      --color-primary: <hex>;
      --color-primary-hover: <hex>;
      /* ... all tokens ... */

      /* Typography */
      --font-heading: <family>, <fallbacks>;
      --font-body: <family>, <fallbacks>;
      --font-code: <family>, monospace;

      /* Scale */
      --text-xs: <n>px;
      /* ... all scale values ... */

      /* Spacing */
      --space-1: <n>px;
      /* ... all spacing values ... */

      /* Borders */
      --radius-sm: <n>px;
      /* ... */

      /* Shadows */
      --shadow-sm: <css value>;
      /* ... */
    }

    /* === LAYOUT === */
    /* page shell, grid, sidebar, topbar */

    /* === COMPONENTS === */
    /* each component: base styles */

    /* === STATES === */
    /* :hover, :focus, :active, .loading, .error, .empty, .success, [disabled] */

    /* === RESPONSIVE === */
    @media (min-width: 768px) { /* tablet */ }
    @media (min-width: 1024px) { /* desktop */ }
    @media (min-width: 1440px) { /* wide */ }

    /* === UTILITIES === */
    /* .visually-hidden for skip links and screen-reader-only text */
    .visually-hidden {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0);
      white-space: nowrap; border: 0;
    }
    .skip-link {
      position: absolute;
      top: -40px; left: 0;
      background: var(--color-primary);
      color: var(--color-text-inverse);
      padding: var(--space-2) var(--space-4);
      z-index: 100;
      text-decoration: none;
    }
    .skip-link:focus { top: 0; }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- SECTION: Navigation -->
  <header>
    <nav aria-label="Main navigation">
      <!-- navigation content -->
    </nav>
  </header>

  <!-- SECTION: Main Content -->
  <main id="main-content">
    <!-- primary content -->

    <!-- STATE: Empty (shown when no data) -->
    <section class="empty-state" aria-label="No items">
      <!-- empty state -->
    </section>

    <!-- STATE: Error (shown on fetch failure) -->
    <section class="error-state" aria-live="polite" aria-label="Error">
      <!-- error state -->
    </section>

    <!-- STATE: Loading (shown while data loads) -->
    <section class="loading-state" aria-busy="true" aria-label="Loading">
      <!-- loading skeleton or spinner -->
    </section>
  </main>

  <!-- SECTION: Footer -->
  <footer>
    <!-- footer content -->
  </footer>
</body>
</html>
```

### Writing the HTML Files

Write each file with the Write tool. Before writing, state:
- File name and path (`design/<slug>.html`)
- Screen this file represents
- States included
- Notable accessibility decisions

Write all files before calling AskUserQuestion D3.

### After Writing All HTML Files

List every file written with its path. Then call AskUserQuestion D3:

```
D3 — HTML mockup set complete — approve or request changes?
Project/branch: <project name> on <_BRANCH>
ELI10: <N> HTML mockup files are written in design/. Each is self-contained, responsive,
       and includes the states documented in DESIGN.md. Phase 4 will run an automated
       audit and fix accessibility, consistency, responsiveness, and state coverage issues.
       You can approve and let Phase 4 run, or request specific changes first.
Stakes if we pick wrong: Moving to Phase 4 with a known structural issue embeds it across
                         all subsequent review iterations. Better to fix structural issues
                         now than to repeatedly work around them in the review loop.
Recommendation: A because Phase 4 catches the common issues automatically — no need to
                enumerate them manually.
Completeness: A=9/10, B=8/10
A) Proceed to Phase 4 review loop (recommended)
  ✅ Phase 4 will catch and fix accessibility, consistency, responsive, and state gaps
  ✅ Faster than a manual review at this stage
  ❌ Structural feedback (layout direction, screen scope) must still come from you
B) Request specific changes first
  ✅ Address structural or directional issues before automated review
  ✅ Prevents fixing minor issues in a file that needs a full structural revision
  ❌ Delays Phase 4; you review raw HTML without the benefit of the automated audit
Net: Choose A for efficient iteration. Choose B if you already see a structural problem
     that the review loop cannot fix (wrong screen, wrong layout direction, missing screen).
```

If the user requests specific changes: apply them, then call D3 again. Repeat until approved.

STOP. Wait for user approval before proceeding to Phase 4.

---

## Phase 4 — Review Loop

Audit every HTML file in `design/` against `DESIGN.md`. Run 4 audit categories in sequence. Fix every finding. Loop until the audit is clean.

### Audit Categories

**Category A11Y — Accessibility:**
- Missing `alt` text on image placeholders
- Missing `aria-label` on icon-only buttons and interactive controls
- Heading hierarchy violation (skipped level, multiple `<h1>`, `<h2>` before `<h1>`)
- Missing associated `<label>` on form inputs
- `outline: none` without a replacement `:focus` style
- Non-semantic element used where a semantic one exists (`<div>` used as button without `role="button"` and keyboard handler)
- `aria-expanded`, `aria-selected`, `aria-current` missing on components that have those states
- Color contrast failure: text color against background below WCAG AA threshold (4.5:1 body, 3:1 large)
- Information conveyed by color alone (no text, icon, or pattern backup)
- Missing skip link on pages with navigation
- Form submit button not in a `<form>` element

**Category CONSISTENCY — Design token adherence:**
- Hardcoded hex color that differs from a DESIGN.md token (e.g., `color: #3b82f6` when `--color-primary` is `#2563eb`)
- Hardcoded pixel value for spacing that diverges from the spacing scale
- Font family not in DESIGN.md typography tokens
- Font size not in the type scale from DESIGN.md
- Border-radius value not in the radius tokens
- Shadow value not in the shadow tokens
- Component variant not matching the documented variant (wrong button style, wrong badge color)

**Category RESPONSIVE — Layout at all breakpoints:**
- Content overflow or horizontal scroll at 375px
- Touch target below 44×44px on mobile viewport
- Fixed-width element that does not adapt to viewport
- Layout that collapses to unreadable density below 768px
- Text that truncates prematurely at narrow viewport
- Sticky or fixed element that obscures critical content on mobile
- Missing mobile navigation (desktop nav present, no mobile equivalent)
- Sidebar that does not collapse or stack on mobile

**Category STATE — State coverage:**
- Component with hover/active interaction but no `:hover` or `:active` CSS
- Interactive element with no `:focus-visible` style
- Button or control with no `[disabled]` style
- Screen with data but no empty state documented
- Screen with async data but no loading state shown
- Form field with no error state shown
- Action with no success confirmation state shown
- List or grid with no empty state variant
- Error state present but no recovery action visible (no retry button, no clear next step)

### Audit Report Format

Report every finding in this format:

```
design/<filename>.html: [A11Y|CONSISTENCY|RESPONSIVE|STATE]: <issue in one sentence>. Fix: <specific fix in one sentence>.
```

Examples:
```
design/dashboard.html: [A11Y]: Icon-only "settings" button missing aria-label. Fix: add aria-label="Open settings" to the button element.
design/login.html: [CONSISTENCY]: Password input uses border-color #d1d5db, token is --color-border (#e2e8f0). Fix: replace hardcoded value with var(--color-border).
design/user-settings.html: [RESPONSIVE]: Avatar upload button is 32×32px on mobile — below 44px minimum. Fix: add min-width: 44px; min-height: 44px to the .avatar-upload-btn rule.
design/dashboard.html: [STATE]: Card grid shows populated state only — no empty state. Fix: add a .card-grid--empty variant with "No data yet. Add your first item →" message.
```

### Auto-Fix Policy

**Auto-fix without asking** when the count of findings is ≤5. Apply all fixes using `Edit`, then re-run the audit to confirm clean.

**If findings > 5**: call AskUserQuestion D4:

```
D4 — <N> review findings — auto-fix all or selective?
Project/branch: <project name> on <_BRANCH>
ELI10: The audit found <N> issues across <M> files. I can fix them all automatically
       (faster, no decisions needed) or you can review the list and tell me which to
       skip (if any). Most findings are mechanical: wrong token value, missing aria-label,
       missing hover state. Auto-fix is safe for all of them.
Stakes if we pick wrong: Skipping a real finding leaves the mockup non-compliant with
                         DESIGN.md or WCAG AA — which affects Phase 5 (build handoff).
Recommendation: A because all <N> findings are mechanical and safe to auto-fix.
Note: options differ in kind, not coverage — no completeness score.
A) Auto-fix all <N> findings (recommended)
  ✅ All issues resolved in one pass — no review overhead
  ✅ Safe: all findings are mechanical fixes, not design decisions
  ❌ You will not see each individual change before it is applied
B) Review the list and tell me which to skip
  ✅ Full control over which changes land
  ❌ Requires reading <N> findings and deciding on each — adds 5-10 minutes
Net: Auto-fix is the right call for mechanical issues. Use selective if you have a
     reason a specific finding should not be fixed (e.g., deliberate design exception).
```

STOP. Wait for user answer.

### Fix Loop

1. Apply all fixes using the `Edit` tool. One `Edit` call per finding. Do not batch multiple unrelated changes in a single `Edit` call — keep the diff readable.
2. After applying all fixes, re-run the audit.
3. If new findings appear: report them and auto-fix (they are likely secondary effects of the previous fixes).
4. Loop until the audit reports zero findings.
5. Maximum 5 audit loops. If findings persist after 5 loops: report as DONE_WITH_CONCERNS with the remaining findings listed.

### After Clean Pass

Report the review summary:

```
Review complete.

Files reviewed: <list all design/*.html files>
Total findings across all passes: <N>
Findings fixed: <N>

Per-file summary:
- design/<file>.html: <N> findings fixed — <category list>
- design/<file>.html: <N> findings fixed — <category list>

Remaining issues (unfixed, with reason): <list, or "none">

CLEAR TO /sriflow-build
```

The `CLEAR TO /sriflow-build` line is the explicit handoff signal. It appears only when the review loop has run to a clean pass (zero open findings or all remaining findings are documented exceptions).

---

## Output Summary

After Phase 4 completes, print the output summary:

```
/sriflow-design complete.

DESIGN.md: <absolute path>

HTML mockups:
- design/<slug>.html — <Screen Name>
- design/<slug>.html — <Screen Name>
- design/<slug>.html — <Screen Name>
(list all files)

Total review findings fixed: <N>
Review result: CLEAN (or: DONE_WITH_CONCERNS — <list exceptions>)

CLEAR TO /sriflow-build
```

---

## UX Principles — Applied Throughout

These are not preferences. They are observed behavior patterns. Apply them in every phase.

**Users scan, they don't read.** Design for scanning: visual hierarchy (prominence = importance), clearly defined areas, headings and lists. Billboard design: if a user going 60mph can't identify what page they're on and what they can do, the layout has failed.

**Users satisfice.** They pick the first reasonable option, not the best. Make the right choice the most visible choice. If everything shouts, nothing is heard.

**Clicks don't matter, thinking does.** Three unambiguous clicks beat one click that requires thought. Navigation must answer: What site is this? What page am I on? What can I do here?

**Mobile: same rules, higher stakes.** No hover-to-discover affordances on mobile — hover doesn't exist. Touch targets: 44px minimum. Flat design that strips visual cues for interactivity fails on mobile.

**Goodwill reservoir.** Users start with goodwill. Every friction point drains it. Hiding information, punishing formatting, unnecessary fields, forced tours — all drain it. Obvious paths, upfront disclosure, easy error recovery — replenish it.

**Clarity over consistency.** If making something significantly clearer requires making it slightly inconsistent, choose clarity.

---

## Notes for Phase Resumption

If the user resumes a session mid-pipeline (e.g., after a break or context compaction), check `SRIFLOW_MEMORY.md` and `design/` to determine what phase was last completed:

```bash
# Check what exists
ls design/ 2>/dev/null && echo "design/ dir exists"
[ -f "DESIGN.md" ] && echo "DESIGN.md exists" || echo "DESIGN.md missing"
ls design/*.html 2>/dev/null | head -10

# Check memory
grep "Phase completed:" SRIFLOW_MEMORY.md 2>/dev/null | tail -3
```

Determine the correct resume point:
- No `DESIGN.md`, no `design/`: resume from Phase 1.
- `DESIGN.md` exists, no `design/`: resume from Phase 3 (wireframe was approved).
- `design/` has HTML files, last memory entry says "Phase 3": resume from Phase 4.
- Last memory entry says "Phase 4": ask the user if they want to re-run the review or proceed to build.

Announce the resume point: "Resuming at Phase <N>: <reason>." Then continue.
