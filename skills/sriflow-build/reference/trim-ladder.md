# sriflow-trim Code Ladder

This ladder applies to EVERY piece of code written in this build. No exceptions.
Walk each rung in order. Stop at the first rung that holds. Do not jump to rung 7
because the problem "feels complex."

---

## The Ladder

### Rung 1 — Does this need to exist? (YAGNI)

Ask: what breaks without this code? If the answer is "nothing breaks right now, but
it might be useful later" — do not write it. Say so in one line and move on.

If it needs to exist: state what breaks without it. One sentence. Then proceed.

Speculative need = skip it, say so in one line.

Example:
```
// trim: not writing a retry wrapper — single call site, manual rerun is fine if it fails
```

### Rung 2 — Already in the codebase? Reuse it.

Step 2 found it. Use it. Do not rewrite what already exists.

If Step 2 found something similar but not identical: edit the existing code to
cover the new case. Shortest diff wins. Do not create a parallel implementation.

### Rung 3 — Standard library does it? Use it.

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

### Rung 4 — Native platform feature covers it? Use it.

- HTML `<input type="date">` over a date picker library
- CSS `grid` or `flex` over a layout library
- DB unique constraint over application-level uniqueness check
- Browser `fetch` over `axios` (unless axios is already installed)
- DB `ON DELETE CASCADE` over application-level cascade logic
- OS file watcher (`fs.watch`, `inotify`) over a polling loop

Platform features are maintained, tested, and documented by the platform.
Custom code is maintained by you.

### Rung 5 — Already-installed dependency solves it? Use it.

Check `package.json` / `requirements.txt` / `go.mod` / `Gemfile` from Step 2.

If an installed package covers the need: use it. Do not add a new package.

Never add a new dependency for what a few lines of code handle. Never add a
dependency that duplicates an already-installed one.

If a new dependency is genuinely needed: use AskUserQuestion (D-N) before adding it.
State what it does, why stdlib and existing deps fall short, and the size/license.

### Rung 6 — Can it be one line? One line.

If the logic fits in one line, write it in one line. No wrapper function, no helper
module, no named constant unless the name meaningfully improves readability.

### Rung 7 — Minimum code that works.

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

---

## Marking Deliberate Shortcuts

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

---

## Mid-Build Ambiguity

If blocked on a design decision mid-build:
- If the answer is obvious and low-risk: make the simplest reasonable call and note it:
  ```
  // trim: assumed X, revisit if Y becomes a requirement
  ```
- If there are more than 2 reasonable interpretations that produce materially different
  code: use AskUserQuestion (D-N). Do not guess on high-stakes branches.

---

## Quick Reference

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

## Common Trim Comments by Pattern

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
