# Investigate — Root-Cause Debugging Workflow

Used when the build loop's self-check or smoke check fails. The goal is the
root cause, not the first symptom. Never "fix" a symptom and call it done —
trace to the actual defect, fix it, then re-verify the original symptom is
gone for the right reason.

## The workflow

### 1. Reproduce, exactly

- Run the failing command from the same working directory, env, and inputs the
  build used. Write down the exact command.
- A failure that won't reproduce is a build-environment problem (stale cache,
  wrong branch, missing env var) — fix the environment first, then re-run.
- Reduce: strip flags/features until it stops failing or until it's minimal.
  The minimal failing case tells you which part of the pipeline is guilty.

### 2. Read the error, not the narrative

- First line of the stack trace, the compiler caret, the test name — the
  concrete signal.
- Capture the FULL output to a file if long; never work from the last 20 lines
  alone. (`tee`, or redirect then search.)

### 3. Form hypotheses, test cheapest first

Order hypotheses by cost, not by "most likely" feels:

1. Environment/config: version, env var, flag, cache. Cheapest to check.
2. Data: the specific input. Run the same code against a known-good input.
3. Code: the actual defect. Only after 1 and 2 are ruled out.

```
# log pattern
hypothesis: stale build cache serving old artifact
test:       clean rebuild, re-run failing command
result:     still fails → hypothesis false
```

### 4. Instrument at the boundary

- Add the minimal print/log/traceback at the boundary where data crosses into
  the failing unit: the input to the failing function, its return, and where
  it diverges from expectation.
- One probe at a time. Two probes at once blur cause and effect.
- Remove probes after the fix. No debug prints shipped.

### 5. Fix the root cause

- The fix is the smallest change that makes the failing case pass AND does not
  break the cases that were already passing.
- If the fix would be large, it's a symptom of a design gap — fix the root
  cause in the smallest coherent change, or flag it as DONE_WITH_CONCERNS.

### 6. Re-verify backward

- Re-run the original failing command (from step 1).
- Re-run the test suite / smoke check that was passing before.
- Grep for other call sites of the changed code — did the fix assume a
  caller that doesn't exist?

## Error-class playbooks

| Symptom class | Typical root cause | First probe |
|---------------|---------------------|-------------|
| Compile/build failure | Wrong toolchain version, missing dep, stale artifact | `--version`, clean build |
| Import/module not found | Path, case, missing install | `python -c "import x"`, `npm ls` |
| Test fails only in CI | Env difference (secrets, timezone, locale, ordering) | Run with CI env locally |
| Flaky test | Shared state, race, order dependence | Run test alone, then in a loop |
| Crash/panic | Nil/None deref, unhandled case | Print the value before the crash line |
| Wrong output, no error | Off-by-one, wrong index, wrong field | Print the boundary inputs/outputs |

## Investigate posture

- **One variable at a time.** Change one thing, re-run, keep notes.
- **Bisect.** For regressions, `git bisect` or manual binary search over
  recent changes — halves the search space each step.
- **Beware the last-touched-code bias.** The bug is often in the code you
  didn't touch. Grep callers, check data shape, check the framework.
- **Trust evidence over memory.** Write down what the failing run actually
  printed. Don't "remember" the output differently.

## Exit criteria

An investigation is done when:
- The root cause is stated in one sentence with evidence.
- The fix addresses it (not a workaround).
- The original failing command passes.
- Prior-passing checks still pass.

If investigation exceeds ~15 minutes without a root cause: log the current
state (command, output, hypotheses tested), and either escalate the build
status or take a clean break. Staring at the same output produces the same
wrong conclusion.