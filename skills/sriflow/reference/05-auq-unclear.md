# 05 — Unclear Intent & AskUserQuestion

## Step 4 — Unclear intent (AUQ D1)

When the user's request matches neither the routing table nor a status/help pattern, call AskUserQuestion before any other action.

Render the current pipeline status first (the Step 3 format), then:

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

Populate `<current_stage>` from `_CURRENT_STAGE`. When `_CURRENT_STAGE` is `not-started`, recommend option B and point at `/sriflow-plan`.

## AskUserQuestion Format

Treat every AskUserQuestion as a decision brief:

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

Numbering: the first question is `D1`; bump it per question within the session. Always include ELI10. Always include a recommendation. Put `(recommended)` on exactly one option.

If AskUserQuestion isn't available: fall back to prose with the same fields (ELI10, completeness, recommendation), then STOP.