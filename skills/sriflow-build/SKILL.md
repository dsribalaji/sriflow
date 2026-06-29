---
name: sriflow-build
preamble-tier: 2
version: 2.0.0
description: Implements the approved design. Pre-build safety, sriflow-trim code ladder, reuse-first. Writes minimal code that works. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - build this
  - implement this
  - start coding
  - write the code
  - /sriflow-build
---

## When to invoke this skill

Use when it is time to implement: after a plan is approved, a design is locked,
or the user says "build this", "implement this", "start coding", "write the code",
or "/sriflow-build". Runs a pre-build safety check, loads context from PLAN.md /
DESIGN.md / SRIFLOW_MEMORY.md, scans for reusable code, then implements using
the sriflow-trim ladder (laziest working code, no unnecessary abstractions).
Progress written to SRIFLOW_MEMORY.md after each logical unit. One smoke check
at the end.

# /sriflow-build — Build Stage

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -60 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

if [ -f "PLAN.md" ]; then echo "PLAN.md: found"; else echo "PLAN.md: MISSING — cannot build without plan"; fi
if [ -f "DESIGN.md" ]; then echo "DESIGN.md: found"; else echo "DESIGN.md: missing — building from plan only"; fi

_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
echo "GIT_STAGED: $_GIT_STAGED | UNSTAGED: $_GIT_UNSTAGED"

_CURRENT_STAGE=$(grep -i "Current Stage" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/.*Current Stage[^:]*: *//' | sed 's/\*//g' | tr -d ' ' || echo "unknown")
echo "PIPELINE_STAGE: $_CURRENT_STAGE"
```

---

## Plan Mode Safe Operations

In plan mode (`SRIFLOW_PLAN_MODE=active`): read files, analyze, report findings,
write to SRIFLOW_MEMORY.md and the plan file. No destructive file operations. No
git mutations. No code written — analysis only.

When invoked in plan mode: follow this skill step by step. AskUserQuestion satisfies
the plan mode end-of-turn requirement. At a STOP point, stop immediately.

---

## AskUserQuestion Format

Every AskUserQuestion is a decision brief:

```
D<N> — <one-line question title>
Branch: <_BRANCH value>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro, ≥40 chars>
  ❌ <con, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment per question.
ELI10 always present. Recommendation always present. `(recommended)` on exactly one option.

When options differ in coverage: `Completeness: A=X/10, B=Y/10` (10 = all edge cases
handled, 7 = happy path solid, 3 = shortcut).
When options differ in kind, not coverage: `Note: options differ in kind — no completeness score.`

If AskUserQuestion is unavailable: render as prose with same triad (ELI10,
completeness, recommendation), then STOP.

---

## Voice

Direct, builder-to-builder, compressed. Active via sriflow-trim.

- Lead with the point. What it does, why it matters, what changes.
- Be concrete. Name files, functions, line numbers, commands, real numbers.
- Never corporate, academic, or hype. No filler.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted.
- Never narrate what code does. Only comment when the WHY is non-obvious.
- No markdown headers in conversational replies. Headers only in documents.

Good: `auth.ts:47 returns undefined when cookie expires. Fix: null check + redirect /login.`
Bad: `I've identified a potential issue in the authentication flow that may cause problems.`

---

## Completeness Principle

Do the complete thing. Tests, edge cases, error paths. The only out-of-scope is
genuinely unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10`. When options differ in kind:
`Note: options differ in kind — no completeness score.`

---

## Completion Status Protocol

End every skill run with one of:

- **DONE** — completed with evidence.
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

---

## Memory Write

After each logical unit, append to SRIFLOW_MEMORY.md:

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
Surprises: <anything unexpected — missing dep, wrong assumption, scope change>
MEMEOF
```

After full build:

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

At session start or after context compaction:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

If memory found: 2-sentence summary of current state. If a next skill is implied by
the current stage, suggest it once. Do not repeat the suggestion.

---

## Confusion Protocol

For high-stakes ambiguity (architecture, data model, destructive scope, missing
context): STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask
via AskUserQuestion. Do not use for routine coding or obvious changes. Threshold:
more than 2 reasonable interpretations that produce materially different code.

---

# /sriflow-build — Build Stage

Build runs in five steps. Complete each before moving to the next. Never skip a step.
Never write code before completing Step 2.

---

## Step 0 — Pre-Build Safety Check

Before writing, deleting, or mutating anything, scan the requested work for
destructive operations.

### Triggers that require AskUserQuestion (D0) before proceeding

| Pattern | Risk level | Notes |
|---------|-----------|-------|
| `rm -rf <path>` | CRITICAL | Recursive delete, permanent |
| `DROP TABLE` | CRITICAL | Data loss, permanent |
| `DROP DATABASE` | CRITICAL | Data loss, permanent |
| `TRUNCATE` | CRITICAL | Row wipe, permanent |
| `ALTER TABLE DROP COLUMN` | CRITICAL | Schema mutation, data loss |
| `DELETE FROM` without `WHERE` | CRITICAL | Full table wipe |
| Schema migrations on prod DB | HIGH | Downtime risk, potential data loss |
| `git push --force` / `git push -f` | HIGH | Rewrites remote history |
| `git reset --hard` | HIGH | Permanently discards uncommitted changes |
| `git checkout .` / `git restore .` | HIGH | Wipes uncommitted work |
| Overwriting an existing file without reading it first | HIGH | Silent data loss |
| Deleting branches | MEDIUM | History loss if not merged |
| Dropping indexes on production tables | MEDIUM | Performance impact, may block |

**Safe exceptions — no warning needed:**
- `rm -rf node_modules`
- `rm -rf .next`
- `rm -rf dist`
- `rm -rf __pycache__`
- `rm -rf .cache`
- `rm -rf build`
- `rm -rf .turbo`
- `rm -rf coverage`
- `rm -rf .pytest_cache`
- `rm -rf target` (Rust)

### D0 format for destructive operations

```
D0 — <operation name>: destructive operation detected
Branch: <_BRANCH>
ELI10: About to run <operation>. This is permanent and cannot be undone without a
backup. I need you to confirm before I proceed, because the cost of getting this
wrong is data loss / history loss / production downtime.
Stakes if wrong: <specific consequence — data gone, prod down, history rewritten>
Recommendation: B (backup first) because irreversible operations need a restore path.
A) Proceed without backup (not recommended)
  ✅ Faster if you're certain the target is safe to destroy
  ❌ No recovery path if wrong; any mistake is permanent
B) Back up first, then proceed (recommended)
  ✅ Full recovery path; adds <estimated time> seconds
  ❌ Slightly slower
Net: The backup step costs seconds. The missing backup costs hours or permanent loss.
Backup step: <exact command to back up before proceeding>
```

If SRIFLOW_PLAN_MODE is `active`: skip all destructive operations entirely. Analyze
only. Note the operations that would be run and their risk level.

---

## Step 1 — Context Load

Read context in this order. Do not skip any file that exists.

```bash
for f in PLAN.md DESIGN.md SRIFLOW_MEMORY.md; do
  if [ -f "$f" ]; then
    echo "=== $f ==="
    cat "$f"
  else
    echo "--- $f: not found ---"
  fi
done
```

### What to extract from each file

**PLAN.md** — read the implementation sequence. What is to be built, in what order,
what the success criteria are. Note the exact sequence of units to implement.

**DESIGN.md** — read the component list, data model, API contracts, and any decisions
already made (framework, library choices, DB schema). These are locked — do not
re-litigate them. If a design decision is missing, use AskUserQuestion before assuming.

**SRIFLOW_MEMORY.md** — read for build progress already logged. If a `[BUILD PROGRESS]`
entry exists for a unit, skip that unit. Do not re-implement completed work.

### No plan found

If none of PLAN.md, DESIGN.md, or SRIFLOW_MEMORY.md exist, AskUserQuestion:

```
D1 — No plan found. What should I build?
Branch: <_BRANCH>
ELI10: No PLAN.md or DESIGN.md found. Without a spec I might build the wrong thing,
and wrong code has to be deleted. A description lets me scope the work precisely before
writing a single line.
Stakes if wrong: Building the wrong thing wastes time and produces code to delete.
Recommendation: A because a description is the minimum viable spec.
Completeness: A=8/10, B=3/10
A) Provide a description now (recommended)
  ✅ Precise scope, minimal waste, builds the right thing
  ❌ Requires you to type the description
B) Infer scope from the codebase and build what looks missing
  ✅ No typing required
  ❌ High risk of building the wrong thing; no shared spec to validate against
Net: A description beats inference every time. Thirty seconds of spec saves hours of rework.
```

Do not write any code until the user provides scope. STOP after AskUserQuestion.

### Partial context

If PLAN.md exists but DESIGN.md is missing: build from the plan. Note that design
decisions will be made inline using the trim ladder (minimal, reversible choices).

If DESIGN.md exists but PLAN.md is missing: extract the implementation sequence from
DESIGN.md directly. Note which sections describe components vs. which describe data
model vs. which describe API contracts.

If SRIFLOW_MEMORY.md shows a partial build: resume from the last incomplete unit.
State which unit is being resumed. Do not re-run completed units.

---

## Step 2 — Existing Code Scan

Before writing ANY new code, scan the codebase for existing utilities, types,
helpers, and patterns that might cover the need. This step is mandatory.
Running it takes seconds. Skipping it produces duplicate code.

### Scan sequence

Run each search below. Record every finding before proceeding.

**1. Find existing utilities and helpers:**
```bash
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" -o -name "*.rb" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/__pycache__/*" \
  | head -60
```

**2. Grep for functions, classes, or exports related to the current build target:**
```bash
# Replace <keyword> with the relevant domain term from PLAN.md / DESIGN.md
grep -r "<keyword>" --include="*.ts" --include="*.js" --include="*.py" --include="*.go" --include="*.rb" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
  -l 2>/dev/null | head -20
```

Run this for each major domain term in the plan (e.g., "auth", "user", "payment",
"webhook", "cache", "queue").

**3. Check installed dependencies before adding new ones:**
```bash
# Node / Bun
cat package.json 2>/dev/null | grep -A 999 '"dependencies"'
# Python
cat requirements.txt 2>/dev/null || cat pyproject.toml 2>/dev/null
# Go
cat go.mod 2>/dev/null
# Ruby
cat Gemfile 2>/dev/null
```

**4. Check for existing patterns in similar files:**
```bash
# Find files that are similar to the file about to be created
ls -la src/ 2>/dev/null || ls -la lib/ 2>/dev/null || ls -la app/ 2>/dev/null
```

### Recording findings

After each grep, record findings in this format:

```
Found: <path>:<line> — <what it does> — reuse this instead of writing new
```

If nothing found: `Not found: <keyword> — will implement new`

### Reuse rule

If a reusable utility or function is found:
- Use it. Import it. Do not re-implement it.
- Note the file and function name in the next build step.
- If the existing code almost works but needs a small change, edit the existing
  file (shortest diff). Do not create a new file for a small variation.

If a dependency already covers the need:
- Use the installed dependency. Do not add a new one.
- Name the package and the function to use.

Only proceed to Step 3 when the scan is complete and findings are recorded.

---

## Step 3 — sriflow-trim Code Ladder

This ladder applies to EVERY piece of code written in this build. No exceptions.
Walk each rung in order. Stop at the first rung that holds. Do not jump to rung 7
because the problem "feels complex."

### The ladder

**Rung 1 — Does this need to exist? (YAGNI)**

Ask: what breaks without this code? If the answer is "nothing breaks right now, but
it might be useful later" — do not write it. Say so in one line and move on.

If it needs to exist: state what breaks without it. One sentence. Then proceed.

Speculative need = skip it, say so in one line.

Example:
```
// trim: not writing a retry wrapper — single call site, manual rerun is fine if it fails
```

**Rung 2 — Already in the codebase? Reuse it.**

Step 2 found it. Use it. Do not rewrite what already exists.

If Step 2 found something similar but not identical: edit the existing code to
cover the new case. Shortest diff wins. Do not create a parallel implementation.

**Rung 3 — Standard library does it? Use it.**

Check the stdlib for the current language before writing utility code.

Common patterns that the stdlib covers:
- String formatting / parsing → stdlib
- Date/time → stdlib
- File I/O → stdlib
- HTTP → stdlib or built-in server
- JSON serialization → stdlib
- UUID generation → stdlib (Python 3.x `uuid`, Node `crypto.randomUUID()`)
- Sorting / filtering → stdlib
- Hashing → stdlib (`hashlib`, `crypto`)
- Environment variables → `process.env` / `os.environ`

Do not add a dependency for what 3 stdlib lines handle.

**Rung 4 — Native platform feature covers it? Use it.**

- HTML `<input type="date">` over a date picker library
- CSS `grid` or `flex` over a layout library
- DB unique constraint over application-level uniqueness check
- Browser `fetch` over `axios` (unless axios is already installed)
- DB `ON DELETE CASCADE` over application-level cascade logic
- OS file watcher (`fs.watch`, `inotify`) over a polling loop

Platform features are maintained, tested, and documented by the platform.
Custom code is maintained by you.

**Rung 5 — Already-installed dependency solves it? Use it.**

Check `package.json` / `requirements.txt` / `go.mod` / `Gemfile` from Step 2.

If an installed package covers the need: use it. Do not add a new package.

Never add a new dependency for what a few lines of code handle. Never add a
dependency that duplicates an already-installed one.

If a new dependency is genuinely needed: use AskUserQuestion (D-N) before adding it.
State what it does, why stdlib and existing deps fall short, and the size/license.

**Rung 6 — Can it be one line? One line.**

If the logic fits in one line, write it in one line. No wrapper function, no helper
module, no named constant unless the name meaningfully improves readability.

**Rung 7 — Minimum code that works.**

Only here do you write new code. Rules:
- No class where a function works.
- No function where an expression works.
- No abstraction layer with exactly one caller.
- No interface with exactly one implementation.
- No factory for one product.
- No config key for a value that never changes.
- No boilerplate "for later." Later can scaffold for itself.
- Deletion over addition. Boring over clever.
- Fewest files possible. Shortest working diff wins.

### Marking deliberate shortcuts

Every shortcut is marked inline:

```
// trim: <reason and ceiling>
```

The comment names:
1. Why this simpler approach was chosen.
2. What the ceiling is (where it breaks down).
3. What to upgrade to if the ceiling is hit.

Examples:
```python
# trim: in-memory cache, no TTL — single process, restart clears it. Add Redis if multi-process.
# trim: no pagination — dataset currently <200 rows. Add cursor if it grows past 10k.
# trim: sequential processing — low volume (<100/day). Add queue if throughput matters.
# trim: no retry logic — idempotent endpoint, caller retries. Add exponential backoff if SLA tightens.
# trim: O(n) scan — list never exceeds 50 items. Add index if list grows or scan becomes hot path.
```

### Mid-build ambiguity

If blocked on a design decision mid-build:
- If the answer is obvious and low-risk: make the simplest reasonable call and note it:
  ```
  // trim: assumed X, revisit if Y becomes a requirement
  ```
- If there are more than 2 reasonable interpretations that produce materially different
  code: use AskUserQuestion (D-N). Do not guess on high-stakes branches.

---

## Step 4 — Build Loop (per logical unit)

A logical unit is one of: a function group, a module, a route handler, a data
model, a test file, a configuration block. Not a single function — but not the
entire application either. Size it so a unit represents a meaningful, independently
testable piece of the build.

### Loop body

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

Self-check template (Python):
```python
# test_<unit>.py
def test_<unit>():
    # arrange
    # act
    result = <function under test>(<input>)
    # assert
    assert result == <expected>, f"expected <expected>, got {result}"

if __name__ == "__main__":
    test_<unit>()
    print("ok")
```

Self-check template (TypeScript):
```typescript
// <unit>.check.ts
import { <function> } from './<unit>'

const result = <function>(<input>)
console.assert(result === <expected>, `expected <expected>, got ${result}`)
console.log('ok')
```

Run the check:
```bash
python test_<unit>.py
# or
npx ts-node <unit>.check.ts
# or whatever the project's runner is
```

If the check fails: fix the code, not the check.

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

### Unit sequence

Process units in the order specified by PLAN.md. If PLAN.md has no explicit order:
implement in this default order:
1. Data models / schema (innermost, no dependencies)
2. Storage / DB layer (reads and writes on models)
3. Business logic / services (orchestrates storage)
4. API / route handlers (exposes services)
5. CLI / UI entry points (consumes API or services)
6. Configuration and env (fills in missing pieces)
7. Tests / checks (validates the above)

---

## Step 5 — Final Smoke Check

After all units are built and self-checks pass, run one command that exercises
the happy path end to end.

### What the smoke check is

One command that:
- Starts the system (or the relevant component)
- Exercises the primary user-facing flow
- Exits cleanly on success
- Fails visibly on error (non-zero exit, error output)

It is NOT a full test suite. It is the minimum evidence that the build works.

### Finding the smoke check command

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

### Running and recording

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

---

## Hard Rules

These rules apply at all times. No exceptions.

**Never narrate what code does.**
Code names itself. No comment explaining an obvious operation.
Only comment when the WHY is non-obvious: a hidden constraint, a workaround, a
performance decision, a subtle invariant that will bite the next person.

Bad:
```python
# Check if user exists
user = db.get_user(user_id)
if user is None:
    # Return 404 if not found
    return 404
```

Good:
```python
user = db.get_user(user_id)
if user is None:
    return 404
```

**Never write code that could already exist.**
Step 2 is mandatory. Do not skip it. A grep takes 2 seconds. Duplicate code takes
hours to maintain and merge.

**Shortest diff wins.**
One-line fix in the shared function beats a guard in every caller. Edit the existing
file before creating a new one. Delete the old pattern before adding a new one.

**No speculative features.**
Build exactly what PLAN.md specifies. Nothing else. If a feature looks useful but
is not in the plan: note it in SRIFLOW_MEMORY.md under `Suggestions` and move on.
Do not implement it.

**Bug fix = root cause.**
When fixing a bug mid-build: grep every caller of the function being changed.
The fix goes at the root, in the shared function, once. Not in the specific caller
the bug report named.

**Irreversible actions require explicit user confirmation.**
No rm -rf, no DROP, no force-push without D0 AskUserQuestion. This rule is absolute.

**Security and validation are never shortcuts.**
Input validation at trust boundaries, error handling that prevents data loss, auth
checks — these are not "abstractions" subject to the trim ladder. Build them fully,
always, on the first pass.

**Accessibility basics are not shortcuts.**
`alt` attributes, semantic HTML, keyboard accessibility — build them in. They are
not "out of scope."

---

## Reference: sriflow-trim Ladder (Quick Reference)

For inline use during Step 3 and Step 4:

```
Before writing any code, climb this ladder. Stop at first rung that holds:

1. Does this need to exist? (YAGNI — say so in one line if not)
2. Already in this codebase? Reuse it.
3. Stdlib does it? Use it.
4. Native platform feature covers it? Use it.
5. Already-installed dependency solves it? Use it. Never add new dep for few lines.
6. Can it be one line? One line.
7. Only then: minimum code that works.

Rules:
- No unrequested abstractions.
- No interface with one implementation.
- No factory for one product.
- Deletion over addition. Boring over clever.
- Fewest files possible. Shortest working diff wins.
- Mark shortcuts: // trim: <reason and ceiling>
- Non-trivial logic: ONE minimal runnable check. No frameworks unless project uses one.
```

---

## Reference: Destructive Operation Patterns (Quick Reference)

```
ALWAYS AUQ before:
  rm -rf <non-cache-dir>
  DROP TABLE / DROP DATABASE
  TRUNCATE
  ALTER TABLE DROP COLUMN
  DELETE FROM (no WHERE)
  Schema migration on prod
  git push --force / -f
  git reset --hard
  git checkout . / git restore .
  Overwriting file without reading first
  Deleting branches

NEVER AUQ for:
  rm -rf node_modules
  rm -rf .next / dist / build / .turbo / coverage
  rm -rf __pycache__ / .pytest_cache / .cache
```

---

## Reference: Memory Entry Templates

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

---

## Reference: Self-Check Templates

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

---

## Reference: Common trim Comments by Pattern

```
// trim: no pagination — <N> rows max in current data. Add cursor if grows past 10k.
// trim: in-memory store — single process, no persistence needed. Add Redis if multi-instance.
// trim: no retry — idempotent endpoint, caller retries on failure. Add backoff if SLA tightens.
// trim: O(n) scan — list bounded at <N> items. Add index if this becomes a hot path.
// trim: hardcoded limit — matches current requirement. Extract to config if it needs tuning.
// trim: sequential — throughput <N>/day. Add queue (BullMQ/Celery) if volume grows 10x.
// trim: no cache — <function> called rarely. Add memoize if profiling shows it hot.
// trim: single error type — only one failure mode today. Expand if error handling diverges.
// trim: no abstraction — one caller. Extract if a second caller appears.
// trim: env-based config — no config file yet. Add config file if options multiply past 5.
// trim: no logging — dev environment. Add structured logger if moving to prod.
// trim: plaintext — internal use only. Add encryption if data leaves this service.
// trim: no rate limit — internal endpoint. Add if exposed externally.
// trim: assume UTF-8 — all current inputs are ASCII. Add encoding detection if source widens.
```

---

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

---

## Appendix: Language-Specific Stdlib Reference

Use this to avoid unnecessary dependencies.

### TypeScript / JavaScript (Node / Bun / Deno)

| Need | Stdlib / built-in | Never add |
|------|------------------|-----------|
| UUID | `crypto.randomUUID()` | `uuid` package |
| Hash (SHA-256) | `crypto.createHash('sha256')` | `bcryptjs` for non-password hashing |
| Env vars | `process.env.KEY` | `dotenv` (just call `require('dotenv/config')` if already installed) |
| Date formatting (ISO) | `new Date().toISOString()` | `moment`, `dayjs` |
| Deep equal (Node 22+) | `assert.deepStrictEqual` | `lodash.isEqual` |
| Fetch | `fetch` (Node 18+, Bun, Deno) | `axios`, `node-fetch` |
| File read/write | `fs.readFileSync`, `fs.writeFileSync` | `fs-extra` |
| Path join | `path.join` | `upath` |
| JSON | `JSON.parse`, `JSON.stringify` | any JSON library |
| HTTP server | `http.createServer` or framework already installed | adding new framework |
| EventEmitter | `EventEmitter` from `events` | `mitt`, `nanoevents` |
| Base64 | `Buffer.from(s).toString('base64')` | `js-base64` |
| URL parsing | `new URL(str)` | `qs`, `url-parse` |
| Query string | `new URLSearchParams(obj).toString()` | `qs` |
| Stream | `stream.Readable`, `stream.Writable` | `through2` |

### Python

| Need | Stdlib | Never add |
|------|--------|-----------|
| UUID | `import uuid; uuid.uuid4()` | `shortuuid` |
| Hash | `import hashlib; hashlib.sha256(b).hexdigest()` | — |
| Date/time | `from datetime import datetime, timezone` | `arrow`, `pendulum` |
| JSON | `import json` | `ujson` (unless profiling shows it hot) |
| HTTP client | `urllib.request` or `httpx`/`requests` if installed | adding new client |
| Env vars | `import os; os.environ.get('KEY')` | `python-dotenv` (unless already installed) |
| Arg parsing | `argparse` | `click` (unless already installed) |
| Logging | `import logging` | `loguru` (unless already installed) |
| Path | `from pathlib import Path` | `os.path` (both fine, prefer pathlib) |
| Temp files | `import tempfile` | — |
| Regex | `import re` | — |
| Base64 | `import base64` | — |
| CSV | `import csv` | `pandas` (unless already installed and needed for more) |
| TOML (3.11+) | `import tomllib` | `toml`, `tomli` |

### Go

| Need | Stdlib | Never add |
|------|--------|-----------|
| UUID | `crypto/rand` + `fmt.Sprintf` | `google/uuid` (acceptable, but stdlib works) |
| Hash | `crypto/sha256` | — |
| Date/time | `time` | — |
| JSON | `encoding/json` | — |
| HTTP client | `net/http` | — |
| HTTP server | `net/http` | — |
| Logging (1.21+) | `log/slog` | `zap`, `logrus` |
| Env vars | `os.Getenv` | — |
| Temp files | `os.CreateTemp` | — |
| Regex | `regexp` | — |
| CSV | `encoding/csv` | — |

---

## Appendix: Ambiguity Escalation Matrix

Use this to decide whether to block (AskUserQuestion) or proceed (trim comment).

| Ambiguity type | Risk if wrong | Action |
|---------------|--------------|--------|
| Variable name / style | None | Proceed, pick sensible name |
| Formatting / whitespace | None | Match existing project style |
| Error message wording | None | Proceed, be clear |
| Log verbosity | Low | Proceed, info-level default |
| Config key naming | Low | Proceed, snake_case default |
| Optional feature inclusion | Medium | Check PLAN.md. If not specified: skip. Note in memory. |
| Auth scope / permission | HIGH | AskUserQuestion (D-N) |
| Data model field type | HIGH | AskUserQuestion (D-N) |
| Destructive operation scope | CRITICAL | AskUserQuestion (D0), always |
| Missing dependency decision | HIGH | AskUserQuestion (D-N) |
| Prod vs dev behavior difference | HIGH | AskUserQuestion (D-N) |
| API contract change | HIGH | AskUserQuestion (D-N), may break callers |
| Schema migration on live data | CRITICAL | AskUserQuestion (D0), always |

Rule: if the wrong choice requires a migration, a data fix, or a public API change
to correct — it is HIGH or CRITICAL. Ask.

If the wrong choice can be fixed with a 1-line edit in 30 seconds — it is Low or None.
Proceed.

---

## Appendix: Files Written vs. Files Edited

Default: edit existing files. Create new files only when genuinely new capability
is being added that has no home in any existing file.

**Edit the existing file when:**
- Adding a route to an existing router file
- Adding a field to an existing model
- Adding a case to an existing switch / if-chain
- Adding an export to an existing barrel file
- Extending an existing config object

**Create a new file when:**
- The module is a distinct concern with no existing home
- The file would be a new entry point (CLI, server, worker)
- The project's existing structure clearly calls for a new file (e.g., every route
  domain has its own file and the new route is a new domain)
- The existing file would grow by more than ~150 lines from this addition

When creating a new file: state why editing an existing file was ruled out.

---

## Appendix: Post-Build Checklist

Before writing the final memory entry and issuing a status:

```
□ All units from PLAN.md implemented
□ Self-checks written and passing for non-trivial units
□ No duplicate code (Step 2 scan confirmed)
□ No new dependencies added without AskUserQuestion
□ No speculative features added
□ trim comments on every deliberate shortcut
□ No comments explaining what code does (only WHY comments)
□ Smoke check ran and passed (or failure documented)
□ SRIFLOW_MEMORY.md has one progress entry per unit
□ SRIFLOW_MEMORY.md has final build entry
□ Status issued: DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT
```

If any item is unchecked: complete it before issuing DONE.

---

## Appendix: What Not to Build

Common over-engineering patterns that sriflow-build explicitly rejects:

**Config abstraction layers.**
```python
# WRONG — one caller, never changes
class Config:
    def __init__(self):
        self.host = os.environ.get('HOST', 'localhost')
    def get_host(self):
        return self.host

config = Config()
# trim: no config class — just read env directly
HOST = os.environ.get('HOST', 'localhost')
```

**Single-implementation interfaces.**
```typescript
// WRONG — never has a second implementation
interface UserRepository {
    getById(id: string): Promise<User>
}
class PostgresUserRepository implements UserRepository {
    async getById(id: string) { ... }
}
// CORRECT
async function getUserById(id: string): Promise<User> { ... }
```

**Factory for one product.**
```python
# WRONG
def create_emailer(type='smtp'):
    if type == 'smtp':
        return SmtpEmailer()
    raise ValueError(f"unknown type: {type}")
# CORRECT — just instantiate directly
emailer = SmtpEmailer()
```

**Abstractions "for testability" with zero tests.**
If there are no tests: no interface needed. Write the function. If tests come later,
extract then.

**Config files for single values.**
```yaml
# WRONG — app.config.yaml with one key
max_retries: 3
# CORRECT — just hardcode with a trim comment
MAX_RETRIES = 3  # trim: hardcoded, extract to config if it needs tuning
```

**Premature pagination.**
If the current dataset has 50 rows and the plan says nothing about pagination:
do not implement it. Note it in SRIFLOW_MEMORY.md under Suggestions.

**Wrapper functions around standard library.**
```python
# WRONG
def get_current_time_utc():
    return datetime.now(timezone.utc)
# CORRECT — just use datetime directly
from datetime import datetime, timezone
ts = datetime.now(timezone.utc)
```

---

## Appendix: When PLAN.md Has No Implementation Sequence

If PLAN.md describes what to build but not in what order, derive the order from
data flow:

1. **Identify leaf nodes** — things with no dependencies inside the project
   (external APIs, DBs, env vars). These produce the foundational types/models.
2. **Build bottom-up** — models before services, services before routes, routes
   before CLIs.
3. **Write the dependency graph** — one line per node and its dependencies.
   Example:
   ```
   User model → no deps
   UserStore (DB) → User model
   AuthService → UserStore
   /api/auth router → AuthService
   CLI login command → /api/auth (or AuthService directly)
   ```
4. **Implement in topological order** — leftmost nodes first.

If there is a cycle in the dependency graph: AskUserQuestion (D-N) because it
implies a design problem that code cannot resolve. Name the cycle in the question.

---

## Appendix: Scope Creep Guard

During build, the user may ask for something not in PLAN.md. The rule:

- Small clarification within the plan's intent: implement it, note in memory.
- New feature not in the plan: AskUserQuestion (D-N). Implementing out-of-scope
  work without asking changes the build's footprint and may conflict with other
  planned units.

Format for scope-creep AUQ:

```
D<N> — "<request>" is outside PLAN.md scope. Include it?
Branch: <_BRANCH>
ELI10: The request "<request>" is not in PLAN.md. Adding it extends the build's
scope. It may or may not fit the current design. Checking before proceeding because
out-of-scope work can create conflicts with later planned units.
Stakes if wrong: Out-of-scope code may need to be deleted or redesigned when it
conflicts with the planned units that follow.
Recommendation: B (add to plan for next iteration) because scope discipline keeps
this build shippable.
A) Implement it now (not recommended)
  ✅ Gets the feature sooner
  ❌ Not in PLAN.md; may conflict with later units; unreviewed scope
B) Note it in SRIFLOW_MEMORY.md for the next iteration (recommended)
  ✅ Keeps this build focused; feature gets proper planning
  ❌ Slightly delayed
Net: Note it now, plan it properly, build it cleanly next cycle.
```

---

## Appendix: Error Handling Standards

Error handling is not a shortcut candidate. These patterns are required on the first
pass — they are not "gold-plating."

### Trust boundaries (always validate)

Every input that crosses a trust boundary — HTTP request body, query param, env var,
file read, CLI argument — must be validated before use. Validation is not a
speculative feature. It is required.

```typescript
// HTTP body — validate before use
const { userId } = req.body
if (!userId || typeof userId !== 'string') {
  return res.status(400).json({ error: 'userId required' })
}
```

```python
# Env var — fail fast with a clear message
PORT = int(os.environ.get('PORT') or raise ValueError("PORT env var required"))
# or more readably:
if not os.environ.get('PORT'):
    raise ValueError("PORT env var required — set it before starting")
PORT = int(os.environ['PORT'])
```

### Data loss prevention

Error handling that prevents data loss is required, not optional.

- File writes: check disk full / permission errors. Do not silently swallow write errors.
- DB writes: handle unique constraint violations explicitly if duplicate is a real
  possibility. Do not silently drop the record.
- Network calls: handle timeouts. If the call is critical, return a clear error. If
  the call is optional (e.g., analytics), swallow and log.

```python
try:
    db.insert(record)
except UniqueViolationError:
    # trim: return conflict, not 500 — duplicate is a known business case
    return {'error': 'already exists'}, 409
```

### Fail-fast over silent failure

A loud failure is better than silent data corruption. If a function cannot complete
its contract, raise or return an error. Do not return a zero-value, an empty list,
or `None` when the absence of a result is meaningfully different from an error.

```python
# WRONG — hides the real error
def get_config():
    try:
        return load_config()
    except Exception:
        return {}  # caller gets empty config, doesn't know it failed

# CORRECT
def get_config():
    return load_config()  # let the exception propagate; caller handles it
```

Exception: best-effort cleanup paths (shutdown, disconnect, teardown). Here,
swallowing errors is correct — a cleanup path that throws on EPERM means the
rest of cleanup does not run.

### Logging at errors

At every error path that returns to the caller: log the error with context.
One line. Include the operation that failed and the input that caused it.

```python
logger.error("get_user failed", user_id=user_id, error=str(e))
```

Do not log and re-raise without adding context. Do not log the same error twice
(log at the point of origin, not at every caller).

---

## Appendix: Security Standards (Never Shortcuts)

These are required on every build that touches auth, data handling, or external input.
They are not abstractions. They are not speculative. They are baseline.

### Authentication

- Never roll your own auth algorithm. Use the installed auth library or the platform's
  built-in.
- Token validation: always verify signature, expiry, issuer, and audience.
- Sessions: use the framework's session library with a secret from env, not hardcoded.

```python
# WRONG
def verify_token(token):
    return token == "hardcoded_secret"

# CORRECT
import jwt
payload = jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS256'])
```

### Input sanitization

- SQL: use parameterized queries. Never string-interpolate user input into SQL.
- HTML: escape before rendering. If the project uses a templating engine, auto-escaping
  is usually on by default — do not disable it.
- Shell: never pass user input to `subprocess.run` with `shell=True`. Pass a list.

```python
# WRONG
db.execute(f"SELECT * FROM users WHERE id = {user_id}")

# CORRECT
db.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

### Secrets

- Never log secrets. Never return secrets in API responses. Never commit secrets.
- All secrets from env vars. If a secret is needed and no env var exists:
  AskUserQuestion, do not hardcode a placeholder.

### HTTPS

- Never disable TLS verification in production code. If a test environment needs
  it disabled: add a `// trim: TLS disabled for local dev only, never in prod` comment
  and guard it with an env check.

---

## Appendix: Dependency Decision Guide

When Step 3 Rung 5 fails (no installed dep covers the need) and you consider adding
a new one, always AskUserQuestion before adding. The AUQ must include:

1. What the dependency does.
2. Why stdlib and existing deps fall short (be specific).
3. The package size (add `npm info <pkg> dist.unpackedSize` or `pip show <pkg>`).
4. The license (MIT, Apache, GPL — GPL is a blocker for most commercial projects).
5. The maintenance status (last commit, stars, open issues).
6. The alternative: what the code looks like if done by hand (show it).

```
D<N> — Add <package> as a dependency?
Branch: <_BRANCH>
ELI10: Need to add <package> to cover <use case>. The stdlib and existing deps
do not cover <specific gap>. Asking before adding because dependencies add
maintenance burden and increase bundle size.
Stakes if wrong: An unnecessary dependency is forever — removing it later
requires touching every import site.
Recommendation: <A or B> because <reason>
A) Add <package> (recommended if the hand-rolled version is >50 lines)
  ✅ <what it handles that we'd otherwise write>
  ❌ <size/license/maintenance concern>
B) Implement by hand
  ✅ Zero new dependency
  ❌ <what we'd have to write — paste the actual code or estimate lines>
Net: <concrete tradeoff — "50-line implementation vs. 45KB dep" beats vague prose>
```

If the hand-rolled version is under 20 lines: implement by hand, no question needed.
If it is over 50 lines and the package is well-maintained with a permissive license:
ask, lean toward adding.
Between 20 and 50 lines: judgment call, lean toward hand-rolling.

---

## Appendix: Build Order for Common Project Types

### REST API (Node/Python/Go)

1. DB schema / migration (if new tables needed)
2. Models / types (structs, dataclasses, interfaces)
3. DB access layer (queries, ORMs, raw SQL functions)
4. Service layer (business logic — validates, orchestrates, no HTTP)
5. Route handlers (HTTP — thin: parse input, call service, format response)
6. Middleware (auth, logging, error handler — add after routes exist)
7. Config / env validation (startup checks — add after code is wired)
8. Smoke check (one curl or HTTP request)

### CLI tool

1. Argument parsing (argparse, cobra, click — use what's installed)
2. Core logic (the thing the CLI actually does)
3. Output formatting (stdout, stderr, exit codes)
4. Config file / env support (only if PLAN.md requires it)
5. Smoke check (run the binary with one real argument)

### Frontend feature (React/Vue/Svelte)

1. Types / interfaces (props, state shapes)
2. Data fetching (hook or store — one function)
3. Component (renders the data, handles loading/error states)
4. Wiring (register in router or parent)
5. Smoke check (start dev server, visit the route)

### Background worker / queue consumer

1. Queue client setup (use installed library)
2. Job handler (the processing function)
3. Error handling (dead letter, retry policy)
4. Registration (wire into the worker entrypoint)
5. Smoke check (enqueue one test job, watch it process)

### DB migration

1. Read current schema (describe tables, check existing columns)
2. Write migration (up and down)
3. Test on a dev DB (never on prod first)
4. Step 0 safety check if migration is on prod: AUQ D0 required
5. Run migration
6. Verify (describe table again, check row counts)

---

## Appendix: Resuming a Partial Build

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
in SRIFLOW_MEMORY.md, then re-implement the unit. The memory entry may be from a
session that lost its file writes.

Resume format:

```
Resuming build. Prior progress found:
- <unit 1>: done (per SRIFLOW_MEMORY.md <timestamp>)
- <unit 2>: done (per SRIFLOW_MEMORY.md <timestamp>)
- <unit 3>: NOT found — starting here.
```

Then proceed with Step 3 → Step 4 for the remaining units.

---

## Appendix: Handoff to Next Skills

When the build is complete, suggest the next skill based on what was built:

| What was built | Suggest next |
|----------------|-------------|
| Code with tests | `/sriflow-test` — run QA pass |
| Code with no tests | `/sriflow-test` — QA will surface gaps |
| DB schema changes | `/sriflow-test` — test migration rollback |
| API endpoints | `/sriflow-test` — test edge cases and error states |
| Any build | `/sriflow-code-review` — diff review before ship |
| Build with concerns | `/sriflow-code-review` — required before ship |
| Build complete + reviewed | `/sriflow-ship` — merge and deploy |

Suggest once. Do not repeat. Format:

```
Build done. Next: /sriflow-test to run QA, or /sriflow-code-review to diff-review first.
```

Do not automatically invoke the next skill. The user decides what comes next.

---

## Appendix: Notes for Common Failure Modes

These are patterns that produce wrong or broken builds. Know them.

### Reading PLAN.md wrong

PLAN.md describes intent and sequence. It does not always describe the exact
implementation. When PLAN.md says "add user authentication," it means: pick up
the design decisions from DESIGN.md (which auth library, which token format,
which session strategy) and implement them. Do not invent auth strategy if
DESIGN.md specifies one.

If PLAN.md and DESIGN.md contradict each other: AskUserQuestion. They were written
at different times and may have drifted. Do not silently pick one.

### Implementing the wrong abstraction level

PLAN.md says "add a cache for user lookups." Wrong: implement a generic cache
library. Right: add `@lru_cache` (Python) or `Map` memoization (JS) on the one
function that needs it.

The plan's scope is the scope. Not one abstraction level higher.

### Writing tests before the code

Self-checks come AFTER the code unit (Step 4e). Writing tests first without
implementation is fine in TDD, but sriflow-build is not a TDD skill. Write code,
then write the check, then run the check.

### Letting the smoke check pass with wrong behavior

A smoke check that exits 0 but returns wrong data is not a passing smoke check.
Check the output, not just the exit code. `exit 0` with `{"error": "DB not connected"}`
is a failure.

### Over-trimming security

The trim ladder applies to abstractions, not to validation, auth, and error handling.
Skipping input validation because "it's just one caller" is not laziness — it is a
security bug. The trim ladder stops before security.

### Building all files at once

Build one logical unit at a time. Write the memory entry. Run the self-check.
Then move to the next unit. Building everything before testing means a failing
smoke check with no way to know which unit broke.

### Ignoring the reuse scan

Skipping Step 2 produces duplicate code. Duplicate code produces merge conflicts,
diverging behavior, and double maintenance. Step 2 costs 30 seconds. Pay it every time.
