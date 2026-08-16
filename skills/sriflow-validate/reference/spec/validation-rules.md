# Complete Validation Rules

Consolidated from the spec + sriflow extensions + sriflow conventions.

## Spec compliance checks

### Name validation
- Non-empty string
- Max 64 chars after NFKC normalization
- Lowercase only (Unicode-aware)
- No leading/trailing hyphens
- No consecutive hyphens (`--`)
- Only Unicode letters, digits, hyphens
- Must match parent directory name (NFKC-normalized)
- Must match the name used in `related`, `prerequisite`, `next-skill` references

### Description validation
- Non-empty string
- Max 1024 characters
- Should describe what it does AND when to use it

### Compatibility validation
- Must be string (not int/list/etc.)
- Max 500 characters

### YAML frontmatter validation
- File must start with `---`
- Frontmatter must be closed with `---`
- YAML must be valid
- Frontmatter must be a mapping (dict), not a list or scalar
- Only recognized fields allowed (spec + sriflow extensions)

## sriflow extended validation

### version
- Must match semver: `MAJOR.MINOR.PATCH`
- Optional pre-release suffix

### preamble-tier
- Must be 1, 2, or 3

### category
- Must be `pipeline` or `utility`

### triggers
- Must have at least 1 trigger
- Must include `/sriflow-<name>` as a trigger

### gate (if present)
- Must have `rule` key (string)
- Must have `signal` key (string)

### allowed-tools
- Each entry must be a valid tool name
- Common tools: Bash, Read, Write, Edit, Glob, Grep, WebSearch, AskUserQuestion, WebFetch

## Directory structure checks

- SKILL.md exists in each `skills/<name>/` directory
- Directory name matches `name` field
- All `reference/` files referenced in SKILL.md exist
- No orphan reference files (files not referenced by any SKILL.md)
- No broken cross-skill references

## Cross-skill dependency validation

- All `prerequisite` skills exist
- All `next-skill` values exist
- All `related` skill names exist
- Pipeline ordering is consistent (no circular dependencies)
- No duplicate skill names

## Body content checks

- No hardcoded secrets (API keys, tokens, passwords)
- No absolute file paths
- All `Read reference/X.md` targets exist
- Markdown body should not exceed ~500 lines (recommendation, not hard rule)
