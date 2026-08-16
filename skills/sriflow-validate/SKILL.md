---
name: sriflow-validate
preamble-tier: 2
version: 3.0.0
category: utility
related: sriflow (router), all skills
description: "Validates all skills against the Agent Skills specification + sriflow extended fields. Not for: writing skills — use a text editor. Not for: running the pipeline — use the individual sriflow-* skills."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - validate skills
  - check skills
  - skill health
  - /sriflow-validate
---

# /sriflow-validate — Full SKILL.md Validation

## When to invoke

After creating or modifying any skill. Validates all SKILL.md files against the [Agent Skills specification](https://agentskills.io/specification) + sriflow extended fields. Checks: frontmatter schema, directory structure, reference file integrity, cross-skill dependencies.

## Validation categories

### 1. Frontmatter spec compliance
| Check | Rule | Source |
|-------|------|--------|
| `name` | lowercase, hyphens, matches directory name | spec |
| `description` | required, max 150 chars | spec |
| `allowed-tools` | valid tool names only | spec |
| `compatibility` | environment requirements | spec |
| `triggers` | required for invocation | spec |
| `version` | semver format | sriflow extended |
| `category` | one of: pipeline, utility | sriflow extended |
| `related` | valid skill names only | sriflow extended |
| `outputs` | file paths that exist or will exist | sriflow extended |
| `gate` | has both rule and signal | sriflow extended |
| `prerequisite` | valid skill name | sriflow extended |
| `next-skill` | valid skill name | sriflow extended |

### 2. Directory structure
- SKILL.md exists in each skills/<name>/ directory
- All reference/ files referenced in SKILL.md exist
- No orphan reference files (files not referenced by any SKILL.md)
- No broken cross-skill references

### 3. Cross-skill dependency validation
- All `prerequisite` skills exist
- All `next-skill` values exist
- All `related` skill names exist
- Pipeline ordering is consistent (no circular deps)

### 4. Format compliance details (full spec)

| Rule | Description |
|------|-------------|
| YAML frontmatter | Valid YAML, `---` delimiters |
| Frontmatter fields | Only recognized fields |
| Max description length | ≤150 characters |
| Allowed tools | Subset of available tools |
| Triggers | At least 1 trigger |
| Reference integrity | Every `Read reference/X.md` target exists |
| No hardcoded secrets | No API keys, tokens, passwords in SKILL.md |

## Reference files

| File | Content |
|------|---------|
| `reference/spec/agentskills-schema.md` | Full YAML frontmatter schema (all fields, types, constraints) |
| `reference/spec/sriflow-extensions.md` | sriflow extended fields (preamble-tier, gate, outputs, etc.) |
| `reference/spec/validation-rules.md` | Complete validation rule set |
| `reference/spec/example-valid.md` | Example of a valid SKILL.md |
| `reference/spec/example-invalid.md` | Examples of invalid patterns |

## Workflow
1. Enumerate all skills/ directories
2. For each: parse YAML frontmatter, validate all fields
3. Reference integrity scan
4. Cross-skill dependency check
5. Report findings (PASS/WARN/FAIL per skill)
6. Write VALIDATION_REPORT.md if failures found

## Completion Status
- **DONE** — all checks pass.
- **DONE_WITH_CONCERNS** — warnings exist.
- **BLOCKED** — validation failures found.
