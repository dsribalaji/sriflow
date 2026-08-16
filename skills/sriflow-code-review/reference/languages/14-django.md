# Django Code Review Guide

## ORM

### N+1 Queries — HIGH

Serializing a queryset triggers one query per related row. Use `select_related` (FK/OneToOne) and `prefetch_related` (ManyToMany/reverse).

```python
# BAD — 1 + N queries
orders = Order.objects.filter(user=request.user)
for order in orders:
    print(order.product.name)  # query per order

# GOOD — eager load
orders = Order.objects.filter(user=request.user).select_related("product")
for order in orders:
    print(order.product.name)
```

### Querying Inside Loops — HIGH

Any DB call inside a loop is a code smell. Restructure into a single annotated query.

### Field Lookups That Defeat Indexes — MEDIUM

`field__icontains` with a leading wildcard, `LOWER(field)` in `annotate`, or functions on indexed columns skip the index.

### Select_related vs prefetch — MEDIUM

`select_related` does a JOIN; `prefetch_related` does a second query with `IN`. Use the right tool — deep `select_related` chains create wide JOINs.

### Missing .only()/.defer() for Wide Rows — LOW

Large text/blob columns pulled on every list page bloat memory and latency. Defer heavy fields.

### Raw SQL Interpolation — CRITICAL

`raw()` with f-strings is injection. Use parameterized raw or ORM.

```python
# CRITICAL
Order.objects.raw(f"SELECT * FROM orders WHERE user_id = {user_id}")

# GOOD
Order.objects.raw("SELECT * FROM orders WHERE user_id = %s", [user_id])
```

---

## Migrations

### Hand-Edited Migrations With no Make — MEDIUM

Migrations are generated; hand-editing them often breaks `makemigrations` state. Review hand edits for correctness against the model.

### Dropping Columns Without Data Plan — HIGH

A migration that drops a column/data deletes it for everyone. Flag destructive operations: `DeleteModel`, `RemoveField`, `RunSQL` with `DELETE`/`DROP`.

```python
# HIGH — irreversible data loss
migrations.RemoveField(
    model_name="order",
    name="legacy_field",
)
```

### Missing Indexes on Hot Fields — MEDIUM

FKs used in filters and `ordering` need `db_index=True` or `Meta.indexes`. Review hot query paths against model indexes.

### RunPython Without Reverse — MEDIUM

Data migrations should be reversible or clearly marked irreversible. Provide `reverse_code` or `migrations.RunPython.noop`.

### Schema vs Data Migration — LOW

Pure schema changes go in generated migrations; data backfills in `RunPython`. Don't mix data logic into a schema migration where possible.

---

## DRF (Django REST Framework)

### Missing Permission Checks in Views — CRITICAL

A view without `permission_classes` or explicit object-level checks is open. Verify every endpoint has auth + object-level ownership checks.

```python
# GOOD — object-level check
class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)  # scoped
```

### Serializer for Output but Raw for Input — MEDIUM

Deserializing with `.save()` bypassing `is_valid()` lets unvalidated data through.

```python
# BAD — skips validation
serializer = OrderSerializer(data=payload)
order = serializer.save(force_insert=True)

# GOOD
serializer = OrderSerializer(data=payload)
serializer.is_valid(raise_exception=True)
serializer.save()
```

### QuerySet Not Scoped in List API — HIGH

`ListView`/`ReadOnlyModelViewSet` without `get_queryset` filtering exposes every row to every user. Always scope by the request user.

### Nested Serializers Causing N+1 — HIGH

Nested serializer fields (`SerializerMethodField`, nested `Serializer`) trigger per-row queries. Use `select_related`/`prefetch_related` in the queryset, or use `SerializerMethodField` with a single annotated query.

### Unbounded Pagination — MEDIUM

No `pagination_class`, or `PageNumberPagination` with huge `page_size`, lets clients page through everything. Cap page size.

### Update With Write-Only Secrets — MEDIUM

Password/token fields need `write_only=True` so they're never serialized back in responses.

---

## Middleware & Security

### Custom Middleware Ordering — MEDIUM

Middleware order in `MIDDLEWARE` matters (auth before views, common last). A middleware placed too early/late breaks invariants. Review placement.

### Open CORS / CSRF Bypass — CRITICAL

`CORS_ALLOW_ALL_ORIGINS = True`, `csrf_exempt` on production endpoints, or `@csrf_exempt` on mutating views are security regressions.

### DEBUG=True in Production — CRITICAL

Debug mode exposes settings, stack traces, and the admin console. It must be `False` with a `settings_prod` config.

### Sensitive Data in Logs/Emails — MEDIUM

`ADMINS` emailing 500s, and logging of `request.POST`, leaks passwords and tokens. Scrub sensitive fields.

### SECRET_KEY committed — CRITICAL

A hardcoded `SECRET_KEY` in settings or the repo enables session forgery. Load from env/secret manager.

### Session/Auth Cookie Flags — MEDIUM

`SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY` must be set in production.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Raw SQL f-string interpolation | CRITICAL | Parameterized raw / ORM |
| Missing permission checks | CRITICAL | `permission_classes` + scoped queryset |
| `DEBUG=True` in prod | CRITICAL | Config from env |
| Committed SECRET_KEY | CRITICAL | Secret manager / env |
| N+1 via serializer methods | HIGH | Eager loading / annotation |
| Unscoped list queryset | HIGH | Filter by request user |
| Skipping `is_valid()` | MEDIUM | Validate before save |
| Destructive migration | HIGH | Reverse plan, data backup |
| `csrf_exempt` mutating views | CRITICAL | Keep CSRF / token auth |
| Missing indexes | MEDIUM | Add for hot filter paths |
| Huge page_size | MEDIUM | Cap pagination |
| Write-only secrets serialized | MEDIUM | `write_only=True` |