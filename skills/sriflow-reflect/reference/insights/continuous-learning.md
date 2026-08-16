# Insight System — Continuous Learning

The continuous-learning loop, used as the reflect skill's insight engine: turn cycles into observations, observations into instincts, and instincts into operating rules. This is how the stack gets better at being used — the product improves every cycle, and so does the process.

## The loop

```
Observe → Extract → Score → Promote → Apply → (next cycle: Observe again)
```

### 1. Observe

During a cycle, events happen that are worth remembering. The reflect skill's minimum is **one observation per cycle**; a healthy cycle produces 2-4. Observations come from the raw material the retro already reads: plan variance, QA failures, code-review findings, deploy incidents, time overruns, decisions that looked right and weren't.

An observation is a **fact about the cycle**, not a verdict about the person: "the design phase overran by 3 days because DESIGN.md had no mobile breakpoints" — not "we planned badly".

### 2. Extract

Distill each observation into a single learnable sentence: the pattern, not the incident. The extract has the shape of an instinct:

- **Trigger** — the situation where this applies ("when starting a web-design cycle...").
- **Action** — what to do in that situation ("...add responsive breakpoints to DESIGN.md in the first pass").
- **Why** — the evidence that makes it worth remembering.

### 3. Score

Assign confidence per the scoring pattern (0-100 from evidence: occurrences, independence, actionability, consequence). First-cycle lessons start low (0-30); the same lesson repeating across cycles climbs.

### 4. Promote

When an instinct crosses the high-confidence band (86+), it is promoted from "log entry" to "operating rule" — written into the project's guidance (SRIFLOW_MEMORY.md preferences, or the process docs it governs) so future cycles apply it by default. Promotion is the memory system acting on the lesson, not just storing it.

### 5. Apply

A promoted rule changes behavior: the plan skill writes breakpoints earlier, the design skill checks a state earlier, the ship skill polls differently. If applying the rule produces a better outcome next cycle, that outcome is itself an observation that raises confidence further.

## What gets promoted (and what never does)

Promote rules that are:
- **Specific** — "add breakpoints to DESIGN.md" (not "design better").
- **Actionable** — there is a concrete step to take at a named stage.
- **Evidence-backed** — the consequence of ignoring it is named.

Never promote:
- Verdicts on people or single incidents.
- Vague aspirations ("plan more carefully").
- Lessons that only apply to one unique situation with no transfer.

## Rules

1. Minimum one observation per cycle; 2-4 is healthy.
2. Observations are facts about the cycle, not verdicts on the person.
3. Extract to trigger-action-why, then score with evidence.
4. Confidence below 30: logged, not applied. Above 86: promoted to an operating rule.
5. Application is the loop closing — a promoted rule that changes behavior and works raises its own confidence.
6. Nothing is promoted on one occurrence; patterns need recurrence or tested actionability.
7. The insight log lives in the project's memory system (`~/.sriflow/projects/<slug>/learnings.jsonl` and the retro's lessons), so every cycle starts from the accumulated instincts, not from amnesia.