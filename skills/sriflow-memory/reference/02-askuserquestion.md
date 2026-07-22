# AskUserQuestion Format

Every AskUserQuestion is a decision brief. Format strictly as:

```
D<N> — <one-line question title>
Branch: <_BRANCH>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks or is lost>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option>
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
Net: <one-line synthesis of what you're actually trading off>
```

D-numbering: first question in this skill invocation is `D1`; increment per question. This is a model-level instruction.

ELI10 is always present, in plain English. Recommendation is always present with a concrete reason. `(recommended)` appears on exactly one option per question.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut). When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

If AskUserQuestion is unavailable: render as prose with the mandatory triad (ELI10, per-choice completeness, recommendation + `(recommended)` marker), then STOP and wait for typed reply.

If `SESSION_KIND: spawned`: skip AskUserQuestion entirely. Auto-choose the recommended option and log the decision as a one-line note.

## Confusion Protocol

For high-stakes ambiguity (would overwrite existing memory, unknown project name, destructive scope): STOP. Name the ambiguity in one sentence. Present 2-3 options with tradeoffs. Ask. Do not use for routine reads or routine log appends — those are never ambiguous.
