# C++ Code Review Guide

## RAII

### Manual new/delete — CRITICAL

Raw `new`/`delete` without a matching guard is a leak or double-free. Use RAII owners.

```cpp
// CRITICAL — leak on early return
Foo* f = new Foo();
if (!init(f)) return;   // f leaked
delete f;

// GOOD — RAII
std::unique_ptr<Foo> f = std::make_unique<Foo>();
if (!f->init()) return;   // destructor runs on scope exit
```

### Ownership Transfer — HIGH

Bare owning raw pointers (returned by `new`, accepted "to own") are a leak source. Transfer with `unique_ptr`/`shared_ptr` or document transfer semantics.

### Resource Handles in structs — MEDIUM

FILE*, sockets, and fds need a destructor or RAII wrapper. A plain `int fd` member that isn't closed anywhere is a leak.

```cpp
// GOOD — RAII wrapper
class FileGuard {
  FILE* f_;
public:
  explicit FileGuard(const char* path) : f_(std::fopen(path, "r")) {}
  ~FileGuard() { if (f_) std::fclose(f_); }
  FileGuard(const FileGuard&) = delete;
};
```

---

## Smart Pointers

### unique_ptr for Exclusive Ownership — MEDIUM

Exclusive ownership should be `unique_ptr`, not `shared_ptr`. Shared ownership hides lifetime and adds atomic refcount cost.

### shared_ptr Cycles — HIGH

Two `shared_ptr` objects owning each other leak forever. Use `weak_ptr` for back-references or break the cycle manually.

```cpp
// BAD — cycle: A owns B, B owns A
struct A { std::shared_ptr<B> b; };
struct B { std::shared_ptr<A> a; };

// GOOD — one side weak
struct A { std::shared_ptr<B> b; };
struct B { std::weak_ptr<A> a; };
```

### make_shared / make_unique — LOW

Prefer `std::make_unique` / `std::make_shared` over `new` — exception-safe and (for shared) allocates control block with the object.

---

## Templates

### Template Explosion / Compile Time — MEDIUM

Deep recursive templates blow up compile time and binary size. Flag heavy metaprogramming where a plain function or a `consteval`/`if constexpr` would do.

### Concepts Over SFINAE — LOW

Prefer C++20 `requires` / concepts for readable constraints over `enable_if` gymnastics.

```cpp
// GOOD — readable constraint
template <typename T> requires std::integral<T>
T square(T x) { return x * x; }
```

### Missing `typename` / Forward Declarations — MEDIUM

Incorrect `typename` in dependent types, and `#include` walls that slow builds. Use forward declarations where ownership is by reference.

---

## Undefined Behavior Patterns

### Signed Integer Overflow — CRITICAL

Signed overflow is UB. Optimizers can "helpfully" remove the branch guarding it.

```cpp
// CRITICAL — signed overflow is UB
int total = std::numeric_limits<int>::max();
total += 1;   // UB

// GOOD — checked add
if (a > std::numeric_limits<int>::max() - b) { throw std::overflow_error(""); }
```

### Dangling References & Iterators — CRITICAL

Returning a reference into a temporary, or using an iterator after the container reallocated.

```cpp
// CRITICAL — reference into temporary
const std::string& s = getString();   // dangling if getString returns by value

// CRITICAL — iterator invalidated
auto it = vec.begin();
vec.push_back(1);   // may reallocate
use(*it);           // dangling
```

### Use-After-Free via raw capture — HIGH

Capturing `this` or a raw pointer by value in a lambda that outlives the object.

### Uninitialized Members — HIGH

Non-static data members without a default initializer or constructor init are indeterminate. Add default member initializers.

```cpp
// BAD — indeterminate until set
class Point { int x; int y; };

// GOOD
class Point { int x = 0; int y = 0; };
```

### int vs size_t / Signedness — MEDIUM

Mixing signed/unsigned in comparisons (`vec.size() > -1` is never false) and loop counters.

### Dereferencing End Iterators — CRITICAL

`*vec.end()`, `std::prev(vec.begin())` on empty — off-by-one at container edges.

### Strict Aliasing Violations — HIGH

Type-punning through `reinterpret_cast` on incompatible types. Use `std::bit_cast`, `memcpy`, or proper unions.

---

## Concurrency

### Data Races on Shared State — CRITICAL

Shared mutable state without a mutex/atomic. Run ThreadSanitizer in review.

```cpp
// BAD — race
int counter = 0;
// multiple threads: counter++

// GOOD
std::atomic<int> counter{0};
```

### Lock Ordering Deadlocks — HIGH

Locking two mutexes in different orders across threads. Consistent order (e.g., by address/id) prevents it.

### Condition Variable Without Predicate — HIGH

`wait` must loop on a predicate — spurious wakeups.

```cpp
// GOOD — predicate loop
std::unique_lock lk(m);
cv.wait(lk, [&]{ return ready; });
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Signed integer overflow | CRITICAL | Checked arithmetic, wide types |
| Dangling reference/iterator | CRITICAL | Return by value, re-fetch after mutation |
| Dereferencing end iterator | CRITICAL | Guard against empty/size |
| Raw `new`/`delete` | CRITICAL | RAII / smart pointers |
| Data race | CRITICAL | Mutex / atomics / TSan |
| `shared_ptr` cycle | HIGH | `weak_ptr` on one side |
| Use-after-free in lambda capture | HIGH | Capture value or weak handle |
| Uninitialized members | HIGH | Default member initializers |
| Strict aliasing `reinterpret_cast` | HIGH | `std::bit_cast` / `memcpy` |
| Missing move semantics | MEDIUM | Define moves or default them |
| Signed/unsigned mismatch | MEDIUM | Consistent types in comparisons |
| Lock ordering inconsistency | HIGH | Sort locks by address/id |
| Unbounded recursion | HIGH | Iterative forms or depth caps |