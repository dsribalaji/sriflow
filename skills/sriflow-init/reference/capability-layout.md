# Project Scaffolding Patterns

Conventions for
project structure, spec extraction, and continuous learning. sriflow-init
adopts the structure that makes these patterns work: flat entry points,
capability-oriented grouping, and an installable `CLAUDE.md`/rules layer.

## 1. Capability-oriented source layout

Code is grouped by capability, not by type chapter. A capability is a
cohesive cluster of related entry points and their backing directories.
Same service namespace = same capability.

```
<project>/
├── src/
│   ├── <capability>/          # kebab-case: orders, payments, user-auth
│   │   ├── <capability>.ts    # entry point: router / controller / facade
│   │   └── services/          # backing services
│   ├── index.ts               # app entry
│   └── <main-capability>.ts   # first-level deps point here
├── test/
├── docs/
└── CLAUDE.md                  # project rules layer (see below)
```

For CLI tools this collapses to: `src/bin/<cmd>.ts` (thin entrypoints),
`src/lib/<capability>.ts` (the logic). Keep entrypoints thin — they should
only parse arguments and delegate.

## 2. Spec-first brownfield bootstrap

When scaffolding onto an existing codebase, the brownfield extraction pass pulls a flat
list of behavioral assertions (Requirements + Invariants) into
`openspec/specs/<capability>/spec.md`. sriflow-init creates the target
directory when the project is a brownfield extraction:

- `specs/` directory scaffolded at init for brownfield projects
- Each capability gets one spec file, no type chapters
- Every behavioral assertion carries `id`, `entities`, `enforced` metadata

Init impact: scaffold `specs/` only when the user confirms an existing
codebase. Greenfield projects skip it.

## 3. Continuous-learning hooks (optional)

Instinct storage is installed via hooks. sriflow-init
does not install hooks, but scaffolds the `.sriflow/` project state dir so the
sriflow-memory skill has a home:

```
<project>/.sriflow/
└── instincts.jsonl     # optional; created on first instinct write
```

## 4. Rules layer convention

Project rules ship as markdown (`.claude/rules/*.md`). sriflow-init
scaffolds a single `AGENTS.md` per project by default, and offers an
`.claude/rules/` split only when the user asks for a multi-file rules layer.
Keep one source of truth: a rules layer that duplicates AGENTS.md is a
maintenance trap.

## 5. What init adopts / rejects

| Pattern | sriflow-init |
|-------------|--------------|
| Capability layout | ✅ Default `src/<capability>/` grouping |
| Thin entrypoints | ✅ CLI scaffolds: `src/bin/<cmd>` |
| Spec-first extraction | ⚠️ `specs/` dir only for brownfield |
| Instinct storage | ✅ `.sriflow/` state dir |
| Multi-file rules | ⚠️ Opt-in `.claude/rules/` split |
| Hook installation | ❌ Out of scope — sriflow-memory owns state |