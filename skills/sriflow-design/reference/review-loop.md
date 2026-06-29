# Phase 4 — Review Loop

Audit every HTML file in `design/` against `DESIGN.md`. Run 4 audit categories in sequence. Fix every finding. Loop until the audit is clean.

## Audit Categories

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

## Audit Report Format

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

## Auto-Fix Policy

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

## Fix Loop

1. Apply all fixes using the `Edit` tool. One `Edit` call per finding. Do not batch multiple unrelated changes in a single `Edit` call — keep the diff readable.
2. After applying all fixes, re-run the audit.
3. If new findings appear: report them and auto-fix (they are likely secondary effects of the previous fixes).
4. Loop until the audit reports zero findings.
5. Maximum 5 audit loops. If findings persist after 5 loops: report as DONE_WITH_CONCERNS with the remaining findings listed.

## After Clean Pass

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
