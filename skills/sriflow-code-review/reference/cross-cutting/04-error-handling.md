# Error Handling Principles Guide

Language-agnostic review checklist. Apply to every PR with error paths.

---

## 5 Core Principles

### 1. Don't Swallow Errors

Every error must either be handled or propagated. Silent failures are bugs waiting to happen.

```python
# BAD - swallowed error
try:
    process_payment(order)
except Exception:
    pass  # order lost, no one knows

# GOOD - handled or propagated
try:
    process_payment(order)
except PaymentError as e:
    logger.error("payment failed", extra={"order_id": order.id, "error": str(e)})
    order.status = "payment_failed"
    order.save()
    raise
```

### 2. Add Context

Raw exceptions lack context. Wrap with meaningful information.

```go
// BAD
func ReadConfig(path string) (Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return Config{}, err  // caller has no idea what file
    }
    // ...
}

// GOOD
func ReadConfig(path string) (Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return Config{}, fmt.Errorf("reading config at %s: %w", path, err)
    }
    // ...
}
```

### 3. Use Specific Types

Catch what you can handle. Let the rest propagate.

```java
// BAD - catches everything, can't distinguish
try {
    userService.create(user);
} catch (Exception e) {
    return error("failed");
}

// GOOD - catches what it can handle
try {
    userService.create(user);
} catch (DuplicateEmailException e) {
    return conflict("email already registered");
} catch (ValidationException e) {
    return badRequest(e.getMessage());
}
// Other exceptions propagate to global handler
```

### 4. Fail Fast

Validate early. Don't let bad state propagate through the system.

```python
def transfer_funds(from_account, to_account, amount):
    # Fail fast - validate before any side effects
    if amount <= 0:
        raise ValueError("amount must be positive")
    if from_account.balance < amount:
        raise InsufficientFundsError(from_account.id, amount)
    if from_account.id == to_account.id:
        raise ValueError("cannot transfer to same account")

    # Now safe to execute
    from_account.debit(amount)
    to_account.credit(amount)
```

### 5. Handle Errors Once

Handle at the appropriate layer. Don't catch-log-rethrow.

```python
# BAD - catch-log-rethrow (logs duplicate, loses stack trace context)
try:
    result = api_call()
except ApiError as e:
    logger.error(f"API failed: {e}")  # handler will log again
    raise  # pointless

# GOOD - handle once
try:
    result = api_call()
except ApiError as e:
    # Either handle here (retry, fallback, user message)
    # OR let it propagate to the layer that handles it
    raise UserFacingError("service temporarily unavailable") from e
```

---

## 5 Anti-Patterns

### 1. Empty Catch Blocks

```java
// NEVER acceptable
try {
    file.delete();
} catch (Exception e) {
    // nothing
}
```

At minimum: log it. Better: handle it or remove the try/catch.

### 2. Overly Broad Catches

```python
# BAD
try:
    user = create_user(data)
except Exception:
    return error("failed")

# GOOD
try:
    user = create_user(data)
except DuplicateEmailError:
    return conflict("email exists")
except ValidationError as e:
    return bad_request(str(e))
```

### 3. Losing Original Exception

```go
// BAD - original error lost
result, err := process(input)
if err != nil {
    return fmt.Errorf("processing failed")  // no %w, original gone
}

// GOOD - wrapped
result, err := process(input)
if err != nil {
    return fmt.Errorf("processing failed: %w", err)
}
```

### 4. Using Exceptions for Flow Control

```python
# BAD - exception as if/else
def get_user(user_id):
    try:
        return db.query(User).get(user_id)
    except NoResultFound:
        return None

# GOOD - explicit check
def get_user(user_id):
    user = db.query(User).get(user_id)
    if user is None:
        return None
    return user
```

Exceptions are for exceptional conditions, not expected branches.

### 5. Ignoring Return Values

```javascript
// BAD - promise rejection ignored
fetchUser(id).then(user => console.log(user));
// What if fetchUser fails? Unhandled rejection.

// GOOD
fetchUser(id)
    .then(user => console.log(user))
    .catch(err => logger.error("fetch failed", { id, err }));
```

---

## 3-Layer Error Architecture

### Layer 1: Application Errors (Global Handler)

Top-level handler catches everything that wasn't handled. Maps to HTTP responses, user messages, error codes.

```python
@app.error_handler
def handle_error(exc):
    if isinstance(exc, UserFacingError):
        return response(status=400, body={"error": str(exc)})
    if isinstance(exc, NotFoundError):
        return response(status=404, body={"error": "not found"})
    if isinstance(exc, AuthError):
        return response(status=401, body={"error": "unauthorized"})

    # Unknown error - log full details, return generic message
    logger.exception("unhandled error", exc_info=exc)
    return response(status=500, body={"error": "internal server error"})
```

```go
func ErrorHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if r := recover(); r != nil {
                log.WithError(err).Error("unhandled panic")
                http.Error(w, "internal error", 500)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

### Layer 2: Module Errors (Business Modules)

Each module defines its own error types. Catches infrastructure errors and wraps them.

```python
class PaymentModule:
    def process(self, order):
        try:
            return self.gateway.charge(order.amount)
        except GatewayTimeout:
            raise PaymentTimeoutError(order.id) from None
        except GatewayDeclined as e:
            raise PaymentDeclinedError(order.id, e.decline_code) from e
        except GatewayError as e:
            raise PaymentServiceError(order.id) from e
```

### Layer 3: Infrastructure Errors (Converted at Boundary)

Infrastructure errors are converted to domain errors at the module boundary. Never leak infrastructure details upward.

```java
// Infrastructure layer - raw exceptions
public User findUser(Long id) {
    try {
        return repository.findById(id)
            .orElseThrow(() -> new EmptyResultDataAccessException("user not found", 1));
    } catch (DataAccessException e) {
        throw new UserLookupError(id, e);  // convert at boundary
    }
}
```

---

## Logging Rules

| Level | When | Example |
|-------|------|---------|
| ERROR | Needs human attention now | Payment gateway down, data corruption |
| WARN | Auto-recoverable, monitor | Retry succeeded, degraded feature |
| INFO | Business event | User signed up, order placed |
| DEBUG | Debugging detail | Query parameters, cache hit/miss |

### Never Log

- Passwords, tokens, API keys
- PII (emails, names, addresses) in production logs
- Full request/response bodies with sensitive data
- Stack traces at INFO level (save for ERROR)

```python
# BAD - logs PII
logger.info(f"User {email} logged in from {ip}")

# GOOD - logs event without PII
logger.info("user login", extra={"user_id": user.id, "ip_hash": hash(ip)})
```

---

## Language-Specific Error Chaining

### Python (raise ... from)

```python
try:
    value = int(user_input)
except ValueError as e:
    raise ValidationError(f"invalid number: {user_input}") from e
# Traceback shows both exceptions chained
```

### Java (cause chain)

```java
try {
    config = parseConfig(data);
} catch (JsonParseException e) {
    throw new ConfigError("invalid config format", e);  // cause chain
}
```

### Go (%w wrapping)

```go
data, err := os.ReadFile(path)
if err != nil {
    return fmt.Errorf("config load: %w", err)
}
// errors.Is(err, os.ErrNotExist) still works through wrapping
```

### Rust (thiserror)

```rust
#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("not found: {entity} {id}")]
    NotFound { entity: String, id: i64 },
}
```

### C# (when filters)

```csharp
try {
    await http.SendAsync(request);
} catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.NotFound) {
    return null;
} catch (HttpRequestException e) {
    throw new ServiceUnavailableException("api call failed", e);
}
```

### Swift (Error enum)

```swift
enum AuthError: Error {
    case invalidCredentials
    case tokenExpired
    case networkFailure(underlying: Error)
}

do {
    try await login(username, password)
} catch AuthError.tokenExpired {
    try await refreshToken()
}
```

### TypeScript (custom Error class)

```typescript
class NotFoundError extends Error {
    constructor(public readonly entity: string, public readonly id: string) {
        super(`${entity} ${id} not found`);
        this.name = "NotFoundError";
    }
}

// Usage
function findUser(id: string): User {
    const user = db.users.get(id);
    if (!user) throw new NotFoundError("User", id);
    return user;
}
```

---

## Review Checklist

- [ ] No empty catch blocks (every catch has at least a log or rethrow)
- [ ] Catches are specific (not bare `except Exception` / `catch (Exception)`)
- [ ] Original exceptions preserved in chains (`from e` / `%w` / `initCause`)
- [ ] Errors handled at appropriate layer (not catch-log-rethrow)
- [ ] No exceptions for flow control (use return values for expected cases)
- [ ] Module boundaries convert infrastructure errors to domain errors
- [ ] Global handler catches unhandled errors with generic user message
- [ ] Logging follows levels (ERROR = human action, WARN = monitor, INFO = event)
- [ ] No secrets/PII in log output
- [ ] All promise rejections / futures handled
