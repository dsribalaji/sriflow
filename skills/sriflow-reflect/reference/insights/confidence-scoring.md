# Insight System — Confidence Scoring

Score every instinct and observation on a 0-100 confidence scale, and let the score drive whether the insight survives, grows, or dies. Confidence is the memory system's immune response: it keeps weak lessons from being treated as rules and promotes strong ones into operating principles.

## The scale

| Range | Meaning | Handling |
|-------|---------|----------|
| 0-30 | Speculative — a hunch or one-off | Logged, not applied. Re-evaluate if it recurs |
| 31-60 | Plausible — observed 2-3 times, not yet verified | Held as a hypothesis. Act on it only with low stakes |
| 61-85 | Likely — consistent evidence across several observations | Applied as a working assumption. Flagged when it would be costly if wrong |
| 86-100 | Proven — tested, consistent, and consequential | Treated as an operating rule. Can override default behavior |

The score is **evidence-based, not authority-based**: it comes from how many times the pattern was observed and whether acting on it succeeded. "I think this is important" is a 0-30 hunch until observation supports it.

## What feeds a score

For each observation, gather the evidence that sets the score:

1. **Occurrences** — how many separate times did the pattern appear? One instance is a hunch; three independent instances are a pattern.
2. **Independence** — were the occurrences in genuinely different contexts, or the same context repeated? The same project's repeated CI flake is one data point, not three.
3. **Actionability** — did acting on the insight change the outcome? A lesson that was applied and worked earns more than one that was never tested.
4. **Consequence** — how much did it matter when ignored? An ignored lesson that cost a rework deserves a higher score than a cosmetic one.

## Evolution rules

Confidence is not static — it moves with new evidence.

- **Observe a supporting instance** → raise the score (10-15 points per independent recurrence, capped at 100).
- **Act on it and it works** → raise toward the 86-100 band.
- **Find a contradicting instance** → drop the score, and if it falls below 30, archive the insight (it is refuted, not forgotten).
- **A rule repeatedly ignored** → it may be scored too high for its real importance, or too low to be trusted — re-read the evidence, re-score honestly.

Evolution happens at retro time (the reflect skill's continuous-learning step), never mid-task. Scoring during a task is a decision-making input; scoring between cycles is a memory-system update.

## Rules

1. Score from evidence (occurrences, independence, actionability, consequence), never from feeling.
2. An insight below 30 is logged, not applied — it is a hypothesis awaiting evidence.
3. Above 86, an insight becomes an operating rule and is written as one.
4. Contradiction drops the score; a score below 30 archives the insight.
5. Re-scoring happens at retro, not mid-task.
6. The score is written with every observation, and the evidence that justifies it is written beside it — an unscored insight is unverified, and an unverified insight is noise.

## Scoring format

```
INSIGHT: <one-line lesson>
CONFIDENCE: <0-100>
EVIDENCE: <what was observed, how many times, in what contexts, what happened when acted on>
NEXT: <what would raise/lower this score>
```

This is the format the observation template and the retro's lessons section both emit.