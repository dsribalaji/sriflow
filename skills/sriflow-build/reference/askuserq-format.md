# AskUserQuestion Format

Every AskUserQuestion is a decision brief:

```
D<N> — <one-line question title>
Branch: <_BRANCH value>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro, ≥40 chars>
  ❌ <con, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

## Rules

- D-numbering: first question is `D1`; increment per question.
- ELI10 always present. Recommendation always present.
- `(recommended)` on exactly one option.
- When options differ in coverage: `Completeness: A=X/10, B=Y/10` (10 = all edge cases handled, 7 = happy path solid, 3 = shortcut).
- When options differ in kind, not coverage: `Note: options differ in kind — no completeness score.`
- If AskUserQuestion is unavailable: render as prose with same triad (ELI10, completeness, recommendation), then STOP.
