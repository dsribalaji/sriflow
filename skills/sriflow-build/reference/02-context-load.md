# Step 1 — Context Load (Details)

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

## What to extract from each file

**PLAN.md** — read the implementation sequence. What is to be built, in what order,
what the success criteria are. Note the exact sequence of units to implement.

**DESIGN.md** — read the component list, data model, API contracts, and any decisions
already made (framework, library choices, DB schema). These are locked — do not
re-litigate them. If a design decision is missing, use AskUserQuestion before assuming.

**SRIFLOW_MEMORY.md** — read for build progress already logged. If a `[BUILD PROGRESS]`
entry exists for a unit, skip that unit. Do not re-implement completed work.

## No plan found

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

## Partial context

If PLAN.md exists but DESIGN.md is missing: build from the plan. Note that design
decisions will be made inline using the trim ladder (minimal, reversible choices).

If DESIGN.md exists but PLAN.md is missing: extract the implementation sequence from
DESIGN.md directly. Note which sections describe components vs. which describe data
model vs. which describe API contracts.

If SRIFLOW_MEMORY.md shows a partial build: resume from the last incomplete unit.
State which unit is being resumed. Do not re-run completed units.

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
