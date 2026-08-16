# Project Structure Conventions

Project structure conventions adopted by sriflow-init. This file captures the durable
structure decisions.

## 1. Repo skeleton

Repos keep a flat, predictable top level — every entry point is
discoverable from the root listing:

```
<project>/
├── bin/                    # helper CLIs (one executable per concern)
├── skills/<name>/          # one dir per skill, each with SKILL.md
├── scripts/                # repo-level shell scripts
├── test/                   # tests live outside src
├── .github/workflows/      # CI
├── AGENTS.md               # operating manual for agents
├── ARCHITECTURE.md         # system design
├── ETHOS.md                # builder philosophy (optional)
├── CHANGELOG.md            # version history
├── VERSION                 # plain-text version
├── README.md
└── LICENSE
```

## 2. One executable per concern

`bin/` files are standalone CLIs, not scripts that need a build step.
They are copied/installed to a `dist/` or `$PATH` location on build.
Each reads config from a single source (`config.yaml`), never from
scattered env vars.

sriflow-init mirrors this: CLI projects scaffold a `bin/` entrypoint that
forwards to the real implementation, keeping the executable stable while the
logic moves.

## 3. Config with defaults

Config has a documented key → default → purpose table. sriflow-init
scaffolds a minimal `config.yaml` only when the project has runtime config
(a service, TUI, or library with knobs). CLI tools without config get none —
empty config files are noise.

## 4. CI as a first-class citizen

CI is treated as part of the scaffold, not an afterthought. Every stack
gets a GitHub Actions workflow at init time (see
`reference/templates/ci-github-actions.md`). The workflow must fail loudly on
lint + test, and the repo must be in a state where that workflow passes on
commit #1.

## 5. Memory / state lives outside the repo

Sessions, learnings, and analytics live in a home-state dir, never in the
repo. sriflow-init keeps this boundary: the repo stays clean; per-project
state goes to `~/.sriflow/projects/<slug>/` via sriflow-memory.

## 6. What init adopts / rejects

| Pattern | sriflow-init |
|----------------|--------------|
| Flat discoverable root | ✅ Default layout |
| `bin/` executables | ✅ CLI scaffolds |
| Config with defaults table | ⚠️ Only when runtime config exists |
| CI at init | ✅ Always |
| State outside repo | ✅ `~/.sriflow/` |
| Update-check / telemetry preambles | ❌ Stripped — no runtime deps |