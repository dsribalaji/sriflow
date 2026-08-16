# Pattern — Canary Monitoring

The post-deploy monitoring loop. A deploy is not done when the URL returns 200 — it is done when the new version has survived the observation window. This pattern defines what to watch, for how long, and what triggers a rollback.

## When to use

- After any production deploy via `/sriflow-ship` (Step 5 smoke test passes → begin the canary window).
- Full window for user-facing changes. Config-only or no-op deploys may shorten the window.

## The loop

### 1. Confirm the new version is serving

Before trusting any metric, confirm traffic hits the new build:

- Web: `$B goto <url>` + verify a version marker only the new build has (a header, a build id in the DOM, a changed element from the diff).
- CLI: `--version` returns the deployed SHA.
- Package: the registry page shows the new version, and `npm view`/`pip index` confirm the latest.

A monitoring window watching the old version is a false sense of safety — this step is mandatory, not optional.

### 2. Watch the metric set

During the window, sample these (via logs, dashboards, or direct probes):

| Metric | Healthy | Danger |
|--------|---------|--------|
| HTTP error rate | ~0 (baseline + small delta) | Spiking 5xx — request path broken |
| Latency (p50/p95/p99) | Within baseline ×1.5 | p95 doubling or climbing — slow path |
| Crash/restart rate | 0 | Containers/processes churning — boot or OOM loop |
| Client JS errors | ~0 (baseline) | New error signature appearing |
| Core Web Vitals (LCP/INP) | Within budget | Regression — render path degraded |

CLI/package deploys skip the browser metrics but still watch: install from the registry succeeds, `--help` runs, and no new runtime errors in the first N invocations.

### 3. Sample cadence

- **First 5 minutes:** sample every 30-60s (most failures surface immediately or in the first traffic spike).
- **Next 25 minutes:** sample every 5 minutes (covers the first real user wave).
- **Window close:** after 30 minutes with no danger signal, declare the deploy healthy.

Total window default: **30 minutes**. Shrink to 5-10 for config-only deploys. Extend for high-traffic or high-stakes surfaces (payments, auth) — the cost of watching longer is tiny compared to the cost of a bad deploy discovered late.

### 4. Decide

- **All metrics healthy at window close** → declare `DONE`, record the deploy as stable in SRIFLOW_MEMORY.md.
- **Danger signal appears** → do not wait for the window. Go to rollback guidance (`reference/patterns/rollback-guide.md`). The rule: a deploy that needs monitoring to get better is a deploy that should be rolled back.
- **Ambiguous signal** (one metric above threshold, others normal) → check logs to decide "transient spike" vs "real problem". One verification pass, then decide. Do not extend the window indefinitely.

## Rules

1. Confirm the new version is actually serving before the window starts.
2. The window is a hard commitment — never close it early on good vibes.
3. Any danger signal ends the window immediately; the decision is rollback or a verified cause.
4. Sample on a cadence, not reactively — you are looking for absence of failure too.
5. Record the canary outcome (passed/rolled back, window length, signal that triggered) in the deploy record — the retro skill reads it.

## Common failure modes

| Mode | Symptom | Fix |
|------|---------|-----|
| Watching old version | Metrics fine, new build broken | Version-verify first |
| Window closed early | Failure surfaces after "success" | Hold the full window |
| Reacting to one spike | Rollback on a CDN blip | One log-verification pass before deciding |
| No error baseline | New errors invisible | Capture baseline before the deploy, not after |
| CLI "no metrics" | Package installs but breaks at runtime | Post-install invocation check in the window |

## Integration

The ship skill's Step 5 smoke test is the entry gate into this window; the deploy record (`reference/08-deploy-record.md`) captures the window outcome; the retro skill's metrics section reads it as the "deploy stability" signal for the cycle.