# Contributing to SriFlow

How to add, modify, and test skills.

## Quick start

```bash
git clone <repo> sriflow
cd sriflow
bun install                    # install dependencies

# Skills are in my-stack/skills/
ls my-stack/skills/
```

Skills are discovered by Claude Code from `~/.claude/skills/sriflow-*/SKILL.md` (or the equivalent for other hosts). The install script (`install.sh`) copies symlinks.

## Skill anatomy

Every skill is a directory under `my-stack/skills/` containing a `SKILL.md` file:

```
my-stack/skills/
└── sriflow-think/
    └── SKILL.md
```

### SKILL.md structure

```markdown
---
name: sriflow-think
version: 2.0.0
description: 6 BA phases + office-hours forcing questions. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - think about this
  - ideation
  - start an idea
  - /sriflow-think
---

## When to invoke this skill

<One paragraph: what it does, when to use it, what it proactively suggests.>

## Preamble (run first)

\`\`\`bash
<Branch detection, session ID, memory read, config reads>
\`\`\`

## Plan Mode Safe Operations

<What's allowed in plan mode.>

## AskUserQuestion Format

<Decision brief format: D<N>, ELI10, stakes, recommendation, completeness, options.>

## Voice

<Direct, builder-to-builder. No filler.>

## Completeness Principle

<Do the complete thing.>

## Completion Status Protocol

<DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT>

## Confusion Protocol

<Stop on high-stakes ambiguity. Present options. Ask.>

## Workflow

<The actual skill logic, step by step.>

## Memory Write

\`\`\`bash
<Append to SRIFLOW_MEMORY.md>
\`\`\`
```

### Required sections

| Section | Purpose |
|---------|---------|
| Frontmatter | name, version, description, triggers, allowed-tools |
| When to invoke | Proactive suggestion logic |
| Preamble | Branch, session, memory, config |
| AskUserQuestion | Decision brief format |
| Voice | Communication style |
| Completeness | Do the whole thing |
| Completion Status | DONE/BLOCKED/etc. |
| Confusion Protocol | When to stop and ask |
| Workflow | Actual skill logic |
| Memory Write | Append to SRIFLOW_MEMORY.md |

## Adding a new skill

1. Create directory: `my-stack/skills/srirflow-<name>/`
2. Write `SKILL.md` with all required sections
3. Add trigger phrases to the router skill (`my-stack/skills/sriflow/SKILL.md`)
4. Run static validation: `bun run test:static`
5. Test manually in Claude Code
6. Add entry to this README's pipeline table

## Modifying an existing skill

1. Read the skill's `SKILL.md`
2. Make changes (preserve all required sections)
3. Run static validation: `bun run test:static`
4. Test in Claude Code
5. Update CHANGELOG.md

## Writing style

- Direct, builder-to-builder
- No corporate, academic, or hype language
- No AI vocabulary: delve, crucial, robust, comprehensive, nuanced
- Name files, functions, line numbers, commands
- Never narrate what code does

## Testing

```bash
# Static validation (free, fast)
bun run test:static

# Full test suite (free, excludes E2E + LLM-judge)
bun test

# E2E tests (requires API key, costs ~$3.85)
bun run test:e2e

# All tests including LLM-as-judge
bun run test:evals
```

### Test tiers

| Tier | Command | Cost | What it tests |
|------|---------|------|---------------|
| 1 — Static | `bun run test:static` | Free | SKILL.md structure, frontmatter, required sections |
| 2 — E2E | `bun run test:e2e` | ~$3.85 | Full skill execution via `claude -p` |
| 3 — LLM-judge | `bun run test:evals` | ~$0.15 | Doc quality scoring (clarity/completeness/actionability) |

## Multi-host support

Skills target Claude Code, OpenCode, and GitHub Copilot.

| Host | Skills dir | Frontmatter | Preamble |
|------|-----------|-------------|----------|
| Claude Code | `~/.claude/skills/sriflow-*/` | Full | Full bash |
| OpenCode | `~/.config/opencode/skills/sriflow-*/` | Full | Simplified |
| GitHub Copilot | `.github/copilot-skills/sriflow-*/` | Minimal | Simplified |

The install script (`install.sh`) detects which hosts are installed and copies to the correct directories.

## File layout

```
sriflow/
├── gstack/                        # reference clone — READ ONLY
├── ba-toolkit/                    # reference — READ ONLY
├── my-stack/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── ETHOS.md
│   ├── CONTRIBUTING.md
│   ├── DESIGN.md
│   ├── BROWSER.md
│   ├── CHANGELOG.md
│   ├── VERSION
│   ├── package.json
│   ├── install.sh
│   ├── browse/                    # TypeScript/Bun browser stack
│   │   ├── src/
│   │   ├── test/
│   │   └── build.ts
│   ├── lib/
│   │   ├── sriflow-browse.py      # Playwright wrapper (legacy)
│   │   └── sriflow-browse-daemon.py
│   ├── skills/
│   │   ├── sriflow/               # router
│   │   ├── sriflow-think/         # ideation
│   │   ├── sriflow-plan/          # planning
│   │   ├── sriflow-plan-review/   # plan review
│   │   ├── sriflow-design/        # design
│   │   ├── sriflow-build/         # build
│   │   ├── sriflow-code-review/   # code review
│   │   ├── sriflow-test/          # QA
│   │   ├── sriflow-browser/       # browser
│   │   ├── sriflow-ship/          # deploy
│   │   ├── sriflow-reflect/       # retrospective
│   │   ├── sriflow-memory/        # memory
│   │   └── sriflow-trim/          # speech + code optimization
│   └── test/
│       ├── helpers/
│       └── skill-*.test.ts
├── AGENTS.md
├── IMPLEMENTATION_PLAN.md
└── SRIFLOW_MEMORY.md
```

## Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test test/skill-validation.test.ts
bun test test/skill-parser.test.ts
bun test browse/test/commands.test.ts

# Verify a skill loads correctly
cat skills/sriflow-trim/SKILL.md | head -20
```

**Test coverage:**
- 12 unit tests (skill-parser.test.ts)
- 56 structural tests (skill-validation.test.ts)
- Browse command tests

**What tests verify:**
- All 13 skills exist with valid frontmatter
- All skills have required sections (Voice, Completeness, Completion Status, etc.)
- Browser commands are valid
- Cross-skill path consistency

## Things to know

- Skills are hand-written, not generated from templates.
- Every skill writes to `SRIFLOW_MEMORY.md` on completion.
- sriflow-trim is always active — speech compression + minimal code.
- Never edit files in `gstack/` or `ba-toolkit/` — they are read-only references.
- One skill at a time, personalization first (for new skills).
