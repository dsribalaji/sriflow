# SriFlow — AGENTS.md

## What this project is

**sriflow** is a set of 14 agent skills that form a product-development pipeline — from raw idea to deployed product. Every stage is a `/sriflow-*` skill under `skills/`. Skills are plain `SKILL.md` markdown with YAML frontmatter, following the Agent Skills spec.

```
think → plan → plan-review → design → build → code-review → test → ship → reflect
```

## How to work here

1. **Skills are the product.** Everything you change lives under `skills/<skill-name>/` — a `SKILL.md` plus a `reference/` directory of supporting docs each skill points to.
2. **Keep skills self-contained.** No runtime, no daemon, no build step, no external dependencies. If a skill needs a reference doc, it lives in that skill's `reference/` and is linked from a table in its `SKILL.md`.
3. **Frontmatter is load-bearing.** Agents read `name`, `description`, `triggers`, `gate`, `outputs`, `related`, `next-skill`, `allowed-tools` from the YAML. Keep every field accurate.
4. **Validate after changes:**

   ```bash
   scripts/validate-skills
   ```

   This checks all 14 skills against the spec (name rules, required fields, allowed extended fields). It must pass.
5. **No personal/third-party attribution.** The skills absorb patterns from many sources, but the docs must not name external projects. Describe the pattern, not its origin.
6. **The router (`skills/sriflow/`) is the entry point.** When adding or renaming a stage skill, update its routing table and `related`/`next-skill` links so the pipeline stays connected.

## Conventions

- Skill names: lowercase, hyphens, directory name == frontmatter `name`.
- Version: every skill carries `version: 3.0.0` (matches `VERSION`).
- License: Apache-2.0 on every skill.
- `reference/` docs: numbered (`01-`, `02-`, ...) where order matters; named otherwise. Keep `SKILL.md` reference tables pointing at real files.

## Pipeline state

Skills track per-project state under `~/.sriflow/projects/<slug>/` (JSONL files for learnings, decisions, timeline, context). The `bin/` CLI helpers (`sriflow-learnings`, `sriflow-decisions`, ...) read/write those files and are symlinked by `install.sh`.
