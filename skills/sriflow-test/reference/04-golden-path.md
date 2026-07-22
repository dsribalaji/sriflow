# Step 3 — Category 1: Golden Path (Details)

Golden Path tests cover core happy-path flows. These must ALL pass before any
other category matters. A Golden Path failure is a BLOCKED gate — do not ship.

If a Golden Path test cannot run because the feature is not implemented, mark it
as SKIP with note "feature not implemented — re-run after build". Do not treat
SKIP as BLOCKED. Only implemented features can produce Golden Path failures.

## Required Golden Path tests

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
