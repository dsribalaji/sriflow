# _admin — Project Administration

This folder holds the project-level administrative documents that span all phases.

## Contents

| File | Purpose | Update frequency |
|------|---------|-----------------|
| `decisions-log.md` | Immutable record of every significant BA decision | After every decision (append-only) |
| `glossary.md` | Agreed definitions for all project-specific terms | After every stakeholder interview or Disagreement Diagnostic |
| `CHAT-PROMPTS.md` | Copy-pasteable prompt sequences for all 9 skills | Reference only |

## Rules

- **decisions-log.md** is append-only. Never delete or overwrite a past decision.
  If a decision is reversed, add a new entry referencing the original: `[Reverses DEC-001]`.
- **glossary.md** is the single source of truth for terminology.
  If a term is used in a BRD or Use Case that isn't in the glossary — add it.
- **CHAT-PROMPTS.md** is a reference prompt playbook — copy prompts from here to your AI assistant session.
