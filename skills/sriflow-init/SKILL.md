---
name: sriflow-init
preamble-tier: 2
version: 1.0.0
category: pipeline
related: sriflow-think
description: "Zero-to-project scaffolding. Detects tech stack, scaffolds directory structure, creates git repo, sets up CI/CD, generates README. Not for: ideation — use sriflow-think."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - new project
  - start a project
  - initialize
  - scaffold
  - init
  - set up a new repo
  - /sriflow-init
next-skill: /sriflow-think
outputs:
  - Project directory with src/, test/, docs/
  - .gitignore (per language)
  - README.md (per project type)
  - CI/CD scaffold (GitHub Actions)
  - SRIFLOW_MEMORY.md
  - Initial git commit
---

# /sriflow-init — Project Initialization

## When to invoke

Start here for every new project. Run before `/sriflow-think`. Detects or asks for project type, tech stack, scaffolds the full directory structure, creates git repo, sets up CI, and writes project docs. One command from zero to ready.

## Workflow

### Step 0 — Preamble
Run shell preamble for branch, session, plan-mode detection.
```
export SRIFLOW_PROJECT_NAME=""   # set from user answer
export SRIFLOW_PROJECT_TYPE=""   # CLI | TUI | Web | Mobile | Library | Service
export SRIFLOW_TECH_STACK=""     # typescript | python | go | rust | java | kotlin | cpp | multi
export SRIFLOW_PROJECT_DIR=""    # absolute path
```

### Step 1 — Project identity
Ask D1:
- **Project name** (kebab-case, lowercase)
- **One-line description** (what it does)
- **Location** (defaults to `./<name>`)

### Step 2 — Project type & tech stack
Detect from user description or ask:
- **CLI** → ask TypeScript/Node, Python, Go, Rust. Scaffold bin entry, command framework.
- **TUI** → ask Rust (ratatui), Go (bubbletea), TypeScript (ink/react-terminal). Scaffold TUI skeleton.
- **Web** → ask Next.js, Express, FastAPI, Django, Rails, Gin. Scaffold full-stack skeleton.
- **Mobile** → ask React Native, Flutter, SwiftUI, Kotlin Compose.
- **Library** → ask npm/Python/Rust/Cargo. Scaffold entry point, test framework.
- **Service** → ask FastAPI, Express, Go Gin, Axum. Scaffold health endpoint, Dockerfile.

Full per-stack scaffolds: `Read reference/templates/<type>/<stack>/`

### Step 3 — Scaffold directory structure
Create the project skeleton. Minimum common structure:
```
<project>/
├── src/                     # source code
├── test/                    # tests
├── docs/                    # documentation
├── .github/workflows/      # CI
├── .gitignore              # per-stack
├── README.md               # generated from type/stack
├── LICENSE                 # user choice (MIT, Apache-2.0, GPL-3.0, Unlicense)
├── SRIFLOW_MEMORY.md        # initialized
└── <config files>          # per-stack (tsconfig.json, Cargo.toml, pyproject.toml, etc.)
```

### Step 4 — CI/CD scaffold
Create GitHub Actions workflow for the stack:
- **TypeScript**: `npm ci && npm run build && npm test`
- **Python**: `pip install && pytest`
- **Go**: `go build && go test ./...`
- **Rust**: `cargo build && cargo test`

Full CI templates: `Read reference/templates/ci/github-actions.md`

### Step 5 — Git init
```bash
cd <project-dir>
git init
git add -A
git commit -m "Initial scaffold: <project-name> [<type>/<stack>]"
```

### Step 6 — Suggest next step
```
SRIFLOW_PROJECT: <name> initialized at <path>
Tech: <type>/<stack>
Next: /sriflow-think — define what we're building
```

## Reference files

| File | Content |
|------|---------|
| `reference/templates/typescript-cli.md` | TypeScript CLI scaffold (commander, vitest, biome) |
| `reference/templates/python-cli.md` | Python CLI scaffold (click, pytest, ruff) |
| `reference/templates/go-cli.md` | Go CLI scaffold (cobra, testing) |
| `reference/templates/rust-cli.md` | Rust CLI scaffold (clap, cargo test) |
| `reference/templates/typescript-web.md` | Next.js/Express scaffold |
| `reference/templates/python-web.md` | FastAPI/Django scaffold |
| `reference/templates/ci-github-actions.md` | GitHub Actions workflow templates |
| `reference/templates/gitignore.md` | Per-stack .gitignore templates |
| `reference/templates/license.md` | License file templates |
| `reference/templates/readme.md` | README.md template per project type |
| `reference/gstack-patterns.md` | gstack project structure conventions absorbed |
| `reference/ecc-patterns.md` | ECC project scaffolding patterns absorbed |
| `reference/ruflo-patterns.md` | ruflo monorepo structure patterns absorbed |

## Voice
Direct, builder-to-builder, compressed. No AI vocabulary. Name files and paths exactly.

## Completion Status
- **DONE** — project scaffolded, git init, CI set up.
- **DONE_WITH_CONCERNS** — scaffolded but non-critical gaps.
- **BLOCKED** — cannot proceed (e.g., invalid path).
