# Step 4 — The Stakeholder Register

Write the full register and keep revising it across discovery.

```markdown
# Stakeholder Register — [Project Name]

| Name / Role | Category | Power | Interest | Top Uncertainty | Analysis Needed | Deliverable |
|-------------|----------|-------|----------|----------------|----------------|-------------|
| [Full name, Title] | [Category] | H/M/L | H/M/L | "[Specific open question]" | [What analysis resolves this?] | [Specific artifact or answer] |
```

**Red/Green classification:**
- **GREEN** — Named individual, top uncertainty identified, analysis planned, priority tier assigned
- **RED** — Named as a group ("leadership"), OR top uncertainty unidentified, OR no resolution plan

**Any generic group label is automatically RED. Name the individuals.**

---

# Step 5 — Uncertainty Prioritization

Uncertainties are not created equal. Rank them by how much damage leaving them unresolved would cause.

**Priority tiers:**

- **Tier 1 — Resolve This Week:** High power + high uncertainty. Project scope or architecture will be wrong if this isn't resolved first.
- **Tier 2 — Resolve Before Sprint Start:** Medium power or uncertainty that shapes a major feature area.
- **Tier 3 — Resolve Before Build Completes:** Low power or peripheral uncertainty; important but not blocking.

**The rule:** resolve every Tier 1 before any requirement is written. Resolve Tier 2 before any sprint starts. Never leave a Tier 1 open and assume it will sort itself out.

**Produce a ranked list:**

```markdown
# Uncertainty Priority Register — [Project Name]

## Tier 1 — Resolve This Week
1. [Stakeholder Name]: "[Their top uncertainty]" — blocks: [what gets wrong without resolution]

## Tier 2 — Resolve Before Sprint Start
1. [Stakeholder Name]: "[Their uncertainty]" — affects: [feature area]

## Tier 3 — Resolve Before Build Completes
1. [Stakeholder Name]: "[Their uncertainty]" — low-risk deferral: [why it can wait]
```