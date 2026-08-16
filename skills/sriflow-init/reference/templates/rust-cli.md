# Rust CLI Scaffold (clap, cargo test)

clap for argument parsing (derive API), cargo as the build/test runner.
Layout:

```
<project>/
├── Cargo.toml
├── src/
│   ├── main.rs              # thin binary
│   ├── cli.rs               # clap derive structs
│   └── greet.rs             # logic — no parsing in here
└── tests/
    └── cli.rs               # integration tests (binary black-box)
```

## Cargo.toml

```toml
[package]
name = "<project>"
version = "0.1.0"
edition = "2021"

[dependencies]
clap = { version = "4", features = ["derive"] }

[profile.release]
strip = true
lto = true
```

`strip + lto` gives small release binaries — right for a personal CLI.

## src/cli.rs

```rust
use clap::Parser;

#[derive(Parser)]
#[command(name = "<project>", about = "<one-line description>")]
pub struct Cli {
    /// Name to greet
    #[arg(default_value = "world")]
    pub name: String,

    /// Number of greetings
    #[arg(short, long, default_value_t = 1)]
    pub count: u8,
}
```

## src/greet.rs

```rust
pub fn greet(name: &str, count: u8) -> String {
    let mut out = String::new();
    for _ in 0..count {
        out.push_str(&format!("Hello, {name}!\n"));
    }
    out
}
```

## src/main.rs

```rust
mod cli;
mod greet;

use clap::Parser;

fn main() {
    let cli = cli::Cli::parse();
    print!("{}", greet::greet(&cli.name, cli.count));
}
```

## Integration test (tests/cli.rs)

```rust
use std::process::Command;

#[test]
fn greets_with_count() {
    let out = Command::new(env!("CARGO_BIN_EXE_<project>"))
        .args(["Sri", "--count", "2"])
        .output()
        .expect("binary runs");
    assert!(out.status.success());
    let text = String::from_utf8_lossy(&out.stdout);
    assert_eq!(text, "Hello, Sri!\nHello, Sri!\n");
}
```

`env!("CARGO_BIN_EXE_<project>")` points at the built binary — real
end-to-end CLI tests without a shell. Run: `cargo test`.

## Unit test in greet.rs

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_name_defaults() {
        assert_eq!(greet("", 1), "Hello, !\n");
    }
}
```

## Build

```bash
cargo build --release
```

## CI

Workflow at `reference/templates/ci-github-actions.md` — Rust section
(`cargo fmt --check`, `clippy -D warnings`, `cargo test`).

## Init checklist

- [ ] clap derive CLI with at least one real flag
- [ ] logic in a separate module (no parsing in main)
- [ ] one integration test via `CARGO_BIN_EXE_`
- [ ] `.gitignore` `/target` (keep `Cargo.lock` committed)
- [ ] `cargo clippy -- -D warnings` clean on commit #1