# Step 1b — Market Research (Medium / Enterprise, optional)

Competitive landscape discovery. This is **stakeholder discovery input, not a
market research report.** Its purpose is to surface stakeholders you would
otherwise miss — competitors, adjacent players, regulators — and to catch
assumptions the idea already makes about "how this space works."

## Time box: 3 searches max

The whole step must fit in three WebSearch calls. Budget:

1. `[domain] market landscape [current year]`
2. `[domain] competitors [current year]`
3. `[specific feature] alternative solutions`

If a search returns nothing useful, do not re-roll the query more than once.
Proceed without that dimension. Rabbit-holing here is the failure mode this
step exists to prevent.

## What each search feeds

| Search | Feeds | Who it can surface |
|--------|-------|---------------------|
| Landscape | "Market Context" in THINK_OUTPUT.md | Adjacent players, platform owners, channel middlemen |
| Competitors | Market Context + Step 2 stakeholders | Direct competitors (may hold veto power over partners) |
| Alternatives | Market Context | The **status quo workaround** — your user's current behavior |

## The status quo is the real competitor

In the alternatives search, the most important finding is often "nothing — or
a manual process." People currently solve the problem with spreadsheets,
Slack, email threads, or a hired human. That workaround is not a competitor
to dismiss; it is the baseline the product must beat. If the search shows
*nobody is doing anything* about this problem, that is usually a signal the
problem is not painful enough — flag it as an uncertainty, don't celebrate it.

## Recording results

Write under THINK_OUTPUT.md `## Market Context`:

```markdown
## Market Context
- Direct competitors: [name] — [what they do, one line]
- Adjacent players: [name] — [touches the space, doesn't compete]
- Status quo / workaround: [what people do today]
- Regulators / compliance: [only if present in this domain]
- Open gap: [one sentence — what none of them do]
```

Keep it to 3-6 bullets. This section is read by Step 2 to inform stakeholder
identification, then forgotten.

## When to skip

- User says skip (always honored).
- WebSearch unavailable in the runtime.
- Small tier — already complete after Q1 + S1/S2; never run market research
  for Small projects.

## Rules

1. Max 3 searches. Hard cap.
2. Output goes only into `## Market Context`. No separate research document.
3. Never recommend a pivot from this step. It informs stakeholder discovery,
   not product strategy — strategic challenge is sriflow-plan-review's job.