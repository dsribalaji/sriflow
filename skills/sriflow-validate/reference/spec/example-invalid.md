# Example: Invalid SKILL.md Patterns

Each snippet below fails at least one validation rule. Use this as a
checklist of what NOT to ship. The numbered reasons map to
`validation-rules.md`.

## 1. Name violations

```markdown
---
name: Sriflow-Greeter          # FAIL: uppercase, must be lowercase
---
```

```markdown
---
name: greeter--handler         # FAIL: consecutive hyphens
---
```

```markdown
---
name: some-other-name          # FAIL: must match directory name
---
```

## 2. Missing / oversized description

```markdown
---
name: sriflow-greeter
description: ""                # FAIL: empty
---
```

```markdown
---
name: sriflow-greeter
description: "This skill greets users and manages greeting history and also
handles farewells and logs everything and integrates with seventeen other
systems and provides analytics dashboards and ... (well over 150 characters
and no 'when to use' and no 'not for' clause)"
---
```

(For the spec the hard cap is 1024; sriflow convention is ≤150
for scannability. Either way, no "when to use" = FAIL.)

## 3. Broken frontmatter structure

```markdown
name: sriflow-greeter           # FAIL: no opening `---`
description: hello
---
```

```markdown
---
name: sriflow-greeter
description: hello              # FAIL: missing closing `---`
```

```markdown
---
- name: sriflow-greeter         # FAIL: frontmatter is a list, not a mapping
- description: hello
---
```

## 4. Unknown / mistyped fields

```markdown
---
name: sriflow-greeter
description: hello
category: utilityy              # FAIL: typo — must be pipeline|utility
version: "1.0"                  # FAIL: not semver (missing patch)
preamble-tier: 4                # FAIL: must be 1, 2, or 3
allowed-tools:
  - Bash
  - Teleport                   # FAIL: not a valid tool name
triggers:
  - hello
---
```

## 5. Missing triggers / missing slash trigger

```markdown
---
name: sriflow-greeter
description: hello              # FAIL: no triggers at all
---
```

```markdown
---
name: sriflow-greeter
description: hello
triggers:
  - hello                      # FAIL: must include /sriflow-greeter
---
```

## 6. Invalid gate

```markdown
---
name: sriflow-greeter
description: hello
triggers:
  - /sriflow-greeter
gate:
  rule: "greeting logged"       # FAIL: gate needs both rule AND signal
---
```

## 7. Broken cross-skill references

```markdown
---
name: sriflow-greeter
description: hello
triggers:
  - /sriflow-greeter
related:
  - sriflow-does-not-exist     # FAIL: related skill does not exist
next-skill: sriflow-plan       # OK if exists
---
```

## 8. Broken reference integrity

```markdown
## Reference files

| File | Content |
|------|---------|
| `reference/templates/greeting.md` | Templates |   # FAIL: file missing
```

## 9. Hardcoded secrets

```markdown
---
name: sriflow-greeter
description: hello
triggers:
  - /sriflow-greeter
---

# Usage

Configure with the API key: sk-live-abc123def456GHI789
                                                 # FAIL: secret in body
```

## 10. Absolute paths

```markdown
Always write the log to /home/otwos/sriflow/GREETING_LOG.md
                                        # FAIL: absolute path in body
```

## Summary of the most common failures

| # | Failure | Detection |
|---|---------|-----------|
| 1 | Name/dir mismatch or case | regex + dir compare |
| 2 | No description or no "when to use" | length + heuristic |
| 3 | Frontmatter not a `---` mapping | YAML parse |
| 4 | Unknown field / bad enum / bad semver | schema check |
| 5 | No `/sriflow-<name>` trigger | list membership |
| 6 | Gate missing rule or signal | key check |
| 7 | `related`/`next-skill` dangling | cross-skill scan |
| 8 | `Read reference/X.md` target missing | file existence |
| 9 | Secrets | pattern scan |
| 10 | Absolute paths | path scan |