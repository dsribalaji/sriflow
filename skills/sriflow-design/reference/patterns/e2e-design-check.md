# Pattern — E2E Design Check

Programmatic design verification with a headless browser. After the HTML mockups exist, run them through real-browser checks that a human eyeball misses or skips: computed-style verification, contrast measurement, responsive layout at real viewports, and regression against prior iterations.

## Purpose

The design review loop (`reference/05-review.md`) fixes what it can see in source. The e2e design check fixes what only a rendering browser reveals: computed styles that don't match DESIGN.md, actual contrast ratios, overflow at real widths, and screenshots that changed between iterations.

## When to use

- After HTML mockups are written (Phase 3) and before/within the Phase 4 review loop.
- On every review iteration — the fix loop re-runs the check, not just a re-read.
- Always for web/mobile medium. CLI/TUI projects have no browser surface — skip.

## Checks to run (via the browser skill)

### 1. Token application audit

For each DESIGN.md token, verify it is actually applied where the design says:

```bash
$B goto file://./design/dashboard.html
$B js "getComputedStyle(document.documentElement).getPropertyValue('--color-primary')"
```

Compare the computed `--color-primary` (and every token) against DESIGN.md. A token defined in `:root` but never referenced, or referenced as a hardcoded hex somewhere, is a finding.

### 2. Contrast measurement

Measure the actual rendered contrast of text on its background:

```bash
$B js "(() => {
  // sample the computed color of a text node and its nearest background
  // return the WCAG ratio; fail if < 4.5 (body) or < 3 (large text)
})()"
```

Cross-check the DESIGN.md contrast table against the real computed values — DESIGN.md says the ratio; the browser proves it.

### 3. Responsive layout check

Render at each breakpoint and verify no horizontal overflow:

```bash
$B viewport 375x812
$B js "document.documentElement.scrollWidth <= window.innerWidth"   # false = horizontal scroll
$B viewport 768x1024
$B js "document.documentElement.scrollWidth <= window.innerWidth"
$B viewport 1280x800
$B js "document.documentElement.scrollWidth <= window.innerWidth"
```

Also verify key content is visible at 375px (no hidden-but-required elements).

### 4. State coverage check

For each interactive component, confirm the state exists in the DOM (empty/error/loading sections present):

```bash
$B snapshot -i
$B js "document.querySelectorAll('.empty-state, .error-state, .loading-state').length"
```

The check asserts every designed state is present in at least one screen — not that every state is correct, but that none is missing.

### 5. Screenshot regression

Between review iterations, diff the screenshots:

```bash
$B screenshot /tmp/design-v2-dashboard.png
$B diff /tmp/design-v1-dashboard.png /tmp/design-v2-dashboard.png
```

Intentional change (the fix) shows a localized diff; an unintended change elsewhere (fixing the header changed the footer) is the regression the diff catches.

## Scoring and gate

Each check produces pass/fail per screen:

| Check | Pass | Fail → |
|-------|------|--------|
| Token application | All tokens match DESIGN.md | Fix the hardcoded value at token/component layer |
| Contrast | All text ≥ threshold | Fix the token (affects everywhere), re-measure |
| Responsive | No horizontal scroll at 3 widths | Fix the layout, re-check all widths |
| State coverage | All designed states present | Add the missing state section |
| Regression | Diff shows only intended change | Investigate scope creep of the change |

A failed check returns the loop to the fix step at the correct layer (token vs component vs screen). Three consecutive failures on the same check at the same layer means the layer's definition is wrong — go up a layer.

## Rules

1. The browser check verifies the DESIGN.md, never substitutes for it — expectations come from the spec.
2. Run the full check set on every iteration; partial checks let regressions through.
3. A token mismatch is fixed at the token layer once, then re-audited everywhere — never patched per-screen.
4. Screenshot diffs are the regression signal of the design loop — capture a baseline at the start of Phase 4.
5. Real content, real viewports: the check runs on the actual mockup files at actual breakpoints, not on a scaled-down abstraction.