# Phase Details

## Phase 1 — Discovery (Stakeholder Mapping) (Medium / Enterprise only)

Small tier already finished in Scale Detection. This phase is for Medium and Enterprise only.

**Goal:** Map every named stakeholder by power, interest, and top uncertainty.

Read: `phases/01-discovery/README.md`
Questions: `phases/01-discovery/questions/phase-questions.md`
Templates: `phases/01-discovery/templates/`
Gate: `phases/01-discovery/gates/gate-checklist.md`

**Phase 1 Gate:**
- **Medium:** Top 3-5 stakeholders named + top uncertainty identified
- **Enterprise:** Every Tier 1 stakeholder named with top uncertainty before proceeding

---

## Phase 2 — Elicitation (Interview Design) (Enterprise / Medium-depth)

**Goal:** Design structured interview scripts and question sets to resolve Tier 1 uncertainties.

Read: `phases/02-elicitation/README.md`
Questions: `phases/02-elicitation/questions/phase-questions.md`
Templates: `phases/02-elicitation/templates/`
Gate: `phases/02-elicitation/gates/gate-checklist.md`

**Phase 2 Gate:**
- **Small:** Skip (no separate phase)
- **Medium:** All Phase 2 questions answered (Q19-Q28), 1-paragraph summary per stakeholder
- **Enterprise:** Every Tier 1 uncertainty has clarity check score ≥ 8/10

---

## Phase 3 — Use Cases (SCOPE GATE)

**Goal:** Convert elicitation findings into formal Use Cases at Sea Level (Cockburn framework).

Read: `phases/03-usecases/README.md`
Questions: `phases/03-usecases/questions/phase-questions.md`
Templates: `phases/03-usecases/templates/`
Gate: `phases/03-usecases/gates/gate-checklist.md`

**Phase 3 Gate:**
- **Small:** Skip (features list = use cases)
- **Medium:** Top 3-5 use cases GREEN, inline summary table
- **Enterprise:** All primary Use Cases are GREEN. UC Inventory up to date.

---

## Phase 4 — Requirements (BRD + User Stories)

**Goal:** Score BRD requirements and write INVEST User Stories with Given-When-Then acceptance criteria.

Read: `phases/04a-brd/README.md` and `phases/04b-stories/README.md`
Questions: `phases/04a-brd/questions/phase-questions.md` and `phases/04b-stories/questions/phase-questions.md`
Templates: `phases/04a-brd/templates/` and `phases/04b-stories/templates/`
Gate: `phases/04a-brd/gates/gate-checklist.md` and `phases/04b-stories/gates/gate-checklist.md`

**Phase 4 Gate:**
- **Small:** Skip (stories in PLAN.md inline)
- **Medium:** FRs inline + stories with GWT in table format
- **Enterprise:** Stories pass INVEST + GWT. BRD scores ≥ 7.

---

## Phase 5 — UI & Data

**Goal:** Animate screens with Field + Value + Behavior + Rule. Map to Feature Data Dictionary.

Read: `phases/05-nfr/README.md`
Questions: `phases/05-nfr/questions/phase-questions.md`
Templates: `phases/05-nfr/templates/`
Gate: `phases/05-nfr/gates/gate-checklist.md`

**Phase 5 Gate:**
- **Small:** Skip (tech stack in plan)
- **Medium:** Screen list + key fields inline in PLAN.md
- **Enterprise:** Every field has type, validation, behavior, rule. No open questions.

---

## Phase 6 — Architecture

**Goal:** Discover Non-Functional Requirements and produce system design.

Read: `phases/06-officehours/README.md`
Questions: `phases/06-officehours/questions/phase-questions.md`

**Phase 6 Gate:**
- **Small:** Skip (tech stack in plan)
- **Medium:** Stack + NFR summary inline in PLAN.md
- **Enterprise:** NFRs numeric, business-traced, conflicts resolved. System design complete.
