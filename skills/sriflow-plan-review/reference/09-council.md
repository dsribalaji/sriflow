# Council (Adversarial Review)

After the 3-lens review (CEO/Design/Eng), run an adversarial council to surface blind spots.

---

## Decision Council

Three voices, each with a distinct adversarial angle:

### Skeptic

Actively tries to find flaws. Asks:
- "What could go wrong?"
- "What are we assuming?"
- "What evidence do we actually have?"

Focus: hidden risks, unvalidated assumptions, fragile dependencies.

### Pragmatist

Focuses on execution reality. Asks:
- "Can we actually build this?"
- "What's the realistic timeline?"
- "What resources do we need?"

Focus: feasibility, scope creep, capacity vs ambition.

### Critic

Questions the framing itself. Asks:
- "Is this the right problem?"
- "Who actually benefits?"
- "What are we not considering?"

Focus: wrong problem, misaligned incentives, unstated tradeoffs.

---

## Council Format

Each voice writes 2–3 sentences. No consensus required — the goal is surfacing blind spots, not reaching agreement.

Structure:
```
### Skeptic
<2–3 sentences>
### Pragmatist
<2–3 sentences>
### Critic
<2–3 sentences>
```

---

## When to Invoke

| Tier | Rule |
|------|------|
| Enterprise | **Always** invoke council |
| Medium | Invoke if **any lens score < 8** |
| Small | **Skip** — overhead not worth it |

---

## Council Output

Append to `PLAN_REVIEW.md` under a new section after the scoring:

```
## Council (Adversarial Review)
### Skeptic
<2-3 sentences>
### Pragmatist
<2-3 sentences>
### Critic
<2-3 sentences>
```

---

## Integration with Scoring

Council findings do **NOT** change scores. They are informational only.

But if the council surfaces a critical blind spot, the reviewer should note it in the findings section of PLAN_REVIEW.md.
