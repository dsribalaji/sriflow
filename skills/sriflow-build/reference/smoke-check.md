# Smoke Check Reference

## What the Smoke Check Is

One command that:
- Starts the system (or the relevant component)
- Exercises the primary user-facing flow
- Exits cleanly on success
- Fails visibly on error (non-zero exit, error output)

It is NOT a full test suite. It is the minimum evidence that the build works.

---

## Finding the Smoke Check Command

Read PLAN.md for a specified smoke check. If none specified:

```bash
# Check for common project scripts
cat package.json 2>/dev/null | grep -A 5 '"scripts"'
cat Makefile 2>/dev/null | grep "^[a-z]" | head -20
```

Then infer from project type:
- Web server: `curl -s http://localhost:<port>/health`
- CLI: `<binary> --version` or `<binary> <simple subcommand>`
- Library: `python -c "from <module> import <key_function>; print(<key_function>(<arg>))"`
- DB migration: `<migrate-tool> status`
- Build: `<build-tool> build && echo "build ok"`

---

## Running and Recording

Run the smoke check. Record exit code and first 10 lines of output.

### If it passes

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-build | done | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Build complete. All units implemented.
Smoke check: <command> — exit 0 — <first line(s) of output>
Units built: <comma-separated list of unit names>
MEMEOF
```

### If it fails

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-build | done-with-concerns | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Build complete. Smoke check failed.
Smoke check: <command> — exit <code> — <error output>
Action needed: <what to fix>
MEMEOF
```

Fix the smoke check failure before declaring DONE. A passing smoke check is the
minimum bar for DONE status. If the fix requires more than 15 minutes of debugging,
use DONE_WITH_CONCERNS and document the exact error and reproduction step.

**Important:** A smoke check that exits 0 but returns wrong data is a failure.
Check the output, not just the exit code.
