# Error Handling & Security Standards

Error handling and security are never shortcut candidates. These patterns are required
on the first pass — they are not "gold-plating."

---

## Trust Boundaries (Always Validate)

Every input that crosses a trust boundary — HTTP request body, query param, env var,
file read, CLI argument — must be validated before use.

```typescript
// HTTP body — validate before use
const { userId } = req.body
if (!userId || typeof userId !== 'string') {
  return res.status(400).json({ error: 'userId required' })
}
```

```python
# Env var — fail fast with a clear message
if not os.environ.get('PORT'):
    raise ValueError("PORT env var required — set it before starting")
PORT = int(os.environ['PORT'])
```

---

## Data Loss Prevention

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

---

## Fail-Fast Over Silent Failure

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

---

## Logging at Errors

At every error path that returns to the caller: log the error with context.
One line. Include the operation that failed and the input that caused it.

```python
logger.error("get_user failed", user_id=user_id, error=str(e))
```

Do not log and re-raise without adding context. Do not log the same error twice
(log at the point of origin, not at every caller).

---

## Security Standards (Never Shortcuts)

These are required on every build that touches auth, data handling, or external input.

### Authentication

- Never roll your own auth algorithm. Use the installed auth library or the platform's built-in.
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

### Input Sanitization

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
