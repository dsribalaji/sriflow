# README.md Template

Generated from the project type and stack in Step 2. Keep it honest: a README
that describes features that don't exist yet is a lie. For a greenfield
scaffold, fill the skeleton below; sections marked *(as built)* are filled by
sriflow-build as features land, not at init.

## Template

```markdown
# <Project Name>

<One-line description: what it does, for whom, in one sentence.>

## Status

🚧 Scaffolded — under active development. No stable API yet.

## Features

- [ ] <first planned feature>          *(as built)*
- [ ] <second planned feature>         *(as built)*

## Requirements

- <Runtime + version, e.g. "Node 22", "Python 3.11+", "Go 1.24", "Rust 1.75+">

## Install

```bash
# <install command — exact, per stack>
```

## Usage

```bash
# <one real example invocation — not placeholder text>
```

## Development

```bash
# install dev deps
# run tests
# run linter
```

## Test

```bash
<test command>
```

## License

MIT — see [LICENSE](LICENSE).
```

## Per-type adjustments

| Project type | README emphasis |
|--------------|-----------------|
| CLI | **Usage** first — examples dominate; skip Features depth |
| Library | **Install** + API example; document the one entry point |
| Web/Service | **Requirements**, env vars, local dev runbook |
| Mobile | Requirements (Xcode/Android SDK), device setup |
| TUI | Screenshot placeholder + keybindings table |

## Rules

1. Never write "Features" as prose claiming done work — use checkboxes.
2. The **Usage** block must be a real command that works on commit #1.
3. Every scaffolded README links the `LICENSE` file by name.
4. At init, write the skeleton. At the end of each later pipeline stage,
   sriflow-build/ship update the checkbox list — that is their job, not init's.