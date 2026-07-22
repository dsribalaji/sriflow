---
name: sriflow-design
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-plan-review, sriflow-build
description: "Progressive design pipeline. CLI/TUI/Web/Mobile/Library/Service aware. Absorbs: gstack design-shotgun, design-consultation, ECC UI patterns. Not for: code implementation — use sriflow-build. Not for: plan review — use sriflow-plan-review."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
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
next-skill: /sriflow-build
---

# /sriflow-design — Progressive Design (CLI+TUI+Web+Mobile)

## When to invoke

After plan-review. Detects project medium (CLI/TUI/Web/Mobile/Library/Service) and branches the design pipeline accordingly. CLI/TUI projects skip wireframes/HTML and produce command tree + output contract. Web/Mobile projects run the full visual pipeline.

## Reference files

| File | Content |
|------|---------|
| `reference/00-preamble.md` | Shell setup, medium detection |
| `reference/01-pre-flight.md` | Context gathering + competitive research |
| `reference/02-wireframe.md` | ASCII wireframe candidates (Web/Mobile) |
| `reference/03-design.md` | DESIGN.md token specification |
| `reference/04-html.md` | HTML mockup rules (Web/Mobile) |
| `reference/05-review.md` | A11Y + CONSISTENCY + RESPONSIVE + STATE audit |
| `reference/06-output.md` | CLEAR TO /sriflow-build |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **gstack design-consultation** | Full design system from scratch | `reference/patterns/design-consultation.md` |
| **gstack design-shotgun** | Multi-variant generation + comparison board | `reference/patterns/design-shotgun.md` |
| **gstack design-html** | Production-quality Pretext HTML/CSS | `reference/patterns/design-html.md` |
| **gstack design-review** | Visual audit + fix loop with atomic commits | `reference/05-review.md` enhanced |
| **ECC e2e-runner** | Playwright-based design verification | `reference/patterns/e2e-design-check.md` |
| **Apple HIG** | iOS design patterns (via gstack ios-design-review) | `reference/patterns/apple-hig.md` |

### CLI/TUI design path
Already implemented in v2.0. No changes needed — command tree, flag reference, output contract, terminal tokens, prototype phase all present.

## Workflow
1. **Preamble** → medium detection
2. **Phase 0** — Context gathering (read PLAN.md, PLAN_REVIEW.md)
3. **Phase 0b** — Competitive research (3 searches max)
4. **Phase 1** — Wireframe candidates (Web/Mobile) OR Command tree (CLI/TUI)
5. **Phase 2** — DESIGN.md (tokens + components)
6. **Phase 3** — HTML mockups (Web/Mobile) OR Prototype (CLI/TUI)
7. **Phase 4** — Review loop (audit → fix → re-verify, max 5 passes)
8. **Output** → CLEAR TO /sriflow-build

## Voice
Direct, builder-to-builder, compressed for runtime.

## Completion Status
- **DONE** — design complete, review clean.
- **DONE_WITH_CONCERNS** — completed with concerns.
- **BLOCKED** — cannot proceed.
