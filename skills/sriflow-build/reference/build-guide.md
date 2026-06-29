# Build Guide Reference

## Dependency Decision Guide

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

## Ambiguity Escalation Matrix

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

## Build Order for Common Project Types

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

## Post-Build Checklist

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

## Scope Creep Guard

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

## Handoff to Next Skills

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

## Common Failure Modes

### Reading PLAN.md wrong

PLAN.md describes intent and sequence. It does not always describe the exact
implementation. When PLAN.md says "add user authentication," it means: pick up
the design decisions from DESIGN.md. Do not invent auth strategy if DESIGN.md
specifies one.

If PLAN.md and DESIGN.md contradict each other: AskUserQuestion.

### Implementing the wrong abstraction level

PLAN.md says "add a cache for user lookups." Wrong: implement a generic cache
library. Right: add `@lru_cache` (Python) or `Map` memoization (JS) on the one
function that needs it.

### Writing tests before the code

Self-checks come AFTER the code unit (Step 4e). Write code, then write the check,
then run the check.

### Letting the smoke check pass with wrong behavior

A smoke check that exits 0 but returns wrong data is not a passing smoke check.
Check the output, not just the exit code.

### Over-trimming security

The trim ladder applies to abstractions, not to validation, auth, and error handling.
Skipping input validation because "it's just one caller" is not laziness — it is a
security bug.

### Building all files at once

Build one logical unit at a time. Write the memory entry. Run the self-check.
Then move to the next unit.

### Ignoring the reuse scan

Skipping Step 2 produces duplicate code. Duplicate code produces merge conflicts,
diverging behavior, and double maintenance. Step 2 costs 30 seconds. Pay it every time.
