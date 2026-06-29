---
name: elicit
version: 2.0.0
phase: "02 — Elicitation"
description: >
  Elicitation — Phase 2 of the BA pipeline. Designs structured interview scripts, layered question
  sets, questionnaires, and Black Box reverse engineering sessions for any stakeholder tier.
  Modes: Generate, Review, Script, Reverse Engineer, Simulate.
  Never generates questions without confirming the discovery goal and stakeholder tier first.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - design interview questions
  - build a questionnaire
  - reverse engineer this system
  - what questions should I ask
  - prepare for my stakeholder interview
  - elicit requirements
  - /elicit
prerequisite: /discover — Phase 1 must be complete. Tier 1 stakeholders must be named.
next-skill: /usecase
outputs:
  - 02_elicitation/interview-scripts/INT-001_[Role]_[Date].md
  - 02_elicitation/question-sets/QS-001_[Topic].md
  - 02_elicitation/session-notes/NOTES-001_[Role]_[Date].md
  - 02_elicitation/reverse-engineering/RE-001_[System]_blackbox.md
  - 02_elicitation/divergence-log.md
gate:
  rule: Tier 1 clarity checks scored ≥ 8/10 before moving to Use Cases
  signal: DONE when every Tier 1 uncertainty has a resolution confirmed by the stakeholder
---

# /elicit — Elicitation (Interviews, Questionnaires & Reverse Engineering)

## When to invoke this skill

Phase 2 of the BA pipeline. Use when preparing for a stakeholder interview, building a questionnaire
for broad input, scoring or reviewing existing questions, performing Black Box reverse engineering
on an existing system or UI prototype, or simulating stakeholder responses to test question quality.

**Prerequisite:** `/discover` must be complete. The Stakeholder Register must exist with named Tier 1
stakeholders and their top uncertainties. Never generate questions without knowing who they are for
and what uncertainty they target.

## Core Principle: Your Job Is to Be a Vacuum

> "The requirement that kills a project is the one nobody volunteers — and you'll miss it by talking."

Elicitation is **drawing out** what is already in the stakeholder's head — not putting your ideas into it. The BA who dominates the session hasn't elicited — they've broadcast assumptions and called it discovery.

**The 70/30 Stance:** ~70% listening, ~20% clarifying, ~10% suggesting.

**Three instincts to resist:**
- The urge to impress → makes the conversation about you, not them
- Eagerness to help → premature solutions close doors before the real need surfaces
- Discomfort with silence → fills the space where the project-saving insight was forming

---

## Step 1 — Confirm Before Generating

Before any question set is produced, confirm:

1. **Who is this for?** (Name, title, stakeholder tier from the register)
2. **What uncertainty are we targeting?** (Reference the Tier 1/2/3 register entry)
3. **What mode do we need?**
   - **Generate** — Design a new question set from a discovery goal
   - **Review** — Score and improve an existing question set
   - **Script** — Build a full interview script with opening, flow, probes, and close
   - **Reverse Engineer** — Extract implemented requirements from an existing system (Black Box)
   - **Simulate** — Role-play stakeholder answers to test question quality

4. **What domain context exists?** (Any existing BRD, PRD, system docs, or mockups to inform questions)

---

## Step 2 — The Layered Question Methodology

All questions sit in one of four layers. Questions must be sequenced from surface to depth — never start at Features when you haven't established Exploration.

```
Layer 1 — EXPLORE    → What exists today? What hurts? What's the reality?
Layer 2 — CONTEXT    → Why does it work this way? Who's involved? What shapes the environment?
Layer 3 — PROCESS    → How exactly does it work? Walk me through it step by step.
Layer 4 — IDEA/FUTURE → What would better look like? What's missing?
```

**Layer sequencing rule:** Never advance to the next layer until the current one is clear.

**Default distribution for a 10-question set:**

| Layer | Default | When to increase |
|-------|---------|-----------------|
| Explore | 3 | New domain, no prior context, first session |
| Context | 2 | Multi-stakeholder alignment needed, political complexity |
| Process | 3 | Migration, replatform, operational systems |
| Idea/Future | 2 | Greenfield product, innovation, design-level discovery |

---

## Step 3 — Stakeholder-Appropriate Questioning

Tailor question style to the stakeholder tier:

### C-Level / Executive
- Speak in business outcomes, not features
- Time-box to 30 min max; respect their calendar
- Lead with impact: "What would success look like for the business?"
- Avoid technical terms; if necessary, immediately translate

**Example questions:**
- "What is the business problem this project solves — in one sentence?"
- "How will you know in 6 months that this worked?"
- "What's the biggest risk if we get this wrong?"
- "What's the one thing you'd cancel the project over if it's not in scope?"

### Manager / Process Owner
- Focus on operational workflows and pain points
- Ask about exceptions, failures, and workarounds
- "What does your team complain about most?"
- Map their day-in-the-life before proposing changes

**Example questions:**
- "Walk me through how [process] works today from start to finish."
- "Where does it break down? What happens when it does?"
- "What workarounds has your team invented to cope with the current system?"
- "What does your team need from this system that they can't get today?"

### End User / Frontline
- Ask task-specific, concrete questions
- Observe actual workflow if possible (don't just ask)
- Avoid leading questions ("Wouldn't it be better if...?")
- Ask about frequency, volume, error rates

**Example questions:**
- "Show me how you [perform the task] today."
- "What's the most frustrating step in this process?"
- "What do you have to do manually that you wish the system did automatically?"
- "How often do you encounter [specific problem]? What do you do when you do?"

---

## Step 4 — Interview Script Template (Script Mode)

```markdown
# INT-001 — [Role] Interview Script
**Date:** [YYYY-MM-DD]
**Stakeholder:** [Name, Title]
**Primary uncertainty target:** [From Tier register]
**Duration:** 45 minutes

## Opening (5 min)
"Thank you for your time. Our goal today is to understand [specific domain/process] from your
perspective so we can make sure we build what you actually need — not what we assume you need.
Can I start by asking you to walk me through a typical [relevant day/task]?"

## Layer 1 — Explore (10 min)
1. "[Explore question 1]"
2. "[Explore question 2]"
3. "[Explore question 3]"

## Layer 2 — Context (10 min)
4. "[Context question 1]"
5. "[Context question 2]"

## Layer 3 — Process (10 min)
6. "[Process question 1]"
7. "[Process question 2]"
8. "[Process question 3]"

## Layer 4 — Idea/Future (5 min)
9. "[Future question 1]"
10. "[Future question 2]"

## Hypothesis Check (5 min)
"Based on what you've told me, here's what I think you need: [your current understanding].
Does this sound right? What's missing or wrong?"

## Clarity Check (2 min)
"On a scale of 0–10, how confident are you that we now understand what you need?
What would move that number higher?"

## Close
"Is there anything else about [domain] that you think we should know?
Is there anyone else I should be talking to?"
```

---

## Step 5 — Question Scoring (Review Mode)

Score every question set before using it:

| Criterion | Score 0 | Score 5 | Score 10 |
|-----------|---------|---------|---------|
| **Layer correct?** | No layer, jumps to solutions | Partially sequenced | Correct layer, correct sequence |
| **Open-ended?** | Yes/no question | Partially open | Fully open, encourages elaboration |
| **Role-appropriate?** | Wrong tier language | Partially appropriate | Perfectly calibrated for this stakeholder tier |
| **Uncertainty-targeted?** | Generic, could be for anyone | Loosely related | Directly targets the Tier uncertainty |
| **Assumption-free?** | Embeds assumptions ("since you want X...") | Partially neutral | Fully neutral, no embedded solution |

**Minimum acceptable average: 7/10 per question. Rewrite any question scoring < 7.**

---

## Step 6 — Black Box Reverse Engineering (RE Mode)

Use when you have an existing system, prototype, or UI and no documentation.

### RE Process

**Step 6a — Visual Inventory**
Scan the system left-to-right, top-to-bottom. For each screen, document:
- Entities visible (what "things" the system manages)
- Actions available (what the user can do)
- Data fields displayed (what information is shown or captured)
- Navigation flows (how screens connect)
- Business rules visible (validation messages, conditional displays, status labels)

**Step 6b — Inferred Behavior**
For each entity and action, infer the underlying behavior:
- What must happen in the database when this action runs?
- What business rule is implied by this validation?
- What role/permission is required to see/trigger this?
- What is the happy path? What are the likely exceptions?

**Step 6c — Gap and Ambiguity Log**
Document everything the UI does not reveal:
- API behavior behind the UI
- Server-side validation vs. client-side only
- Concurrency behavior (what happens if two users act simultaneously?)
- State machine transitions not visible in the current screen
- Error conditions not yet triggered

**Step 6d — SME Question List**
Produce a prioritized list of questions for a Subject Matter Expert to confirm your inferences.
Format: "[Inferred behavior] — is this correct? If not, what is the actual behavior?"

**RE Output Template:**

```markdown
# RE-001 — [System Name] Black Box Analysis
**Status:** DRAFT | CONFIRMED
**Date:** [YYYY-MM-DD]
**Source artifact:** [URL, file name, screenshot set]

## Entities Identified
- **[Entity 1]:** [Description of what it represents in the business domain]
- **[Entity 2]:** [Description]

## Actions / CRUD Operations
| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| [Entity] | ✅ | ✅ | ✅ | ✅ | [Constraints observed] |

## Business Rules (Confirmed)
- BR-001: [Rule — e.g., "Only Admin role can delete records"]
- BR-002: [Rule]

## Business Rules (Inferred — needs SME confirmation)
- BR-INF-001: [Inferred rule] — **Confidence: High/Medium/Low**

## Ambiguities and Gaps
| ID | What is unclear | Why it matters | SME question |
|----|----------------|----------------|--------------|
| GAP-001 | [Unclear behavior] | [Impact on requirements] | "[Exact question to ask]" |

## SME Confirmation Q&A
| Question | Answer | Confirmed by | Date |
|----------|--------|--------------|------|
| [Question] | [Answer] | [Name] | [Date] |
```

---

## Output Artifacts

Produce files in `02_elicitation/` using the naming convention:

| File | Location | Naming Pattern |
|------|----------|---------------|
| Interview script | `interview-scripts/` | `INT-001_[Role]_[YYYY-MM-DD].md` |
| Question set | `question-sets/` | `QS-001_[Topic].md` |
| Session notes | `session-notes/` | `NOTES-001_[Role]_[YYYY-MM-DD].md` |
| RE report | `reverse-engineering/` | `RE-001_[SystemName]_blackbox.md` |
| Divergence update | root of `02_elicitation/` | `divergence-log.md` (update, don't replace) |

---

## Phase Gate

**DONE signal:** Every Tier 1 uncertainty has a clarity check score ≥ 8/10, confirmed by the stakeholder. Divergence log is complete. Session notes are filed.

**Next skill:** `/usecase` — convert elicitation findings into formal Use Cases.

---

## Anti-Patterns to Reject

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| Leading questions ("You'd want X, right?") | Confirms your assumption, not their need | Rewrite as open: "What would you want the system to do here?" |
| Solution-first questions ("Should we build a dashboard?") | Closes off alternatives before the problem is understood | Ask about the problem first: "What decision do you need to make daily?" |
| Jumping to Layer 4 immediately | Skips the reality check; requirements become wish lists | Always establish Layer 1 (current state/pain) before Layer 4 (future state) |
| Generic questions that could be for anyone | Wastes the stakeholder's time; misses tier-specific insights | Customize every question to this specific person's role and uncertainty |
| Skipping the clarity check | Leaves residual uncertainty undetected | Always close with the 0–10 scale question |
