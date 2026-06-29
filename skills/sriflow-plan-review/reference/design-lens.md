# Lens 2 — Design Review

## Cognitive frame: what a great designer sees

- **Seeing the system, not the screen** — Evaluate every flow end-to-end. What comes before, what comes after, what happens when things break.
- **Empathy as simulation** — Run mental simulations: bad signal, one hand free, boss watching, first time vs. 1000th time, mobile vs. desktop.
- **Hierarchy as service** — Every screen answers "what should the user see first, second, third?" Respecting their time, not prettifying pixels.
- **Edge case paranoia** — What if the name is 47 chars? Zero results? Network fails mid-action? First-time user vs. power user? Empty states are features, not afterthoughts.
- **Subtraction default** — "As little design as possible" (Dieter Rams). If a UI element doesn't earn its pixels, cut it. Feature bloat kills products faster than missing features.
- **Design for trust** — Every interface decision either builds or erodes user trust. Invisible = perfect. The highest compliment is not noticing the design.
- **The goodwill reservoir** — Users start with finite goodwill. Every friction point depletes it. Every unnecessary step depletes it. Every confusing error depletes it.
- **Storyboard the journey** — Before evaluating pixels, trace the full emotional arc. Every moment is a scene with a mood, not just a screen with a layout.

## How users actually behave (apply throughout)

- Users scan, they don't read. Design for scanning: visual hierarchy, clearly defined areas, headings, highlighted key terms.
- Users satisfice. They pick the first reasonable option, not the best. Make the right choice the most visible choice.
- Users muddle through. They don't figure out how things work. If they accomplish a goal by accident, they won't seek the right way.
- Users don't read instructions. Guidance must be brief, timely, and unavoidable, or it won't be seen.

## 10/10 design criteria checklist

Use this to evaluate whether the plan's design decisions meet the bar for a 10/10 design:

- [ ] Every key user flow is described end-to-end (not just the happy path)
- [ ] Error states are specified for every operation that can fail
- [ ] Empty states are specified for every list, feed, or dashboard view
- [ ] Loading/pending states are specified for async operations
- [ ] Mobile-first layout described (not just "responsive")
- [ ] Touch targets are adequate (minimum 44px) — or plan is desktop-only with explicit rationale
- [ ] Accessibility baseline specified: keyboard navigation, screen reader labels, color contrast
- [ ] First-time user experience differs from returning user experience (onboarding vs. power use)
- [ ] Edge cases named: very long text, zero items, max items, slow connection, session expiry
- [ ] Visual hierarchy stated for at least the primary screens (what the user sees first)
- [ ] Navigation model clear: how does the user get from anywhere to anywhere?
- [ ] Destructive actions have confirmation flows
- [ ] Success states are specified (what does the user see after completing a key action?)

## Design question set

**Q9 — Is the UX approach sound for the target user?**

Name the target user from the plan. Then evaluate:
- What is their likely context of use? (workplace, mobile, high-stress, routine task, occasional use?)
- Is the proposed interaction model appropriate for that context?
- Is the complexity of the interface matched to the user's skill level and expectations?
- What existing mental model does the user arrive with, and does the plan's design honor it or fight it?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q10 — Are the key flows clearly specified?**

Name the 2-3 most important user flows from the plan. These are the flows users will do most often, or that carry the most risk if they break. For each flow:

1. **Entry point**: How does the user arrive at this flow? (direct nav, email CTA, in-app prompt, search result?)
2. **Steps**: Is each step described in enough detail that a designer could wireframe it and a developer could implement it?
3. **Success state**: What does the user see and feel when the flow completes successfully? Is there a confirmation, a state change, a redirect?
4. **Error state**: What happens if the flow fails partway through? Are specific error conditions named (validation failure, network error, permission denied, resource not found)?
5. **Empty state**: If this flow involves displaying a list, feed, or dashboard, what does the user see when there is nothing to display?
6. **Edge cases**: Name at least three edge cases per key flow:
   - Concurrent edit (user opens same record on two tabs)
   - Network interruption mid-flow (connection drops after submit, before confirmation)
   - Session expiry (token expires while user is mid-flow)
   - Double submission (user clicks submit twice)
   - Slow response (server takes > 5 seconds — does the UI show loading state?)
   - Invalid/unexpected data (data returned from API is malformed or missing fields)

Flag any flow where the plan describes only the happy path without specifying error, empty, or edge case states.
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q11 — Interaction complexity check**

Evaluate the proposed interaction model against what the plan is trying to accomplish:

- **Proportionality**: Is the interaction complexity appropriate for the value being delivered? A 12-step onboarding for a utility app fails this test. A 1-click action for a high-stakes irreversible operation also fails this test. Name any mismatch.
- **Convention vs. innovation**: Does the plan introduce any novel interaction patterns (non-standard navigation, unusual input methods, bespoke UI metaphors)? If yes, does it justify why the convention was abandoned? The bar for departing from convention is high — conventions exist because they reduce cognitive load.
- **Subtraction**: List every UI element or interaction the plan describes. For each: does it earn its pixels? Does removing it make the product worse? If a UI element's removal would not hurt the product, it should be removed.
- **Cognitive load**: How many decisions does the user have to make in the primary flow? More than 3 decisions in a flow is a signal to simplify.
- **Missing elements**: Are there UI elements users will expect that are missing from the plan? (Navigation back, cancel/undo, help text, progress indicators for long operations, keyboard shortcuts for power users?)
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q12 — Accessibility and mobile baseline**

Accessibility and mobile are not afterthoughts — they are first-class design requirements. Evaluate whether the plan addresses them:

**Accessibility:**
- Is accessibility addressed anywhere in the plan? If not at all, that is a CONCERN at minimum.
- Minimum WCAG AA baseline that must be specified:
  - Keyboard navigation: can every interactive element be reached and activated without a mouse?
  - Screen reader labels: are form fields labeled? Are icon-only buttons described? Are images described?
  - Color is not the sole indicator of meaning: error states, required fields, status indicators must use shape or text in addition to color.
  - Color contrast: primary text on primary background must meet 4.5:1 contrast ratio.
  - Focus indicators: focused elements must have visible focus rings (default browser styles are acceptable if not overridden).
  - Touch targets: interactive elements must be at least 44x44px for mobile.
- If the plan removes or overrides browser defaults (custom checkboxes, custom selects, custom focus rings), does it specify accessible replacements?

**Mobile:**
- Does the plan expect mobile usage? (If yes, it is explicit; if unstated, default to yes for any product with public access.)
- "Responsive" is not a design decision. Is the plan describing how the layout changes across breakpoints? What is the primary mobile layout for each key screen?
- Are there interactions in the plan that don't translate to touch? (Hover states, right-click menus, drag-and-drop without mobile equivalent, multi-key keyboard shortcuts?)
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q13 — Run the 10/10 design criteria checklist**

Go through every item in the checklist above. For each unchecked item:
- Is the absence intentional (e.g., plan is API-only, so empty states don't apply)? If yes, mark N/A and explain why.
- Or is it a gap in the plan? If yes, classify it.

Don't soft-pedal the severity:
- An unspecified error state in a key flow is a BLOCKER. The developer will implement something — without a spec, it will be a raw exception or an empty page.
- An unspecified empty state in a list view is a CONCERN. Users will see a blank screen and not know if they're doing something wrong or if there's nothing to show.
- An unspecified loading state for an async operation is a CONCERN. Users will click the submit button a second time because they don't know if the first click worked.
- An unspecified success state for a key action is a CONCERN. Users won't know if their action succeeded.

For each gap: name exactly what needs to be added to the plan. Not "add empty states" but "the /projects list view needs an empty state: illustration, heading 'No projects yet', and a primary CTA button 'Create your first project'."

**Q14 — First-time user vs. returning user experience**

Most plans describe the returning-user experience (the steady-state interaction with a product that has data). Evaluate whether the plan addresses first-time user experience:
- What does a brand new user see the first time they open the product? Empty lists? Onboarding wizard? Example/demo data?
- Is there an explicit onboarding flow, or is the user dropped into the empty product state and expected to figure out what to do?
- How does the experience change after the user has been using the product for a week? For a month?
- Are there gates in the plan for users who haven't completed required setup? (e.g., payment not entered, email not verified, profile not complete — what does the user see, and are they guided to complete setup?)
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q15 — What would make this design a 10/10?**

Now that you have reviewed all the above, name 2-3 specific, concrete changes that would move this plan's design from its current score to 10/10. Not "improve the UX" — name the specific flow to add, the specific state to specify, the specific interaction to simplify.

A 10/10 design plan is not a plan with more features — it is a plan where every screen, every flow, every state, and every edge case is specified with enough detail that the implementation can be done correctly without guessing. Size of the plan is irrelevant. Completeness of specification is everything.
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q16 — Design score**

Consider all Q9-Q15 findings and the 10/10 checklist results. Score this plan 0-10 on the Design lens.

State:
```
DESIGN LENS: X/10 — <one-line verdict>
```

Include the full list of findings (BLOCKER, CONCERN, NOTE) in the output.
