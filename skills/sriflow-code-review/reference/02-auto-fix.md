# Auto-Fix Gate (Details)

After all 6 lenses complete, count total NITPICK findings. If any NITPICKs exist, ask:

```
D1 — Auto-fix <N> nitpick findings?
Branch: <_BRANCH>
ELI10: The review found <N> nitpick-level issues — dead code, debug logs, wrapper functions, restating comments. These are safe to fix automatically. None of them change behavior. Skipping leaves known waste in the diff.
Stakes if wrong: Nitpick fixes are low-risk cosmetic changes. Worst case: a one-line revert.
Recommendation: A because these are verified wastes with no behavior change.
Completeness: A=9/10, B=6/10
A) Fix all nitpicks automatically (recommended)
  ✅ Diff leaves clean; no manual work needed for trivial findings
  ✅ Findings are pre-verified — only applying changes with confirmed line numbers
  ❌ Applies all nitpick changes at once without individual confirmation
B) Report only — I will fix manually
  ✅ Full control over exactly what changes
  ✅ Can read each finding before deciding
  ❌ Leaves confirmed waste in the diff for you to clean up later
Net: If you trust the review, A is strictly better. If you want to inspect each change first, pick B.
```

**If A (auto-fix):**
For each NITPICK finding, apply the fix using `Edit`. After each fix, print:
```
Fixed: path/file.ext:LINE — <what changed in one line>
```

Apply fixes in order from last line to first line within each file (prevents line number drift). Work through files in alphabetical order.

After all fixes: `Auto-fixed <N> nitpicks. Re-reading diff to confirm no unintended changes.`

Run `git diff HEAD` to verify the fixes look correct. If any fix produced an unexpected result, revert it and note: `Reverted: path/file.ext:LINE — fix produced unexpected output; manual review needed.`

**If B (report only):**
Proceed directly to writing CODE_REVIEW.md.

---

## Auto-Fix Scope and Safety Rules

### Always safe to auto-fix

These changes cannot break behavior:

1. **Delete `console.log` / `print` / `logger.debug` / `debugger` / `breakpoint()`** — development artifacts with no production value.
2. **Delete obvious-restatement comments** — comments that say the same thing as the line of code they precede.
3. **Remove redundant imports** — only when Grep confirms the imported name appears nowhere else in the file.
4. **Remove immediately-returned intermediate variables** — `const x = foo(); return x;` → `return foo();`
5. **Delete commented-out code blocks** — code that is commented out, not explanatory comments.

### Require confirmation before auto-fixing

Do not auto-fix these without asking:

1. **Wrapper function deletion** — the function might be the callsite's stable public API
2. **Config-for-constant removal** — the env var might be documented elsewhere
3. **Interface collapse** — there might be a test double using the interface
4. **Any NITPICK where Grep shows the symbol has callers outside the diff**

### Never auto-fix

- Any WARN or CRITICAL finding
- Any NITPICK where the change would touch more than 5 lines
- Any NITPICK where the original code is inside a file not in the diff
- Any NITPICK where the comment being deleted appears to document a non-obvious business rule
