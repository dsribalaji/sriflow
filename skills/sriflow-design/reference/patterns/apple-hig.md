# Pattern — Apple HIG

Apple Human Interface Guidelines distilled for design work on iOS/macOS/iPadOS targets. Use when the design skill's medium detection resolves to an Apple platform, or when applying Apple's interaction vocabulary to a cross-platform product. Everything here is a pattern to apply, not a list of requirements.

## Platform defaults

| Surface | Element | Default |
|---------|---------|---------|
| Navigation | Navigation bar | Title centered (iOS 16+), large title on scroll, back button inherits previous screen title |
| Navigation | Tab bar | 2-5 tabs max, at bottom, SF Symbol + label, never scrollable |
| Navigation | Toolbar | Context actions at bottom; move destructive actions to a confirmation sheet |
| Layout | Safe area | Content never under status bar, notch, or home indicator; inset via `safeAreaInsets` |
| Layout | Margins | Standard 16pt horizontal (iOS), 20pt (macOS) |
| Layout | Corner radius | Buttons 8-12pt, cards/sheets 12-16pt, large sheets 28pt+ |
| Motion | Feedback | Haptics for discrete outcomes, spring animations for modal transitions |
| Content | Lists | Grouped lists for settings; inset grouped on iPad |

## Core principles

### Deference and clarity
- Content is the interface. UI chrome (borders, shadows, gradients) recedes behind the content.
- One primary action per screen. Secondary actions visually quieter.
- Typography follows the system scale (Dynamic Type) — never a fixed pixel size for body text; the OS grows text for accessibility.

### Depth
- Layered material: navigation bar, cards, and sheets sit on distinct elevations with translucency and shadow.
- Transitions are physical: push (drill-down), present (modal sheet), fade (content change). Never mix without reason.

### Direct manipulation
- Tap targets ≥ 44×44pt (iOS). Gestures (swipe, long-press, drag) are primary, not hidden extras — if a gesture is the only way, it is discoverable through another visible affordance.

## Component vocabulary

**Navigation bar:** default top bar. Large titles for top-level screens, standard titles for detail. Never put more than 2-3 actions on the right.

**Tab bar:** the app's top-level structure. Changing tabs never loses state. A tab bar is not a toolbar — no destructive actions in it.

**Sheet (modal):** for focused, completion-required tasks. Half-sheet for quick edits, full-sheet for multi-step flows. Provide drag-to-dismiss plus a Cancel/Done affordance.

**Alert:** reserved for critical, time-sensitive information that blocks the task. Not for confirmations you can design away (destructive actions live in a confirmation dialog attached to the action, not a generic alert).

**Toast/snackbar:** Apple has no native toast; use a banner (announcement style) or an inline message. Snackbars are Android vocabulary — do not graft them onto an iOS look.

**Empty states:** an illustration (SF Symbol in a tinted circle), a title, one line of guidance, and exactly one action.

## State handling

- **Loading:** skeleton or spinner in place — never a blank screen. Pull-to-refresh on scroll views with a "last updated" affordance.
- **Error:** inline error near the field or action, not a modal. Full-screen errors only when the content is unavailable and a retry is the only path.
- **Offline:** degrade gracefully; cache last-known state; banner when actions will fail.
- **Empty:** always a designed state with an action, per the component vocabulary.

## Dark mode and dynamic type

- Design with semantic colors (background, secondaryBackground, label, secondaryLabel) — they flip automatically between light/dark.
- Never use raw white/black as a color; use system semantic colors or your tint-derived surfaces.
- Verify contrast in both appearances at both minimum and maximum Dynamic Type sizes.
- The design must read at 44pt text — hierarchy survives, nothing overlaps, no truncation of critical info.

## Accessibility (Apple's baseline)

- **Dynamic Type:** all text scales with the system setting. Fixed-size text is a defect.
- **VoiceOver:** every meaningful element has a label; decorative elements are hidden. Actions state what they do, not their type ("Compose email", not "Button").
- **Full Keyboard Access** (macOS/iPadOS): every control is reachable and activated by keyboard.
- **Reduce Motion / Reduce Transparency:** motion and translucency are enhancements, never carriers of meaning.

## Design-review checklist (Apple lens)

- [ ] One primary action per screen
- [ ] Tab bar ≤ 5, no destructive actions in it
- [ ] Touch targets ≥ 44×44pt
- [ ] Semantic colors used (dark mode is not a second design)
- [ ] Dynamic Type survives at max size
- [ ] Back/forward affordance matches platform (swipe-back, push animation)
- [ ] No Android vocabulary (snackbar, FAB) in the design language
- [ ] Empty/loading/error states designed for every content screen
- [ ] VoiceOver labels and keyboard access present

## Integration

The design skill applies this pattern to the DESIGN.md token spec (semantic color tokens, spacing in 4pt/8pt multiples, typography scale) and to the HTML mockup phase (simulate the platform chrome in the mockup so reviewers can judge it). The design review lens checks the `apple-hig` checklist above for Apple-targeted projects.