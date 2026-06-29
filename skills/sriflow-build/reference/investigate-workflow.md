# Investigate Workflow (absorbed from gstack/investigate)

## Iron Law

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

Fixing symptoms creates whack-a-mole debugging. Find root cause, then fix.

---

## Phase 1: Root Cause Investigation

Gather context before forming any hypothesis.

1. **Collect symptoms:** Read error messages, stack traces, reproduction steps. Ask ONE question at a time if context is insufficient.
2. **Read the code:** Trace code path from symptom back to potential causes. Use Grep for all references, Read for logic.
3. **Check recent changes:**
   ```bash
   git log --oneline -20 -- <affected-files>
   ```
   Was this working before? What changed? Regression = root cause is in the diff.
4. **Reproduce:** Can you trigger the bug deterministically? If not, gather more evidence.
5. **Check investigation history:** Search prior learnings for investigations on same files. Recurring bugs in same area = architectural smell.

## Prior Learnings

Search SRIFLOW_MEMORY.md for related past investigations. If prior investigations exist, note patterns and check if root cause was structural.

Output: **"Root cause hypothesis: ..."** — specific, testable claim about what is wrong and why.

---

## Scope Lock

After forming root cause hypothesis, lock edits to affected module to prevent scope creep. Identify narrowest directory containing affected files. If bug spans entire repo or scope is unclear, skip lock and note why.

---

## Phase 2: Pattern Analysis

Check if bug matches a known pattern:

| Pattern | Signature | Where to look |
|---------|-----------|---------------|
| Race condition | Intermittent, timing-dependent | Concurrent access to shared state |
| Nil/null propagation | NoMethodError, TypeError | Missing guards on optional values |
| State corruption | Inconsistent data, partial updates | Transactions, callbacks, hooks |
| Integration failure | Timeout, unexpected response | External API calls, service boundaries |
| Configuration drift | Works locally, fails in staging/prod | Env vars, feature flags, DB state |
| Stale cache | Shows old data, fixes on cache clear | Redis, CDN, browser cache |

Also check TODOS.md for related known issues and `git log` for prior fixes in same area.

**External pattern search:** If bug doesn't match known patterns, WebSearch for:
- "{framework} {generic error type}" — **sanitize first:** strip hostnames, IPs, file paths, SQL, customer data
- "{library} {component} known issues"

---

## Phase 3: Hypothesis Testing

Before writing ANY fix, verify hypothesis.

1. **Confirm hypothesis:** Add temporary log/assertion at suspected root cause. Run reproduction. Does evidence match?
2. **If wrong:** WebSearch for error (sanitized), then return to Phase 1. Gather more evidence. Do not guess.
3. **3-strike rule:** If 3 hypotheses fail, **STOP**. Ask user:
   - A) Continue investigating — new hypothesis
   - B) Escalate for human review
   - C) Add logging and wait — instrument area, catch next time

**Red flags:**
- "Quick fix for now" — no "for now." Fix right or escalate.
- Proposing fix before tracing data flow — guessing.
- Each fix reveals new problem elsewhere — wrong layer, not wrong code.

---

## Phase 4: Implementation

Once root cause confirmed:

1. **Fix root cause, not symptom.** Smallest change that eliminates actual problem.
2. **Minimal diff:** Fewest files, fewest lines. Resist urge to refactor adjacent code.
3. **Write regression test** that:
   - **Fails** without fix (proves test is meaningful)
   - **Passes** with fix (proves fix works)
4. **Run full test suite.** Paste output. No regressions allowed.
5. **If fix touches >5 files:** Flag blast radius:
   - A) Proceed — root cause genuinely spans these files
   - B) Split — fix critical path now, defer rest
   - C) Rethink — more targeted approach?

---

## Phase 5: Verification & Report

**Fresh verification:** Reproduce original bug scenario, confirm fixed. Not optional.

Output structured debug report:
```
DEBUG REPORT
════════════════════════════════════════
Symptom:         [what user observed]
Root cause:      [what was actually wrong]
Fix:             [what changed, file:line references]
Evidence:        [test output, reproduction showing fix]
Regression test: [file:line of new test]
Related:         [TODOS.md items, prior bugs, architectural notes]
Status:          DONE | DONE_WITH_CONCERNS | BLOCKED
════════════════════════════════════════
```

Log investigation as learning for future sessions.

---

## Important Rules

- **3+ failed fix attempts → STOP and question architecture.** Wrong architecture, not failed hypothesis.
- **Never apply fix you cannot verify.** Reproduce and confirm before shipping.
- **Never say "this should fix it."** Verify and prove it. Run tests.
- **If fix touches >5 files → flag blast radius** before proceeding.
- **Completion status:** DONE (root cause found, fix applied, regression test, all pass) | DONE_WITH_CONCERNS (fixed but cannot fully verify) | BLOCKED (root cause unclear after investigation)
