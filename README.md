# SriFlow

Fully custom AI-powered product development pipeline. From raw idea to deployed product.

```
think → plan → plan-review → design → build → code-review → test → ship → reflect
```

Every stage is a `/sriflow-*` slash command. Skills live in `my-stack/skills/`. No runtime dependency on gstack.

## Quick start (3 commands)

```bash
# 1. Install
sh my-stack/install.sh

# 2. Build browser binary
cd my-stack && bun install && bun run build && cd ..

# 3. Start in Claude Code
/sriflow          # routes to the right skill
```

## Install

### Claude Code

```bash
sh my-stack/install.sh
# Installs to ~/.claude/skills/sriflow-*/
```

### OpenCode

```bash
sh my-stack/install.sh
# Detects OpenCode, installs to ~/.config/opencode/skills/sriflow-*/
```

### GitHub Copilot

```bash
sh my-stack/install.sh
# Detects Copilot, installs to .github/copilot-skills/sriflow-*/
```

### Browser binary (optional)

```bash
cd my-stack && bun install && bun run build
# Produces browse/dist/sriflow-browse (~58MB compiled binary)
```

## Pipeline

| Stage | Command | What it does |
|-------|---------|-------------|
| **Ideation** | `/sriflow-think` | 6 BA phases + office-hours forcing questions |
| **Planning** | `/sriflow-plan` | Structured implementation plan from ideation |
| **Review** | `/sriflow-plan-review` | CEO, Design, Eng lenses. Iterative improvement loop |
| **Design** | `/sriflow-design` | Candidates → pick → DESIGN.md → HTML → review |
| **Build** | `/sriflow-build` | Implements approved design |
| **Code Review** | `/sriflow-code-review` | 6-lens diff review. Blocks on CRITICAL |
| **Test** | `/sriflow-test` | QA: golden path, edges, errors, regression |
| **Browser** | `/sriflow-browser` | 58 commands, daemon, ref-based selection |
| **Ship** | `/sriflow-ship` | Merge, deploy, CI wait, smoke test |
| **Reflect** | `/sriflow-reflect` | End-of-cycle retrospective |
| **Memory** | `/sriflow-memory` | Per-project memory (auto-updated) |
| **Trim** | `/sriflow-trim` | Always-on: caveman speech + ponytail code |

## Docs

| Doc | What it covers |
|-----|---------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, pipeline, browser daemon, security |
| [ETHOS.md](ETHOS.md) | Builder philosophy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Adding/modifying skills, testing |
| [DESIGN.md](DESIGN.md) | Design system, output formats |
| [BROWSER.md](BROWSER.md) | All 58 browser commands, snapshot system |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## Testing

```bash
# Static validation (free, fast)
cd my-stack && bun run test:static

# Full test suite (free)
cd my-stack && bun test

# E2E tests (requires API key)
cd my-stack && bun run test:e2e

# All tests including LLM-as-judge
cd my-stack && bun run test:evals
```

## Project-Aware State

All project state is isolated by project slug:
```
~/.sriflow/
├── config.yaml
└── projects/
    ├── sriflow/
    │   ├── context.json
    │   ├── learnings.jsonl
    │   ├── decisions.jsonl
    │   ├── timeline.jsonl
    │   └── analytics.jsonl
    └── other-project/
```

## Platform support

| Platform | Status |
|----------|--------|
| macOS | Full support |
| Linux | Full support |
| Windows | Git Bash or WSL |

## License

Personal project. Not published.
