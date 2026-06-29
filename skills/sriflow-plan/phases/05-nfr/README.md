# Phase 5 — NFR (Non-Functional Requirements)

**Goal:** Discover Non-Functional Requirements and produce system design.

---

## Step 5.1 — Confirm UI & Data Complete

**Q46:** Confirm: Every field has type, validation, behavior, rule?

---

## Step 5.2 — NFR Discovery

For each NFR category, ask:

**Q47 (Performance):** What are the response time requirements? (e.g., <200ms for API calls, <2s for page loads)

**Q48 (Availability):** What uptime is required? (e.g., 99.9%, 99.99%)

**Q49 (Security):** What authentication/authorization is needed? What compliance requirements? (GDPR, HIPAA, SOC2)

**Q50 (Scalability):** What are the expected user counts? Data volumes? Growth projections?

**Q51 (Cost):** What's the budget infrastructure? Any cost constraints?

---

## Step 5.3 — System Design

**Q52:** Based on everything above, confirm the architecture:
- System design (prose)
- Component table
- Data flow
- Key dependencies

---

## Output

- `NFR.md` — full non-functional requirements specification
- `system-design.md` — architecture and component design
