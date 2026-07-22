# Phase 1 — Wireframe Candidates

Generate exactly **2 ASCII wireframe candidates** for each key screen identified in pre-flight. For a product with multiple screens, present Candidate A and Candidate B for each screen as a set — not screen-by-screen in isolation.

## Wireframe Generation Rules

**Each candidate must:**

1. Cover all key screens identified in pre-flight (or stated by the user).
2. Show layout structure with ASCII box-drawing characters — not just a list of words.
3. Label every component with its name and approximate placement.
4. Show navigation pattern explicitly (topbar, sidebar, bottom nav, breadcrumbs, etc.).
5. Include a 3-sentence design rationale explaining the visual and interaction philosophy behind this direction.

**Candidate A and B must be genuinely different directions.** Not the same layout with different labels. If two candidates feel like siblings — same structural rhythm, same primary navigation placement, same content density — one of them failed. Regenerate the weaker one with a deliberately different direction.

Concrete test: if you could swap the navigation between the two candidates without noticing, they are too similar. Each candidate should feel like it came from a different design team.

## ASCII Wireframe Format

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

## What Each Candidate Must Document

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

## After Generating Both Candidates

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
