# GitHub Actions Workflow Templates

Real, copy-paste CI for the four supported stacks. Each workflow runs on push
to `main` and on pull requests. All four fail loudly on lint or test failure.

## TypeScript / Node

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

Notes: `npm ci` requires a committed `package-lock.json`. Pin the Node major
(`22`) unless the project tracks the current release; add
`node-version-file: .nvmrc` if the project carries an `.nvmrc`.

## Python

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.12', '3.13']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip
      - run: python -m pip install --upgrade pip
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: pytest
```

Notes: the matrix runs the suite on three Python minors. Drop the matrix to a
single version for personal projects. `pip install -e ".[dev]"` assumes
`pyproject.toml` with a `dev` extra (see `reference/templates/python-cli.md`).

## Go

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.24'
          cache: true
      - run: go build ./...
      - run: go vet ./...
      - run: go test ./...
```

Notes: `go build ./...` compiles every package. `go vet` catches static
issues; `gofmt -l .` can be added to fail on unformatted files:
`- run: test -z "$(gofmt -l .)"`.

## Rust

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt
      - uses: Swatinem/rust-cache@v2
      - run: cargo fmt --check
      - run: cargo clippy -- -D warnings
      - run: cargo test
      - run: cargo build --release
```

Notes: `cargo clippy -- -D warnings` escalates warnings to errors — the CI
gate that catches sloppy code. `rust-cache` is required for acceptable
workflow times on Rust projects.

## Stack → command mapping

| Stack | Install | Lint | Test |
|-------|---------|------|------|
| TypeScript | `npm ci` | `npm run lint` | `npm test` |
| Python | `pip install -e ".[dev]"` | `ruff check .` | `pytest` |
| Go | — | `go vet ./...` | `go test ./...` |
| Rust | — | `cargo clippy -- -D warnings` | `cargo test` |

## Rules

1. The first commit after `git init` must pass the workflow. No
   "CI will pass once X is fixed" scaffolding.
2. One workflow file per stack. Split deploy steps into a second
   `deploy.yml` only when a deploy target exists at init time.
3. Pin runner versions (`ubuntu-latest`, `actions/*@v4/v5`) — do not
   scaffold fragile `@master` refs.