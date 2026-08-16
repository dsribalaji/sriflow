# Pattern — Eval Framework

The metrics-driven evaluation framework used by the QA skill (verification) and the reflect skill (improvement). A feature is not "done" because it works — it is done when it provably meets its numbers. This pattern defines what to measure, how to measure it deterministically, and how the numbers close the loop back into the plan.

## The three measurement layers

### 1. Functional verification (the QA gate)

Behavior is proven by the test categories the QA skill already runs: golden path, edges, errors, regression. Functional eval answers "does it do what the spec says". This layer is the ship gate — no numbers here means no ship.

### 2. Integration suite (the standard)

A standing integration suite — the standard is 75+ integration tests — that runs on every significant change, not just at QA time. It covers the seams unit tests can't: DB migrations against a real schema, external API contracts, config loading, deployment shapes. The suite is the project's constant — a regression in it is a regression in the product.

### 3. Performance benchmarks (the NFR proof)

Non-functional requirements are promises with numbers. Each NFR from the plan gets a benchmark that proves it:

- **Latency budget:** p50/p95/p99 under the plan's number, measured on a representative workload.
- **Throughput:** requests/sec the system sustains without error-rate climb.
- **Scale:** the load point where p95 breaks the budget — named, so the team knows the headroom.
- **Resource envelope:** memory/CPU at sustained load (an OOM at hour 2 is a benchmark failure).

Benchmarks are code, run deterministically, stored with their result history. A benchmark that can't reproduce its own numbers is measuring noise.

## Eval discipline

### Determinism
- Same inputs, same environment, same result. Pin: data fixtures, seed, hardware/config, and warm-up behavior.
- A benchmark run on a busy laptop is not a benchmark — it is a weather report.

### Baseline and target
- Every metric has a baseline (current state) and a target (the plan's NFR). The delta is the reportable signal.
- "It got faster" is not a result. "p95 went 340ms → 210ms, target 200ms" is a result — and shows what's left.

### Regression on the numbers
- The eval framework fails the gate when a benchmark regresses beyond tolerance — the same way a functional test fails. Silent perf regression is the framework's job to catch, not a surprise for the canary window.
- Tolerance: small noise is normal; a >10% p95 regression on a stable workload is a finding.

## Closing the loop

Eval results write back:

- **Into the QA report** — functional + integration + benchmark verdicts feed `SHIP-READY`.
- **Into the plan** — a benchmark that misses its NFR is proof the plan's number was wrong or the build missed it; the plan gets corrected (prove → evolve).
- **Into the retro** — the reflect skill reads the eval history to score the cycle's NFR achievement.

## Rules

1. Every NFR in the plan has a number and a test that proves it — an NFR without an eval is an aspiration.
2. Benchmarks are deterministic code, committed with the project — never ad-hoc commands.
3. The integration suite runs on every significant change, not just at QA time.
4. A benchmark regression beyond tolerance fails the gate like a functional failure.
5. Eval results are evidence — they correct the plan, the estimates, and the next cycle's targets.

## Common failure modes

| Mode | Symptom | Fix |
|------|---------|-----|
| Benchmarks on live traffic | Non-reproducible numbers | Deterministic harness + pinned fixtures |
| No baseline | "Regressed from what?" | Record baseline before the first run |
| NFR without a test | The plan promises, the build forgets | The gate blocks when a claimed NFR has no eval |
| One-off benchmark scripts | Numbers die with the session | Benchmarks as committed code in CI |
| Ignoring slow regressions | Perf rots until prod complains | CI fails on the >10% p95 regression |