---
name: discover
version: 2.0.0
phase: "01 — Discovery"
description: >
  Stakeholder Discovery — Phase 1 of the BA pipeline. Maps every named stakeholder by power,
  interest, and top uncertainty. Runs the Disagreement Diagnostic on shared vague phrases.
  Produces: Stakeholder Register, Power/Interest Map, Tier 1/2/3 Priority ranking, Interview Plan.
  ALWAYS start here. Never begin elicitation, use cases, or BRD work without a completed Phase 1.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - who are the stakeholders
  - map the stakeholders
  - stakeholder register
  - who should I talk to
  - who decides
  - /discover
next-skill: /elicit
outputs:
  - 01_discovery/stakeholder-register.md
  - 01_discovery/power-interest-map.md
  - 01_discovery/uncertainty-priority.md
  - 01_discovery/disagreement-log.md
  - 01_discovery/interview-plan.md
gate:
  rule: Every Tier 1 stakeholder named with top uncertainty before elicitation begins
  signal: DONE when all Tier 1 uncertainties have a resolution plan and clarity check ≥ 8/10
---

# /discover — Stakeholder Discovery

## When to invoke this skill

Phase 1 of the BA pipeline. Use when starting any project from zero, when a requirement is
attributed to a group label ("leadership," "the business," "users"), when stakeholders disagree
and you need to understand why, or when you need to plan who to interview and in what order.

Proactively invoke this skill before beginning any elicitation session, interview plan, BRD section,
or requirements workshop. If anyone refers to "the stakeholders" as one voice — invoke this skill first.

## Core Principle: Uncertainty Is Never Reduced "In General"

> "Uncertainty is never reduced 'in general.' It's reduced for a specific person who has to decide something."

"The stakeholders" are not one voice. They are multiple people with distinct problems, distinct decisions to make, and distinct uncertainties to resolve. Treating them as one audience is the single most common cause of requirements that satisfy nobody.

**The BA's job:** Map who decides what — then aim each piece of analysis at the person who actually needs it.

---

## Step 1 — Confirm the Project Context

Before mapping stakeholders, confirm:
- What system or product are we building (in one sentence)?
- What phase is this project in? (Greenfield / Existing system / Enhancement)
- Do we have any existing documentation (BRD draft, PRD, design brief, legacy system)?
- Has any stakeholder discovery been done before? If yes — what exists?

---

## Step 2 — Identify: Who Is in the System?

Cast wide before narrowing. Ask the following for every system being built:

**Discovery questions:**
- Who commissioned this work? Who is paying for it?
- Who will use the system daily / weekly / occasionally?
- Who approves the work as "done"? Who signs off?
- Who will be affected if this fails?
- Who has blocked or paused similar work in the past?
- Who has data or systems this project depends on?
- Who is NOT in the room but should have a voice?

**Stakeholder categories — check all that apply per person:**

| Category | Description | Common Titles |
|----------|-------------|---------------|
| **Decision-Maker** | Final say on scope, priorities, go/no-go | CEO, VP, Product Owner, Sponsor |
| **Subject Matter Expert** | Owns the domain knowledge | Ops Lead, Finance Manager, Compliance Officer |
| **End User** | Uses the system to do their job | Field staff, Data Analyst, Customer |
| **Technical Gatekeeper** | Controls architecture, data, or infrastructure | IT Lead, DBA, Security Officer, Architect |
| **Affected Party** | Impacted by the change but not a user | Adjacent team, Downstream process owner |
| **Regulator / Auditor** | External compliance or governance requirement | Legal, External Auditor, Regulatory Body |

**Output:** Produce a stakeholder list with name, title, category, and initial notes before moving to Step 3.

---

## Step 3 — Map: Power, Interest, Uncertainty

For each identified stakeholder, assess three dimensions:

### 3a — Power / Influence (High / Medium / Low)
Can this person stop the project, change its scope, or veto a decision?
- **High:** Project cannot proceed without their buy-in
- **Medium:** Can significantly delay or redirect if dissatisfied
- **Low:** Affected but not blocking

### 3b — Interest / Stakes (High / Medium / Low)
How much does the outcome of this project affect their daily work or goals?
- **High:** Their job changes significantly because of this project
- **Medium:** Noticeable but not daily impact
- **Low:** Peripheral impact

### 3c — Top Uncertainty (the most important dimension)
What is the single biggest open question this stakeholder carries about this project?

> "This will help ______ decide ______."
> If you can't fill both blanks with a specific name and a specific decision — you haven't found the uncertainty yet.

**Example — CRM System project:**

| Name / Role | Category | Power | Interest | Top Uncertainty | Analysis Needed | Deliverable |
|-------------|----------|-------|----------|----------------|----------------|-------------|
| Sarah Chen, VP Sales | Decision-Maker | High | High | "Will this give my reps time back, or add admin?" | Time study: current vs. new workflow | Before/after time per deal showing ≥ 20% reduction |
| Marcus Webb, IT Lead | Technical Gatekeeper | High | Medium | "Can we integrate with our ERP without custom middleware?" | Integration feasibility assessment | Confirmed integration path or identified gap |
| Priya Rao, Sales Rep | End User | Low | High | "Will this be harder to use than what we have now?" | UX comparison: current vs. new | 5-minute onboarding benchmark |
| David Kim, Finance | Affected Party | Medium | Medium | "How will we audit commission calculations?" | Audit trail spec | Commission audit trail specification |

---

## Step 4 — The Stakeholder Register

Produce the full register. Update it throughout discovery.

```markdown
# Stakeholder Register — [Project Name]

| Name / Role | Category | Power | Interest | Top Uncertainty | Analysis Needed | Deliverable |
|-------------|----------|-------|----------|----------------|----------------|-------------|
| [Full name, Title] | [Category] | H/M/L | H/M/L | "[Specific open question]" | [What analysis resolves this?] | [Specific artifact or answer] |
```

**Red/Green classification:**
- 🟢 **GREEN** — Named individual, top uncertainty identified, analysis planned, priority tier assigned
- 🔴 **RED** — Named as a group ("leadership"), OR top uncertainty unidentified, OR no resolution plan

**Any generic group label is automatically RED. Name the individuals.**

---

## Step 5 — Uncertainty Prioritization

Not all uncertainties are equal. Rank them by the damage caused if left unresolved.

**Priority tiers:**

- 🔴 **Tier 1 — Resolve This Week:** High power + high uncertainty. Project scope or architecture will be wrong if this isn't resolved first.
- 🟡 **Tier 2 — Resolve Before Sprint Start:** Medium power or uncertainty that shapes a major feature area.
- 🟢 **Tier 3 — Resolve Before Build Completes:** Low power or peripheral uncertainty; important but not blocking.

**The rule:** Resolve Tier 1 before writing any requirements. Resolve Tier 2 before any sprint begins. Never leave a Tier 1 unresolved and assume it will work itself out.

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

---

## Step 6 — The Disagreement Diagnostic

When stakeholders appear to agree but are using the same word for different things:

**Warning signals:**
- Multiple stakeholders nod at a vague phrase ("better visibility," "smarter reporting," "more efficient")
- The same requirement satisfies two people but would require contradictory architectural choices
- Stakeholders stop using the phrase but describe very different things in the next sentence

**Diagnostic question (ask each stakeholder separately):**
> "When you say [the agreed phrase], are you trying to [Option A] or [Option B]?"

**Classic example — The Dashboard Disaster:**
> "When you say 'better visibility into operations,' are you trying to **react to a problem today** — within the hour — or **review what happened last month** for the board?"
>
> COO: *"React today. If a shipment's slipping, I want to know within the hour."*
> CFO: *"Last month. It has to reconcile to the ledger for the board; I don't want live numbers."*

One phrase. Two completely different products. Found in ten minutes of separate conversations.

**Output — Disagreement Log entry:**

```markdown
| Phrase | Stakeholder A | A's meaning | Stakeholder B | B's meaning | Status |
|--------|---------------|-------------|---------------|-------------|--------|
| "better visibility" | COO | Real-time ops dashboard (<1hr lag) | CFO | Monthly reconciled board report | OPEN |
```

---

## Step 7 — Interview Plan

For each Tier 1 and Tier 2 stakeholder, produce a focused interview plan.

**Interview structure:**

```
1. Open with their role (5 min)
   "Walk me through your day on [relevant process]. What does that look like today?"

2. Surface the pain, not the solution (10 min)
   "What's the most frustrating part of [current process]?"
   "When does it break down? What happens when it does?"

3. Define success (10 min)
   "If this project goes perfectly, what does your day look like six months from now?"
   "How would you know it worked? What would you see or measure?"

4. Test your hypotheses (10 min)
   "Here's what I think you need. Does this sound right?"
   Listen for corrections — corrections are the gold.

5. Clarity check (5 min)
   "On a scale of 0–10, how confident are you that we understand what you need?"
```

**After every interview:** Update the Stakeholder Register with new uncertainties surfaced. Flag any new disagreements.

---

## Output Artifacts

Produce these five files in `01_discovery/`:

1. **`stakeholder-register.md`** — full table, one row per stakeholder
2. **`power-interest-map.md`** — 2×2 grid (power vs interest) with stakeholder placement
3. **`uncertainty-priority.md`** — Tier 1/2/3 ranking with rationale
4. **`disagreement-log.md`** — vague phrases + diverging stakeholder definitions
5. **`interview-plan.md`** — sequenced plan: who, goal, primary uncertainty, date

---

## Phase Gate

**DONE signal:** Every Tier 1 stakeholder is named, their top uncertainty is documented, a resolution plan exists, and the clarity check score ≥ 8/10.

**Next skill:** `/elicit` — design the interview scripts and question sets to resolve Tier 1 uncertainties.

---

## Anti-Patterns to Reject

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| "Leadership needs better visibility." | "Leadership" is 2–5 people with different needs. | Name each leader. Interview separately. |
| Interviewing only the loudest voice | Quiet stakeholders often have highest-impact uncertainties | Map every category; use the register to identify gaps |
| Treating the sponsor as the only decision-maker | End users who reject the system at launch are also decision-makers | Include End User uncertainty as Tier 1 if adoption is a risk |
| Stakeholder list not updated after interviews | New stakeholders surface mid-discovery | Treat the register as a living document |
| Assuming agreement because nobody objected | Silence is not agreement; it's often unexpressed confusion | Use the clarity check (0–10) at the end of every interview |

---

## The Clarity Check — Use in Every Meeting

> "On a scale of 0 to 10, how confident are you that we understand what you need?"

- **0–5:** Stop. More work required before proceeding.
- **6–7:** Identify the specific gaps keeping them from an 8 and close those gaps.
- **8–10:** Document the confidence level, who gave it, and the date. Proceed.

**If the number didn't move after your analysis — your work didn't land.**
