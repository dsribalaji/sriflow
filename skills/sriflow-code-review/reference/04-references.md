# References & Appendices

## Language-Specific Patterns

### JavaScript / TypeScript

**Correctness:**
- `parseInt(value)` without radix — use `parseInt(value, 10)` or `Number(value)`
- `typeof null === "object"` — always `value !== null && typeof value === "object"`
- `Array.isArray` vs `instanceof Array` — the latter fails across iframes
- `0` / `""` / `NaN` / `null` / `undefined` all falsy — `if (x)` is not a null check
- `Object.keys(undefined)` throws. Always guard with `if (obj)`
- `async` function inside `forEach` — `forEach` does not await. Use `for...of`

**Security:**
- `JSON.parse(atob(cookie))` — base64 encoding is not encryption
- `window.location.search` → `URLSearchParams` → value used in `innerHTML` — reflected XSS
- `eval(localStorage.getItem(...))` — stored XSS
- Template literals in `document.cookie` setter without path/secure/httpOnly flags
- `new Function(userInput)()` — same as eval

**SQL (via ORMs):**
- Sequelize: `Model.findAll({ where: sequelize.literal(\`id = ${userId}\`) })` — injection
- Prisma: `prisma.$queryRawUnsafe(...)` with template literals — injection
- Knex: `.whereRaw('id = ' + userId)` — injection
- TypeORM: `.createQueryBuilder().where('id = ' + userId)` — injection

### Python

**Correctness:**
- Mutable default arguments: `def foo(items=[])` — use `def foo(items=None)`
- `is` vs `==` for value equality — `x is None` is correct, `x is "string"` is not
- `float("nan") == float("nan")` is `False` — use `math.isnan(x)`
- `dict.get(key)` returns `None` — then `dict.get(key).method()` throws AttributeError
- Generator exhaustion — a generator can only be iterated once

**Security:**
- `subprocess.Popen(f"ls {user_path}", shell=True)` — shell injection
- `yaml.load(data)` — arbitrary code execution. Use `yaml.safe_load(data)`
- `pickle.loads(data)` — arbitrary code execution
- `eval(user_input)` — code execution
- `open(os.path.join(base_dir, user_filename))` without bounds check — path traversal
- `hashlib.md5(password.encode()).hexdigest()` — MD5 is not a password hash

**SQL:**
- `cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")` — injection
- SQLAlchemy: `session.execute(text(f"SELECT * FROM users WHERE id = {user_id}"))` — injection
- Django ORM: `User.objects.extra(where=[f"id = {user_id}"])` — injection

### Ruby / Rails

**Correctness:**
- `nil.to_s` returns `""` — silently converts nil to empty string
- `array.first` returns `nil` on empty array, not an error
- `Time.now` vs `Time.zone.now` — local server time vs app timezone

**Security:**
- `User.where("name = '#{params[:name]}'")` — SQL injection
- `send(params[:method])` — arbitrary method dispatch
- `render inline: params[:template]` — template injection
- `eval(params[:code])` — code execution
- `Marshal.load(data)` — arbitrary code execution
- `YAML.load(data)` — code execution. Use `YAML.safe_load`
- Mass assignment without strong parameters in Rails < 5

### Go

**Correctness:**
- Goroutine closure captures loop variable by reference — all goroutines see last value
- `nil` map read returns zero value, nil map write panics
- `defer` in a loop — deferred calls execute at function return, not loop iteration end
- Ignoring multiple return values: `val, _ := riskyOp()` when error matters
- `http.Get(url)` without a timeout — can hang indefinitely

**Security:**
- `exec.Command("sh", "-c", userInput)` — shell injection
- `ioutil.ReadFile(filepath.Join(baseDir, userInput))` without bounds check — path traversal
- `os.Getenv("SECRET")` logged or returned in error response

### SQL (database-agnostic)

**PostgreSQL:**
- `ILIKE '%' || user_input || '%'` without escaping
- `ORDER BY` + column_name from user input without allowlist
- `pg_sleep(user_input)` — time-based blind SQLi
- `COPY TO/FROM` with user-controlled filename

**MySQL:**
- `SELECT * FROM users WHERE id = '` + user_id + `'` — injection
- `LOAD DATA INFILE` with user-controlled path
- Backtick-delimited identifiers with user-controlled tableName

**SQLite:**
- `cursor.execute("SELECT * FROM t WHERE id = " + str(user_id))` — must use `?` placeholders

---

## LLM-Specific Attack Scenarios

### Scenario 1: Direct Prompt Injection via User Message

User controls the message content and can instruct the model to ignore the system prompt.

**Fix:** Structural separation with delimited blocks and explicit instructions to treat user content as data.

### Scenario 2: Indirect Prompt Injection via Retrieved Content

Document content could contain injected instructions that the model follows.

**Fix:** Use delimiters and instruct the model to treat retrieved content as data only.

### Scenario 3: LLM Output to SQL

LLM-generated SQL executed directly — double injection risk.

**Fix:** Use an allowlist of query templates. LLM selects template and fills parameters.

### Scenario 4: LLM Output to HTML

LLM output rendered as HTML — XSS risk.

**Fix:** Escape LLM output before inserting into HTML.

### Scenario 5: LLM Output to Shell Command

Never execute LLM-generated shell commands.

**Fix:** Define fixed set of allowed operations. LLM selects from them.

### Scenario 6: Unbounded Token Spend

User controls input length to LLM — budget exhaustion.

**Fix:** Truncate input, add rate limiting, set `max_tokens`.

---

## Complexity Anti-Patterns

### The Single-Implementation Interface
Interface adds indirection with zero current benefit. Extract when second implementation exists.

### The One-Param Config Object
Function that just passes all fields to another function. Delete; call directly.

### The Registry for One Thing
Registry with one entry. Call handler directly. Add registry when second event type arrives.

### The Async Wrapper
`return await` in a function with no try/catch is redundant. Delete wrapper.

### The Config for a Constant
Config object with env vars that are never set. Use constants. Add env var when someone needs to tune.

### The Three-Layer Sandwich
Service and repository both do nothing but delegate. Collapse layers when no logic is added.

---

## Common False Positives

### Correctness
- Intentional null coalescing: `const name = user?.profile?.name ?? "Anonymous"`
- Intentional short-circuit: `isLoading && <Spinner />` in JSX
- Idiomatic falsy check: `if (!items.length)`
- Promise returned from async function

### SQL Safety
- Parameterized query with dynamic structure via allowlist
- Admin-only query builder with visible admin check

### Security
- `innerHTML` with static string (no user input)
- `eval()` with a static string
- CORS `*` on public, unauthenticated, read-only endpoints
- `.env.example` with placeholder values

### LLM Trust
- LLM output used for display only (HTML escaped)
- Static system prompts with no user input

### Complexity
- Interface with one implementation but multiple test doubles
- Async wrapper that adds error handling

---

## Checklists

### Before Emitting a Finding
- [ ] Can quote the specific diff line(s)
- [ ] Problem is real in this codebase, not a pattern-match
- [ ] Fix is specific and actionable
- [ ] Severity matches the matrix
- [ ] For dead code: Grep confirms no callers

### Before Writing CODE_REVIEW.md
- [ ] All 6 lenses applied
- [ ] Lenses with no applicable code are noted
- [ ] Every CRITICAL has file:line and specific fix
- [ ] Every WARN has file:line and specific fix
- [ ] NITPICKs presented via AskUserQuestion
- [ ] Summary table counts match actual findings
- [ ] Verdict matches gate logic

### After CODE_REVIEW.md Written
- [ ] Memory write appended to SRIFLOW_MEMORY.md
- [ ] Timeline log written
- [ ] Verdict printed inline
- [ ] If BLOCKED: CRITICAL findings listed inline
- [ ] If DONE_WITH_CONCERNS: WARN findings listed inline

---

## Diff Size Handling

### Small diff (< 50 files, < 2000 lines)
Run all 6 lenses in one pass.

### Medium diff (50-200 files, 2000-10000 lines)
1. Run all 6 lenses against top 20 highest-churn files
2. Run all 6 lenses against auth/DB/API/LLM files
3. For remaining files: Lens 1 (Correctness) and Lens 3 (Security) only

### Large diff (200+ files, 10000+ lines)
Ask user to scope: auth/DB/API/LLM paths, specific subdirectory, or everything.
