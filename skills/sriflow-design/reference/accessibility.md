# Accessibility Reference

## WCAG 2.1 AA Requirements

Every HTML mockup must meet WCAG 2.1 AA minimum. Key requirements:

### Contrast Ratios
- Body text on background: **4.5:1** minimum
- Large text (18px+ or 14px+ bold) on background: **3:1** minimum
- UI components and graphical objects: **3:1** minimum

### Required Elements

| Element | Requirement |
|---------|-------------|
| Skip link | First focusable element on pages with navigation: `<a href="#main-content" class="skip-link">Skip to main content</a>` |
| Heading hierarchy | One `<h1>` per page. `<h2>` for sections, `<h3>` for subsections. Never skip levels |
| Semantic HTML | Use `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>` for meaning |
| Form labels | Every `<input>` has an associated `<label>` via `for` attribute |
| Alt text | Every image placeholder: `alt="<description>"` |
| Icon buttons | Every icon-only button: `aria-label="<action name>"` |
| Focus styles | Every interactive element has visible `:focus` ring. Never `outline: none` without replacement |
| Keyboard navigation | All interactive controls reachable via Tab. Logical tab order |
| ARIA states | `aria-expanded`, `aria-selected`, `aria-current` on components with those states |
| Color independence | Never convey information by color alone — use text, icons, or patterns alongside |
| Touch targets | Minimum 44×44px on mobile for all interactive elements |

### Common Failures

| Pattern | Problem | Fix |
|---------|---------|-----|
| `outline: none` | Removes focus indicator | Add `:focus-visible` ring |
| `<div onclick="...">` | Not keyboard accessible | Use `<button>` or add `role="button"` + keyboard handler |
| Color-only status | Status conveyed only by color | Add icon or text label |
| Missing `alt` | Screen readers announce filename | Write descriptive alt text |
| Skipped heading level | h1 → h3 (h2 skipped) | Use sequential heading levels |
| `<input>` without label | Screen reader can't identify field | Add `<label for="...">` |
| Small touch target | Buttons/links < 44px on mobile | Set min-width/min-height to 44px |

### CSS Patterns for Accessibility

```css
/* Skip link */
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

/* Visually hidden (screen reader only) */
.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

/* Focus ring — never outline: none without this */
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### Audit Checklist

Use this checklist when running the A11Y audit category:

- [ ] Skip link present as first focusable element
- [ ] One `<h1>` per page
- [ ] Heading hierarchy sequential (no skipped levels)
- [ ] All image placeholders have `alt` text
- [ ] All form inputs have associated `<label>`
- [ ] All icon-only buttons have `aria-label`
- [ ] No `outline: none` without `:focus-visible` replacement
- [ ] All interactive elements keyboard navigable
- [ ] `aria-expanded` on expandable components
- [ ] `aria-selected` on selectable components
- [ ] `aria-current` on active nav items
- [ ] Color contrast ratios meet 4.5:1 (body) / 3:1 (large)
- [ ] Information not conveyed by color alone
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Semantic HTML elements used (`<nav>`, `<main>`, etc.)
- [ ] Form submit button inside `<form>` element
