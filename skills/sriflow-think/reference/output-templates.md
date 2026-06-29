# Output Templates — THINK_OUTPUT.md

## Small Template (~30 lines)

```markdown
# THINK_OUTPUT.md — [Idea/Project Name]

**Scale:** small
**Generated:** [ISO 8601 timestamp]
**Branch:** [_BRANCH]
**Session:** [_SESSION_ID]

---

## What We're Building
<From Q1: 1-2 sentences describing the system>

## User
<From S1: Who uses this? (1 person? a team? customers?)>

## Features
1. <feature 1>
2. <feature 2>
3. <feature 3>

## Done =
<From S2: One observable criterion — "I can [action] and see [result]">

## Scale Detection
Tier: small
Reason: [auto-detected keyword or user confirmation]
Override: [none / user upgraded from X]

## On-Demand Expansions
You can request enterprise-depth analysis on any section:
- "give me the stakeholder register" -> runs full Step 2-4
- "give me the interview plan" -> runs full Step 7
- "give me the disagreement log" -> runs full Step 6
- "expand to full think" -> re-runs entire skill at enterprise depth
```

## Medium Template (~80 lines)

```markdown
# THINK_OUTPUT.md — [Idea/Project Name]

**Scale:** medium
**Generated:** [ISO 8601 timestamp]
**Branch:** [_BRANCH]
**Session:** [_SESSION_ID]

---

## Stakeholder Register (Top 3-5)

| Name / Role | Category | Top Uncertainty |
|-------------|----------|-----------------|
| [Name, Title] | [Decision-Maker / SME / User / Tech Gatekeeper] | "[Specific open question]" |

## Power/Interest Summary

- **High Power / High Interest:** [Names — these drive the project]
- **High Power / Low Interest:** [Names — keep satisfied]
- **Low Power / High Interest:** [Names — keep informed]
- **Low Power / Low Interest:** [Names — monitor]

## Uncertainty Priority (Top 3)

1. [Stakeholder]: "[Their uncertainty]" — blocks: [what gets wrong]
2. [Stakeholder]: "[Their uncertainty]" — affects: [feature area]
3. [Stakeholder]: "[Their uncertainty]" — low-risk deferral: [why it can wait]

## Disagreement Log
<Leave blank unless user flagged a vague phrase>

| Phrase | Stakeholder A | A's meaning | Stakeholder B | B's meaning | Status |
|--------|---------------|-------------|---------------|-------------|--------|

## Interview Summary
<1-paragraph summary per key stakeholder — not formal structure>

## Scale Detection
Tier: medium
Reason: [auto-detected keyword or user confirmation]
Override: [none / user upgraded from X]

## On-Demand Expansions
You can request enterprise-depth analysis on any step:
- "expand [step] to full depth" -> re-runs that step at enterprise depth
- "expand to full think" -> re-runs entire skill at enterprise depth
```

## Enterprise Template

```markdown
# THINK_OUTPUT.md — [Idea/Project Name]

**Generated:** [ISO 8601 timestamp]
**Branch:** [_BRANCH]
**Session:** [_SESSION_ID]

---

## Stakeholder Register
[Full table from Step 4]

## Power/Interest Map
[2x2 grid with stakeholder placement]

## Uncertainty Priority Register
[Tier 1/2/3 ranking with rationale]

## Disagreement Log
[Vague phrases + diverging stakeholder definitions]

## Interview Plan
[Sequenced plan: who, goal, primary uncertainty, date]

## Scale Detection
Tier: enterprise
Reason: [auto-detected keyword or user confirmation]
Override: [none / user downgraded from X]
```
