# Pattern — Design HTML

The HTML production pattern behind the design skill's Phase 3. Defines what "production-quality" means for a design mockup: self-contained, accessible, responsive, and faithful to the DESIGN.md tokens. This is the pattern file; the phase reference (`reference/04-html.md`) carries the operational rules.

## Purpose

A mockup is not a screenshot — it is a living artifact the reviewer (and the build skill) reads. It must:

- Render identically with zero external dependencies (opens on an airgapped machine).
- Encode the design system (tokens as CSS variables) so the build can extract them.
- Pass WCAG AA and keyboard navigation so accessibility is decided in design, not retrofitted.
- Survive responsive review at 375/768/1280px without horizontal scroll.

## Structure discipline

Every HTML file has four layers, in order:

1. **Reset** — box-sizing, margins, image behavior.
2. **Tokens** — all DESIGN.md tokens as CSS custom properties on `:root`. Nothing else references raw values.
3. **Layout + components** — grid/shell, then each component's base styles.
4. **States** — `:hover`, `:focus`, `:active`, `[disabled]`, `.loading`, `.error`, `.empty`, `.success`.

Component classes are human-readable and purpose-named (`card`, `nav-list`, `status-badge`). No generated class names, no minification. Section comments (`<!-- SECTION: Navigation -->`) keep the file navigable.

## Token fidelity

- Every hex, font family, weight, size, spacing, radius, and shadow comes from DESIGN.md verbatim.
- Colors and spacing exist once, as variables — a hardcoded color inside a component rule is a violation (it will drift from DESIGN.md silently).
- Contrast is verified at design time: body text ≥ 4.5:1, large text ≥ 3:1, against the actual backgrounds.

## State completeness

A mockup that only shows the happy path fails its job. Each screen demonstrates:

- The populated state.
- At least one **empty** state section (with an actionable message).
- At least one **loading or error** state section.

Interactive components show every applicable state: hover, focus (visible ring), active, disabled, loading, error, success.

## Accessibility baseline (WCAG 2.1 AA)

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` used for meaning.
- One `<h1>` per page; heading levels never skip.
- Form inputs paired with `<label>`; icon-only buttons carry `aria-label`.
- `aria-expanded`/`aria-selected`/`aria-current` on toggle/selected components.
- Skip link first focusable element on pages with navigation.
- No information conveyed by color alone.
- Touch targets ≥ 44×44 on mobile.

## Anti-patterns (AI-slop blacklist)

Default-generator output that a design reviewer should reject on sight:

- Purple/blue gradients as default decoration.
- Generic 3-column icon+heading+text feature grids.
- Centered-everything with no hierarchy.
- Decorative blobs/waves not in the spec.
- "Get Started" / "Learn More" CTAs not from the product.
- Rounded-card + drop-shadow as the only component pattern.
- Cookie-cutter hero (left text, right image).
- External `<img>` URLs and stock placeholders.
- Lorem ipsum — use realistic content from PLAN.md.
- Emoji as the primary visual of a component.

## Review loop

The review is a fix loop, not a pass/fail:

1. Audit (see `reference/05-review.md`): accessibility, consistency, responsive, states.
2. Fix at the token level if a token is wrong (a wrong token infects every screen).
3. Fix at the component level if a component is wrong.
4. Fix per-screen only for screen-specific issues.
5. Re-verify; max 5 passes. Structural issues (wrong screen, wrong direction) go back to the user, not to more passes.

## Rules

1. Zero external dependencies — self-contained is non-negotiable.
2. Tokens on `:root` only; components reference variables, never literals.
3. Every state that exists in the design exists in the mockup.
4. The mockup is the contract for the build skill — anything ambiguous here will be guessed there.
5. When the user says "this screen is wrong", decide whether it is a token problem (fix once, everywhere), a component problem (fix once, re-check uses), or a screen problem (fix once). Fix at the highest layer that is wrong.