# Design System — SriFlow

## Product Context
- **What this is:** AI-powered product development pipeline — from raw idea to deployed product
- **Who it's for:** Solo builder (Sri), personal tool
- **Space/industry:** Developer tools / AI coding agents
- **Project type:** Skill stack (Markdown files) + browser automation (TypeScript/Bun)

## Aesthetic Direction
- **Direction:** Terminal-inspired, function-first. The CLI heritage IS the brand.
- **Decoration level:** Minimal — no decorative elements, no gradients, no shadows
- **Mood:** Serious tool built by someone who cares about craft. Warm, not cold.
- **Reference sites:** Linear (dark + restrained), Warp (warm accents), gstack (industrial utilitarian)

## Typography
- **Display:** Satoshi (Black 900 / Bold 700) — geometric with warmth
- **Body:** DM Sans (Regular 400 / Medium 500 / Semibold 600) — clean, readable
- **Code/Data:** JetBrains Mono (Regular 400 / Medium 500) — the personality font
- **Scale:** Hero 72px → Body 16px → Caption 13px → Micro 12px

## Color
- **Primary (dark mode):** amber-500 #F59E0B — warm, terminal cursor energy
- **Primary (light mode):** amber-600 #D97706 — darker for contrast on white
- **Neutrals:** Cool zinc grays
  - zinc-50: #FAFAFA (lightest)
  - zinc-400: #A1A1AA
  - zinc-600: #52525B
  - zinc-800: #27272A
  - Surface (dark): #141414
  - Base (dark): #0C0C0C
- **Semantic:** success #22C55E, warning #F59E0B, error #EF4444, info #3B82F6
- **Dark mode:** Default. Near-black base (#0C0C0C), surface cards at #141414.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — not cramped, not spacious
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Grid:** 12 columns at lg+, 1 column at mobile
- **Max content width:** 1200px
- **Border radius:** sm:4px, md:8px, lg:12px, full:9999px

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150ms) medium(250ms) long(400ms)

## Grain Texture
Subtle noise overlay for materiality:
- Dark mode: opacity 0.03
- Light mode: opacity 0.02
- SVG feTurbulence filter as CSS background-image

## Output Formats

### Browser screenshots
- Naming: `screenshots/TC-NNN-<step>.png`
- Annotations: red overlay boxes for findings
- Responsive: capture at mobile/tablet/desktop breakpoints

### HTML mockups
- Pretext computed layout (text reflows, heights adjust)
- 30KB overhead, zero dependencies
- Detects framework (React/Svelte/Vue)

### QA reports
- Markdown with tables and code blocks
- Gate status prominently displayed
- Regression delta section when previous report exists

### Code reviews
- Findings one per line: `path:line: severity: problem. Fix: action.`
- Summary table by lens
- Auto-fix section for NITPICKs

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-28 | Initial design system | Terminal-inspired, dark mode default, amber accent. Matches CLI heritage. |
| 2026-06-28 | Hand-written skills | No template system. Simpler, fewer moving parts, full control. |
| 2026-06-28 | TypeScript/Bun browser | Match gstack exactly. Compiled binary, native SQLite, daemon model. |
