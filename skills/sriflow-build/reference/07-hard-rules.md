# Hard Rules (Details)

These rules apply at all times. No exceptions.

## Never narrate what code does.

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

## Never write code that could already exist.

Step 2 is mandatory. Do not skip it. A grep takes 2 seconds. Duplicate code takes
hours to maintain and merge.

## Shortest diff wins.

One-line fix in the shared function beats a guard in every caller. Edit the existing
file before creating a new one. Delete the old pattern before adding a new one.

## No speculative features.

Build exactly what PLAN.md specifies. Nothing else. If a feature looks useful but
is not in the plan: note it in SRIFLOW_MEMORY.md under `Suggestions` and move on.
Do not implement it.

## Bug fix = root cause.

When fixing a bug mid-build: grep every caller of the function being changed.
The fix goes at the root, in the shared function, once. Not in the specific caller
the bug report named.

## Irreversible actions require explicit user confirmation.

No rm -rf, no DROP, no force-push without D0 AskUserQuestion. This rule is absolute.

## Security and validation are never shortcuts.

Input validation at trust boundaries, error handling that prevents data loss, auth
checks — these are not "abstractions" subject to the trim ladder. Build them fully,
always, on the first pass.

## Accessibility basics are not shortcuts.

`alt` attributes, semantic HTML, keyboard accessibility — build them in. They are
not "out of scope."

## Error Handling Standards

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

## Security Standards (Never Shortcuts)

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
