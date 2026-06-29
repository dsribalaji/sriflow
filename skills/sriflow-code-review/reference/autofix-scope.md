# Appendix D: Auto-Fix Scope and Safety Rules

The auto-fix in Step 4 applies only to NITPICK findings. This appendix defines what "safe to auto-fix" means and the exact scope limits.

## Always safe to auto-fix

These changes cannot break behavior:

1. **Delete `console.log` / `print` / `logger.debug` / `debugger` / `breakpoint()`** — development artifacts with no production value. If a log is needed for observability, it should be `logger.info` or `logger.warn` with a structured message.
2. **Delete obvious-restatement comments** — comments that say the same thing as the line of code they precede, word for word.
3. **Remove redundant imports** — only when Grep confirms the imported name appears nowhere else in the file.
4. **Remove immediately-returned intermediate variables** — `const x = foo(); return x;` -> `return foo();` when no operations happen between assignment and return.
5. **Delete commented-out code blocks** — code that is commented out, not explanatory comments. If it is in the diff, it was recently commented out. If it is not in the diff, leave it (it predates this review).

## Require confirmation before auto-fixing

Do not auto-fix these without asking:

1. **Wrapper function deletion** — the function might be the callsite's stable public API even if the current implementation is trivial.
2. **Config-for-constant removal** — the env var might be documented elsewhere or used in a deployment script not in the diff.
3. **Interface collapse** — there might be a test double using the interface in a test file not in the diff.
4. **Any NITPICK where Grep shows the symbol has callers in files outside the diff** — those callers might depend on the behavior you are about to remove.

## Never auto-fix

- Any WARN or CRITICAL finding.
- Any NITPICK where the change would touch more than 5 lines.
- Any NITPICK where the original code is inside a file that was not in the diff (you should only touch files the diff already touched).
- Any NITPICK where the comment being deleted appears to document a non-obvious business rule (even if the comment re-states the code, the business rule might not be obvious from the code alone).
