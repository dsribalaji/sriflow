# Agent Skills Full Frontmatter Schema

Extracted from the official [Agent Skills specification](https://agentskills.io/specification).

## Required fields

| Field | Type | Max Length | Constraints |
|-------|------|------------|-------------|
| `name` | `str` | 64 chars | Unicode lowercase letters, digits, hyphens only. No leading/trailing/consecutive hyphens. Must match parent directory name. NFKC-normalized before comparison. |
| `description` | `str` | 1024 chars | Non-empty. Describes what the skill does and when to use it. |

## Optional fields

| Field | Type | Max Length | Constraints |
|-------|------|------------|-------------|
| `license` | `str` | — | License name or path to bundled license file. |
| `compatibility` | `str` | 500 chars | Environment requirements (product, packages, network access). |
| `metadata` | `dict[str, str]` | — | Arbitrary key-value pairs for client-specific properties. Keys/values coerced to strings. |
| `allowed-tools` | `str` | — | Space-separated tool patterns. **Experimental**. Format: `ToolName(arg:pattern)`. Example: `Bash(git:*) Read` |

## YAML frontmatter structure

```yaml
---
name: my-skill
description: Does X. Use when Y.
license: Apache-2.0          # optional
compatibility: Requires git  # optional
allowed-tools: Bash(git:*)   # optional, experimental
metadata:                    # optional
  author: example-org
  version: "1.0"
---

Markdown body here...
```

## Progressive disclosure model

| Tier | What's Loaded | When |
|------|---------------|------|
| Discovery/Catalog | `name` + `description` only | Session start (~50-100 tokens) |
| Activation | Full SKILL.md | When task matches description |
| Execution | Loaded scripts/references/evals | When agent needs them |

## evals/ directory (optional)

The spec defines an optional `evals/` directory with `evals.json`:

```json
{
  "tests": [
    {
      "name": "handles empty input",
      "prompt": "User: \"\"",
      "expected_output": "Error: input cannot be empty",
      "input_files": ["empty.txt"]
    }
  ]
}
```

Plus `iteration-N/` workspace structure for eval-driven improvement loops.

## Body recommendations

- Max 5000 tokens for the markdown body
- Max ~500 lines
- Agent should summarize if body exceeds these limits
