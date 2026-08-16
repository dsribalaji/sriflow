# Refactor-Cleaner — Dead Code Cleanup Patterns

Applied during build when the code-scan (Step 2) surfaces dead code, and during
smoke-check cleanup. Dead code is not a separate phase — it's removed as it is
encountered, then the build re-verifies.

## When cleanup is allowed

- The code is confirmed unreachable (grep finds no references, no reflection,
  no dynamic dispatch, no export).
- The change is within the current build unit's scope.
- A smoke check still passes after removal.

When cleanup would touch code outside the unit's scope: note it in the build
log and leave it. Do not scope-creep into unrelated deletions.

## Detection patterns

| Pattern | How to confirm dead |
|---------|---------------------|
| Unused imports | Typecheck/lint flags them (`noUnusedLocals`, `ruff F401`, `golangci unused`) |
| Unused private functions/methods | Static analysis: zero call sites, zero tests referencing |
| Unused exports | Search the whole repo, not just this module |
| Dead branches (`if (false)`, unreachable after `return`) | Manual read; compiler may not warn |
| Commented-out code | Grep for leading `// ` / `# ` blocks with code content |
| Orphan files | Not referenced by any import, module graph, or build config |
| Legacy alternatives (old `v1` alongside `v2`) | Git history shows supersession; confirm no import |

## Removal order

1. **Imports** — remove first; they fail the build loudly if wrong, so they're the safe test.
2. **Local dead branches** — inside the unit being touched.
3. **Private members** — only after proving no call sites.
4. **Public/exposed symbols** — the risky ones. Grep repo-wide; if a symbol is part of a published API, keep it and mark `@deprecated` instead of deleting.
5. **Orphan files** — delete last, after everything referencing them is gone.

## Verification ladder (after each removal batch)

1. Typecheck / lint (project's tool).
2. Build.
3. Run the relevant test subset.
4. Grep the deleted symbol name to confirm zero references remain.

```
# batch: removed 3 unused imports + 1 dead branch in <unit>
# verify: typecheck ✓  build ✓  tests ✓  grep '<symbol>' → 0 hits
```

## Cleanup rules (trim-aligned)

- **One logical cleanup per pass.** If removal #2 breaks the build, you know it
  immediately — you don't untangle five deletions at once.
- **No behavioral change.** Refactor-cleaner deletes; it does not rewrite
  logic. If removing a symbol would change behavior, it wasn't dead.
- **Delete the comment that explains the dead code too.** A comment attached to
  deleted code is dead documentation.
- **No "just in case" retention.** If nothing references it and no test
  exercises it, it goes. Git history preserves it.
- **Public surface: deprecate, don't delete.** Anything that could be consumed
  externally (exported API, CLI flag, config key) gets a deprecation note and a
  removal plan, not a silent delete.

## Common traps

- **Reflection / dynamic dispatch** — JS `obj[methodName]`, Python `getattr`,
  Go `interface{}` switches, DI registries. Grep string names, not just symbols.
- **Test-only usage** — a symbol used only by tests is not dead if the tests
  matter. Confirm the tests still exercise intent after the delete.
- **Re-export chains** — `export * from './x'` can keep a symbol alive without
  a direct import anywhere. Check barrel files.
- **Config-key dead code** — a config key that nothing reads. Remove the read,
  then the key, then the default. Order matters: never remove the key first.
- **Dead code that masks a missing feature** — if the "dead" path was
  half-finished, that's a build decision, not a cleanup decision. Note it in
  the log; ask before finishing or deleting.

## Output

Each cleanup batch is logged with: symbol(s) removed, evidence (zero refs),
verification result. The build's `DONE` status reflects cleanup only if it
changes the behavior surface — otherwise it's part of normal Step 2/4 work.