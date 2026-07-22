# Step 4 — Build Loop (Details)

A logical unit is one of: a function group, a module, a route handler, a data
model, a test file, a configuration block. Not a single function — but not the
entire application either. Size it so a unit represents a meaningful, independently
testable piece of the build.

## Loop body

Repeat for each unit in the implementation sequence from PLAN.md:

**4a. State the unit**

One sentence: what is being built, what it connects to, what done looks like.

Example: "Building `src/auth/middleware.ts` — JWT validation for all `/api/*` routes.
Done when: requests without valid tokens return 401, requests with valid tokens pass `req.user`."

**4b. Apply the trim ladder (Step 3)**

For every piece of code in this unit, walk the ladder. Record rung reached.

**4c. Reuse check**

Before writing any new file: confirm Step 2 found nothing reusable for this unit.
If something was found: use it.

**4d. Write the code**

Write the minimum code that satisfies the unit's done condition. Apply trim comments
to every deliberate shortcut. Do not add comments explaining what the code does —
only comment when the WHY is non-obvious (hidden constraint, workaround, subtle
invariant).

**4e. One self-check**

For any non-trivial logic (branching, data transformation, stateful behavior, money,
security, parsing): write ONE minimal runnable check.

Rules:
- Assert-based or `test_*.py` / `*.test.ts` naming.
- One file, one function. Tests the critical path only.
- No testing frameworks unless the project already uses one.
- Must be runnable with a single command.
- If trivial (a rename, a string format, a config value): skip the check and say so.

**4f. Write progress to memory**

After every unit completes and its self-check passes:

```bash
_TEL_NOW=$(date +%s)
_TEL_DUR=$(( _TEL_NOW - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-build | in-progress | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
[BUILD PROGRESS]: <unit name> — done
Done: <what was just implemented, file paths, function names>
Next: <next unit in the sequence>
Surprises: <anything unexpected encountered — missing dep, wrong assumption, scope delta>
MEMEOF
```

If no surprises: `Surprises: none`.

**4g. Mid-build AUQ threshold**

If blocked mid-unit and the ambiguity is:
- Low-risk (phrasing, naming, minor behavior choice): make the call, add a `// trim:` comment, continue.
- High-risk (architecture, data model, destructive scope): AskUserQuestion (D-N) and STOP until answered.

Never block the build on low-risk ambiguity.

## Unit sequence

Process units in the order specified by PLAN.md. If PLAN.md has no explicit order:
implement in this default order:
1. Data models / schema (innermost, no dependencies)
2. Storage / DB layer (reads and writes on models)
3. Business logic / services (orchestrates storage)
4. API / route handlers (exposes services)
5. CLI / UI entry points (consumes API or services)
6. Configuration and env (fills in missing pieces)
7. Tests / checks (validates the above)

## Self-Check Templates

**Python:**
```python
# test_<unit>.py — ponytail: minimal check, add pytest suite when project grows
def test_<unit>():
    result = <function>(<input>)
    assert result == <expected>, f"got {result!r}"

if __name__ == "__main__":
    test_<unit>()
    print("ok")
```

Run: `python test_<unit>.py`

**TypeScript (no framework):**
```typescript
// <unit>.check.ts — ponytail: assert-only, add jest when project adds test infra
import { <function> } from './<unit>'

const got = <function>(<input>)
console.assert(got === <expected>, `expected <expected>, got ${got}`)
console.log('ok')
```

Run: `npx ts-node <unit>.check.ts` or `bun <unit>.check.ts`

**Go:**
```go
// <unit>_check_test.go
package main

import "testing"

func TestUnit(t *testing.T) {
    got := <function>(<input>)
    if got != <expected> {
        t.Fatalf("expected %v, got %v", <expected>, got)
    }
}
```

Run: `go test -run TestUnit .`

**Shell:**
```bash
#!/usr/bin/env bash
# check_<unit>.sh
set -euo pipefail
result=$(<command>)
[ "$result" = "<expected>" ] || { echo "FAIL: got $result"; exit 1; }
echo "ok"
```

Run: `bash check_<unit>.sh`

## Memory Entry Templates

**Unit in-progress:**
```
### <ISO timestamp> | sriflow-build | in-progress | <Ns>
Branch: <branch>
Session: <session>
[BUILD PROGRESS]: <unit> — done
Done: <file paths, function names, what works>
Next: <next unit>
Surprises: <none | what was unexpected>
```

**Build complete (success):**
```
### <ISO timestamp> | sriflow-build | done | <Ns>
Branch: <branch>
Session: <session>
Build complete. All units implemented.
Smoke check: <command> — exit 0 — <output snippet>
Units built: <list>
```

**Build complete (with concerns):**
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

**Build blocked:**
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
