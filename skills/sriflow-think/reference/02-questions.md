# AskUserQuestion Format

Each AskUserQuestion must be phrased as a decision brief:

```
D<N> — <one-line question title>
Branch: <_BRANCH value>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  + <pro, ≥40 chars>
  - <con, ≥40 chars>
B) <option>
  + <pro>
  - <con>
Net: <one-line synthesis of the tradeoff>
```

Number decisions from `D1` and increment by one each question. Always include ELI10 and the recommendation. Mark exactly one option `(recommended)`.

If AskUserQuestion is not available, present the same triad (ELI10, completeness, recommendation) as prose, then STOP.