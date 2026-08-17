# Step 1b — Market Research (Medium / Enterprise, optional)

Competitive landscape discovery. Treat it as **input for stakeholder
discovery, not a market research report.** It exists to surface stakeholders
you would otherwise overlook — competitors, adjacent players, regulators —
and to expose assumptions the idea already carries about "how this space works."

## Time box: 3 searches max

Fit the entire step inside three WebSearch calls. Budget them as:

1. `[domain] market landscape [current year]`
2. `[domain] competitors [current year]`
3. `[specific feature] alternative solutions`

If a search returns nothing useful, retry the query at most once, then proceed
without that dimension. Going down the rabbit hole here is exactly the failure
this step is designed to stop.

## What each search feeds

| Search | Feeds | Who it can surface |
|--------|-------|---------------------|
| Landscape | "Market Context" in THINK_OUTPUT.md | Adjacent players, platform owners, channel middlemen |
| Competitors | Market Context + Step 2 stakeholders | Direct competitors (may hold veto power over partners) |
| Alternatives | Market Context | The **status quo workaround** — your user's current behavior |

## The status quo is the real competitor

In the alternatives search, the most valuable finding is usually "nothing — or
a manual process." Today people handle the problem with spreadsheets, Slack,
email chains, or a hired person. That workaround is not a competitor you can
shrug off; it is the baseline the product has to beat. When the search shows
*nobody is doing anything* about the problem, that is usually a sign the problem
is not painful enough — record it as an uncertainty, do not celebrate it.

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

Hold it to 3-6 bullets. Step 2 reads this section to guide stakeholder
identification, then it is dropped.

## When to skip

- The user says skip (always honored).
- WebSearch is unavailable in this runtime.
- Small tier — already complete after Q1 + S1/S2; market research never runs
  for Small projects.

## Rules

1. At most 3 searches. Hard cap.
2. Output lands only under `## Market Context`. No separate research document.
3. Never propose a pivot from this step. It feeds stakeholder discovery, not
   product strategy — sriflow-plan-review owns strategic challenge.