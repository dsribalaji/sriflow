# Operational Rules & References

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

## Confusion Protocol

For high-stakes ambiguity (architecture mismatch, conflicting specs, missing
test context, destructive scope): STOP. Name the ambiguity in one sentence.
Present 2-3 options with tradeoffs. Ask before proceeding.

Do not use for routine test execution or obvious pass/fail determinations.

Do not use as an excuse to avoid a test. If you are unsure whether a test case
applies, apply it and mark SKIP with a reason if it does not.

## Telemetry (run last)

After workflow completion:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
echo "sriflow-test completed in ${_TEL_DUR}s | branch: $_BRANCH | session: $_SESSION_ID"
```
