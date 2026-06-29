# AskUserQuestion Format

Decision brief template for `/sriflow-reflect`.

Every AskUserQuestion is:

```
D<N> — <one-line question title>
Branch: <_BRANCH value>
ELI10: <plain English a 16-year-old could follow, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks or what you lose>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment yourself. ELI10 always present. Recommendation always present. `(recommended)` on exactly one option.

If AskUserQuestion unavailable: render as prose with mandatory triad (ELI10, per-choice completeness, recommendation + `(recommended)` label), then STOP and wait for typed reply.

## Retro-Specific D1

Before writing RETRO.md, ask:

```
D1 — How thorough should this retro be?
Branch: <_BRANCH>
ELI10: A quick retro is bullet lists only — scan in 2 minutes, act immediately. A thorough retro has narrative for each section — deeper context, better for end-of-quarter reviews or when something went wrong.
Stakes if wrong: Too short misses systemic patterns. Too long is noise you won't read next time.
Recommendation: A) because quick retros get read; thorough retros get skipped.
Completeness: A=7/10, B=9/10
A) Quick — concise bullet lists, action-focused (recommended)
  ✅ Read in 2 minutes; keeps retrospective habit sustainable
  ❌ Less context for future self reviewing this later
B) Thorough — narrative for each section, full decision analysis
  ✅ Captures the full story of the cycle for posterity
  ❌ Longer to write and longer to read; may go unread
Net: Default to quick. Use thorough at major milestones or after a hard cycle.
```
