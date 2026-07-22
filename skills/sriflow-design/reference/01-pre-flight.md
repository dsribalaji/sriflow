# Pre-flight: Context Gathering

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

## Phase 0b — Competitive Research (optional)

Before wireframing, optionally research how competitors solve the same design
problem. This informs layout patterns, interaction models, and differentiation.

```bash
# Quick competitive scan — 3 searches max
# WebSearch for: "[product type] UI design [current year]"
# WebSearch for: "[competitor name] interface layout"
# WebSearch for: "[feature type] UX best practices"
```

Use findings to:
- **Borrow patterns:** If competitors all use a sidebar nav, consider why.
- **Differentiate:** Where competitors converge, find a better approach.
- **Avoid anti-patterns:** If users complain about a pattern, skip it.

If WebSearch unavailable or user skips: proceed without competitive context.
If results found: note key patterns and anti-patterns. Reference in wireframe
rationale ("Candidate A uses sidebar nav — industry standard for dashboards").

**Time box:** 3 searches max. This is design input, not a research report.
