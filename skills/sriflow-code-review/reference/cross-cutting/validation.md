# Input Validation Guide

Language-agnostic review checklist. Apply to every PR that accepts input at an API, CLI, form, import, or any trust boundary.

---

## Core Principle

Every input is hostile until validated. Validation happens at the boundary — the moment untrusted data enters the system — not deep inside business logic where the originating source is no longer visible.

```
untrusted input ──► [boundary: type, shape, range, format] ──► validated domain data
```

---

## 5 Validation Layers

### 1. Type & Shape

Reject the wrong type before anything else. Never coerce silently.

```python
# BAD - silent coercion hides bugs
def create_order(count):
    count = int(count)  # "abc" -> ValueError deep in a 500

# GOOD - explicit boundary validation
def create_order(count: str) -> Order:
    try:
        parsed = int(count)
    except ValueError as e:
        raise ValidationError(f"count must be an integer, got {count!r}") from e
    if parsed <= 0:
        raise ValidationError("count must be positive")
```

```go
// BAD - trusting raw input
func handler(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    // id used directly in a query

// GOOD - parse at boundary
    id, err := strconv.ParseInt(r.URL.Query().Get("id"), 10, 64)
    if err != nil {
        http.Error(w, "invalid id", http.StatusBadRequest)
        return
    }
}
```

### 2. Range & Length

Bounds beyond the type. Numbers get min/max; strings get max length.

```python
# BAD - unbounded
def set_quantity(n: int):
    item.quantity = n  # negative quantities, million-item orders

# GOOD - bounds enforced at boundary
def set_quantity(n: int):
    if not 1 <= n <= 9999:
        raise ValidationError("quantity must be between 1 and 9999")
    item.quantity = n
```

String length limits prevent both abuse and storage surprises. A 10 MB "title" is never legitimate.

### 3. Format & Enum

Whitelist formats and allowed values. Enums over free text.

```python
# GOOD - enum, not free text
STATUSES = {"pending", "approved", "rejected", "cancelled"}
if status not in STATUSES:
    raise ValidationError(f"status must be one of {STATUSES}")

# GOOD - regex for structured strings
import re
if not re.fullmatch(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", email):
    raise ValidationError("invalid email format")
```

### 4. Semantic Validation

Format is valid but the value is nonsense in context.

- `ship_date` before `order_date`
- `amount` exceeding account balance
- `parent_id` referencing a nonexistent record
- deleted/discontinued SKU

Semantic checks live at the service layer (they need domain state) but must run before side effects.

### 5. Normalization & Canonicalization

Identical input must map to identical handling. This is the #1 path traversal defense.

```go
// BAD - user-controlled path used as-is
filepath.Join(uploadsDir, r.FormValue("filename"))

// GOOD - resolve and re-check the prefix
clean := filepath.Clean(r.FormValue("filename"))
full := filepath.Join(uploadsDir, clean)
if !strings.HasPrefix(full, uploadsDir) {
    http.Error(w, "invalid path", http.StatusBadRequest)
    return
}
```

Other canonicalization traps:
- Unicode lookalikes (`%EF%BC%A5` vs `E`) — normalize to NFC before matching
- Percent-encoding twice (`%252e%252e` → `..`)
- Case sensitivity for tokens and URLs

---

## 6 Common Pitfalls

### 1. Validate After Use

```python
# BAD - used before validated
data = db.query(User).filter_by(email=email).first()
if not valid_email(email):  # too late, already queried
    ...
```

### 2. Only Server-Side Counts

Client-side validation is UX, not security. Anyone can bypass the browser.

```python
# GOOD - the API validates again, always
class OrderSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=9999)
```

### 3. Truncation / Integer Overflow

Number inputs that silently overflow, or strings truncated mid-escape.

```javascript
// BAD - JS number precision loss on large ids
if (id > 9007199254740991) throw new Error("id exceeds safe integer range");
```

### 4. Validation Only in One Place

The same field validated in the controller but not the model means a second entry point (admin, import, script) bypasses it. Validate at the boundary that owns the data, or centralize.

### 5. Rejecting on First Error

Report all problems in one pass. Iterative validation makes API clients loop.

```python
# GOOD - collect errors, return them together
errors = []
if not 1 <= quantity <= 9999: errors.append("quantity out of range")
if status not in STATUSES:    errors.append(f"invalid status: {status!r}")
if errors:
    raise ValidationError(errors)
```

### 6. Error Message Leakage

Validation errors leak schema intent. Keep messages user-safe; log the detail server-side.

```python
# BAD - leaks table structure to the client
raise ValidationError(f"users.id does not exist: {user_id}")

# GOOD - generic client message, details in logs
raise ValidationError("invalid user reference")
logger.info("invalid user reference", extra={"user_id": user_id})
```

---

## Framework Notes

| Framework | Mechanism | Trap |
|-----------|-----------|------|
| FastAPI / Pydantic | `BaseModel` + field constraints | Unvalidated `**kwargs` passthrough |
| Express / Zod | Zod schemas at route | `z.object().passthrough()` lets unknown keys through |
| Django | DRF Serializers / ModelForm | Skipping `is_valid()` before `save()` |
| Spring | Bean Validation `@Valid` | `@Valid` on the DTO but not the nested field |
| Go | `encoding/json` + struct tags | Missing `required`/custom `UnmarshalJSON` for non-empty checks |
| Rails | Strong Parameters | Permit-all (`permit!`) or `params[:x]` direct access |
| Laravel | FormRequest + rules | `sometimes()` used to bypass required |

---

## Review Checklist

- [ ] Validation at every trust boundary (HTTP, CLI, import, queue consumer, LLM output)
- [ ] Type, range/length, format, and semantics each checked
- [ ] Whitelist over blacklist (enums and allowlists, not blocklists)
- [ ] Paths canonicalized and re-checked after `Clean`/`RealPath`
- [ ] Server-side validation never skipped because client validates
- [ ] No silent coercion or default that hides bad input
- [ ] All errors reported in one pass, not one-by-one
- [ ] Validation errors don't leak schema/structure to clients
- [ ] Unknown/extra fields rejected (or explicitly ignored with intent)
- [ ] Unicode normalized (NFC) for any comparison or lookup input
- [ ] Numeric bounds checked (no overflow, no negative without intent)