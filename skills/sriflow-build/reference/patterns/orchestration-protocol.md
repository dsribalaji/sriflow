# Orchestration — Multi-Agent Orchestration Protocol

Used when a build is large enough to split across subagents. Small builds
(one logical unit, one module) run inline — orchestration adds overhead, not
value. Split only when units are independent AND the interface between them is
already defined (from PLAN.md/DESIGN.md).

## Decision to split

Split when ALL hold:
- Units map cleanly to PLAN.md tasks with no shared mutable state.
- The boundary contract (function signatures, file paths, data schemas) is
  specified in DESIGN.md.
- Each unit is independently verifiable (its own build/test/smoke step).

Do not split when: units share files, the contract is unsettled, or the total
work is under ~2 units. Sequential inline build beats parallel chaos.

## Protocol

### 1. Define the contract first

Before any subagent runs, the boundary between units is written down:
- Inputs each unit receives (files, params, data shapes).
- Outputs each unit produces (files, signatures, return shapes).
- The shared interface file names — who creates them, who consumes them.

No subagent invents its own interface. The contract is the source of truth.

### 2. Sequential chaining (the default)

- Units that share a dependency run one after another: unit B consumes unit
  A's output, so B starts only after A's smoke check passes.
- Handoff artifact: a one-line status per unit (`A: DONE — produced X at
  path`). The next unit reads that, not the full build log.
- A failed unit stops the chain. Investigate (see investigate-workflow) at the
  boundary, fix, re-run the chain from the failed unit — not from the start.

### 3. Parallel fan-out (only for independent units)

- Independent units run concurrently, each with the SAME contract doc.
- Each parallel unit must be self-verifying: it runs its own smoke check and
  reports `DONE`/`BLOCKED`/`DONE_WITH_CONCERNS` plus its produced artifacts.
- Fan-out limit: the number of genuinely independent units, not more.
- After all report: run the integration check — build the whole, run the
  project smoke check. Parallel units that each pass alone can still clash at
  the seam (shared file, conflicting config, duplicate symbol). The
  integration check is mandatory, not optional.

### 4. Message discipline

Each subagent reports back exactly:
- Status (`DONE` / `DONE_WITH_CONCERNS` / `BLOCKED`).
- Artifacts produced (paths).
- Deviations from the contract (with reason).
- Open concerns (one line each).

No full transcripts, no diffs of success, no progress narration.

### 5. Convergence

- Merge: sequential units merge as they chain; parallel units merge at the
  integration check.
- Conflict at the seam is resolved by the contract first, then by the
  orchestrator's judgment (not by the subagent). If the contract itself was
  wrong, update it and re-run only the affected unit.
- Final gate: the whole project's smoke check runs once, after all units
  report. That single run is the acceptance signal.

## Failure handling

| Failure | Action |
|---------|--------|
| Unit BLOCKED | Investigate at its boundary; fix or mark BLOCKED in build status |
| Contract mismatch between units | Update the contract doc; re-run the dependent unit only |
| Integration check fails | Treat as a seam defect — bisect which unit's output caused it |
| Parallel unit times out | Cancel it, re-run inline; never merge partial state |
| Conflicting edits to one file | Shouldn't happen (contract forbids it); if it did, contract was wrong — reconcile at the file level |

## Orchestration posture

- The orchestrator never re-implements a unit. It delegates, verifies, and
  integrates.
- Trust the subagent's report for its own unit; verify only at the seams
  (integration check) and the smoke check.
- Keep the fan-out shallow. Two good sequential builds beat four parallel
  half-builds. Orchestration is for parallelism where it's safe, not for
  drama.