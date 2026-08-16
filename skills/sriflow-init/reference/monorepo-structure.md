# Monorepo Structure Patterns

Monorepo conventions for projects that need to host multiple
packages, tools, or plugins under one roof. The pattern follows a
minimal core with everything optional pushed into plugins.

## 1. Microkernel core + plugin packages

The framework keeps a minimal core (agent lifecycle, task execution, memory,
coordination) and pushes everything optional into plugins with a stable
interface. The monorepo shape:

```
<project>/
├── packages/
│   ├── core/            # minimal, no optional features
│   ├── <feature>-pkg/   # one package per optional feature
│   └── cli/             # thin user-facing wrapper
├── crates/              # Rust workspace members (if any)
├── bin/                 # installed executables
├── data/                # state, never committed
├── docs/                # ADRs live here (see 3)
├── AGENTS.md            # operating manual
├── CLAUDE.local.md      # machine-local overlay (never committed)
├── Cargo.toml           # workspace root
├── package.json         # workspace root
└── CHANGELOG.md
```

sriflow-init uses this shape when the project type is **Library** or
**Service** with more than one deliverable. Single-binary CLIs stay flat.

## 2. ADR-driven decisions

Every architectural decision is recorded as an ADR:
`docs/adrs/ADR-###-TITLE.md`, template Context → Decision → Implementation →
Consequences → Related ADRs. sriflow-init scaffolds `docs/adrs/` for any
project with a `docs/` dir, and seeds it with a template file so the first
decision has a place to land. ADR numbering is zero-padded, starting at 001.

## 3. State directory is disposable

Runtime state (`data/`, `~/.claude-flow/`) is kept out of the repo and
treated as regenerable. sriflow-init creates `.gitignore` entries for all
state dirs and never scaffolds a committed state file. If a project needs
seeded data, it goes in a `fixtures/` dir with a loader, not in `data/`.

## 4. Compile → enforce → prove → evolve

The governance model compiles `AGENTS.md`/`CLAUDE.md` into machine-checked
rules. sriflow-init's contribution: keep the agent rules file small and
unambiguous so it can be enforced (see
`reference/patterns/governance.md` in sriflow-think). A scaffolded
AGENTS.md with vague prose is a liability, not a feature.

## 5. What init adopts / rejects

| Pattern | sriflow-init |
|---------------|--------------|
| Microkernel + plugins | ⚠️ Multi-package Library/Service only |
| ADR directory | ✅ `docs/adrs/` scaffolded |
| Disposable state | ✅ State gitignored, never committed |
| Workspace roots (Cargo/package.json) | ⚠️ Only for multi-package projects |
| Rust federation / WASM | ❌ Out of scope for init scaffolds |
| Hook/worker daemons | ❌ sriflow-memory owns runtime state |