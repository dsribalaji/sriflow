# Build Loop Reference

## Unit Definition

A logical unit is one of: a function group, a module, a route handler, a data
model, a test file, a configuration block. Not a single function — but not the
entire application either. Size it so a unit represents a meaningful, independently
testable piece of the build.

---

## Loop Body

Repeat for each unit in the implementation sequence from PLAN.md:

### 4a. State the unit

One sentence: what is being built, what it connects to, what done looks like.

Example: "Building `src/auth/middleware.ts` — JWT validation for all `/api/*` routes.
Done when: requests without valid tokens return 401, requests with valid tokens pass `req.user`."

### 4b. Apply the trim ladder (Step 3)

For every piece of code in this unit, walk the ladder. Record rung reached.

### 4c. Reuse check

Before writing any new file: confirm Step 2 found nothing reusable for this unit.
If something was found: use it.

### 4d. Write the code

Write the minimum code that satisfies the unit's done condition. Apply trim comments
to every deliberate shortcut. Do not add comments explaining what the code does —
only comment when the WHY is non-obvious (hidden constraint, workaround, subtle
invariant).

### 4e. One self-check

For any non-trivial logic (branching, data transformation, stateful behavior, money,
security, parsing): write ONE minimal runnable check.

Rules:
- Assert-based or `test_*.py` / `*.test.ts` naming.
- One file, one function. Tests the critical path only.
- No testing frameworks unless the project already uses one.
- Must be runnable with a single command.
- If trivial (a rename, a string format, a config value): skip the check and say so.

Read `reference/self-checks.md` for templates (Python, TypeScript, Go, Shell).

### 4f. Write progress to memory

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

### 4g. Mid-build AUQ threshold

If blocked mid-unit and the ambiguity is:
- Low-risk (phrasing, naming, minor behavior choice): make the call, add a `// trim:` comment, continue.
- High-risk (architecture, data model, destructive scope): AskUserQuestion (D-N) and STOP until answered.

Never block the build on low-risk ambiguity.

---

## Unit Sequence

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

## When PLAN.md Has No Implementation Sequence

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

## Files Written vs. Files Edited

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
