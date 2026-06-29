---
title: NFR Conflict Register
phase: 06_architecture
status: DRAFT
agent: /nfr
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# NFR Conflict Register — [Project Name]

**Purpose:** Document every case where two NFRs cannot both be fully satisfied simultaneously.
**Rule:** Every conflict must have a human decision recorded before architecture work begins.
Unresolved conflicts are architecture ambiguities that will surface as production incidents.

---

## Active Conflicts

| ID | NFR A | NFR B | Nature of Conflict | Option A | Option B | Recommended | Decided by | Decision | Date |
|----|-------|-------|-------------------|----------|----------|-------------|------------|----------|------|
| CF-001 | NFR-P01 (≤ 200ms p95) | NFR-S01 (AES-256 encryption) | Encryption adds ~15–30ms latency per DB read under load; may push p95 over 200ms at peak | Relax performance target to 250ms p95 | Offload encryption to infrastructure layer (hardware HSM or cloud KMS) rather than application layer — eliminates most latency cost | Option B (offload to infra) | [Name] | 🔴 PENDING | — |
| CF-002 | NFR-A01 (99.9% uptime) | NFR-CO01 (≤ $X/month) | 99.9% uptime requires multi-AZ active-passive or active-active setup; estimated cloud cost: $[X+Y]/month vs. single-AZ at $[X]/month | Accept single-AZ + enhanced monitoring; revise uptime target to 99.5% | Increase infrastructure budget to $[X+Y] to support multi-AZ | Requires Finance + Product decision | [Name] | 🔴 PENDING | — |
| CF-003 | NFR-SC01 (500 concurrent users) | NFR-M01 (weekly deployments, zero downtime) | High concurrent user load requires session affinity or sticky sessions; zero-downtime deployments require stateless sessions | Use Redis-backed sessions (stateless, zero-downtime safe, adds Redis cost ~$[X]/month) | Use rolling deployments with forced re-login on deploy (acceptable if deploy occurs off-peak) | Option A if budget allows | [Name] | 🔴 PENDING | — |

---

## Resolved Conflicts

| ID | Conflict Summary | Resolution | Decided by | Date |
|----|-----------------|------------|------------|------|
| CF-### | [Brief description] | [What was agreed — which option, or a third path] | [Names] | [Date] |

---

## Conflict Resolution Process

1. **Document the conflict** — state both NFRs and why they cannot coexist
2. **Generate options** — at least two viable paths, with trade-offs per option
3. **Present to decision-makers** — the stakeholder(s) who own each conflicting NFR
4. **Record the decision** — who decided, what they chose, any conditions
5. **Update the NFR Specification** — reflect the confirmed (possibly revised) NFR targets
6. **Flag to architecture team** — confirmed conflicts drive technology choices

---

## Notes

**[YYYY-MM-DD]:** [Note about conflict discovery or resolution session]
