# Rust Build Error Resolver

## Toolchain commands

```
cargo build                 # debug build
cargo build --release       # optimized
cargo check                 # fast typecheck, no codegen — use first
cargo test                  # run tests
cargo clippy -- -D warnings # lints as errors
cargo fmt --check           # formatting check
cargo run --bin <name>      # run a binary
cargo add <crate>           # add dependency + fetch
```

First three moves on any Rust error:
1. `cargo check` — faster than `build` and surfaces the same type errors.
2. Read the FIRST error in a stack — later errors are often cascades.
3. `cargo clean` + rebuild only if you suspect incremental corruption; otherwise never.

## Common errors + fixes

### Borrow checker errors

**`cannot move out of index of Vec`** — indexing returns a place, and moving out of it is disallowed. Copy the value, clone it, or iterate with `into_iter()`.

```rust
let v = vec![String::from("a")];
// let s = v[0];        // error: cannot move out of index
let s = v[0].clone();   // ok
```

**`cannot move out of borrowed content`** — you have `&T` and tried to take `T`. Fix: `*t.clone()`, `t.to_owned()`, or deref-copy if `T: Copy`.

**`borrow of moved value`** — the value was moved into a call and you used it again. Reorder or use references/clone.

**`borrowed value does not live long enough`** — a reference outlives its owner (classic: returning a reference to a local, or a `&str` built from a temporary `String`). Store the `String` in the struct, don't hold `&str` to it, or use `Cow`.

**`lifetime may not live long enough`** — missing/excessively short lifetime on a fn/struct. Annotate, or restructure to own data instead of referencing it. For `fn` returning a reference, add `<'a>` tying input and output lifetimes.

**`cannot borrow X as mutable more than once at a time`** — two `&mut` to the same value. Restructure: index-based loops over a slice, or split borrows (`let (a, b) = slice.split_at_mut(n)`).

**`temporary value dropped while borrowed`** — a reference to a temporary. Bind the temporary to a named variable first.

### `E0277 the trait bound ... is not satisfied`

- `X: Debug` / `Clone` / `Send` / `Sync` missing on a type you use generically.
- Most common in `cargo build` for `async`: a future captured a non-`Send` type (e.g. `Rc` or a raw pointer). Make the captured data `Send` (use `Arc`, `Mutex`, owned data).
- Fix: derive/impl the trait, or change the data structure. Read the full diagnostic — it lists the missing trait and where.

### `no method named X found for ...`

- Method exists on a different type or on a trait not in scope — `use` the trait.
- Receiver type mismatch: `&self` vs `self` vs `&mut self`.
- Type is `Option<T>`/`Result<T>` — unwrap or `.map`/`.ok()` first.

### `cannot find type/function/crate X` (E0412 / E0433)

- Name typo or wrong path.
- Crate not added to `Cargo.toml`.
- Item not exported (`pub` missing, or module not declared with `pub mod`).
- Feature-gated: the crate exists but the feature enabling the API is off — check `Cargo.toml` features.

### `expected ';', found '{'` etc. (syntax)

- Missing `;` or misplaced `{}`. Match arms: a block without `=> {}` braces, or comma instead of `=>`.
- `if let`/`while let` patterns need a body block.
- Probably the error message shows the exact character — read the caret.

### Macro errors

- **`no rules expected the token X`** — macro called with wrong syntax. Check the macro's usage doc.
- **`cannot find macro X in this scope`** — trait/derive not imported, or the macro needs `#[macro_use]` (older style) or an explicit `use`.
- **Macro expansion panics** (e.g. `serde` on a type missing `Serialize`) — the real error is usually the `help:` line about the missing trait.
- Derive macros failing often indicate the struct contains a non-`Serialize`/`Deserialize`/`Debug` field — check field types.

### `E0507 cannot move out of a shared reference`

Tried to move out of `&T`. Clone/copy or take ownership at the call boundary.

### `use of moved value` after `?`/`unwrap`

An `Err` path consumed the value. Restructure so you don't need it after the early return, or clone beforehand.

## Cargo/config gotchas

| Gotcha | Fix |
|--------|-----|
| `the lock file needs to be updated` | Run `cargo update` or `cargo build` (auto-updates when `Cargo.lock` is allowed) |
| `failed to select a version for X` (conflict) | Two deps require incompatible versions. `cargo tree -i X` to find who pulls it; bump or `cargo update -p X` |
| `target 'x86_64-unknown-linux-gnu' not installed` | `rustup target add <target>` |
| `could not find <crate> in crates.io` | Private/renamed crate, or `git`/`path` dependency missing from `[dependencies]` |
| Checksum mismatch / corrupt cache | `cargo clean && cargo build` (rare) |
| `the `async` keyword is experimental` | Edition too old. Set `edition = "2021"` (or newer) in `Cargo.toml` |
| `proc-macro crate from a different edition` | Rebuild all: `cargo clean && cargo build` |
| Slow rebuilds | `CARGO_BUILD_JOBS`, keep dev-deps out of release profile, use `--release` for prod checks |
| `cannot find `main` entry point` | Binary target needs `fn main()` at `src/main.rs` or a declared `[[bin]]` path |

## Async gotchas

- **`future cannot be sent between threads safely`** — spawn a `tokio::spawn` with a non-`Send` future. Make captured data `Send` (no `Rc`, no raw pointers, use `Arc<Mutex<T>>`).
- **Missing runtime** — `tokio::main` attribute or an explicit `Runtime`. Calling `.await` outside a runtime panics.
- **Blocking calls inside async** — `std::thread::sleep` in a future blocks the executor. Use `tokio::time::sleep`.
- **`dyn Trait` not `Send` in `Box::new`** — add `+ Send` bounds to trait objects passed across `.await` points.

## Resolution ladder

1. `cargo check` — first error only.
2. If borrow/lifetime error, restructure data ownership before fighting the borrow checker with clones.
3. If trait bound error, read the full note (it lists the missing trait and blame location).
4. `cargo clippy -- -D warnings` for the lint class.
5. Rebuild. If intermittent "internal compiler error", `rustup update` then `cargo clean && cargo build`.