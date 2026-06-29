# RETRO.md Template

Full 8-section template for Step 5. Quick depth = bullet lists only. Thorough depth = narrative paragraphs + bullets.

---

```markdown
# RETRO — <cycle name or date range>

_Generated: <ISO date>. Window: <since> to <today>. Branch: <_BRANCH>. Depth: <quick|thorough>._

---

## 1. What Shipped

<Concrete list of features, fixes, and changes that are now in production or merged.
Each item names the actual thing: file, endpoint, UI change, behavior change.
No vague items. "Improved auth" is not acceptable; "auth.ts: added 15-minute session
timeout with redirect to /login on expiry" is.>

- ...

---

## 2. What Was Planned But Didn't Ship

<Items from PLAN.md that did not land. For each: what it was + why it didn't ship
(scope cut / blocked / deprioritized / still in progress). Be honest. "Ran out of
time" is a valid reason. So is "discovered it wasn't needed.">

- <Item>: <reason it didn't ship>

If PLAN.md was not found: note "No PLAN.md found — cannot compare planned vs shipped."

---

## 3. Where Time Went

<Breakdown of estimated time per pipeline stage. Source: SRIFLOW_MEMORY.md log
entry durations + session detection from git timestamps. If durations are unavailable,
estimate based on commit density per stage. Be honest about estimates vs measurements.>

| Stage | Time | % of cycle |
|-------|------|-----------|
| plan | Xmin | X% |
| design | Xmin | X% |
| build | Xmin | X% |
| qa | Xmin | X% |
| review | Xmin | X% |
| ship | Xmin | X% |
| **Total** | **Xmin** | **100%** |

<1-2 sentences on what this distribution reveals.>

---

## 4. Decision Quality

<Review each D-numbered decision made this cycle. For each:
- What was decided
- Was it the right call in hindsight?
- What would you change?>

If no decisions were logged: "No D-numbered decisions found in SRIFLOW_MEMORY.md."

| Decision | What was decided | Right call? | Change in hindsight |
|----------|-----------------|-------------|---------------------|
| D1 | ... | yes/no/partial | ... |
| D2 | ... | ... | ... |

<If thorough depth: write 1-2 sentences of narrative per decision with non-obvious outcome.>

---

## 5. Code Quality Signals

<Patterns from CODE_REVIEW.md findings. Focus on recurring categories — a single
WARN in one category is noise; a WARN in the same category across 3+ findings is
a systemic issue.>

If CODE_REVIEW.md found:
- Total findings: N critical, N warn, N nitpick
- Recurring WARN categories: [list — systemic issues to address]
- CRITICAL findings and their resolution status
- Any finding that was deferred: what's the plan?

If CODE_REVIEW.md not found: "Code review was not run this cycle."

File hotspot analysis (from git numstat):

| File | Changes | Signal |
|------|---------|--------|
| <path> | N times | churn hotspot / expected / test file |

<Flag files changed 5+ times as churn hotspots.>

---

## 6. What Broke

<QA failures, production issues, bugs found in this cycle.>

If QA_REPORT.md found:
- Total: N/N checks passing
- Failed categories: [list]
- Open failures: [list of specific failing tests/checks]
- Were any QA failures already known (tracked in TODOS.md)?

If QA_REPORT.md not found: "QA was not run this cycle."

If neither CODE_REVIEW.md nor QA_REPORT.md found and commits exist: note
"Neither QA nor code review ran. For next cycle: run /sriflow-test and
/sriflow-code-review before shipping."

---

## 7. Carry-Forward

<Top 3 concrete actions for the next cycle. Not "do better at X" but "Before
merging the next PR, add an integration test for the auth timeout path." Specific,
actionable, with clear done criteria. Priority order: most impactful first.>

1. **<action>**: <rationale — one sentence on why this matters most>
2. **<action>**: <rationale>
3. **<action>**: <rationale>

---

## 8. Lessons

<3 sentences max. What changed in how you'd approach this type of cycle.
Concrete and specific to this project. Not platitudes.
Bad: "Plan more carefully next time."
Good: "The build phase stalled for 2 sessions because DESIGN.md had no mobile breakpoints specified. Next cycle: add responsive specs to DESIGN.md before /sriflow-build starts.">

1. <lesson — ≤2 sentences>
2. <lesson — ≤2 sentences>
3. <lesson — ≤2 sentences>

---

## Appendix: Metrics

<Metrics block from Step 3.>

## Appendix: Pipeline Stage Analysis

<Stage table from Step 4.>
```

---

## Prior Carry-Forward Resolution (§ 2b)

If a prior retro exists, add after § 2:

```markdown
## 2b. Prior Carry-Forward Resolution

Items from the last retro's carry-forward list — did they ship this cycle?

| Item | Shipped? | Notes |
|------|---------|-------|
| <prior CF item 1> | yes/no/partial | <what happened> |
| <prior CF item 2> | yes/no/partial | <what happened> |
| <prior CF item 3> | yes/no/partial | <what happened> |

<1 sentence: what carry-forward resolution rate tells you about follow-through.>
```

---

## Trend Summary

If prior retro exists, add at top of RETRO.md after the generated-date line:

```
Trend vs last retro: commits [↑↓→] N% | LOC [↑↓→] N% | sessions [↑↓→] N | QA pass rate [↑↓→] N%
```

Use ↑ for improvement, ↓ for regression, → for within 10% of prior.
