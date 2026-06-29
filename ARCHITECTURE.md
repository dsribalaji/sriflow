# Architecture

Why sriflow is built this way.

## The core idea

sriflow gives Claude Code (and other AI agents) a structured product development pipeline. Each stage is a standalone Markdown skill — no code, no frameworks, no runtime dependencies. The browser is the only component with a binary.

```
think → plan → plan-review → design → build → code-review → test → ship → reflect
```

Each skill feeds into the next. `/sriflow-think` writes ideation output that `/sriflow-plan` reads. `/sriflow-build` produces a diff that `/sriflow-code-review` analyzes. Nothing falls through because every step knows what came before.

## Pipeline architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  sriflow-   │────▶│  sriflow-   │────▶│  sriflow-   │
│    think     │     │    plan     │     │ plan-review │
└─────────────┘     └─────────────┘     └─────────────┘
                                                 │
                                                 ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  sriflow-   │◀────│  sriflow-   │◀────│  sriflow-   │
│    ship     │     │    test     │     │   design    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  sriflow-   │     │  sriflow-   │
│  reflect    │     │   build     │
└─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  sriflow-   │
                    │ code-review │
                    └─────────────┘
```

Every skill reads from and writes to `SRIFLOW_MEMORY.md`. The memory file is the shared state — it tracks pipeline stage, key decisions, and a timestamped log of every skill run.

## Memory system

Per-project isolation via project slug:

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

`SRIFLOW_MEMORY.md` lives in the project root. Structure:

- **Summary** — goal, stack, key decisions, current pipeline stage (auto-updated)
- **Log** — append-only timestamped entries per skill run
- **Auto-compress** — log > 50 entries → summarize oldest 40 into Summary

Every skill appends a log entry on completion. Auto-compression keeps the file from growing unbounded.

## Trim layer

sriflow-trim is always active. Two compressed layers:

1. **Caveman (speech)** — Drop articles, filler, hedging. Fragments OK. Short synonyms.
2. **Ponytail (code)** — YAGNI ladder. Stdlib first. Shortest working diff. Deletion over addition.

Every skill inherits trim. Code rules enforce minimal implementations. Speech rules keep runtime output tight.

## Browser architecture

TypeScript/Bun daemon, ported from gstack. Persistent Chromium, ~100ms per command.

```
Agent tool call: $B snapshot -i
        │
        ▼
┌──────────────────┐
│  CLI (compiled)  │
│  POST /command   │
│  to localhost    │
└────────┬─────────┘
         │ HTTP
┌────────▼─────────┐
│  Bun.serve()     │
│  dispatches cmd  │
│  talks to CDP    │
└────────┬─────────┘
         │ CDP
┌────────▼─────────┐
│  Chromium        │
│  persistent tabs │
│  cookies persist │
│  30min idle       │
└──────────────────┘
```

First call starts everything (~3s). Every call after: ~100-200ms.

Ref system: `@e1`, `@e2`, ... from ARIA tree. `@c1`, `@c2`, ... from cursor-interactive scan. Agent says `click @e3`, server resolves via Playwright Locator. No DOM mutation, no CSP issues.

## Multi-host support

Skills target three hosts:

| Host | Skills dir | Notes |
|------|-----------|-------|
| Claude Code | `~/.claude/skills/` | Primary. Full preamble, all tools. |
| OpenCode | `~/.config/opencode/skills/` | Simplified preamble. |
| GitHub Copilot | `.github/copilot-skills/` | Minimal frontmatter. |

Since skills are hand-written, multi-host means: universal frontmatter fields, conditional preamble logic, install script that detects host.

## Security model

Browser: localhost-only, bearer token auth (UUID, mode 0o600). No remote access by default. Unicode sanitization at server egress (lone surrogates → U+FFFD for Anthropic API compatibility).

Skills: no secrets in SKILL.md files. No API keys in skill output. Memory file excludes sensitive data.

## Error philosophy

Errors are for AI agents, not humans. Every error message must be actionable:

- "Element not found" → "Run `snapshot -i` to see available elements."
- "Nothing to review" → "On the base branch. Create a feature branch first."
- Timeout → "Navigation timed out. Page may be slow or URL wrong."

Playwright errors are rewritten to strip internal stack traces and add guidance. The agent should know what to do next without human intervention.

## What's intentionally not here

- **No CI/CD pipeline.** Personal project, no merge gates.
- **No telemetry.** No usage analytics, no remote reporting.
- **No multi-user support.** One server per workspace, one user.
- **No template system.** Skills are hand-written, not generated from `.tmpl`.
- **No prompt injection defense.** No sidebar agent, no ML classifier. Browser is local-only.
