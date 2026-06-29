# DESIGN.md Template

Write `DESIGN.md` with these exact sections, in this order:

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

## D2 — Approve Before HTML

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
