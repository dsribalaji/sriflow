# Pattern — Eval Framework (metrics-driven improvement)

The eval framework as used by the reflect skill: turn the cycle's raw events into measurable, improvable numbers. Where the test skill's copy of this pattern proves the build against its NFRs, this copy proves the **cycle** — the process metrics that make the retro a measurement, not an opinion.

## The three measurements of a cycle

### 1. Outcome metrics (what shipped)

From the retro's existing data:

- **Scope variance** — planned stories vs shipped stories, as a ratio (shipped/planned). >1 means scope crept; <1 means scope was cut (each is a different lesson).
- **Feature success** — did the shipped features pass QA golden-path and survive the canary window? The eval is "did it work for users", not "did it deploy".
- **Deploy stability** — how many deploys this cycle needed a rollback or a fix-forward; how many went out clean.

### 2. Process metrics (how it flowed)

- **Stage time distribution** — time per pipeline stage from the retro's "Where Time Went" table. The eval is the distribution's shape: which stage ate the cycle, and is it the same stage that ate the last cycle?
- **Rework ratio** — QA failures / total checks, and code-review findings / LOC changed. Rising rework is the earliest measurable signal of process decay.
- **Gate discipline** — did any gate get skipped or overridden (CRITICAL finding shipped, golden-path failure shipped)? Skipped gates are an eval failure even if the outcome was fine.

### 3. Predictive metrics (what the next cycle inherits)

- **Estimate accuracy** — actual vs estimated per stage, kept as a running series. After three cycles the series is a calibration curve: this project's estimates run N× on migration-bearing stories.
- **Recurring failure count** — how many of this cycle's QA failures were the same category as last cycle's. Recurring categories are the eval's highest-signal output: they are the systematic issues.
- **Insight confidence movement** — which insights gained or lost confidence this cycle; which crossed the promotion threshold.

## The eval output

The cycle eval is a compact block, written into the retro's metrics appendix:

```
CYCLE EVAL
scope_variance: 0.9 (slight cut)
rework_ratio: 0.14 QA fails / checks
review_findings_per_kloc: 3.2
gate_skips: 0
estimate_accuracy: plan 0.95x, design 1.6x, build 1.1x
recurring_failure_category: db-migration (3rd cycle)
deploys: 2 clean, 0 rollback
insights_promoted: 1 (design-phase breakpoints rule)
```

Each number has a one-line interpretation — the number without the interpretation is a reading, not a lesson.

## The loop

```
Cycle N metrics → compare to baseline → name the movement → adjust the next cycle → Cycle N+1 metrics show if the adjustment worked
```

- **Baseline** is the previous cycle (or the first cycle for a new project). Movement against baseline is the signal; absolute numbers are only context.
- **Adjustment** is one concrete change per cycle, tied to one metric (the plan writes breakpoints earlier → design stage ratio should drop). Two adjustments per cycle is fine; a list of six is not a change, it's a wish.
- **Verification** is next cycle's eval. An adjustment that doesn't move its metric gets re-read, not repeated.

## Rules

1. Every metric is computed from the retro's evidence (git data, reports, logs), never from memory.
2. Movement against baseline is the signal — one cycle's absolute numbers are noise without the series.
3. One concrete adjustment per metric per cycle; the next eval proves or disproves it.
4. Recurring failure categories are the top priority — a category that recurs three cycles is the cycle's real story.
5. Gate skips are eval failures even when the outcome was good — discipline is the metric.
6. The eval block is written into RETRO.md so the next retro reads this cycle's numbers as its baseline.