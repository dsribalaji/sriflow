# Quality Gates

Three enforced gates: pre-commit, post-build, final.
Automated checks at every stage boundary.

---

## Pre-Commit Gate

Before writing any file, run these checks on the diff:

| Check | What to look for | Action on fail |
|-------|-----------------|----------------|
| Hardcoded secrets | API keys, passwords, tokens, connection strings with credentials | Block. Extract to env/config |
| Untracked TODOs | `TODO`, `FIXME`, `HACK` without issue number | Block. Add issue reference or remove |
| Debug statements | `console.log`, `console.debug`, `print()`, `debugger` | Block. Remove or gate behind flag |
| Unused imports | Import statements not referenced in file | Block. Remove unused imports |
| File size | > 500 lines | Warn. Suggest split point |

### Pre-commit check script

```bash
_pre_commit_gate() {
  local file="$1"
  local failed=0

  # Secrets scan
  if grep -nE '(api[_-]?key|password|secret|token)\s*[:=]\s*["\x27][A-Za-z0-9]' "$file" 2>/dev/null; then
    echo "GATE FAIL: Hardcoded secret detected in $file"
    failed=1
  fi

  # Untracked TODOs
  if grep -nE '(TODO|FIXME|HACK)(\s*\(\s*\)|\s*:)' "$file" | grep -vE '\(#[0-9]+\)|\(issue [0-9]+\)' 2>/dev/null; then
    echo "GATE FAIL: Untracked TODO/FIXME in $file"
    failed=1
  fi

  # Debug statements
  if grep -nE '(console\.(log|debug|trace)|debugger|binding\.pry)' "$file" 2>/dev/null; then
    echo "GATE FAIL: Debug statement in $file"
    failed=1
  fi

  # File size
  local lines
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 500 ]; then
    echo "GATE WARN: $file is $lines lines — consider splitting"
  fi

  return $failed
}
```

---

## Post-Build Gate

After each logical unit completes, verify before moving to next unit:

| Check | How | Action on fail |
|-------|-----|----------------|
| Self-check passes | Run unit's assert/test | Fix before next unit |
| No new lint errors | `eslint` / `ruff` / language linter | Fix or suppress with reason |
| No new type errors | `tsc --noEmit` / `mypy` / language checker | Fix before next unit |
| Memory entry written | SRIFLOW_MEMORY.md updated for this unit | Write entry |

### Post-build check script

```bash
_post_build_gate() {
  local unit_name="$1"
  local failed=0

  # Lint check
  if command -v eslint &>/dev/null && ! eslint --quiet . 2>/dev/null; then
    echo "GATE FAIL: New lint errors after building $unit_name"
    failed=1
  fi

  # Type check
  if command -v tsc &>/dev/null && ! tsc --noEmit 2>/dev/null; then
    echo "GATE FAIL: New type errors after building $unit_name"
    failed=1
  fi

  # Memory check
  if ! grep -q "$unit_name" SRIFLOW_MEMORY.md 2>/dev/null; then
    echo "GATE FAIL: No memory entry for $unit_name"
    failed=1
  fi

  return $failed
}
```

---

## Final Gate

Before declaring DONE, all must pass:

| Check | How | Action on fail |
|-------|-----|----------------|
| All units built | Every logical unit has self-check evidence | Build missing units |
| End-to-end smoke | Single happy-path command succeeds | Fix failure |
| No merge conflicts | `git status` clean, no conflict markers | Resolve before ship |
| Memory status | SRIFLOW_MEMORY.md shows `done` not `in-progress` | Update status |

### Final check script

```bash
_final_gate() {
  local failed=0

  # Conflict markers
  if grep -rnE '^(<{7}|={7}|>{7})' --include='*.ts' --include='*.js' --include='*.py' . 2>/dev/null; then
    echo "GATE FAIL: Conflict markers found in codebase"
    failed=1
  fi

  # Git clean
  if ! git diff --quiet 2>/dev/null; then
    echo "GATE WARN: Uncommitted changes present"
  fi

  # Memory status
  if grep -q 'in-progress' SRIFLOW_MEMORY.md 2>/dev/null; then
    echo "GATE FAIL: SRIFLOW_MEMORY.md still shows in-progress"
    failed=1
  fi

  return $failed
}
```

---

## Gate Failure Behavior

On any gate failure:

1. **Report** — Name the exact gate (pre-commit / post-build / final)
2. **Show** — Quote the specific error/output line
3. **Offer** — Two options:
   - **Fix** — Address the issue now
   - **Skip** — Acknowledge risk, log the skip, continue
4. **Never silently bypass** — Every skip is logged with reason

### Skip protocol

```bash
_gate_skip() {
  local gate="$1"
  local reason="$2"
  echo "GATE SKIP: $gate — reason: $reason"
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | gate-skip | $gate | $reason" >> SRIFLOW_MEMORY.md
}
```

---

## Integration Points

- **sriflow-build**: Pre-commit gate runs before each file write. Post-build gate runs after each unit in the build loop. Final gate runs in Step 5 (smoke check).
- **sriflow-test**: Post-build gate runs after each test category (golden path, edge cases, error states). Final gate runs before QA_REPORT.md is written.
