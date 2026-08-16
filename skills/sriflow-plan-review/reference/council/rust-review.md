# Council Lens — Rust Review

Domain lens applied by the plan reviewer when the plan's stack is Rust. Checks the plan for Rust-specific risks: ownership, lifetimes, error handling, `unsafe`, and the compiler's strictness as a schedule risk. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's Rust choices** so the ownership/borrow system and ecosystem realities are designed for, not fought against. Rust's compiler is the strictest — the plan must budget for that.

## What to check

### Ownership and design shape
- [ ] The plan's data-flow design respects ownership: single owner per value, moves over clones, borrows scoped tightly. If the plan sketches "shared mutable state", that is a CONCERN — it fights the borrow checker.
- [ ] `Rc`/`RefCell` (or `Arc`/`Mutex`) usage anticipated for shared state, and the interior-mutability hazard (`RefCell` panics on double-borrow) acknowledged.
- [ ] Lifetimes are emergent from design, not plastered on: if the plan needs elaborate lifetimes, the structure (self-referential types, graph cycles) is wrong for Rust.

### Error handling
- [ ] Error model named: `Result<T, E>` with `thiserror` for library errors, `anyhow` for application errors — or a hand-rolled enum. Which, and where the boundary is.
- [ ] The plan does not use `panic!`/`unwrap`/`expect` on fallible external input. A policy on `unwrap` (tests only) is in the design language.
- [ ] `?` operator is the propagation mechanism — no manual match-chain error handling for the happy path.

### unsafe policy
- [ ] `unsafe` is banned by default or gated behind a documented, reviewed boundary. Every `unsafe` block is justified (FFI, SIMD, hot-path perf) and commented with the invariants it upholds.
- [ ] If FFI is planned (C interop), the plan names: `unsafe` at the boundary, ownership transfer rules for the C API, and `repr(C)` layout discipline.

### Ecosystem and tooling
- [ ] Edition pinned (2021, or 2024 deliberately) and toolchain pinned (rust-toolchain.toml) — a floating nightly is a schedule risk.
- [ ] Cargo workspace structure for multi-crate, and dependency hygiene: `cargo audit` in CI for CVEs, `cargo deny` if licensing matters.
- [ ] The plan names the crates it expects to lean on (tokio, serde, clap, axum...) — the async runtime choice (tokio is default) is deliberate, not incidental.
- [ ] Build time acknowledged: Rust cold builds are slow; incremental build, `sccache` if large, and CI split across jobs.

### Concurrency
- [ ] Async (tokio) vs threads chosen deliberately. Async in Rust is not free — `Send`/`Sync` bounds across await points, `Arc<Mutex>` vs channel ownership.
- [ ] If async: no blocking calls on the async executor (std Mutex held across `.await`), channel-based design over shared state where possible.

### Testing realism
- [ ] Unit tests with `#[test]` are cheap and idiomatic — the plan should lean on them heavily (property-based with `proptest` for data-heavy logic).
- [ ] The test plan accounts for the compile-time cost of test binaries in a large workspace.
- [ ] Benchmarks (`criterion`) for the hot path if the plan's value proposition is performance — Rust chosen for speed must prove speed.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Shared-mutable-state design | Fight with the borrow checker for weeks | Burn at build |
| `unwrap` on input | Panic on unexpected data in prod | Burn at prod |
| Untracked `unsafe` | Undefined behavior with no invariants documented | Burn at prod / audit |
| Floating nightly | Breakage between toolchain updates | Burn at build |
| Blocking on async executor | Latency spikes under load | Burn at load test |
| Self-referential design | Lifetime error spiral, stuck refactor | Burn at build |

## Verdict guidance

- **9-10**: ownership shape natural to the domain, error model + unwrap policy explicit, `unsafe` gated, toolchain pinned, build time budgeted.
- **7-8**: solid Rust plan; one soft spot (e.g. error model implied, async choice unstated).
- **5-6**: Rust chosen for performance but ownership/concurrency design fights the language; no unsafe policy.
- **3-4**: C/Java thinking translated to Rust syntax — shared mutable state as default, `unwrap` everywhere.
- **0-2**: plan will be rewritten once the borrow checker is met.

**Block (score < 7) when:**
- The design centers on shared mutable state with no ownership plan.
- `unsafe` is used without a documented boundary policy.
- The async/threading model is undefined for a concurrent workload.

**Findings output format:**
```
rust-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```