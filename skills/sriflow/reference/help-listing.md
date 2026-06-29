# Help Listing

Triggered by: "help", "what skills", "what can sriflow do", "/sriflow help"

```
SRIFLOW SKILLS

Pipeline (run in order):
  /sriflow-plan         BA pipeline — idea to PLAN.md (6 phases: Discovery → Elicitation → Use Cases → Requirements → UI & Data → Architecture)
  /sriflow-plan-review  Three-lens review — CEO, Design, Eng. Scores 0-10. Blocks ship if any lens < 7.
  /sriflow-design       Wireframes → DESIGN.md → HTML mockups. Iterative review loop.
  /sriflow-build        Implement the approved design. Pre-build safety check. sriflow-trim enforces minimal code.
  /sriflow-code-review  Diff review — security, correctness, complexity. CRITICAL findings block ship.
  /sriflow-test         QA — golden path, edge cases, error states, regression. Produces QA_REPORT.md.
  /sriflow-ship         Deploy — gate check, merge PR, wait for CI, smoke test.
  /sriflow-reflect      Retro — metrics, lessons learned, RETRO.md. Updates memory.

Utilities (available any stage):
  /sriflow-browser      Headless Chromium — screenshots, navigation, scraping, automation. ~100ms/command.
  /sriflow-memory       Context — read, write, compress SRIFLOW_MEMORY.md.
  /sriflow-trim         Always-on — compressed speech + minimal code enforcement (ponytail mode).

Notes:
  /sriflow-think → now merged into /sriflow-plan. Both route the same way.
  Run /sriflow (this skill) any time to get status or routing help.
```

## Quick Reference Card

```
/sriflow              This skill. Status, routing, help.
/sriflow-plan         Idea → PLAN.md (also: /sriflow-think)
/sriflow-plan-review  PLAN.md → reviewed, scored, approved
/sriflow-design       Approved plan → DESIGN.md + HTML mockups
/sriflow-build        DESIGN.md → working code
/sriflow-code-review  Working code → CODE_REVIEW.md
/sriflow-test         Code → QA_REPORT.md
/sriflow-ship         Passing tests → deployed
/sriflow-reflect      Post-ship → RETRO.md + lessons in memory

Utilities (any stage):
/sriflow-browser      Headless Chrome — screenshots, scraping, automation
/sriflow-memory       Read/write/compress SRIFLOW_MEMORY.md
/sriflow-trim         Always-on ponytail — minimal code + compressed speech
```
