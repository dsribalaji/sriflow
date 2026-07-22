# Step 0 — Context Read (Details)

Before touching a test, understand what you are testing.

Read these files in order. Do not skip any that exist:

1. `PLAN.md` — user stories, acceptance criteria, feature scope. This is your
   source of truth for golden path test cases. If PLAN.md has no user stories,
   note it and ask the user for a feature description before proceeding.

2. `DESIGN.md` — component surface, API contracts, UI states. Gives you the
   expected outputs for each test.

3. `CODE_REVIEW.md` — pre-flagged risks, code concerns, edge cases the reviewer
   identified. These are high-probability failure candidates; run them early.

4. `QA_REPORT.md` — previous test run. If it exists, this is your regression
   baseline. Compare new results against it in Category 4.

After reading, write a 2-4 sentence summary:
- What feature is being tested
- What files and subsystems are involved
- What known risks or concerns carry forward from CODE_REVIEW.md (if any)
- Whether a previous QA_REPORT.md baseline exists

If PLAN.md does not exist:

```
D0 — No PLAN.md or DESIGN.md found. Describe the feature to test.
Branch: <_BRANCH>
ELI10: I need to know what the feature is supposed to do before I can write test
cases. Without a plan or design doc I have to derive expected behavior from your
description.
Stakes if wrong: Test cases built on wrong assumptions produce misleading results.
Recommendation: A because a written description is enough to proceed.
Completeness: Note: options differ in kind, not coverage — no completeness score.
A) Describe the feature now (recommended)
  ✅ I can proceed immediately with what you tell me
  ❌ If the description misses edge cases, tests may be incomplete
B) Point me to another reference (README, spec, PR description)
  ✅ More structured source; fewer gaps
  ❌ Requires me to read and interpret it first
Net: Either gets us to test cases. A is faster.
```

Wait for the user's answer before proceeding.
