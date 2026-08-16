# Example: A Valid SKILL.md

A fully compliant SKILL.md. Every field here passes the rules in
`validation-rules.md` and `agentskills-schema.md`. Use it as the canonical
reference when authoring a new skill.

```markdown
---
name: sriflow-greeter
description: "Greets users and manages greeting history. Use when starting a session or when a user says hello. Not for: planning — use sriflow-plan."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
triggers:
  - hello
  - say hi
  - greet me
  - /sriflow-greeter
version: 1.2.0
category: utility
related: sriflow-memory
outputs:
  - GREETING_LOG.md
---

# /sriflow-greeter — Greeting Handler

## When to invoke

Invoke when the user greets the assistant or requests a greeting record.

## Workflow

1. Read the existing GREETING_LOG.md
2. Append a greeting entry with a timestamp
3. Reply with a confirmation

## Reference files

| File | Content |
|------|---------|
| `reference/templates/greeting.md` | Greeting message templates |
```

## Why it passes

| Check | Result |
|-------|--------|
| `name` | lowercase, hyphens, matches directory `sriflow-greeter` ✅ |
| `description` | present, <150 chars, has "what" + "when" + "not for" ✅ |
| `license` | valid value ✅ |
| `compatibility` | string, <500 chars ✅ |
| `allowed-tools` | all valid tool names ✅ |
| `triggers` | ≥1, includes `/sriflow-<name>` ✅ |
| `version` | semver `1.2.0` ✅ |
| `category` | `utility` ✅ |
| `related` | references an existing skill ✅ |
| `outputs` | file path that will exist ✅ |
| `gate` | absent — optional, so not required ✅ |
| Frontmatter | starts/ends with `---`, valid YAML mapping ✅ |
| Reference integrity | `reference/templates/greeting.md` exists in the skill dir ✅ |
| Secrets | none present ✅ |

## Practical notes

- Keep the frontmatter lean: only fields with real meaning. Empty optional
  fields (`metadata: {}`) are valid but discouraged.
- The body should let an agent run the skill without reading anything else
  beyond the reference files.
- The `description` reads as "does X, use when Y, not for Z" — one sentence,
  scannable.