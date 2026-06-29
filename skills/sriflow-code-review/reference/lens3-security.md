# Lens 3: SECURITY (OWASP)

Map findings to OWASP Top 10 where applicable. Note the OWASP category in each finding.

## A01 — Broken Access Control
- Route handler or API endpoint that does not verify the authenticated user owns the requested resource
- User-supplied ID (e.g., `GET /users/:id`) used to fetch a record without checking `record.owner_id === req.user.id`
- Admin-only endpoint missing role check (checks authentication but not authorization)
- Insecure Direct Object Reference: sequential numeric IDs exposed in URLs for resources that should be scoped to the owner
- `forceParams` or mass assignment: accepting all request fields into a model without an allowlist

## A02 — Cryptographic Failures
- Secrets, API keys, tokens, or passwords hardcoded in source code or committed to the diff
- PII (emails, phone numbers, SSNs) logged to stdout or written to a log file without masking
- Passwords stored in plaintext or with a weak hash (MD5, SHA1 without salt)
- Sensitive data returned in API responses that don't need it (e.g., password hash, internal IDs, admin flags)
- HTTP used where HTTPS is required for sensitive data transmission

## A03 — Injection
See Lens 2 for SQL. Additionally:
- **Shell injection**: user input passed to `exec()`, `spawn()`, `subprocess.run()`, or `system()` without escaping or argument array form
- **LDAP injection**: user input interpolated into LDAP filter strings
- **NoSQL injection**: user input used as a MongoDB query object field without schema validation
- **XPath injection**: user input in XPath expressions
- **Template injection**: user input rendered via server-side templates with expression evaluation (Jinja2, Twig, Handlebars with `{{{ }}}`)

Flag all injection as `CRITICAL`.

## A04 — Insecure Design
- Authentication flow where bypassing one step allows proceeding to the next without completing the previous
- Password reset tokens not invalidated after first use
- Multi-step checkout or wizard where server does not re-validate state at each step

## A05 — Security Misconfiguration
- CORS configured with `origin: '*'` on endpoints that return authenticated data
- Debug mode, stack traces, or verbose error messages enabled in a path that could reach production
- Default credentials or example secrets left in configuration files
- `X-Powered-By`, `Server`, or other version-disclosing headers not suppressed
- Missing security headers: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`

Flag `*` CORS on authenticated endpoints as `CRITICAL`. Flag misconfiguration findings as `WARN` unless directly exploitable.

## A06 — Vulnerable and Outdated Components
- New dependency added in the diff with a known CVE (check the package name; if obvious, flag it)
- Dependency pinned to a version known to be vulnerable (if recognizable from the diff)

Flag as `WARN`. Do not speculate — only flag if the vulnerability is recognizable from the code in the diff.

## A07 — Identification and Authentication Failures
- Session tokens or JWTs not validated on protected routes (missing middleware, or middleware applied inconsistently)
- JWT validation that only checks the signature but not expiry (`exp` claim), issuer (`iss`), or audience (`aud`)
- JWT `alg: none` accepted
- Session not invalidated on logout
- Password reset flow that does not expire the token or limit attempts
- Missing rate limiting on login, registration, or password-reset endpoints

Flag JWT validation gaps and missing auth middleware as `CRITICAL`. Flag rate-limiting gaps as `WARN`.

## A08 — Software and Data Integrity Failures
- `eval()`, `Function()`, `exec()`, or similar dynamic evaluation of user-controlled strings
- `pickle.loads()`, `unserialize()`, `yaml.load()` (not `yaml.safe_load()`) on untrusted input
- Dynamic `require()` or `import()` of a user-controlled module path

Flag as `CRITICAL`.

## A09 — Security Logging and Monitoring Failures
- Authentication failures not logged
- Admin actions not logged with actor identity
- Log entries that include passwords, tokens, or PII

Flag missing security event logging as `NITPICK` unless the app is in a regulated domain. Flag logging of sensitive data as `WARN`.

## A10 — Server-Side Request Forgery (SSRF)
- User-controlled URL passed to an HTTP client without validation
- `fetch()`, `axios.get()`, `requests.get()`, `curl` called with a URL derived from user input without allowlist validation
- URL scheme not restricted (allowing `file://`, `gopher://`, `dict://`, etc.)
- Internal IP ranges (127.0.0.1, 10.x.x.x, 172.16-31.x.x, 192.168.x.x) not blocked in URL validation

## XSS (related to A03)
- User-controlled content rendered into HTML without escaping: `innerHTML = userInput`, `document.write(userInput)`
- React `dangerouslySetInnerHTML={{ __html: userInput }}` without sanitization
- Server-side template rendering user data without auto-escaping or explicit escape filters
- Markdown rendered to HTML where the renderer allows raw HTML tags

Flag XSS as `CRITICAL`.

## Path Traversal
- User-supplied filename used in `fs.readFile`, `open()`, or similar without path normalization and validation
- Insufficient check: only checking that path starts with the expected directory, not that the resolved path stays within it
- `path.join(baseDir, userInput)` without `path.resolve` + bounds check

Flag path traversal as `CRITICAL`.

## Secrets in code
- API keys, passwords, tokens, or private keys appearing literally in the diff (not just variable names, but actual secret values)
- `.env.example` or config templates with real secret values instead of placeholder strings

Flag as `CRITICAL`.
