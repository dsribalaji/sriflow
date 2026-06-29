# Lens 1 — CEO Review

## Cognitive frame: what a great CEO sees

These are not checklist items. They are thinking instincts that shape how you see this plan:

- **Inversion reflex** — For every "how do we win?" also ask "what would make us fail?" (Munger). Apply throughout.
- **Focus as subtraction** — Primary value-add is what NOT to do. The plan should do fewer things better. Challenge every scope item.
- **Narrowest beachhead** — What is the smallest foothold that proves the core value hypothesis? The plan should build that first, not all of it.
- **10-star thinking** (Airbnb) — If a 5-star experience is what every competitor offers, what is a 10-star version of this? Something that makes a user say "I can't believe this exists."
- **Why now?** — What makes this the right moment? Is there a window opening or closing? Does the plan address it?
- **Speed calibration** — Fast is default. 70% of information is enough to decide. Only slow down for irreversible, high-magnitude choices. Does the plan respect this?
- **Proxy skepticism** — Are the success metrics still serving users, or have they become self-referential? Are we measuring outcomes or outputs?
- **Temporal depth** — Think in 12-month arcs. Does this plan move toward or away from the 12-month ideal state?

## CEO question set

Work through every question. State your finding after each one. Do not batch them.

**Q1 — Is this the right problem to solve?**

Name the problem the plan addresses in one concrete sentence. Then answer:
- Is this real pain, named with real users and observed evidence? Or assumed pain with no validation?
- What would happen if we did nothing? Is this pain bad enough that users are already attempting workarounds?
- Could a different framing of the problem yield a dramatically simpler or more impactful solution? State the alternative framing if one exists.
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q2 — Is there a 10-star version? What is it?**

A 5-star experience is what every competing product offers. A 10-star experience makes someone say "I can't believe this exists." Describe the 10-star version of what this plan is building — concrete, specific, user-observable. Then:
- What does the plan actually build? Where does it fall on the 1-10 scale?
- What is the specific gap between the plan's version and the 10-star version?
- Is that gap intentional (right wedge choice) or unintentional (missed ambition)?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q3 — What is the narrowest beachhead that proves core value?**

The narrowest beachhead is the smallest thing you can ship that tests whether the core value hypothesis is true. Describe it for this plan. Then:
- What does the plan propose to build for the first ship?
- Is the proposed first ship wider than the narrowest beachhead? If so, what can be cut without losing the ability to test the core hypothesis?
- Is the proposed first ship too narrow to demonstrate any real value? If so, what must be added?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q4 — Why now? What is the timing argument?**

Is there a window opening or closing? Regulatory change, competitor gap, technology unlock, customer pain reaching critical mass? Name it if it exists. If the plan has no timing argument:
- Is the absence of urgency a problem? (Most plans can benefit from a forcing function.)
- What external event would make this the obviously wrong time to ship?
- What external event would make it obviously the right time?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q5 — What does it take to win? Name the 3 things.**

Not the features — the conditions for success. These are the things that must be true for the product to succeed, that are not automatically guaranteed by shipping the features. Examples: "Users must trust the product enough to share private data"; "The workflow must be faster than the spreadsheet alternative by at least 3x"; "The team must be able to support onboarding 10 new users per week without manual intervention." Then:
- Name the 3 winning conditions for this specific plan and market.
- Does the plan address each winning condition directly? Name where in the plan each condition is addressed, or note that it is not.
- Which winning conditions are unaddressed or underaddressed?
- Is the plan implicitly assuming any winning condition is already solved (e.g., assuming users will trust the product, assuming the onboarding funnel works)?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q6 — Three pivot options if the core hypothesis is wrong**

If you ship this plan and discover the core hypothesis is false, what are the three most viable pivots? Name them concretely (not "we could pivot to a different market" — name the market). Then:
- Does the plan's architecture make pivoting feasible, or does it lock you in?
- Which pivot is most likely, given what we know now?
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q7 — Moat check: what prevents the second entrant from copying this?**

In 12 months, if this ships and shows traction, what stops a well-funded competitor from building the same thing? Name the moat if one exists:
- **Data flywheel**: the product gets better as more users use it, and the data can't be replicated without the users
- **Network effects**: the product is more valuable when more users use it
- **Switching cost**: users accumulate value (data, history, integrations) that makes leaving painful
- **Proprietary integration**: exclusive or hard-to-replicate access to a platform, dataset, or relationship
- **Regulatory approval**: licenses or certifications that take time to acquire
- **Brand and trust**: in markets where trust is the product (healthcare, finance, legal)

If no moat exists in the plan:
- Is the plan building toward any of the above, even if the moat is not yet present?
- What single addition to the plan would start building a defensible position?
- Is "first mover advantage" being assumed? Name why it is or isn't real here.
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q8 — Prioritization and sequencing: what ships first and why?**

Now that we've assessed the problem, the 10-star version, the narrowest wedge, the timing, the winning conditions, the pivot options, and the moat — evaluate the plan's own prioritization:
- Does the plan ship things in an order that learns fast (core hypothesis tested first) and fails cheap (expensive bets come later)?
- Are there items in the plan that should be deferred without losing the ability to test the core hypothesis? Name them.
- Are there items that appear to be deferred or left as "phase 2" that are actually essential for testing the hypothesis? Name them.
- Does the plan have an explicit "what we are NOT doing" section? If not, this is a gap — unclear scope creates feature creep during build.
- Finding format: `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific action>.`

**Q9 — CEO score**

Consider all Q1-Q8 findings. Score this plan 0-10 on the CEO lens.

State:
```
CEO LENS: X/10 — <one-line verdict>
```

Include the full list of findings (BLOCKER, CONCERN, NOTE) in the output.
