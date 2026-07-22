# SriFlow

Fully custom AI-powered product development pipeline. From raw idea to deployed product.

```
think → plan → plan-review → design → build → code-review → test → ship → reflect
```

Every stage is a `/sriflow-*` slash command. Skills live in `skills/`. No runtime dependency on gstack.

## Quick start (3 commands)

```bash
# 1. Install (detects Claude Code / OpenCode / Copilot)
sh install.sh

# 2. Build browser binary
bun install && bun run build

# 3. Start in Claude Code
/sriflow          # routes to the right skill
```

## Install

### Claude Code

```bash
sh install.sh
# Installs to ~/.claude/skills/sriflow-*/
```

### OpenCode

```bash
sh install.sh
# Detects OpenCode, installs to ~/.config/opencode/skills/sriflow-*/
```

### GitHub Copilot

```bash
sh install.sh
# Detects Copilot, installs to .github/copilot-skills/sriflow-*/
```

### Browser binary (optional)

```bash
bun install && bun run build
# Produces browse/dist/browse (CLI wrapper) + browse/dist/server.js (daemon)
# Or run the one-shot setup: cd browse && ./setup
```

## Pipeline

| Stage | Command | What it does |
|-------|---------|-------------|
| **Ideation** | `/sriflow-init` | Scaffold new project (tech stack, CI/CD, git) |
| | `/sriflow-think` | 6 BA phases + gstack office-hours + ECC spec-miner + ruflo governance |
| **Planning** | `/sriflow-plan` | 6 BA phases + ADR-driven architecture (ruflo) + autoplan (gstack) |
| **Review** | `/sriflow-plan-review` | CEO + Design + Eng + (DX) + Council. 24 domain lenses (ECC). ruflo guidance |
| **Design** | `/sriflow-design` | CLI/TUI/Web/Mobile/Library/Service aware. gstack design-shotgun, design-consultation |
| **Build** | `/sriflow-build` | 12 language-specific error resolvers (ECC). gstack investigate. ruflo orchestration |
| **Code Review** | `/sriflow-code-review` | 24 language-specific guides (ECC). 6 lenses, 6 severity levels. Solo override |
| **Test** | `/sriflow-test` | TDD workflow (ECC). 14 QA patterns (gstack). Eval framework (ruflo). 80% coverage |
| **Browser** | `/sriflow-browser` | 70+ commands, stealth, cookie import (gstack). Headless Chromium |
| **Ship** | `/sriflow-ship` | 10 deploy targets (npm/pip/homebrew/vercel/fly/docker...). Canary, rollback |
| **Reflect** | `/sriflow-reflect` | 8-section retro. ECC instincts. gstack trends. Tier-based depth |
| **Memory** | `/sriflow-memory` | 10 JSONL backends. ruflo vector search patterns. ECC instinct system |
| **Trim** | `/sriflow-trim` | Always-on speech+code compression. ruflo token budget depth control |
| **Validate** | `/sriflow-validate` | Full agentskills spec compliance + sriflow extended fields. Cross-skill deps |

## Docs

| Doc | What it covers |
|-----|---------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, pipeline, browser daemon, security |
| [ETHOS.md](ETHOS.md) | Builder philosophy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Adding/modifying skills, testing |
| [DESIGN.md](DESIGN.md) | Design system, output formats |
| [BROWSER.md](BROWSER.md) | All 70 browser commands, snapshot system |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## Testing

```bash
# Static validation (free, fast)
bun run test:static

# Full test suite (free)
bun test
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
