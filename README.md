# SriFlow

A complete AI-agent workflow to ship products fast — from raw idea to deployed product, as 14 installable agent skills.

```
think → plan → plan-review → design → build → code-review → test → ship → reflect
```

Every stage is a `/sriflow-*` skill. Each skill is a self-contained `SKILL.md` with frontmatter, so any agent that supports the [Agent Skills format](https://agentskills.io/specification) can load them — Claude Code, OpenCode, GitHub Copilot, and others.

No runtime, no daemon, no dependencies. Just markdown instructions an agent can follow.

## Install

### Option A — one-line installer (Claude Code, OpenCode, Copilot)

```bash
sh install.sh
```

Detects installed agents and symlinks every skill into the right directory:

| Agent | Installs to |
|-------|-------------|
| Claude Code | `~/.claude/skills/` |
| OpenCode | `~/.config/opencode/skills/` |
| GitHub Copilot | `.github/copilot-skills/` |

Restart your agent, then invoke with `/sriflow` (router) or any stage skill.

### Option B — skills CLI

```bash
# from any repo that uses the skills CLI
npx skills add <owner>/sriflow --skill sriflow-plan
```

### Option C — manual

```bash
# copy the router + every skill you want into your agent's skills dir
cp -r skills/sriflow* ~/.claude/skills/
```

## The pipeline

| Stage | Skill | What it does |
|-------|-------|-------------|
| Router | `/sriflow` | Routes intent to the correct pipeline skill |
| Init | `/sriflow-init` | Scaffold new project (tech stack, CI/CD, git) |
| Think | `/sriflow-think` | Ideation: stakeholder map, uncertainty register, interview plan |
| Plan | `/sriflow-plan` | Implementation plan: 6 BA phases + ADR-driven architecture |
| Plan review | `/sriflow-plan-review` | CEO + Design + Eng lenses + council. Iterative improvement |
| Design | `/sriflow-design` | Candidates → pick → DESIGN.md → HTML → review |
| Build | `/sriflow-build` | Implements the approved design, language-aware |
| Code review | `/sriflow-code-review` | Diff review, 6 severity levels, 24 language guides |
| Test | `/sriflow-test` | TDD workflow: golden path → edges → errors → regression → visual |
| Ship | `/sriflow-ship` | Deploy to 10 targets (npm/pip/homebrew/vercel/fly/docker...). Canary, rollback |
| Reflect | `/sriflow-reflect` | End-of-cycle retrospective, tier-based depth |
| Memory | `/sriflow-memory` | Per-project JSONL memory: learnings, decisions, timeline, context |
| Trim | `/sriflow-trim` | Always-on speech + code compression |
| Validate | `/sriflow-validate` | Validates all skills against the Agent Skills spec |

## Usage

Start with the router — it tells you which skill to run next:

```
/sriflow        → routes to the right stage
/sriflow-plan   → "I have an idea, make a plan"
/sriflow-build  → "build the interface"
```

Each skill carries its own triggers, gates, and outputs in its frontmatter.

## Validate

```bash
scripts/validate-skills
```

Checks all 14 skills against the Agent Skills spec (name rules, required fields, allowed extended fields).

## Project state

Skills keep per-project state isolated by project slug under `~/.sriflow/projects/<slug>/` (JSONL learnings, decisions, timeline, context).

## License

Apache-2.0
