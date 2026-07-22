# Step 5 — Final Smoke Check (Details)

After all units are built and self-checks pass, run one command that exercises
the happy path end to end.

## What the smoke check is

One command that:
- Starts the system (or the relevant component)
- Exercises the primary user-facing flow
- Exits cleanly on success
- Fails visibly on error (non-zero exit, error output)

It is NOT a full test suite. It is the minimum evidence that the build works.

## Finding the smoke check command

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

## Running and recording

Run the smoke check. Record exit code and first 10 lines of output.

If it passes:

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

If it fails:

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

## Example: Full Build Run (Annotated)

This example shows a complete build run for a small feature. It demonstrates the
correct application of every step.

**Scenario:** PLAN.md says "Add a `/api/health` endpoint that returns `{status: "ok"}`
and the current UTC timestamp."

**Step 0 — Safety scan:**
No destructive operations in scope. Proceed.

**Step 1 — Context load:**
PLAN.md: single endpoint, returns JSON, no auth required, no DB.
DESIGN.md: Express app, TypeScript, src/routes/ directory, existing router in src/routes/index.ts.
SRIFLOW_MEMORY.md: no prior build progress.

**Step 2 — Reuse scan:**
```bash
grep -r "health\|router\|express" --include="*.ts" -l src/ 2>/dev/null
```
Found: `src/routes/index.ts` — existing Express router. Will register the new route here.
Found: `src/app.ts` — mounts the router at `/api`. No change needed.
Not found: any existing health endpoint. Will implement new.

**Step 3 — Trim ladder for the health route:**
- Rung 1: Needs to exist? Yes — monitoring and load balancers need it.
- Rung 2: Already exists? No — grep confirmed.
- Rung 3: Stdlib? `new Date().toISOString()` covers the timestamp. No dep needed.
- Rung 4: Native? N/A for route logic.
- Rung 5: Installed dep? Express already installed for routing.
- Rung 6: One line? No — needs a route handler.
- Rung 7: Minimum code:

```typescript
// src/routes/index.ts (add to existing router)
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})
```

Two lines. No wrapper. No interface. No health-check abstraction. Registers on the
existing router, no new file.

**Step 4 — Self-check:**
Non-trivial? No — it's a route that calls `new Date()`. No branching. No state.
Skip the self-check and note why: trivial handler, no branching logic, no edge cases.

**Step 4f — Memory:**
```
[BUILD PROGRESS]: health-endpoint — done
Done: src/routes/index.ts:42 — GET /api/health returns {status, ts}
Next: smoke check
Surprises: none
```

**Step 5 — Smoke check:**
```bash
npm run dev &
sleep 2
curl -s http://localhost:3000/api/health
```
Output: `{"status":"ok","ts":"2026-06-28T10:00:00.000Z"}`
Exit 0. Done.

**Status: DONE**
Implemented GET /api/health. 2-line addition to existing router. Smoke check passed.
