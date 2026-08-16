# Insight System — Observation Template

The standard shape for logging an observation during the retro's continuous-learning step. One template, filled honestly, is the raw material of the whole insight system — confidence scoring, instinct types, and promotion all read from it.

## The template

```
### OBSERVATION | <YYYY-MM-DD> | <cycle or date range>

TYPE: <process | tech | communication | tooling>
OBSERVED: <what happened, as a fact — the incident, not the verdict>
CONTEXT: <which cycle, which stage, which project>
PATTERN: <the recurring shape, if this is not the first occurrence — else "first occurrence">
CONFIDENCE: <0-100>
EVIDENCE: <occurrences, independence, actionability, consequence>
ROUTED TO: <skill(s) that should act on it>
TRIGGER: <the concrete situation where it applies>
```

## Field guidance

**OBSERVED** — one or two sentences of fact. Names the actual thing that happened:
- Good: "The design phase overran 3 days; DESIGN.md had no mobile breakpoints, so the review loop caught responsive issues in pass 4 instead of pass 1."
- Bad: "Design went badly and took too long."

**CONTEXT** — where it happened, so recurrence is detectable: cycle number, pipeline stage, project. This is what makes three observations across three projects read as one pattern instead of three anecdotes.

**PATTERN** — the honest check: is this new or repeated? "First occurrence" is legitimate and scores low. Repeating the same observation without raising its confidence means either the fix isn't being applied or the observation isn't actionable.

**CONFIDENCE + EVIDENCE** — per the confidence-scoring pattern. The evidence justifies the number. An observation with a confidence and no evidence is a number without a fact.

**ROUTED TO** — where the fix lives, per the instinct-types classification. If you can't name a skill that should apply it, the observation is either not actionable or not typed right.

**TRIGGER** — the concrete situation that should remind the future agent of this lesson. Vague triggers ("when planning") never fire; specific ones do ("when Phase 5 includes data screens").

## Filling rules

1. One observation per template instance — a cycle logging three observations logs three templates.
2. Facts, not verdicts. "The estimate was 2x off because the migration cost was unknown" is a fact; "the estimate was bad" is a verdict.
3. Confidence is scored from the evidence field, never before it — write the evidence, then the number.
4. If the same observation recurs, the new entry says so (PATTERN: repeated) and the confidence reflects it.
5. An observation with no ROUTED TO skill is a draft, not an observation — resolve the routing or drop it.
6. Every observation gets logged to the project's learnings log; the retro's Lessons section is built from the filled templates.

## What makes a good observation (the filter)

A candidate is worth the template if it can answer all three:

1. **Transferable** — would a future cycle in this project (or a similar one) benefit?
2. **Actionable** — is there a concrete step at a named stage?
3. **Not-obvious** — would the team have gotten it without writing it down?

If it fails all three, it is noise. If it passes two, log it. If it passes all three at high consequence, this is the cycle's most important lesson — it deserves the full treatment (score, type, routing, and promotion if evidence supports it).