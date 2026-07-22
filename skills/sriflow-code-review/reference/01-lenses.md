# Six-Lens Review (Details)

Apply all 6 lenses against the diff. Every finding follows this exact format:

```
path/to/file.ext:LINE: CRITICAL|WARN|NITPICK: <problem>. Fix: <specific action>.
```

Severity definitions:
- `CRITICAL` — must be fixed before ship. Data loss risk, security vulnerability, logic error that breaks a core function, SQL injection, XSS, auth bypass. Ship is BLOCKED.
- `WARN` — not immediately dangerous but will cause problems. Missing error handling on critical path, N+1 query under real load, race condition under concurrency.
- `NITPICK` — style, simplification, or trim violation. Low urgency. Safe to auto-fix.

**Before emitting any finding:** verify the specific code line that motivates it. If you cannot point to a specific line in the diff, suppress the finding.

---

## Lens 1: CORRECTNESS

Look for bugs that will manifest at runtime, not style issues.

**Logic errors:**
- Inverted boolean guards: `if (!isAuthenticated)` that grants access instead of denying it
- Wrong operator precedence: `a || b && c` evaluated differently than intended
- Incorrect conditional structure: `if (a) { return } else if (a) { ... }` — dead branch
- Assignment in conditional: `if (x = getValue())` when `==` was intended

**Off-by-one errors:**
- Loop bounds using `<` vs `<=` where the fence matters
- Slice/substring indices off by one
- Pagination offset math
- Array access at `.length` instead of `.length - 1`

**Null / undefined handling:**
- Property access on a value that could be null without a null check
- Optional chaining missing where the chain can realistically be null
- Return value of a function used directly when that function can return null/undefined

**Type safety:**
- Implicit numeric-to-string coercions
- Equality checks using `==` instead of `===` where type coercion would matter
- `parseInt` / `parseFloat` without base argument or without NaN check
- JSON.parse used without try/catch on input that could be malformed

**Async / concurrency correctness:**
- Missing `await` on a Promise that must complete before the next operation
- `.then()` chain where the handler returns a Promise but the outer caller expects it resolved
- `Promise.all` used where `Promise.allSettled` is needed
- Race condition: two concurrent requests both read-then-write the same record without a lock

**State mutation:**
- Mutating a parameter directly instead of returning a new value
- Shared mutable state modified in an async handler without synchronization
- Object spread that only does a shallow copy when a deep copy is needed
- Sorting or filtering an array in place when the caller still needs the original

**Error propagation:**
- `catch` block that swallows an error silently without logging or re-throwing
- `try/catch` that catches but doesn't re-throw, making the caller think the operation succeeded
- Missing error check on a return value that encodes failure as a special value

**Boundary conditions:**
- Empty input: does the code handle an empty string, empty array, or zero correctly?
- Single-element input: does a loop or recursive function terminate correctly for N=1?
- Large input: does the code have a bound on input size, or will it OOM/timeout?
- Negative numbers: does numeric math assume non-negative input without validating?

Flag CORRECTNESS findings as `CRITICAL` if the bug breaks a core function or could cause data loss. Flag as `WARN` if it affects an edge case or non-critical path. Flag as `NITPICK` only if the code works correctly but reads ambiguously.

---

## Lens 2: SQL SAFETY

If the diff contains no database queries, skip this lens and note: `SQL SAFETY: no database queries in diff.`

**SQL Injection vectors (always CRITICAL):**
- String interpolation or concatenation of user input into a query string
- ORM `.raw()`, `.query()`, or `.execute()` calls that interpolate user input
- Named placeholders bypassed by building the query string first then executing

**Parameterization gaps:**
- Query parameters passed positionally or by name but missing for some user-controlled values
- Dynamic table or column names derived from user input without an allowlist check
- `IN (?)` placeholders built dynamically from user-supplied lists without proper binding

**LIKE and wildcard injection:**
- `WHERE name LIKE '%<user_input>%'` without escaping `%` and `_` in the input

**ORDER BY injection:**
- Dynamic `ORDER BY <user_input>` where user_input is not validated against an allowlist

**Unbounded queries:**
- `SELECT *` with no `LIMIT` clause on a table that could grow large
- Missing pagination on list endpoints that read from large tables

**Missing transactions:**
- Multi-step operations (insert then update, create then link) with no transaction wrapping

**Schema migration risks:**
- `ALTER TABLE` that adds a `NOT NULL` column without a default to an existing table with rows
- `DROP TABLE` or `DROP COLUMN` without confirming the data is no longer needed
- Migration that does not handle rollback (no `down` migration)

---

## Lens 3: SECURITY (OWASP)

Map findings to OWASP Top 10 where applicable.

**A01 — Broken Access Control:**
- Route handler that does not verify the authenticated user owns the requested resource
- User-supplied ID used to fetch a record without checking ownership
- Admin-only endpoint missing role check
- Insecure Direct Object Reference: sequential numeric IDs exposed in URLs
- `forceParams` or mass assignment: accepting all request fields without an allowlist

**A02 — Cryptographic Failures:**
- Secrets, API keys, tokens, or passwords hardcoded in source code
- PII logged to stdout or written to a log file without masking
- Passwords stored in plaintext or with a weak hash (MD5, SHA1 without salt)
- Sensitive data returned in API responses that don't need it
- HTTP used where HTTPS is required for sensitive data transmission

**A03 — Injection:**
See Lens 2 for SQL. Additionally:
- Shell injection: user input passed to `exec()`, `spawn()`, `subprocess.run()` without escaping
- NoSQL injection: user input used as a MongoDB query object field without schema validation
- Template injection: user input rendered via server-side templates with expression evaluation

**A04 — Insecure Design:**
- Authentication flow where bypassing one step allows proceeding to the next
- Password reset tokens not invalidated after first use
- Multi-step wizard where server does not re-validate state at each step

**A05 — Security Misconfiguration:**
- CORS configured with `origin: '*'` on endpoints that return authenticated data
- Debug mode or verbose error messages enabled in production paths
- Default credentials or example secrets left in configuration files
- Missing security headers: CSP, X-Frame-Options, HSTS

**A06 — Vulnerable and Outdated Components:**
- New dependency added with a known CVE
- Dependency pinned to a version known to be vulnerable

**A07 — Identification and Authentication Failures:**
- Session tokens or JWTs not validated on protected routes
- JWT validation that only checks signature but not expiry, issuer, or audience
- Session not invalidated on logout
- Missing rate limiting on login, registration, or password-reset endpoints

**A08 — Software and Data Integrity Failures:**
- `eval()`, `Function()`, `exec()` on user-controlled strings
- `pickle.loads()`, `unserialize()`, `yaml.load()` on untrusted input
- Dynamic `require()` or `import()` of a user-controlled module path

**A09 — Security Logging and Monitoring Failures:**
- Authentication failures not logged
- Admin actions not logged with actor identity
- Log entries that include passwords, tokens, or PII

**A10 — Server-Side Request Forgery (SSRF):**
- User-controlled URL passed to an HTTP client without validation
- URL scheme not restricted (allowing `file://`, `gopher://`, etc.)
- Internal IP ranges not blocked in URL validation

**XSS (related to A03):**
- User-controlled content rendered into HTML without escaping
- React `dangerouslySetInnerHTML` without sanitization
- Server-side template rendering user data without auto-escaping

**Path Traversal:**
- User-supplied filename used in `fs.readFile` without path normalization and validation
- `path.join(baseDir, userInput)` without `path.resolve` + bounds check

**Secrets in code:**
- API keys, passwords, tokens, or private keys appearing literally in the diff

---

## Lens 4: LLM TRUST BOUNDARIES

If the diff contains no LLM API calls, prompt construction, or LLM output handling: skip this lens and note `LLM TRUST: no LLM integration in diff.`

**Prompt injection vectors:**
- User-controlled strings concatenated directly into a system prompt or user message
- User profile fields, message history, or document content inserted into prompts without treatment
- Tool descriptions or few-shot examples built from user-supplied data

**Structural prompt injection:**
- System prompt and user content not structurally separated
- Delimiter injection: system prompt uses `---` as delimiter, user can inject `---`

**LLM output trust:**
- LLM-generated code executed via `eval()` or `exec()` without review
- LLM-generated SQL executed directly against the database
- LLM-generated HTML rendered into the DOM without escaping
- LLM-generated file paths used in `fs.readFile` / `fs.writeFile` without validation
- LLM-generated URLs passed to HTTP clients

**Unvalidated structured LLM output:**
- `JSON.parse(llmResponse)` without try/catch
- Accessing `llmJson.field` without checking the field exists
- Using `llmJson.count` as a loop bound without bounding the value first

**Trust boundary violations:**
- LLM API key or prompt content logged to output
- Rate limiting absent on endpoints that trigger LLM calls
- User-supplied `max_tokens`, `temperature` passed directly to LLM API without validation
- LLM response content returned raw to the user without stripping system-internal fields

**Context window poisoning:**
- User-controlled data of unbounded length inserted into the prompt context without truncation

---

## Lens 5: COMPLEXITY

Complexity findings do not block ship, but they are real costs.

**Unnecessary abstraction:**
- An interface with exactly one implementation
- A factory function that creates exactly one product type
- A strategy pattern with one strategy
- A plugin system for functionality that will never be extended

**Premature parameterization:**
- A config option for a value that will never change
- Function parameter that is always called with the same value at every callsite

**YAGNI violations:**
- Code added "for future flexibility" with no planned use case
- Commented-out code left in the diff
- TODOs that describe speculative features not in the current scope
- Generic solutions for a problem with exactly one known case

**Reinventing stdlib / well-tested libraries:**
- Custom `debounce`, `throttle`, `retry`, `memoize` implementations when stdlib exists
- Custom UUID/CUID generator when a well-tested library is already installed
- Custom date arithmetic when stdlib applies
- Custom deep-clone when `structuredClone` works

**Gratuitous indirection:**
- A chain of 3+ wrapper functions where each just calls the next
- A "service" class with a single method that just calls a repository method directly
- A utility function that is just a renamed alias for a function already in scope

**Dead code:**
- Functions defined but never called anywhere in the diff or codebase
- Variables assigned a value that is never read
- `if (false)` or equivalent statically-dead branches
- Module exports that are never imported anywhere

Before flagging dead code, run:
```bash
grep -r "<function_name>" . --include="*.ts" --include="*.js" --include="*.py" -l 2>/dev/null
```

---

## Lens 6: TRIM AUDIT

This lens asks: **which lines in this diff do not need to exist at all?**

**Development leftovers:**
- `console.log`, `print`, `logger.debug`, `debugger`, `breakpoint()` statements
- Commented-out code blocks

**Wrapper-only functions:**
Functions whose entire body is a single call to another function with identical arguments.

**Immediately-returned variables:**
Variables assigned on one line and returned on the next with no operations in between.

**Restating-the-obvious comments:**
Comments that describe what the code obviously does, adding no information about WHY.

**Redundant imports:**
Imports that are never referenced in the file. Before flagging, confirm with:
```bash
grep -n "<imported_name>" path/to/file.ext
```

**Blank-line ceremony:**
More than 2 consecutive blank lines, or blank lines at the start/end of a function body.

Start with: `TRIM AUDIT: lines that do not need to exist:`
Then list findings as NITPICK findings. If no trim findings: `TRIM AUDIT: diff is clean.`

---

## Finding Reference: Severity x Category Matrix

| Category | CRITICAL | WARN | NITPICK |
|----------|----------|------|---------|
| Correctness | Core function broken, data loss | Edge case bug, non-critical path | Reads ambiguously but works |
| SQL Safety | Any injection vector | Unbounded query, missing transaction | N/A |
| Security | Injection, auth bypass, XSS, SSRF, secrets | Data exposure, misconfiguration, missing rate limit | Missing security event logging |
| LLM Trust | User content in prompt without sanitization, LLM output executed | Unvalidated structured output, unbounded context | Raw response passthrough |
| Complexity | Complexity masks security/correctness boundary | Complexity creates maintenance trap | YAGNI, dead code, wrappers |
| Trim Audit | N/A | N/A | Debug logs, commented code, obvious comments |
