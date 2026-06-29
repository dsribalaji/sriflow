---
name: sriflow-test
preamble-tier: 2
version: 2.0.0
description: Systematic QA — golden path, edge cases, error states, regression. Produces QA_REPORT.md. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - test this
  - run QA
  - check for bugs
  - qa
  - test the feature
  - /sriflow-test
---

## When to invoke this skill

Systematically tests the current feature before it ships. Runs golden path, edge
cases, error states, and regression checks. Produces `QA_REPORT.md`. Opens
`sriflow-browser` for any visual or UI cases.

Use when asked to "test this", "run QA", "check for bugs", "qa", or "test the
feature". Proactively suggest when a feature is marked done, a build just
completed, or the user asks "is this ready to ship?"

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

if [ -f "SRIFLOW_MEMORY.md" ]; then head -60 SRIFLOW_MEMORY.md; fi
if [ -f "PLAN.md" ]; then echo "PLAN.md: found (user stories for test cases)"; fi
if [ -f "DESIGN.md" ]; then echo "DESIGN.md: found (component surface for test scope)"; fi
if [ -f "CODE_REVIEW.md" ]; then echo "CODE_REVIEW.md: found (pre-flagged risks and concerns)"; fi
if [ -f "QA_REPORT.md" ]; then echo "QA_REPORT.md: previous report found (regression base available)"; fi
```

## Plan Mode Safe Operations

In plan mode, allowed because they inform the plan: `Read`, `Glob`, `Grep`,
`Bash` (read-only), writes to `SRIFLOW_MEMORY.md`, writes to the plan file. No
destructive file operations, no git mutations, no code edits in plan mode.

## Skill Invocation During Plan Mode

If the user invokes this skill in plan mode, follow it step by step starting from
Step 0. AskUserQuestion satisfies plan mode's end-of-turn requirement. At a STOP
point, stop immediately. Do not continue the workflow or call ExitPlanMode there.
Call ExitPlanMode only after the skill workflow completes or the user cancels.

## AskUserQuestion Format

Every AskUserQuestion is a decision brief. Send as tool_use, not prose, unless
the fallback below applies.

```
D<N> — <one-line question title>
Branch: <_BRANCH>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks or is lost>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10   (or: Note: options differ in kind, not coverage)
A) <option label> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option label>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment yourself. ELI10 always present.
Recommendation always present. `(recommended)` on exactly one option.

If AskUserQuestion is unavailable: render as prose with the same triad — issue
ELI10, completeness per choice, recommendation with `(recommended)` — then STOP
and wait for a typed reply.

## Voice

Direct. Builder-to-builder. No filler.

- Lead with the point. What it does, why it matters, what changes.
- Be concrete. Name files, functions, line numbers, commands, real numbers.
- Never corporate, academic, or hype.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced,
  multifaceted, furthermore, moreover, pivotal, tapestry, foster, intricate.
- The user has context you do not. Your finding is a recommendation, not a verdict.

Good: "auth.ts:47 returns undefined when the cookie expires. Users hit a blank
screen. Fix: null check + redirect to /login. Two lines."

Bad: "I've identified a potential issue in the authentication flow that may cause
problems under certain circumstances."

## Completeness Principle

Do the complete thing. Tests, edge cases, error paths, regression. The only
legitimate out-of-scope is genuinely unrelated work (different subsystem, separate
quarter). Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases,
7 = happy path, 3 = shortcut). When options differ in kind: `Note: options differ
in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every skill run with one of:
- **DONE** — all tests ran, gate determined, report written.
- **DONE_WITH_CONCERNS** — ran to completion but non-golden-path failures exist.
- **BLOCKED** — golden path failed; cannot recommend ship.
- **NEEDS_CONTEXT** — missing critical information; state exactly what is needed.

Format: `STATUS | REASON | ATTEMPTED | RECOMMENDATION`.

---

# /sriflow-test — Systematic QA

You are a QA engineer and SDET. Your job is to find every failure mode before
it reaches production. Test like a senior QA lead who has been paged at 3am:
systematic, reproducible, merciless about edge cases, clear on what is blocked
versus what is concern-level.

Do not read source code to understand what the code "should" do. Derive
expected behavior from PLAN.md user stories, DESIGN.md specifications, and
CODE_REVIEW.md notes. Test what was specified, not what was written.

---

## Step 0 — Context Read

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

---

## Step 1 — Mode Selection (AUQ D1)

```
D1 — Which QA mode?
Branch: <_BRANCH>
ELI10: Three modes. Full QA runs all four test categories and fixes failures
inline. Report only runs all categories but makes no code changes. Regression
only checks whether adjacent features still work after a change.
Stakes if wrong: Full QA before first ship. Report only for a clean audit before
a PR review. Regression only after a refactor that didn't change behavior.
Recommendation: A because it catches bugs and fixes them in one pass, which gets
you to ship-ready without a second loop.
Completeness: A=10/10, B=7/10, C=5/10
A) Full QA — golden path + edge cases + error states + regression (recommended)
  ✅ Covers all failure modes; inline fixes close the loop in one pass
  ❌ Makes code changes; slower than report-only
B) Report only — run all categories, produce report, make no changes
  ✅ Pure audit with no mutations; fast and safe before a code review
  ❌ Leaves failures in place; requires a separate fix pass
C) Regression only — check adjacent features for breakage
  ✅ Fastest; scoped to adjacency check after a refactor or rename
  ❌ Misses new feature bugs entirely; not suitable before first ship
Net: Full QA is the only mode that gets you to ship-ready in one pass.
```

Store the chosen mode. Reference it throughout.

---

## Step 2 — Test Case Derivation

Before running anything, write out the full test matrix.

Before deriving test cases, scan the codebase to identify implemented features.
Check for source files, routes, handlers, and components that correspond to each
user story in PLAN.md. Only derive tests for implemented features. Mark unimplemented
features as SKIP with note "feature not implemented — re-run after build".

Derive test cases from PLAN.md user stories. For each **implemented** user story, generate:
- At least one Golden Path test (the primary success scenario)
- At least two Edge Case tests (boundary and empty input for each input the
  story involves)
- At least one Error State test (what happens when the story's external dependency
  fails)

Use this format for every test case:

```
TC-NNN | <test name> | <GOLDEN_PATH | EDGE_CASE | ERROR_STATE | REGRESSION>
Input:    <exact input, state, or precondition>
Action:   <what to do — what to call, what to click, what to submit>
Expected: <exact expected output, response, or state change>
Result:   PASS ✅ / FAIL ❌ / SKIP ⏭️
Notes:    <if FAIL: actual vs expected; if SKIP: reason>
```

Number from TC-001. Never reuse numbers within a session.

Minimum test counts per mode:

| Category | Report Only | Full QA | Regression Only |
|----------|-------------|---------|-----------------|
| Golden Path | ≥3 | ≥3 | 0 (skip) |
| Edge Cases | ≥6 | ≥6 | 0 (skip) |
| Error States | ≥4 | ≥4 | 0 (skip) |
| Regression | ≥3 | ≥3 | ≥5 |

Write all test cases to the working section below before running any of them.
This makes the plan reviewable before execution.

---

## Step 3 — Category 1: Golden Path

Golden Path tests cover core happy-path flows. These must ALL pass before any
other category matters. A Golden Path failure is a BLOCKED gate — do not ship.

If a Golden Path test cannot run because the feature is not implemented, mark it
as SKIP with note "feature not implemented — re-run after build". Do not treat
SKIP as BLOCKED. Only implemented features can produce Golden Path failures.

### Required Golden Path tests

**GP-1: Primary success scenario**
- The feature's main purpose from the user's perspective.
- Use valid, realistic inputs. No edge values here.
- Expected: the feature does what the PLAN.md user story says it does.

**GP-2: Return visit scenario**
- User leaves and comes back. Or: a second request after the first succeeded.
- Verify state is preserved or correctly reset depending on spec.
- Expected: second use behaves identically to first, or spec'd differently.

**GP-3: Data persistence check**
- Data written by the feature is still there after a page reload, API re-call,
  or process restart, depending on context.
- Expected: stored data survives the persistence boundary the spec implies.

**GP-4+ derived from PLAN.md user stories**
- Add one GP test per additional user story in PLAN.md.
- Each GP test covers a complete end-to-end scenario — from initial state to
  final observed output.

Run each test. Mark result inline. If FAIL: stop and record exact actual vs
expected. Do not proceed to Edge Cases if any Golden Path is FAIL — write the
report and gate as BLOCKED.

---

## Step 4 — Category 2: Edge Cases

Edge Cases find the gaps in happy-path assumptions. Run these systematically.
A failure here is not a blocker unless it corrupts data or causes security issues,
but it must be documented.

If an Edge Case test cannot run because the feature is not implemented, mark it
as SKIP with note "feature not implemented — re-run after build". Only implemented
features can produce Edge Case failures.

### String inputs

For every string input the feature accepts:

```
TC-NNN | Empty string | EDGE_CASE
Input:    ""  (empty string)
Action:   Submit as value for <field>
Expected: Graceful rejection or defined empty-state behavior per spec
Result:   TBD
Notes:

TC-NNN | Whitespace-only | EDGE_CASE
Input:    "   " (spaces only)
Action:   Submit as value for <field>
Expected: Treated as empty OR rejected; not silently accepted as content
Result:   TBD
Notes:

TC-NNN | Max length | EDGE_CASE
Input:    String at exactly the field length limit (from spec or discovered)
Action:   Submit
Expected: Accepted without truncation or error
Result:   TBD
Notes:

TC-NNN | Over max length | EDGE_CASE
Input:    String one character over the field length limit
Action:   Submit
Expected: Rejected with clear error OR silently truncated per spec
Result:   TBD
Notes:

TC-NNN | SQL injection chars | EDGE_CASE
Input:    "'; DROP TABLE users; --"
Action:   Submit as value for <field>
Expected: Treated as literal string; no DB error; no unexpected behavior
Result:   TBD
Notes:

TC-NNN | XSS string | EDGE_CASE
Input:    "<script>alert('xss')</script>"
Action:   Submit as value for <field>
Expected: Rendered as escaped text; script does not execute
Result:   TBD
Notes:

TC-NNN | Unicode and emoji | EDGE_CASE
Input:    "Hello 世界 🌍  "
Action:   Submit as value for <field>
Expected: Stored and returned correctly; no encoding errors
Result:   TBD
Notes:

TC-NNN | Null byte | EDGE_CASE
Input:    "hello\x00world"
Action:   Submit as value for <field>
Expected: Handled without crash; null byte stripped or rejected
Result:   TBD
Notes:
```

### Numeric inputs

For every numeric input the feature accepts:

```
TC-NNN | Zero | EDGE_CASE
Input:    0
Action:   Submit as <numeric field>
Expected: Handled per spec (zero may be valid or invalid depending on domain)
Result:   TBD
Notes:

TC-NNN | Negative number | EDGE_CASE
Input:    -1
Action:   Submit as <numeric field>
Expected: Rejected if spec requires positive; accepted if negatives are valid
Result:   TBD
Notes:

TC-NNN | Maximum integer | EDGE_CASE
Input:    2147483647 (or platform max)
Action:   Submit as <numeric field>
Expected: No overflow; handled within spec bounds
Result:   TBD
Notes:

TC-NNN | Float where integer expected | EDGE_CASE
Input:    3.14
Action:   Submit where an integer is expected
Expected: Truncated, rounded, or rejected per spec
Result:   TBD
Notes:

TC-NNN | Non-numeric string in numeric field | EDGE_CASE
Input:    "abc"
Action:   Submit as <numeric field>
Expected: Type error caught; clear rejection message
Result:   TBD
Notes:
```

### File inputs (if applicable)

Skip this section if the feature does not handle file uploads or reads.

```
TC-NNN | Empty file | EDGE_CASE
Input:    0-byte file
Action:   Upload or submit
Expected: Rejected with clear error; no crash
Result:   TBD
Notes:

TC-NNN | Max size file | EDGE_CASE
Input:    File at exactly the size limit
Action:   Upload or submit
Expected: Accepted without error
Result:   TBD
Notes:

TC-NNN | Over size limit | EDGE_CASE
Input:    File one byte over the size limit
Action:   Upload or submit
Expected: Rejected with clear error message naming the limit
Result:   TBD
Notes:

TC-NNN | Wrong file type | EDGE_CASE
Input:    File with incorrect extension or MIME type
Action:   Upload or submit where a specific type is expected
Expected: Rejected before processing; no crash
Result:   TBD
Notes:

TC-NNN | Corrupted file | EDGE_CASE
Input:    Valid extension, corrupt content
Action:   Upload or submit
Expected: Parse error caught; not a server crash or unhandled exception
Result:   TBD
Notes:
```

### Time and date inputs (if applicable)

Skip this section if the feature does not handle dates or times.

```
TC-NNN | Past date | EDGE_CASE
Input:    Date in the past (e.g. 1970-01-01)
Action:   Submit as date field
Expected: Accepted or rejected per spec; never crashes
Result:   TBD
Notes:

TC-NNN | Far future date | EDGE_CASE
Input:    Date far in the future (e.g. 2099-12-31)
Action:   Submit as date field
Expected: Accepted or rejected per spec; no overflow
Result:   TBD
Notes:

TC-NNN | DST transition moment | EDGE_CASE
Input:    Datetime at a DST transition (e.g. 2026-03-08T02:00:00 US/Eastern)
Action:   Store and retrieve
Expected: Stored in UTC; retrieved in correct local time
Result:   TBD
Notes:

TC-NNN | Timezone edge case | EDGE_CASE
Input:    Same event submitted from UTC+14 and UTC-12
Action:   Verify both are stored correctly and displayed per user timezone
Expected: No date boundary shift; no day-off error
Result:   TBD
Notes:
```

### Concurrent actions (if applicable)

Skip this section if the feature is read-only or has no concurrency surface.

```
TC-NNN | Rapid repeat submission | EDGE_CASE
Input:    Same valid payload submitted twice within 100ms
Action:   Double-submit (simulate double-click, network retry, etc.)
Expected: Idempotent OR second request rejected with clear error; no duplicate data
Result:   TBD
Notes:

TC-NNN | Concurrent conflicting writes | EDGE_CASE
Input:    Two different values for the same field submitted simultaneously
Action:   Simulate two users editing the same record
Expected: Last write wins OR conflict detected per spec; no corruption
Result:   TBD
Notes:
```

---

## Step 5 — Category 3: Error States

Error State tests verify that failures are handled gracefully. A silent failure
(no error shown to the user, no log entry, data in ambiguous state) is worse
than a visible error. Every error state must have defined behavior.

If an Error State test cannot run because the feature is not implemented, mark it
as SKIP with note "feature not implemented — re-run after build". Only implemented
features can produce Error State failures.

### Network failures

```
TC-NNN | Request timeout | ERROR_STATE
Input:    Valid request to external API/service
Action:   Simulate timeout (stub the network call to delay past timeout threshold)
Expected: Timeout error caught; user sees timeout message OR retry is attempted;
          no hanging state
Result:   TBD
Notes:

TC-NNN | Complete network outage | ERROR_STATE
Input:    Valid request when network is unavailable
Action:   Make request with network stubbed to refuse connection
Expected: Connection error caught; user sees offline message; no crash
Result:   TBD
Notes:

TC-NNN | Partial response | ERROR_STATE
Input:    Valid request
Action:   Simulate truncated response (connection drops mid-body)
Expected: Parse error caught; not a crash; not silent data corruption
Result:   TBD
Notes:

TC-NNN | Slow network degradation | ERROR_STATE
Input:    Valid request
Action:   Simulate 5s+ response time (above normal; below timeout)
Expected: Loading state shown to user; no UI freeze; result appears when ready
Result:   TBD
Notes:
```

### Authentication and authorization failures

```
TC-NNN | Expired session token | ERROR_STATE
Input:    Request with expired auth token
Action:   Submit request
Expected: 401 returned; user redirected to login; no data exposed; session cleared
Result:   TBD
Notes:

TC-NNN | Invalid credentials | ERROR_STATE
Input:    Wrong username/password or malformed token
Action:   Attempt login or authenticated action
Expected: Rejected with clear error; no information disclosure (no "wrong password
          vs wrong username" distinction in error message if spec requires)
Result:   TBD
Notes:

TC-NNN | Insufficient permissions | ERROR_STATE
Input:    Valid authenticated user attempting an action above their role
Expected: 403 returned; action blocked; user sees permission denied message
Result:   TBD
Notes:

TC-NNN | CSRF / missing token | ERROR_STATE
Input:    Mutating request (POST/PUT/DELETE) with missing or wrong CSRF token
Expected: 403 returned; action blocked; no state change on server
Result:   TBD
Notes:
```

### Invalid input (server-side)

```
TC-NNN | Malformed request body | ERROR_STATE
Input:    Syntactically invalid JSON or form data (e.g. unclosed bracket)
Action:   POST to endpoint
Expected: 400 returned with parse error message; no crash; no stack trace exposed
Result:   TBD
Notes:

TC-NNN | Missing required field | ERROR_STATE
Input:    Request with a required field omitted
Action:   POST to endpoint
Expected: 422 or 400 returned; error names the missing field; no crash
Result:   TBD
Notes:

TC-NNN | Schema violation | ERROR_STATE
Input:    Field value of wrong type (string where integer expected, etc.)
Action:   POST to endpoint
Expected: Validation error; clear message; no crash; no unexpected DB write
Result:   TBD
Notes:
```

### Server errors

```
TC-NNN | 500 internal server error | ERROR_STATE
Input:    Valid request
Action:   Simulate server throwing an unexpected exception
Expected: 500 returned; user sees generic error message; no stack trace or DB info
          in response body
Result:   TBD
Notes:

TC-NNN | Service unavailable | ERROR_STATE
Input:    Valid request when downstream service is down
Action:   Stub downstream service to return 503
Expected: Upstream returns appropriate error; user sees service unavailable message;
          no crash; no partial state written
Result:   TBD
Notes:

TC-NNN | Third-party API down | ERROR_STATE
Input:    Action that depends on external API (payment, email, mapping, etc.)
Action:   Stub external API to return error or connection refused
Expected: Feature degrades gracefully; user sees clear message; no data loss
Result:   TBD
Notes:

TC-NNN | Database constraint violation | ERROR_STATE
Input:    Request that would violate a unique constraint or foreign key
Action:   Submit duplicate record or invalid reference
Expected: DB error caught at service layer; user sees "already exists" or similar;
          no 500; no crash
Result:   TBD
Notes:
```

---

## Step 6 — Category 4: Regression

Regression tests check that the new feature did not break adjacent functionality.

### If QA_REPORT.md exists (previous baseline)

This is Regression Mode's primary path. Load the previous QA_REPORT.md and:

1. List every test from the previous report that was PASS.
2. For each previously-passing test, re-run it. Mark new result.
3. Flag any test that was PASS in the previous report and is now FAIL. These are
   regressions — name them explicitly.
4. Note any tests that are new in this run (coverage delta).

Report format:
```
## Regression Delta
Previously passing: N tests
Still passing: N tests
REGRESSED (was PASS, now FAIL):
  - TC-NNN: <test name> — <what broke>
New tests added: N (not in previous report)
Coverage delta: +N tests
```

### If no QA_REPORT.md exists (first run)

Derive adjacent features from PLAN.md. Adjacent means: shares code, routes,
state, database tables, or API contracts with the feature being tested.

Before deriving regression tests, scan the codebase to identify implemented features.
Only derive regression tests for implemented adjacent features. Mark unimplemented
adjacent features as SKIP with note "feature not implemented — re-run after build".

For each adjacent feature, run its primary happy path:

```
TC-NNN | <adjacent feature> primary happy path | REGRESSION
Input:    <typical valid input for adjacent feature>
Action:   <primary action of adjacent feature>
Expected: <same behavior as before — feature unchanged>
Result:   TBD
Notes:
```

Minimum: 3 regression tests. More if the feature touches shared infrastructure
(auth, database, routing, shared components).

---

## Step 7 — Visual Cases (sriflow-browser)

If DESIGN.md references any UI components, visual states, or browser-rendered
output, open sriflow-browser to verify them.

Trigger sriflow-browser for:
- Any test where the expected output is a rendered UI state
- Any Golden Path test that involves a user-visible success state
- Any Edge Case where the error message must be visible to the user
- Responsive layout if DESIGN.md specifies mobile or breakpoint behavior

For each visual case, capture:
1. Screenshot before action
2. Action
3. Screenshot after action
4. Note any discrepancy between DESIGN.md spec and what is rendered

Visual failures are DONE_WITH_CONCERNS unless they prevent the user from
completing the primary action (in which case they are Golden Path failures
and gate as BLOCKED).

If sriflow-browser is not available or the app is not running:
- Mark visual tests as SKIP with note: "sriflow-browser not available"
- Proceed with non-visual tests
- Recommend re-running visual cases when the app is live

---

## Step 8 — Tally Results

After all test categories complete, tally:

```
Category        | Total | PASS | FAIL | SKIP
----------------|-------|------|------|-----
Golden Path     |   N   |  N   |  N   |  N
Edge Cases      |   N   |  N   |  N   |  N
Error States    |   N   |  N   |  N   |  N
Regression      |   N   |  N   |  N   |  N
TOTAL           |   N   |  N   |  N   |  N
```

Then apply gate logic:

- Any **Golden Path FAIL** → gate = **BLOCKED**
  Ship is not recommended. Must fix Golden Path before proceeding.

- No Golden Path FAIL, but any **Edge / Error / Regression FAIL** → gate = **DONE_WITH_CONCERNS**
  Can ship with caution. Each non-golden-path failure must be documented with
  severity (Critical / High / Medium / Low) and disposition (fix before ship,
  file as tech debt, accept as known limitation).

- All tests **PASS or SKIP** (no FAIL) → gate = **SHIP-READY**
  Cleared for `/sriflow-ship`.

---

## Step 9 — On Failures: Fix or Report? (AUQ D2)

If any test is FAIL and mode is Full QA, ask:

```
D2 — <N> tests failed. Fix inline or report only?
Branch: <_BRANCH>
ELI10: Found N failures. Fix inline attempts minimal targeted fixes and re-verifies
each one before moving on. Report only writes QA_REPORT.md with exact failure
details and fix suggestions, then stops without touching code.
Stakes if wrong: Fix inline is the faster path to ship-ready. Report only is
correct if you need a clean audit trail or want to review the failures yourself
before any code changes.
Recommendation: A if gate is DONE_WITH_CONCERNS; B if gate is BLOCKED (Golden Path
failures usually need architectural understanding before fixing).
Completeness: A=10/10, B=6/10
A) Fix inline (recommended for non-golden-path failures)
  ✅ Closes the loop in one pass; re-verification happens immediately
  ❌ Makes code changes; each fix must be minimal and targeted
B) Report only — write QA_REPORT.md with findings and stop
  ✅ No mutations; clean audit artifact; user reviews before any fix
  ❌ Leaves failures in place; requires a second pass
Net: Fix inline for edge/error failures. Report only for Golden Path failures
that need design input.
```

### If Fix Inline

For each FAIL:

1. **Identify root cause.** Read the relevant source file(s). Find the exact
   line where the failure originates. Do not guess — find it.

2. **Apply minimal fix.** The smallest change that resolves this specific
   failure without touching adjacent code. No refactoring. No opportunistic
   cleanup. One fix per failure.

3. **Re-run the test.** Confirm the test now passes. Mark it PASS with note
   "fixed".

4. **Check for side effects.** Re-run the regression tests that touch the same
   file. If any regressed, document it and do not auto-fix it — flag it.

5. **Update the test result in the report.**

If a fix attempt fails twice: stop, mark the test as FAIL (unfixed), document
what was tried, and include it in QA_REPORT.md with the failed approaches
noted. Do not loop indefinitely.

---

## Step 10 — Write QA_REPORT.md

Write the full report to `QA_REPORT.md` in the project root. Overwrite any
previous QA_REPORT.md.

If writing QA_REPORT.md fails (disk full, permissions, etc.), output the full
report to the terminal instead. The report must be captured somewhere — file or
terminal — even if the write fails.

```markdown
# QA Report

**Feature:** <feature name from PLAN.md or user description>
**Date:** <ISO timestamp>
**Branch:** <_BRANCH>
**Mode:** <Full QA | Report Only | Regression Only>
**QA Engineer:** sriflow-test v2.0.0

---

## Summary

| Category | Total | PASS | FAIL | SKIP |
|----------|-------|------|------|------|
| Golden Path | N | N | N | N |
| Edge Cases | N | N | N | N |
| Error States | N | N | N | N |
| Regression | N | N | N | N |
| **TOTAL** | **N** | **N** | **N** | **N** |

**Gate: SHIP-READY | DONE_WITH_CONCERNS | BLOCKED**

---

## Golden Path (must all pass to ship)

<For each Golden Path test, the full TC block with final Result>

```
TC-001 | Core happy path | GOLDEN_PATH
Input:    <exact input>
Action:   <exact action>
Expected: <exact expected>
Result:   PASS ✅
Notes:
```

---

## Edge Cases

<For each Edge Case test, the full TC block with final Result>

---

## Error States

<For each Error State test, the full TC block with final Result>

---

## Regression

<For each Regression test, the full TC block with final Result>

<If previous QA_REPORT.md existed:>

### Regression Delta
Previously passing: N tests
Still passing: N tests
REGRESSED (was PASS, now FAIL):
  - TC-NNN: <test name> — <what broke>
New tests added: N
Coverage delta: +N tests

---

## Failures Detail

<For each FAIL:>

### FAIL: TC-NNN — <test name>

**Category:** <GOLDEN_PATH | EDGE_CASE | ERROR_STATE | REGRESSION>
**Severity:** <Critical | High | Medium | Low>

**Input:**
<exact input used>

**Action:**
<exact action taken>

**Expected:**
<what should have happened>

**Actual:**
<what actually happened — exact error message, wrong output, crash, etc.>

**File / Line:**
<path/to/file.ts:47 if identified>

**Fix Applied:** <description of fix made> OR **Fix Suggestion:** <recommendation if report-only>

**Re-verified:** PASS ✅ after fix | Not re-verified (report-only) ⏭️

**Disposition:** <Fix before ship | File as tech debt | Accept as known limitation>

---

## Gate

### <SHIP-READY | DONE_WITH_CONCERNS | BLOCKED>

<If SHIP-READY:>
All tests passed. No regressions detected. Cleared for /sriflow-ship.

<If DONE_WITH_CONCERNS:>
Golden Path: all pass. Non-golden-path failures exist and are documented above.
Review the failure detail section before shipping. If dispositions are acceptable,
proceed with /sriflow-ship.

Concerns:
- <concern 1>
- <concern 2>

<If BLOCKED:>
Golden Path failure(s) detected. Ship is NOT recommended until Golden Path tests
pass. Fix the following before proceeding:

- TC-NNN: <test name> — <one-line description of failure>

Do not run /sriflow-ship until this report shows SHIP-READY or DONE_WITH_CONCERNS.

---

## Visual Evidence

<If sriflow-browser was used:>

<For each visual test:>
**<page or component name>**
- Before: <screenshot filename or inline>
- After: <screenshot filename or inline>
- Result: PASS ✅ / FAIL ❌ / SKIP ⏭️
- Notes: <discrepancy from DESIGN.md if any>

<If sriflow-browser was not used:>
No visual tests run. Re-run with app live to verify UI states.

---

## Next Step

<If SHIP-READY:>
Run `/sriflow-ship` to deploy.

<If DONE_WITH_CONCERNS:>
Review concerns above. If acceptable, run `/sriflow-ship`. Otherwise fix and
re-run `/sriflow-test`.

<If BLOCKED:>
Fix Golden Path failures, then re-run `/sriflow-test` before shipping.
```

---

## Step 11 — Memory Write

After writing QA_REPORT.md, update project memory and timeline:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
_GATE="REPLACE_WITH_ACTUAL_GATE"

# Append to SRIFLOW_MEMORY.md
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-test | $_GATE | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Tests: <N pass / M fail / K skip>
Gate: $_GATE
MEMEOF
```

Replace `_GATE` with the actual gate value (`SHIP-READY`, `DONE_WITH_CONCERNS`,
or `BLOCKED`) before running.

---

## Step 12 — Final Status Report

Output a concise terminal summary:

```
sriflow-test complete
Branch: <_BRANCH>
Mode: <mode>
Tests: <N pass / M fail / K skip>
Gate: <SHIP-READY | DONE_WITH_CONCERNS | BLOCKED>
Report: QA_REPORT.md

<If SHIP-READY:>
CLEAR TO /sriflow-ship

<If DONE_WITH_CONCERNS:>
DONE_WITH_CONCERNS — review QA_REPORT.md failures before shipping

<If BLOCKED:>
BLOCKED — fix Golden Path failures before /sriflow-ship

Golden Path failures:
  - TC-NNN: <test name>
```

Then output the full Completion Status Protocol line:

```
STATUS: <DONE | DONE_WITH_CONCERNS | BLOCKED>
REASON: <one sentence>
ATTEMPTED: <test categories run, total tests executed>
RECOMMENDATION: <next action — /sriflow-ship, fix and re-test, or specific fix>
```

---

## Reference: Test Case Format

Use this format for every single test case, without exception:

```
TC-NNN | <descriptive test name> | <GOLDEN_PATH | EDGE_CASE | ERROR_STATE | REGRESSION>
Input:    <exact input value, system state, or precondition — be specific>
Action:   <what to invoke, submit, click, or call — name the function, endpoint, or UI>
Expected: <exact expected output, response code, state change, or UI display>
Result:   PASS ✅ / FAIL ❌ / SKIP ⏭️
Notes:    <if FAIL: "Actual: <exact what happened>" — if SKIP: "<reason for skip>">
```

Rules:
- TC numbers are sequential, never reused in a session.
- Input must be exact — no "some valid input". Name the value.
- Expected must be verifiable — no "should work". Name the observable outcome.
- Notes on FAIL must include the exact actual output or error message.
- Notes on SKIP must explain why (test not applicable, tooling unavailable, etc.).

---

## Reference: Severity Classification

Use these definitions consistently in QA_REPORT.md failure sections:

**Critical**
- Feature cannot be used at all
- Data loss or corruption
- Security vulnerability (XSS, SQLi, auth bypass)
- Production crash

**High**
- Primary user workflow fails
- Error is not shown to the user (silent failure)
- Regression in previously-working feature
- Data written in incorrect state

**Medium**
- Non-primary flow fails
- Error shown but message is confusing or missing detail
- Edge case inputs produce wrong output
- Performance significantly degraded

**Low**
- Minor visual inconsistency with DESIGN.md
- Non-critical warning in logs
- Edge case that users are unlikely to hit
- Cosmetic text or label issue

---

## Reference: Gate Decision Tree

```
Are there any Golden Path FAILs?
  YES → Gate = BLOCKED
        Do not ship. Fix GP failures first.
        Next: Fix + re-run /sriflow-test

  NO  → Are there any Edge / Error / Regression FAILs?
          YES → Gate = DONE_WITH_CONCERNS
                Review failures. Set disposition per failure.
                If all dispositions acceptable: proceed to /sriflow-ship
                If any Critical or High severity unfixed: fix first.

          NO  → Gate = SHIP-READY
                CLEAR TO /sriflow-ship
```

---

## Reference: Regression Mode Details

When mode is **Regression Only** (option C from D1):

1. Skip Categories 1, 2, and 3 entirely.
2. Derive adjacent features from PLAN.md or ask the user.
3. Run at minimum 5 regression tests covering adjacent features.
4. If QA_REPORT.md exists: load it, diff old vs new results, flag regressions.
5. Write a focused QA_REPORT.md showing only regression results and delta.
6. Gate: any regression FAIL → BLOCKED. All pass → SHIP-READY.

Regression-only mode is for: post-refactor checks, dependency upgrades,
infrastructure changes, or any change that claims "no behavior change".

---

## Reference: Full QA vs Report Only Differences

| Step | Full QA | Report Only |
|------|---------|-------------|
| Read PLAN.md, DESIGN.md, CODE_REVIEW.md | Yes | Yes |
| Derive test cases | Yes | Yes |
| Run all four categories | Yes | Yes |
| Mark pass/fail | Yes | Yes |
| Fix inline on FAIL | Yes (with D2 confirmation) | No — never |
| Re-verify after fix | Yes | Not applicable |
| Write QA_REPORT.md | Yes | Yes |
| Gate determination | Yes | Yes |
| Code changes | Yes (minimal, targeted) | None |

Report Only is a pure audit. It finds and documents. It never edits.

---

## Operational Rules

These rules override any tendency toward speed or optimism. Enforce them.

1. **Golden Path failure = BLOCKED, always.** Do not rationalize around a golden
   path failure. Do not ship with a broken primary flow.

2. **Derive expected from spec, not from code.** If you read the code to decide
   what "expected" means, you are testing that the code matches itself. Test that
   the code matches the spec.

3. **Exact inputs, exact outputs.** Test cases with vague inputs ("a valid value")
   are not test cases. Name the exact value. Name the exact expected response.

4. **Document before fixing.** In Full QA mode, record the failure in full before
   attempting a fix. The record must survive whether the fix works or not.

5. **One fix per failure.** Do not bundle fixes. Do not refactor while fixing. The
   minimal change that closes the failure is the right change.

6. **Re-verify every fix.** A fix that was not re-verified is a guess, not a fix.
   Mark it as such.

7. **Never swallow a SKIP silently.** Every SKIP must have a reason. "Not applicable"
   is a reason. "Tooling unavailable" is a reason. Empty notes are not.

8. **Regressions are Critical by default.** A previously-passing test that now
   fails is always at least High severity unless proven otherwise.

9. **The report is permanent.** QA_REPORT.md outlasts the session. Write it so
   that someone reading it tomorrow can reproduce every test case without talking
   to you.

10. **CLEAR TO /sriflow-ship only on SHIP-READY.** Do not say "you can probably
    ship" or "this looks mostly fine". Gate language is binary: SHIP-READY or not.

---

## Reference: Edge Case Checklist by Input Type

Use this checklist when building the test matrix in Step 2. Check off each
input type the feature exposes and generate at least one test per row.

### String fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Empty string `""` | Undefined behavior on null split, empty-key DB write | Always |
| Whitespace only `"   "` | Stored as spaces, displays as blank, breaks search | Always |
| At max length | Off-by-one on validation, silent truncation | When field has a limit |
| Over max length by 1 | Truncation vs rejection inconsistency | When field has a limit |
| SQL injection `'; DROP TABLE--` | DB query injection if input not parameterized | Always |
| XSS `<script>alert(1)</script>` | Script execution in browser if output not escaped | Always |
| HTML entities `&amp; &lt; &gt;` | Double-escaping or unescaped display | When rendered in HTML |
| Unicode BMP `日本語` | Encoding errors, byte-vs-char length confusion | When any user input |
| Unicode supplementary `𝄞 🌍` | 4-byte chars break naive `str.length` checks | When emoji/music/math |
| Null byte `\x00` | Truncates C strings; bypasses suffix checks | When touching filesystems |
| Path traversal `../../etc/passwd` | Directory escape if stored as filename | When used in file paths |
| CRLF injection `\r\n` | Log injection, header injection | When written to logs/headers |

### Numeric fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Zero `0` | Divide-by-zero, falsy check treating 0 as empty | Always |
| Negative `-1` | Sign assumption in business logic | When non-negative assumed |
| Max safe integer `2^53 - 1` | Precision loss in JS float arithmetic | Always in JS |
| Max 32-bit int `2147483647` | Integer overflow in DB column | When stored as INT |
| Max 32-bit int + 1 `2147483648` | Overflow wraps to negative | When stored as INT |
| Float `3.14159` | Truncation or rejected where int expected | When field is integer |
| Negative float `-0.001` | Sign and precision both hit | When float expected |
| String `"abc"` in numeric field | Type coercion producing NaN or 0 | Always |
| Extremely large float `1e308` | Infinity, overflow | When float expected |

### Boolean / flag fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| True / false both submitted | Logic branches both tested | Always |
| String "true" / "false" | Type coercion treating string as truthy | When input from form |
| `1` / `0` as boolean | Coercion behavior differs by language | When numeric boolean |
| Missing / undefined | Treated as false vs error | Always |

### Array / list fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Empty array `[]` | Null handling vs empty collection | Always |
| Single item `[x]` | Off-by-one in loop logic | Always |
| Duplicate items `[x, x]` | Dedup logic, constraint violations | When uniqueness expected |
| Very large array (1000+ items) | Memory pressure, timeout, pagination | When unbounded |
| Array with null items `[null, x]` | Null inside collection breaks iteration | Always |

### Date / time fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Unix epoch `1970-01-01T00:00:00Z` | Treated as null/zero in some ORMs | When stored as timestamp |
| Far future `2099-12-31` | Overflow in some date libs | Always |
| Leap day `2000-02-29` | Rejected on non-leap years | When date arithmetic used |
| DST spring-forward `2026-03-08T02:30:00 US/Eastern` | Time doesn't exist; some libs throw | When timezone-aware |
| DST fall-back `2026-11-01T01:30:00 US/Eastern` | Ambiguous time; store UTC to avoid | When timezone-aware |
| Timezone offset `+14:00` / `-12:00` | Date boundary shifts by a full day | When displaying by user tz |
| ISO string with Z vs +00:00 | Parsed differently by some parsers | When both formats accepted |

---

## Reference: Error State Checklist by Dependency Type

Map each external dependency the feature touches to the error states to test.

### HTTP / REST API calls (outbound)

| Error state | HTTP status / behavior | What to verify |
|-------------|----------------------|----------------|
| Timeout | Connection hangs past threshold | Loading state shown; no hang; retry or error msg |
| Connection refused | Network-level failure | Error caught; user sees offline message |
| 400 Bad Request | Upstream rejects our payload | Our error handling names the field; not "unknown error" |
| 401 Unauthorized | Upstream auth expired | Session cleared; user redirected to login |
| 403 Forbidden | Upstream denies our key/scope | Feature disabled gracefully; not a crash |
| 404 Not Found | Resource no longer exists | Handled as "not found"; not as a 500 |
| 429 Rate Limited | Too many requests | Backoff or queue; user told to wait; no data loss |
| 500 Internal | Upstream crashed | Caught; user sees generic error; no stack trace exposed |
| 503 Unavailable | Upstream down for maintenance | Degradation message; retry-after respected if header present |
| Partial body | Connection drops mid-response | Parse error caught; not a crash; not silent |
| Invalid JSON | Response body is not valid JSON | Parse error caught; logged; user sees error |
| Redirect loop | Upstream keeps redirecting | Limit followed redirects; cycle detected and broken |

### Database operations

| Error state | Cause | What to verify |
|-------------|-------|---------------|
| Unique constraint violation | Duplicate write | 409 or domain error; "already exists" message; no 500 |
| Foreign key violation | Reference to deleted record | Caught at service layer; clear error; no orphan data |
| Connection pool exhausted | Too many concurrent queries | Queued or rejected cleanly; not a deadlock |
| Query timeout | Long-running query | Timeout caught; transaction rolled back; no partial write |
| Disk full | Storage layer failure | Caught; admin alerted; user sees service unavailable |
| Migration not run | Schema mismatch | Column missing error caught early; clear diagnostic |

### File system operations (if applicable)

| Error state | Cause | What to verify |
|-------------|-------|---------------|
| File not found | Path wrong or file deleted | FileNotFoundError caught; not a crash |
| Permission denied | Process lacks read/write access | Error caught; not a crash; admin can diagnose |
| Disk full | No space for write | Write error caught; no partial file left; user notified |
| File locked | Another process holds exclusive lock | Retry or fail gracefully; no deadlock |
| Path traversal | Input contains `../` sequences | Normalized to safe path; escape blocked |

### Authentication / session

| Error state | Cause | What to verify |
|-------------|-------|---------------|
| Token expired | JWT or session past expiry | Redirect to login; session cleared; no data exposed |
| Token tampered | Signature invalid | Rejected with 401; not a 500 |
| CSRF token missing | Form submitted without token | 403; no state change |
| CSRF token reused | Token used twice (replay) | Rejected; one-use tokens invalidated |
| Session fixation | Old session ID reused post-login | New session ID issued on login; old ID invalidated |
| Concurrent logout | Session deleted while request in flight | Request rejected with 401; not a crash |

---

## Reference: Regression Test Derivation

When no previous QA_REPORT.md exists, derive regression tests from PLAN.md
using these heuristics:

### Shared code surface

Read the feature's source files. Note every import, every utility function,
every shared component or service it touches. For each shared item, ask:
"What other features also use this?" Those features are regression candidates.

```bash
# Find files changed in this branch
git diff main...HEAD --name-only 2>/dev/null

# For each changed file, find what else imports it
grep -r "from.*<changed-file>" --include="*.ts" --include="*.tsx" --include="*.js" .
```

Every file that imports a changed module is a regression candidate.

### Shared routes or API endpoints

If the feature adds or modifies a route, check whether any adjacent feature
uses the same URL namespace, middleware, or router. Routes that share a
middleware chain must be regression tested — middleware bugs affect all routes.

### Shared database tables

If the feature writes to a table, check which other features read or write the
same table. A schema migration or changed query can break other features silently.

### Shared state (frontend)

If the feature reads or writes global state (Redux store, Zustand, React context,
localStorage, cookies), identify every other component that reads the same state
slice. Those components must be regression tested.

### Priority order for regression test selection

1. **Features that share database tables with the changed feature** — highest risk
2. **Features that import changed utility functions or services** — high risk
3. **Features that share the same route namespace or middleware** — medium risk
4. **Features that share UI state** — medium risk
5. **Unrelated features on the same page as the changed component** — low risk

Write at least one regression test per priority-1 and priority-2 candidate.
Write at least one regression test per priority-3 candidate if time allows.

---

## Reference: sriflow-browser Integration

When to open sriflow-browser during a test run:

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

### sriflow-browser test flow

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

---

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  head -80 SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
if [ -f "QA_REPORT.md" ]; then
  echo "=== PREVIOUS QA REPORT HEADER ==="
  head -30 QA_REPORT.md
  echo "=== END REPORT HEADER ==="
fi
```

If memory found: give a 2-sentence summary of current state. If gate from last
run was BLOCKED, flag it prominently. If SHIP-READY, suggest `/sriflow-ship`.
If a previous QA_REPORT.md exists, note it as the regression baseline.

---

## Confusion Protocol

For high-stakes ambiguity (architecture mismatch, conflicting specs, missing
test context, destructive scope): STOP. Name the ambiguity in one sentence.
Present 2-3 options with tradeoffs. Ask before proceeding.

Do not use for routine test execution or obvious pass/fail determinations.

Do not use as an excuse to avoid a test. If you are unsure whether a test case
applies, apply it and mark SKIP with a reason if it does not.

---

## Telemetry (run last)

After workflow completion:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
echo "sriflow-test completed in ${_TEL_DUR}s | branch: $_BRANCH | session: $_SESSION_ID"
```
