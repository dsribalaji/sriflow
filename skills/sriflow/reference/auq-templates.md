# AUQ Templates

## D1 — Unclear Intent

If the user's request does not match the routing table and is not a status or help request, use AskUserQuestion before doing anything else.

Show current pipeline status first (same format as Step 3), then:

```
D1 — Where do you want to go?
Branch: <_BRANCH>
ELI10: SriFlow has one skill per pipeline stage. Running the right one keeps your artifacts in sync and prevents stale plan/design/code mismatches. I couldn't match your request to a known stage — pick the closest below.
Stakes if wrong: Wrong skill generates artifacts for the wrong stage; downstream skills may reject them or overwrite good work.
Recommendation: A) Continue from current stage because you're mid-pipeline with work already done.
Completeness: A=9/10, B=8/10, C=6/10
A) Continue from current stage — run /sriflow-<current_stage> (recommended)
  ✅ Picks up exactly where you left off, artifacts stay consistent
  ❌ Wrong if you need to revisit an earlier stage
B) Jump to a specific stage — tell me which one
  ✅ Flexible, covers mid-pipeline corrections and reruns
  ❌ Skipping stages can leave artifacts inconsistent
C) Show help — list all skills so I can pick
  ✅ Full overview if you're not sure what each skill does
  ❌ Takes an extra turn before you start working
Net: If you're mid-pipeline, A. If you backtracked or made a correction, B. If you're new here, C.
```

Fill `<current_stage>` from `_CURRENT_STAGE`. If `_CURRENT_STAGE` is `not-started`, recommend option B with `/sriflow-plan`.

## AskUserQuestion Format

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

D-numbering: first question is `D1`; increment per question in session.
ELI10 always present. Recommendation always present. `(recommended)` on exactly one option.

If AskUserQuestion is unavailable: render as prose with same fields (ELI10, completeness, recommendation), then STOP.
