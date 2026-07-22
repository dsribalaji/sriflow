# Rust Code Review Guide

## Ownership and Borrowing

### Ownership Violations — CRITICAL

Rust enforces single ownership. Violations won't compile — but workarounds (clone, Rc) may hide real issues.

```rust
// CRITICAL — moved value used after move
fn main() {
    let s = String::from("hello");
    let s2 = s;
    println!("{}", s); // ERROR: value used after move
}

// GOOD — clone when you need both
fn main() {
    let s = String::from("hello");
    let s2 = s.clone();
    println!("{} {}", s, s2);
}
```

### Borrowing Rules — HIGH

Only one mutable reference OR many immutable references at a time.

```rust
// CRITICAL — two mutable references
let mut data = vec![1, 2, 3];
let r1 = &mut data;
let r2 = &mut data; // ERROR

// GOOD — separate scopes
let mut data = vec![1, 2, 3];
{
    let r1 = &mut data;
    r1.push(4);
}
{
    let r2 = &mut data;
    r2.push(5);
}
```

### Lifetime Annotations — MEDIUM

Lifetimes ensure references don't outlive their data. When ambiguous, annotate explicitly.

```rust
// GOOD — explicit lifetime
fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str {
    if s1.len() > s2.len() { s1 } else { s2 }
}

// BAD — missing lifetime, won't compile
fn longest(s1: &str, s2: &str) -> &str {
    if s1.len() > s2.len() { s1 } else { s2 }
}
```

---

## Unsafe Code

### Minimize Unsafe — HIGH

Every `unsafe` block must have a comment explaining why it's needed and what invariants it maintains.

```rust
// GOOD — documented unsafe
// SAFETY: `ptr` is valid for writes and properly aligned.
// Caller guarantees `len` matches the allocation.
unsafe {
    std::ptr::write(ptr, value);
}

// BAD — undocumented unsafe
unsafe {
    std::ptr::write(ptr, value);
}
```

---

## Error Handling

### thiserror for Custom Errors — MEDIUM

Use `thiserror` for library errors. Use `anyhow` for application errors.

```rust
// GOOD — thiserror
#[derive(Debug, thiserror::Error)]
enum UserError {
    #[error("user not found: {0}")]
    NotFound(String),
    #[error("permission denied")]
    PermissionDenied,
}
```

### Unwrap in Production — CRITICAL

Never use `unwrap()` in production code. Use `?` or proper error handling.

```rust
// CRITICAL — panics on error
let file = File::open("data.txt").unwrap();

// GOOD — propagates error
let file = File::open("data.txt")?;

// GOOD — unwrap with context in tests/examples
let file = File::open("data.txt").expect("data.txt must exist");
```

---

## Async / Await

### Tokio Patterns — MEDIUM

Use `tokio` for async runtime. Don't block the async runtime with sync code.

```rust
// GOOD — async file I/O
let content = tokio::fs::read_to_string("data.txt").await?;

// BAD — blocks the runtime
let content = std::fs::read_to_string("data.txt")?;

// GOOD — spawn blocking work
let content = tokio::task::spawn_blocking(|| {
    std::fs::read_to_string("data.txt")
}).await??;
```

### Join vs Select — LOW

Use `tokio::join!` when you want all tasks. Use `tokio::select!` when you want the first.

---

## Common Mistakes

### Unnecessary Clone — MEDIUM

Cloning bypasses ownership. It's often a sign of incorrect ownership design.

```rust
// BAD — unnecessary clone
let data = Rc::new(get_data());
let data2 = data.clone(); // clone when Rc would suffice

// GOOD — pass reference
fn process(data: &Data) { ... }
```

### `unwrap()` in Libraries — CRITICAL

Libraries should never panic. Return `Result` instead.

```rust
// CRITICAL
pub fn parse(input: &str) -> Parsed {
    input.split(',').map(|s| s.parse().unwrap()).collect()
}

// GOOD
pub fn parse(input: &str) -> Result<Parsed, ParseError> {
    input.split(',').map(|s| s.parse()).collect()
}
```

### String vs &str — LOW

Use `&str` for borrowed strings. Use `String` only when you need ownership.

```rust
// GOOD
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

// BAD — takes ownership unnecessarily
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
```

### Iter Without Collect — LOW

Rust iterators are lazy. Don't collect unnecessarily.

```rust
// GOOD — lazy
let sum: i32 = (0..1000).filter(|x| x % 2 == 0).sum();

// BAD — unnecessary collect
let evens: Vec<i32> = (0..1000).filter(|x| x % 2 == 0).collect();
let sum: i32 = evens.iter().sum();
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| unwrap() in production | CRITICAL | Use ? or match |
| Undocumented unsafe | HIGH | Add SAFETY comment |
| Unnecessary clone | MEDIUM | Fix ownership design |
| Blocking async runtime | HIGH | Use spawn_blocking |
| String where &str works | LOW | Use borrowed string |
| Missing lifetime annotations | MEDIUM | Add explicit lifetimes |
| &mut and & in same scope | CRITICAL | Separate scopes |
