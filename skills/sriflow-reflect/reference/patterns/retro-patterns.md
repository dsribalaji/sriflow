# Pattern — Retro (per-person, streaks, trends)

The retrospective techniques in the reflect skill: per-person breakdowns, shipping streaks, and trend lines. These add the longitudinal view to the cycle's snapshot — the retro should answer not just "how was this cycle" but "where is this project heading".

## The techniques

### 1. Per-person breakdown (for team cycles)

When the cycle had multiple contributors (or AI + human split), attribute the work honestly:

- **What each person shipped** — from git author stats, not from memory.
- **What each person's cycle looked like** — commit count, time distribution, where their effort concentrated.
- **Where effort concentrated** — a cycle where one person carried the plan and another carried QA is a different lesson than one where everyone did everything.

For a solo builder (the typical sriflow user), the breakdown is by **mode**: how much of the cycle was planning, building, reviewing — and which mode produced the highest rework. A cycle dominated by building with thin planning should have shipped that pattern in its own metrics.

### 2. Shipping streaks

The streak is a motivation and cadence signal:

- **Streak count** — consecutive cycles (or days) with a deploy. A long streak is momentum; its absence is a cadence problem worth naming.
- **Streak end analysis** — when the streak breaks, the retro names why (blocked deploy, scope too big, environment breakage). A broken streak from a blocked ship is an environment lesson; a broken streak from "didn't finish" is a scope lesson — different fixes.

### 3. Trend lines

The longitudinal view — compare across the last N cycles:

- **Cycle length** — is the average cycle getting shorter, longer, or stable?
- **Rework ratio** — the line across cycles: flat, rising (process decay), falling (improvement working).
- **Scope variance** — creeping above 1.0 across cycles is a structural scope problem, not a one-cycle wobble.
- **Time-per-stage line** — the same stage dominating across cycles is the estimate-category problem (see retro-patterns).

Trend lines are drawn from the eval-framework numbers accumulated per cycle — the eval series is what makes trends possible. Three cycles minimum before a trend is called; two data points are a line, not a trend.

### 4. Session cadence

From the git timestamps and session logs:

- **Session frequency** — how often work sessions happened. Gaps are environment or motivation signals.
- **Session length distribution** — many short sessions vs few long ones. The hero-pattern retro pattern lives here (a cycle driven by one marathon session).

## Integration with the retro

- The per-person/mode breakdown feeds the "Where Time Went" section with attribution.
- Streaks and cadence feed the opening "What Shipped" and the meta-narrative of the cycle.
- Trend lines live in the metrics appendix (the eval-framework block) — this cycle's numbers are the newest point on the line.
- Breakage (streak end, cadence gap) is logged through the observation template with type, confidence, and routing — cadence gaps are process-type insights, blocked-ship streak breaks are tooling or environment.

## Rules

1. Attribution from git data, never memory — a per-person section built from recollection is a fiction.
2. Streaks and trends need the accumulated series: streaks need the deploy record, trends need ≥3 cycles of eval numbers.
3. A streak break is analyzed for cause and type, not mourned — "ship stopped" is a fact, "why" is the lesson.
4. Trend lines are the eval framework's longitudinal output; the eval series is the data the trends read.
5. Solo cycles use the mode breakdown in place of per-person — the human/AI split of the work is the attribution that matters.