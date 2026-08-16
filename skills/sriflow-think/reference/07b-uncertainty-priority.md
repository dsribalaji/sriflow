# Step 5 — Uncertainty Prioritization

Not all uncertainties are equal. Rank them by the damage caused if left
unresolved. The output is the ranked register that drives the interview plan
in Step 7 and the gate at the end of this skill.

## Priority tiers

- 🔴 **Tier 1 — Resolve This Week:** High power + high uncertainty. Project
  scope or architecture will be wrong if this isn't resolved first.
- 🟡 **Tier 2 — Resolve Before Sprint Start:** Medium power or uncertainty
  that shapes a major feature area.
- 🟢 **Tier 3 — Resolve Before Build Completes:** Low power or peripheral
  uncertainty; important but not blocking.

## The rules

1. **Resolve all Tier 1 before writing any requirements.** A Tier 1 left
   unresolved is a scope or architecture error you have already committed to.
2. **Resolve Tier 2 before any sprint begins.**
3. **Never leave a Tier 1 unresolved and assume it will work itself out.**
   If it can't be resolved this week, promote the uncertainty to a named
   risk with an owner and a date.
4. One stakeholder, one uncertainty per row. A stakeholder with three open
   questions produces three rows.

## Tiering method

For each stakeholder's top uncertainty, score two dimensions:

| Dimension | H | M | L |
|-----------|---|---|---|
| **Power** | Can stop the project / redefine scope | Shapes a major feature | Peripheral, advisory |
| **Uncertainty** | Answer changes the architecture or core flow | Answer changes a feature area | Answer changes details only |

- H+H or H power + M uncertainty → **Tier 1**
- M+M or M power + L uncertainty → **Tier 2**
- Everything else → **Tier 3**

**Inversion check (office-hours pattern):** for each Tier 1, ask
"what would make this fail?" If the failure scenario is catastrophic (data
loss, regulatory, irreversible commitment), the uncertainty is not just Tier
1 — it needs a decision or an experiment this week, not an interview later.

## Output

```markdown
# Uncertainty Priority Register — [Project Name]

## Tier 1 — Resolve This Week
1. [Stakeholder Name]: "[Their top uncertainty]" — blocks: [what gets wrong
   without resolution]

## Tier 2 — Resolve Before Sprint Start
1. [Stakeholder Name]: "[Their uncertainty]" — affects: [feature area]

## Tier 3 — Resolve Before Build Completes
1. [Stakeholder Name]: "[Their uncertainty]" — low-risk deferral: [why it can wait]
```

## Feeding the gate

The skill gate requires all Tier 1 uncertainties to reach clarity ≥ 8/10.
Clarity check, per Tier 1 item:

| Score | Meaning |
|-------|---------|
| 9-10 | Answered by a named individual with evidence |
| 7-8 | Answered by a named individual, still second-hand |
| 4-6 | Partial — conflict between sources, needs the interview |
| 0-3 | Unanswered — still a guess |

Any Tier 1 at ≤6 goes on the Step 7 interview plan as a first-class question.
The gate is not passable while a Tier 1 sits below 8/10.