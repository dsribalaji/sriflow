# Uncertainty Prioritization

Not all uncertainties are equal. Rank them by the damage caused if left unresolved.

## Priority Tiers

- **Tier 1 — Resolve This Week:** High power + high uncertainty. Project scope or architecture will be wrong if this isn't resolved first.
- **Tier 2 — Resolve Before Sprint Start:** Medium power or uncertainty that shapes a major feature area.
- **Tier 3 — Resolve Before Build Completes:** Low power or peripheral uncertainty; important but not blocking.

**The rule:** Resolve Tier 1 before writing any requirements. Resolve Tier 2 before any sprint begins. Never leave a Tier 1 unresolved and assume it will work itself out.

## Ranked List Template

```markdown
# Uncertainty Priority Register — [Project Name]

## Tier 1 — Resolve This Week
1. [Stakeholder Name]: "[Their top uncertainty]" — blocks: [what gets wrong without resolution]

## Tier 2 — Resolve Before Sprint Start
1. [Stakeholder Name]: "[Their uncertainty]" — affects: [feature area]

## Tier 3 — Resolve Before Build Completes
1. [Stakeholder Name]: "[Their uncertainty]" — low-risk deferral: [why it can wait]
```
