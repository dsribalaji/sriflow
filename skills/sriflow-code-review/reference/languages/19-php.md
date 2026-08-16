# PHP Code Review Guide

## Type Declarations

### Missing Parameter/Return Types — MEDIUM

PHP 7+ supports scalar type hints and return types. Un-typed signatures defeat static analysis.

```php
// BAD — untyped
function calculate($amount, $rate) { ... }

// GOOD
function calculate(int $amount, float $rate): float { ... }
```

### Weak Types / Coercion Surprises — MEDIUM

In weak mode, `"12abc"` coerces to `12`. `declare(strict_types=1)` disables coercion for calls in that file — but only for that file.

```php
// GOOD — strict in the file
declare(strict_types=1);

function setQty(int $qty): void { ... }
setQty("5"); // TypeError under strict_types
```

### Mixed / Union for Explicit Nulls — LOW

Use `?Type` / `Type|null` / union types (`int|string`) explicitly rather than omitting the type.

### PHPStan/Psalm Level — MEDIUM

No static analysis config means type errors ship. Expect a level (8 is strict) in CI.

---

## Laravel Conventions

### Mass Assignment — CRITICAL

`$fillable` missing means Eloquent silently accepts arbitrary attributes via `create`/`update`. Conversely `$guarded = []` disables protection entirely.

```php
// CRITICAL — no fillable guard
$user = User::create($request->all()); // attacker sets role=admin

// GOOD — guarded
$user = User::create($request->only(['name', 'email']));
```

### N+1 Without `with()` — HIGH

Lazy-loading relations in a loop queries per row. Use `with('relation')` / `load`.

```php
// BAD — N+1
$orders = Order::all();
foreach ($orders as $order) { echo $order->product->name; }

// GOOD
$orders = Order::with('product')->get();
```

### Query Builder Raw Concatenation — CRITICAL

String-built SQL via `whereRaw`, `DB::select`, `selectRaw` with interpolation is injection.

```php
// CRITICAL
$q->whereRaw("id = $id");

// GOOD — bindings
$q->whereRaw("id = ?", [$id]);
// or the query builder
$q->where('id', $id);
```

### Controllers Doing Too Much — MEDIUM

Fat controllers with business logic and no FormRequest/Service classes. Move validation to FormRequest, logic to services.

### Validation in Controllers Instead of FormRequest — MEDIUM

`$request->validate()` in a controller duplicates rules across endpoints. Centralize in FormRequest classes.

### Unscoped Queries — HIGH

Eloquent queries without `where('user_id', ...)` / global scopes expose other tenants' rows.

```php
// BAD — no scope
$order = Order::find($id);

// GOOD — scoped
$order = auth()->user()->orders()->findOrFail($id);
```

### Queue Job Without Timeout/Retry Config — MEDIUM

Jobs that can run long need `timeout`, `tries`, and idempotency (they retry and re-run).

---

## Security

### SQL Injection — CRITICAL

Raw queries with concatenation (`"SELECT ... $var"`, `DB::raw("... $var")`) — always parameterize or use the query builder.

### XSS via Unescaped Output — CRITICAL

`echo $userInput` and `{!! $var !!}` render raw HTML. Use `{{ }}` escaping in Blade, and validate/encode on input for storage.

```blade
{{-- CRITICAL --}}
{!! $user->bio !!}

{{-- GOOD --}}
{{ $user->bio }}
```

### CSRF on State-Changing Routes — HIGH

Routes without the CSRF middleware (`web` group) or a disabled `VerifyCsrfToken` allow cross-site requests. Verify CSRF on all mutating endpoints.

### Unsafe Deserialization / eval — CRITICAL

`unserialize()` on user-controlled data and `eval()` on any string is RCE. Flag `unserialize` with external input and any `eval`.

```php
// CRITICAL — RCE/object injection
$data = unserialize($_COOKIE['data']);

// GOOD — JSON or validated
$data = json_decode($_COOKIE['data'], true);
```

### File Upload Path Traversal — HIGH

User-controlled filenames in `move_uploaded_file` / `$request->file('f')->store()` need sanitization and a restricted upload dir.

### Sensitive Data in Responses — MEDIUM

`$user->makeVisible('password')` and debug stack traces leaking env vars / DB credentials.

### Missing Rate Limiting — MEDIUM

Login and API endpoints without rate limits are brute-force targets. Use `throttle` middleware.

### Logging Secrets — HIGH

Logging passwords, tokens, and API keys in `Log::info` / `logger()`.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Raw SQL concatenation | CRITICAL | Bindings / query builder |
| `{!! !!}` unescaped output | CRITICAL | `{{ }}` escaping |
| Mass assignment (`$guarded=[]`) | CRITICAL | `$fillable` allowlist |
| `unserialize`/`eval` on input | CRITICAL | JSON / never eval |
| Unscoped queries | HIGH | Scope by auth user |
| N+1 lazy loading | HIGH | `with()` eager loading |
| No CSRF on mutations | HIGH | CSRF middleware |
| Upload path traversal | HIGH | Sanitize, restricted dir |
| Missing strict_types | MEDIUM | `declare(strict_types=1)` |
| No FormRequest validation | MEDIUM | Centralize rules |
| Un-typed signatures | MEDIUM | Add scalar + return types |
| Rate limiting missing | MEDIUM | `throttle` |
| Secrets in logs | HIGH | Scrub sensitive fields |