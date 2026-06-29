# Appendix A: Language-Specific Patterns

These are the most common real-world instances of the abstract categories, by language. Use these as a lookup when you see a familiar pattern in the diff.

## JavaScript / TypeScript

### Correctness
- `parseInt(value)` without radix — `parseInt("09")` returns 9 in modern JS but 0 in older (ES3-era) engines. Use `parseInt(value, 10)` or `Number(value)`.
- `typeof null === "object"` — the classic null-check failure. Always `value !== null && typeof value === "object"`.
- `Array.isArray` vs `instanceof Array` — the latter fails across iframes. Use `Array.isArray`.
- `0` / `""` / `NaN` / `null` / `undefined` all falsy — `if (x)` is not a null check. `if (x != null)` catches null and undefined without collapsing 0 and "".
- `Object.keys(undefined)` throws. Always guard with `if (obj)` before Object.keys/values/entries.
- `async` function inside `forEach` — `forEach` does not await. Use `for...of` with `await` or `Promise.all(arr.map(async ...))`.
- `catch (err)` in an async function that returns a Promise — the catch only covers the synchronous throw. Errors in awaited calls inside the try block are caught; errors thrown after an `await` in `.then()` chains are not.

### Security
- `JSON.parse(atob(cookie))` — base64 encoding is not encryption. The cookie value is user-controlled.
- `window.location.search` -> `URLSearchParams` -> value used in `innerHTML` — classic reflected XSS.
- `eval(localStorage.getItem(...))` — stored XSS.
- Template literals in `document.cookie` setter without path/secure/httpOnly flags.
- `new Function(userInput)()` — same as eval.

### SQL (via ORMs)
- Sequelize: `Model.findAll({ where: sequelize.literal(`id = ${userId}`) })` — injection.
- Prisma: `prisma.$queryRaw(Prisma.sql`SELECT * FROM users WHERE id = ${userId}`)` is safe. `prisma.$queryRawUnsafe(...)` with template literals is not.
- Knex: `.whereRaw('id = ' + userId)` — injection. `.whereRaw('id = ?', [userId])` — safe.
- TypeORM: `.createQueryBuilder().where('id = ' + userId)` — injection. `.where('id = :id', { id: userId })` — safe.

---

## Python

### Correctness
- Mutable default arguments: `def foo(items=[])` — the list persists across calls. Use `def foo(items=None): if items is None: items = []`.
- `is` vs `==` for value equality — `x is None` is correct, `x is "string"` is not reliable.
- `float("nan") == float("nan")` is `False` — use `math.isnan(x)`.
- `dict.get(key)` returns `None` by default — then `dict.get(key).method()` throws AttributeError when the key is absent.
- Generator exhaustion — a generator can only be iterated once. Passing a generator to two consumers will give the second consumer nothing.
- `except Exception as e: pass` — swallows everything including KeyboardInterrupt (if not specifically excluded).

### Security
- `subprocess.Popen(f"ls {user_path}", shell=True)` — shell injection. Use `subprocess.run(["ls", user_path])` (list form, no shell).
- `yaml.load(data)` — arbitrary code execution via `!!python/object`. Use `yaml.safe_load(data)`.
- `pickle.loads(data)` — arbitrary code execution. Never deserialize untrusted pickle data.
- `eval(user_input)` — code execution.
- `os.system(user_input)` — shell injection.
- `open(os.path.join(base_dir, user_filename))` without `os.path.realpath` bounds check — path traversal.
- `hashlib.md5(password.encode()).hexdigest()` — MD5 is not a password hash. Use `bcrypt`, `argon2`, or `hashlib.scrypt`.

### SQL
- `cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")` — injection. Use `cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`.
- SQLAlchemy: `session.execute(text(f"SELECT * FROM users WHERE id = {user_id}"))` — injection. Use `session.execute(text("SELECT * FROM users WHERE id = :id"), {"id": user_id})`.
- Django ORM: `User.objects.filter(id=user_id)` — safe. `User.objects.extra(where=[f"id = {user_id}"])` — injection.

---

## Ruby / Rails

### Correctness
- `nil.to_s` returns `""` in Ruby — this silently converts nil to empty string where you might want a nil check.
- `array.first` returns `nil` on an empty array, not an error. Calling `.id` on it throws NoMethodError.
- `Time.now` vs `Time.zone.now` — the former returns local server time, not the app timezone.

### Security
- `User.where("name = '#{params[:name]}'")`  — SQL injection. Use `User.where(name: params[:name])` or `User.where("name = ?", params[:name])`.
- `ActiveRecord::Base.connection.execute("SELECT * FROM #{table_name}")` with user-supplied `table_name` — injection.
- `send(params[:method])` — arbitrary method dispatch. Never call `send` with user-controlled input.
- `render inline: params[:template]` — template injection.
- `eval(params[:code])` — code execution.
- `Marshal.load(data)` — arbitrary code execution on untrusted data.
- `YAML.load(data)` (Psych before safe mode) — code execution. Use `YAML.safe_load`.
- Mass assignment without strong parameters in Rails < 5: `User.new(params[:user])`.

---

## Go

### Correctness
- Goroutine closure captures loop variable by reference: `for i := range items { go func() { use(i) }() }` — all goroutines see the last value of `i`. Fix: pass `i` as argument.
- `nil` map read returns zero value, nil map write panics. Always initialize maps.
- `defer` in a loop — deferred calls execute at function return, not at loop iteration end. Close resources explicitly inside the loop.
- Ignoring multiple return values: `val, _ := riskyOp()` when the error matters.
- `http.Get(url)` without a timeout — the request can hang indefinitely. Use `http.Client{Timeout: ...}`.

### Security
- `fmt.Sprintf("SELECT * FROM users WHERE id = %d", userID)` with an integer is safe. With a string (`%s`) and user input: injection.
- `exec.Command("sh", "-c", userInput)` — shell injection. Use `exec.Command(program, arg1, arg2)` form.
- `ioutil.ReadFile(filepath.Join(baseDir, userInput))` without filepath.Clean and bounds check — path traversal.
- `os.Getenv("SECRET")` logged or returned in an error response.

---

## SQL (database-agnostic patterns)

### PostgreSQL-specific
- `ILIKE '%' || user_input || '%'` without escaping — the `%` and `_` in user_input match any string.
- `ORDER BY ` + column_name where column_name comes from user input without allowlist — even if parameterized, ORDER BY cannot be parameterized in most drivers.
- `pg_sleep(user_input)` in a trigger or function — time-based blind SQLi if user controls the argument.
- `COPY TO/FROM` with a user-controlled filename — file system access from the DB.

### MySQL-specific
- `SELECT * FROM users WHERE id = '` + user_id + `'` — injection in single-quoted string context.
- `LOAD DATA INFILE` with user-controlled path.
- Backtick-delimited identifiers: `` SELECT `name` FROM `${tableName}` `` where tableName is user-controlled — injection.

### SQLite-specific
- SQLite3 Python: `cursor.execute("SELECT * FROM t WHERE id = " + str(user_id))` — injection. Must use `?` placeholders.
