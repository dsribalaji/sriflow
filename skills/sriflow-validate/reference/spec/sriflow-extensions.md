# sriflow Extended Frontmatter Fields

sriflow extends the Agent Skills spec with additional frontmatter fields for pipeline integration.

## Custom fields

| Field | Required | Type | Purpose |
|-------|----------|------|---------|
| `preamble-tier` | Yes | `int` (1-3) | Preamble verbosity. 1=minimal, 2=standard, 3=full. |
| `version` | Yes | `str` (semver) | sriflow skill version. Format: `MAJOR.MINOR.PATCH` |
| `category` | Yes | `str` | One of: `pipeline`, `utility` |
| `related` | No | `list[str]` | Related skill names for cross-referencing |
| `triggers` | Yes | `list[str]` | Invocation phrases (extends spec triggers) |
| `next-skill` | No | `str` | Suggested next skill in pipeline |
| `outputs` | No | `list[str]` | Files or artifacts the skill produces |
| `gate` | No | `dict` | Completion gate criteria (rule + signal) |
| `prerequisite` | No | `str` | Required prior skill |

## Validation rules

- `preamble-tier`: Must be 1, 2, or 3
- `version`: Must match semver (`MAJOR.MINOR.PATCH` with optional pre-release)
- `category`: Must be `pipeline` or `utility`
- `related`: Each entry must be a valid skill name
- `next-skill`: Must reference an existing skill
- `prerequisite`: Must reference an existing skill
- `outputs`: File paths should not use absolute paths or path traversal
- `gate`: Must contain both `rule` and `signal` keys
