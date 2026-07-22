# Python Code Review Guide

## Type Annotations

### Basic Annotations — LOW (informational)

Use type hints for function signatures. Enforce with `mypy` or `pyright`.

```python
# GOOD
def get_user(user_id: int) -> User | None:
    ...

# BAD — no hints
def get_user(user_id):
    ...
```

### TypeVar and Generic — MEDIUM

Use `TypeVar` for generic functions. Avoid `Any` unless truly necessary.

```python
# GOOD
T = TypeVar("T")

def first(items: Sequence[T]) -> T | None:
    return items[0] if items else None

# BAD — uses Any
def first(items):
    return items[0] if items else None
```

### Protocol for Structural Subtyping — MEDIUM

Prefer `Protocol` over ABC when you only care about shape, not inheritance.

```python
# GOOD
class Printable(Protocol):
    def __str__(self) -> str: ...

def print_item(item: Printable) -> None:
    print(str(item))
```

---

## Mutable Default Arguments

### Shared Mutable Defaults — CRITICAL

Mutable defaults are created once and shared across all calls.

```python
# CRITICAL — list shared across calls!
def add_item(item: str, items: list[str] = []) -> list[str]:
    items.append(item)
    return items

add_item("a")  # ['a']
add_item("b")  # ['a', 'b'] — NOT ['b']!

# GOOD — use None sentinel
def add_item(item: str, items: list[str] | None = None) -> list[str]:
    items = items if items is not None else []
    items.append(item)
    return items
```

### Mutable Default in Class — CRITICAL

Same issue with class attributes.

```python
# CRITICAL — shared across instances
class Config:
    settings: dict = {}  # all instances share this dict

# GOOD
class Config:
    def __init__(self) -> None:
        self.settings: dict = {}
```

---

## `is` vs `==`

### Integer Caching Gotcha — MEDIUM

Python caches small integers (-5 to 256). `is` may work by accident but fail for larger values.

```python
# BAD — unreliable for non-cached values
x = 257
y = 257
if x is y:  # False in CPython, True in some contexts
    ...

# GOOD — use == for value comparison
x = 257
y = 257
if x == y:  # always True
    ...

# CORRECT use of is — identity check
if x is None:  # correct
    ...
```

---

## Async Patterns

### Async Context Managers — MEDIUM

Use `async with` for resources that need async setup/teardown.

```python
# GOOD
async with aiohttp.ClientSession() as session:
    async with session.get(url) as resp:
        data = await resp.json()

# BAD — manual resource management
session = aiohttp.ClientSession()
resp = await session.get(url)
# missing cleanup
```

### TaskGroup for Structured Concurrency — MEDIUM

Prefer `TaskGroup` over manual `gather` for concurrent work.

```python
# GOOD
async with asyncio.TaskGroup() as tg:
    task1 = tg.create_task(fetch_user(user_id))
    task2 = tg.create_task(fetch_orders(user_id))

# BAD — no error propagation
results = await asyncio.gather(
    fetch_user(user_id),
    fetch_orders(user_id),
    return_exceptions=True,  # easy to miss errors
)
```

---

## Testing

### pytest Fixtures — MEDIUM

Use fixtures for setup. Scope fixtures appropriately (`session`, `module`, `function`).

### parametrize — LOW

Use `@pytest.mark.parametrize` over loops in tests.

```python
# GOOD
@pytest.mark.parametrize("input,expected", [
    ("hello", 5),
    ("", 0),
    ("  ", 2),
])
def test_string_length(input: str, expected: int) -> None:
    assert len(input) == expected

# BAD
def test_string_length() -> None:
    assert len("hello") == 5
    assert len("") == 0
    assert len("  ") == 2  # if one fails, rest don't run
```

### Mock and Patch — MEDIUM

Use `monkeypatch` or `unittest.mock.patch` for external dependencies. Prefer dependency injection over patching.

---

## Performance

### Set vs List for Lookups — LOW

Use `set` for membership checks. O(1) vs O(n).

```python
# GOOD
allowed = {"admin", "editor", "viewer"}
if user.role in allowed:
    ...

# BAD — O(n) lookup every time
allowed = ["admin", "editor", "viewer"]
if user.role in allowed:
    ...
```

### Generators Over Lists — LOW

Use generators for large datasets to avoid materializing the entire list.

```python
# GOOD
def get_large_ids():
    for user in db.query(User):
        yield user.id

# BAD — loads all into memory
def get_large_ids():
    return [user.id for user in db.query(User)]
```

### @lru_cache — LOW

Cache expensive pure functions. Don't cache methods with `self` unless you know the implications.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Mutable default argument | CRITICAL | Use `None` sentinel |
| Mutable class attribute | CRITICAL | Initialize in `__init__` |
| `is` for value comparison | MEDIUM | Use `==` for values, `is` for identity |
| Missing `__slots__` on large classes | LOW | Add `__slots__` for memory |
| `except Exception` silencing | HIGH | Log or re-raise |
| String concatenation in loops | LOW | Use `"".join()` or `io.StringIO` |
| Bare `except:` | CRITICAL | Catch specific exceptions |
| Importing inside function | LOW | Move to top unless circular |
