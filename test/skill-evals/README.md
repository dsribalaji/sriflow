# Skill Evals

TDD for sriflow skills. Each eval spec defines what a skill should and should not produce for a given prompt.

## What eval specs are

Eval specs are test definitions, not tests themselves. They describe the expected behavior of a skill in structured JSON so a runner can:

1. Send a prompt to the skill
2. Check the output against expected patterns (must-match)
3. Check the output against anti-patterns (must-not-match)
4. Report pass/fail per eval

Think of it as a contract: "when someone says X, this skill must do Y and must not do Z."

## JSON format

```json
{
  "skill": "sriflow-<name>",
  "version": "2.0.0",
  "evals": [
    {
      "id": "<skill>-<nn>",
      "prompt": "what the user sends",
      "expected_patterns": ["regex that MUST match output"],
      "anti_patterns": ["regex that MUST NOT match output"],
      "tags": ["category", "category"]
    }
  ]
}
```

### Fields

| Field | Type | Purpose |
|-------|------|---------|
| `skill` | string | Skill name (matches `skills/sriflow-<name>/`) |
| `version` | string | Skill version at time of eval |
| `evals` | array | One or more eval cases |
| `evals[].id` | string | Unique ID: `<skill>-<nn>` |
| `evals[].prompt` | string | User input to the skill |
| `evals[].expected_patterns` | string[] | Regex patterns that must appear in output |
| `evals[].anti_patterns` | string[] | Regex patterns that must NOT appear in output |
| `evals[].tags` | string[] | Categories for filtering (safety, security, reuse, etc.) |

## How to add new evals

1. Pick the skill to eval
2. Read the skill's `SKILL.md` — identify the core workflow steps
3. Write 2-5 evals per skill covering:
   - Golden path (normal happy path)
   - Edge cases (empty input, missing context)
   - Anti-patterns (what the skill must never do)
4. Save as `test/skill-evals/sriflow-<name>-evals.json`
5. Run the eval runner (see below)

### Tags to use

| Tag | Meaning |
|-----|---------|
| `safety` | Pre-flight checks, Step 0, context loading |
| `context` | Reads PLAN.md, DESIGN.md, or existing code before acting |
| `reuse` | Scans for existing code, avoids new dependencies |
| `security` | OWASP, input validation, parameterized queries |
| `golden-path` | Happy path coverage |
| `edge-cases` | Empty/whitespace/boundary inputs |
| `report` | Produces required output file (QA_REPORT.md, CODE_REVIEW.md, etc.) |

## How to run evals

No runner yet. Placeholder for future implementation:

```bash
# Future: run all evals
node test/skill-evals/runner.js

# Future: run evals for one skill
node test/skill-evals/runner.js --skill sriflow-build

# Future: run a specific eval
node test/skill-evals/runner.js --eval build-01
```

### Runner requirements (when built)

1. Read all `*-evals.json` files in this directory
2. For each eval: send prompt to skill, capture output
3. Check `expected_patterns` — all must match (regex)
4. Check `anti_patterns` — none must match (regex)
5. Output: pass/fail per eval, summary per skill, overall summary
6. Exit code 0 if all pass, 1 if any fail

### Runner constraints

- Must work with local skill execution (no external API required)
- Patterns use JS regex syntax (case-insensitive by default)
- `OR` in patterns means either side can match (split on ` OR `)
- Timeout per eval: 60 seconds
- Output: JSON + human-readable summary
