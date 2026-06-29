---
title: Uncertainty Priority Register
phase: 01_discovery
status: DRAFT
agent: /discover
verdict: RED
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Uncertainty Priority Register — [Project Name]

**Rule:** Resolve Tier 1 before writing any requirements. Resolve Tier 2 before any sprint begins.
Never leave a Tier 1 unresolved and assume it will work itself out.

---

## Tier 1 — Resolve This Week 🔴

*High power + high uncertainty. Project scope or architecture will be wrong if unresolved.*

| # | Stakeholder | Their Uncertainty | Blocks What | Resolution Method | Owner | Target Date | Status |
|---|-------------|------------------|------------|------------------|-------|-------------|--------|
| 1 | [Name, Role] | "[Exact question they hold]" | [What feature/decision breaks without resolution] | [Interview / workshop / data analysis] | [BA name] | [YYYY-MM-DD] | 🔴 OPEN |
| 2 | [Name, Role] | "[Their uncertainty]" | [Impact] | [Method] | [Owner] | [Date] | 🔴 OPEN |

---

## Tier 2 — Resolve Before Sprint Start 🟡

*Medium power or uncertainty that shapes a major feature area.*

| # | Stakeholder | Their Uncertainty | Affects | Resolution Method | Owner | Target Date | Status |
|---|-------------|------------------|---------|------------------|-------|-------------|--------|
| 1 | [Name, Role] | "[Uncertainty]" | [Feature area] | [Method] | [Owner] | [Date] | 🟡 OPEN |

---

## Tier 3 — Resolve Before Build Completes 🟢

*Lower power or peripheral uncertainty; important but not blocking.*

| # | Stakeholder | Their Uncertainty | Notes | Owner | Target Date | Status |
|---|-------------|------------------|-------|-------|-------------|--------|
| 1 | [Name, Role] | "[Uncertainty]" | [Why this can wait] | [Owner] | [Date] | 🟢 DEFERRED |

---

## Resolved Uncertainties (Archive)

| Stakeholder | Uncertainty | Resolved by | Resolution | Date |
|-------------|-------------|------------|------------|------|
| [Name] | "[Uncertainty]" | [Name] | "[What was confirmed]" | [Date] |

---

## Phase Gate Check

- [ ] All Tier 1 uncertainties have a resolution owner and target date
- [ ] At least one resolution method is defined per Tier 1 item
- [ ] No Tier 1 item is "TBD" or unassigned
- [ ] Every Tier 1 stakeholder has a clarity check score ≥ 8/10 (or a plan to reach it)
