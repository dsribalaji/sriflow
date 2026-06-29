# Memory Entry Templates

## Unit In-Progress

```
### <ISO timestamp> | sriflow-build | in-progress | <Ns>
Branch: <branch>
Session: <session>
[BUILD PROGRESS]: <unit> — done
Done: <file paths, function names, what works>
Next: <next unit>
Surprises: <none | what was unexpected>
```

## Build Complete (Success)

```
### <ISO timestamp> | sriflow-build | done | <Ns>
Branch: <branch>
Session: <session>
Build complete. All units implemented.
Smoke check: <command> — exit 0 — <output snippet>
Units built: <list>
```

## Build Complete (With Concerns)

```
### <ISO timestamp> | sriflow-build | done-with-concerns | <Ns>
Branch: <branch>
Session: <session>
Build complete. Concerns:
- <concern 1 — file, line, exact issue>
- <concern 2>
Smoke check: <command> — <result>
Units built: <list>
```

## Build Blocked

```
### <ISO timestamp> | sriflow-build | blocked | <Ns>
Branch: <branch>
Session: <session>
Build blocked on: <exact blocker — missing file, ambiguous spec, failing dep>
Attempted: <what was tried>
Units completed before block: <list>
Units remaining: <list>
Recommendation: <what to do next>
```

---

## Bash Snippets

### Progress entry after each unit

```bash
_TEL_NOW=$(date +%s)
_TEL_DUR=$(( _TEL_NOW - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-build | in-progress | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
[BUILD PROGRESS]: <unit name> — done
Done: <what was just implemented>
Next: <what comes next>
Surprises: <anything unexpected>
MEMEOF
```

### Final entry after full build

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-build | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Build complete. Smoke check: <command and result>.
MEMEOF
```

Replace `OUTCOME` with actual outcome: `done`, `blocked`, or `done-with-concerns`.

---

## Context Recovery

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

---

## Resuming a Partial Build

When SRIFLOW_MEMORY.md has `[BUILD PROGRESS]` entries from a prior session:

1. Read all `[BUILD PROGRESS]` entries.
2. Build the set of completed units.
3. Cross-reference with PLAN.md unit list.
4. Identify the first unit NOT marked done.
5. Resume from there.

```bash
grep "\[BUILD PROGRESS\]" SRIFLOW_MEMORY.md
```

Do not re-implement a unit that has a `[BUILD PROGRESS]: <unit> — done` entry.
If the code for a "done" unit is missing from the filesystem: note the inconsistency
in SRIFLOW_MEMORY.md, then re-implement the unit.

Resume format:

```
Resuming build. Prior progress found:
- <unit 1>: done (per SRIFLOW_MEMORY.md <timestamp>)
- <unit 2>: done (per SRIFLOW_MEMORY.md <timestamp>)
- <unit 3>: NOT found — starting here.
```
