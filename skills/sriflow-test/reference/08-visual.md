# Step 7 — Visual Cases (Details)

If DESIGN.md references any UI components, visual states, or browser-rendered
output, open sriflow-browser to verify them.

## When to open sriflow-browser

**Always open for:**
- Golden Path tests that involve a rendered UI state (success screen, dashboard,
  form confirmation, etc.)
- Any test where the expected output must be visible to a human user
- Error state tests where the error message must display to the user

**Open if helpful for:**
- Edge case tests involving character rendering (emoji, Unicode, XSS display)
- Regression tests for components that changed visually

**Do not open for:**
- Pure API tests with JSON responses
- Database-layer tests with no UI surface
- Tests where expected/actual is logged output only

## sriflow-browser test flow

For each visual test case:

1. Navigate to the relevant page or state
2. Take a screenshot: `sriflow-browser screenshot <output-path>`
3. Perform the test action (fill form, click button, submit)
4. Take a second screenshot showing the result state
5. Compare result screenshot to DESIGN.md spec
6. Note any discrepancy in TC Notes field

Screenshot naming: `screenshots/TC-NNN-<step>.png`

If sriflow-browser is unavailable or the app is not running locally:
- Mark all visual tests as SKIP with note "app not running — re-run with live app"
- Complete all non-visual tests
- Note in QA_REPORT.md header: "Visual tests skipped — sriflow-browser unavailable"

## Visual failure classification

Visual failures are DONE_WITH_CONCERNS unless they prevent the user from
completing the primary action (in which case they are Golden Path failures
and gate as BLOCKED).
