# Pattern — Design Consultation

The consultation pattern for building a **full design system from scratch** when no design exists: brand extraction → token definition → component library → review. This is the deep path the design skill uses when the project has no established visual language, as opposed to the shotgun path (many variants) which explores options within a language.

## When to use

- No existing brand, style guide, or prior design (greenfield).
- The plan says "make it look good" with no visual direction.
- The product must feel cohesive across multiple screens (always true for web/mobile).

## Phase 0 — Consultation questions

Before any visual work, extract the design intent. Ask, in order:

1. **Reference anchors** — "Name 2-3 products or apps whose look you admire. What specifically about each?" (Gets direction without abstract adjectives.)
2. **Feeling** — "If a user described this product after one day of use, what word do you hope they use?" (Confident, calm, playful, serious...)
3. **Audience** — "Who is the primary user, and what is their environment?" (B2B desk vs commuter phone changes everything.)
4. **Non-negotiables** — "What must this NEVER look like?" (Cuts the template defaults fast.)
5. **Constraints** — brand colors that must be used, existing logo assets, accessibility requirements.

Record the answers verbatim — they become the DESIGN.md philosophy statement.

## Phase 1 — Brand extraction

If assets exist (logo, old site, brand doc), extract the system from them:

- Pull the existing primary/accent colors and the typeface.
- Identify the emotional register (what the current brand communicates).
- Decide what survives (continuity) vs what is replaced (the reason for the redesign).

## Phase 2 — Token definition

Define tokens before any component. A token is a decision you make once:

- **Color:** semantic roles (primary, secondary, background, surface, text, error, success, warning, border, focus) not just hues. Each token has a hex + a purpose. Verify WCAG contrast in the same pass — fixing a color later means touching every component that uses it.
- **Typography:** 2 families max (heading + body), a scale (usually 5-8 sizes), and line heights. Weights constrained.
- **Spacing:** base unit (4px or 8px) and the scale derived from it. No arbitrary paddings.
- **Radius/shadows/breakpoints:** as in the DESIGN.md spec.

Token rules: name by role, not by value (`--color-danger`, not `--color-red`). Roles can be remapped later; values cannot be reasoned about.

## Phase 3 — Component library

Build components bottom-up, from the tokens:

1. Primitive set: button (variants: primary/secondary/ghost/destructive), input, select, checkbox, radio, toggle, badge, tooltip, card, modal, toast, empty state.
2. Each component documents: variants, all states (default/hover/focus/disabled/loading/error/empty/success), keyboard behavior, and ARIA.
3. Compose screens from components — never invent new ad-hoc styling on a screen. If a screen needs something new, it becomes a component first.

**Rule:** no raw token values inside screen layout code — screens reference components, components reference tokens. Three layers, three reasons to change independently.

## Phase 4 — Review against intent

Re-read the consultation answers and check the built system against each:

- Does the feeling match the target word from question 2?
- Would the audience's environment (question 3) be served?
- Do the non-negotiables (question 4) hold?

Anything that fails gets fixed at the token or component layer, not patched per-screen.

## Output

The consultation produces exactly the DESIGN.md the design skill already writes. The added value of this pattern:

- The philosophy statement comes from real answers, not invented taste.
- Tokens are justified by brand/audience, so the reviewer can question them.
- The component library is complete before screens — screens are then assembly, not invention.

## Rules

1. Never skip the consultation questions for a greenfield design — direction from thin air is a coin flip.
2. Tokens by role, never by value.
3. New screen needs → new component first, then used on the screen.
4. The review compares against the recorded intent, not against "good design" in general.
5. If the user later says "make it more like X", that is a new consultation — re-run the relevant questions, update tokens, then let components and screens follow.