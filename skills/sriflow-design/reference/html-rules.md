# HTML Mockup Rules

## HTML File Naming

`design/<screen-slug>.html` — derive slug from the screen name (lowercase, hyphens, no spaces).

Examples:
- "Dashboard" → `design/dashboard.html`
- "User Settings" → `design/user-settings.html`
- "Login / Sign Up" → `design/login.html`
- "Empty State" → `design/empty-state.html`

## HTML Generation Rules — Non-Negotiable

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

## AI Slop Blacklist — Never Include

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

## HTML Document Structure

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

## Writing the HTML Files

Write each file with the Write tool. Before writing, state:
- File name and path (`design/<slug>.html`)
- Screen this file represents
- States included
- Notable accessibility decisions

Write all files before calling AskUserQuestion D3.

## D3 — Approve or Request Changes

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
