# Step 10: RETRO.md quality check

After writing RETRO.md, run a self-check before finishing:

**Completeness check:**
- [ ] § 1 What Shipped: every item names a specific artifact (file, endpoint, feature name) — not a vague action
- [ ] § 2 What Was Planned: compared against PLAN.md (or noted that PLAN.md was missing)
- [ ] § 3 Where Time Went: table is present with at least one row showing time > 0
- [ ] § 4 Decision Quality: all D-numbered decisions from SRIFLOW_MEMORY.md are reviewed (or "none found" noted)
- [ ] § 5 Code Quality Signals: file hotspot table is present (even if empty)
- [ ] § 6 What Broke: QA findings present (or "QA not run" noted)
- [ ] § 7 Carry-Forward: exactly 3 items, each specific and actionable
- [ ] § 8 Lessons: 3 lessons, none of which are generic platitudes

**Lesson quality check.** For each lesson in § 8, verify:
- Does it name something specific from THIS cycle? (file path, stage name, specific failure)
- Is it actionable? (Does it suggest a behavior change, not just an observation?)
- Is it different from lessons already in SRIFLOW_MEMORY.md?

If any lesson fails the check, rewrite it. A rewritten lesson that is more specific but still factual is always better than a passing-but-generic one.

**Carry-forward quality check.** For each item in § 7:
- Does it have a clear done condition? ("Add auth timeout test" is done when the test exists. "Improve auth" never has a done condition.)
- Is it scoped to the next cycle? (Not "someday" — something achievable in the next 1-2 weeks.)
- Is it the right priority? (The top item should be the thing that, if not done, most threatens the next cycle's quality.)

If a carry-forward item is vague, rewrite it to be specific. If you cannot make it specific from available data, note the gap: "This item needs more context — check TODOS.md or PLAN.md for the next cycle."
