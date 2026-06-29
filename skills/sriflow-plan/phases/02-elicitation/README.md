# Phase 2 — Elicitation (Interview Design)

**Goal:** Design structured interview scripts and question sets to resolve Tier 1 uncertainties.

---

## Step 2.1 — Confirm Discovery Complete

**Q19:** Confirm: Is the Stakeholder Register from Phase 1 complete and approved?

---

## Step 2.2 — For Each Tier 1 Stakeholder, Design Interview

For [Stakeholder Name], ask:

**Q20:** What mode do we need?
- A) Generate — Design new question set from discovery goal
- B) Review — Score and improve existing questions
- C) Script — Build full interview script with opening, flow, probes, close
- D) Reverse Engineer — Extract requirements from existing system (Black Box)
- E) Simulate — Role-play stakeholder answers to test question quality

**Q21:** What domain context exists? (Any existing BRD, PRD, system docs, or mockups)

---

## Step 2.3 — Layered Question Design

For each interview, design questions in 4 layers:

**Layer 1 — EXPLORE (3 questions minimum):**
**Q22:** What exists today for [stakeholder's process]? What hurts? What's the reality?

**Layer 2 — CONTEXT (2 questions minimum):**
**Q23:** Why does it work this way? Who's involved? What shapes the environment?

**Layer 3 — PROCESS (3 questions minimum):**
**Q24:** How exactly does it work? Walk through it step by step.

**Layer 4 — IDEA/FUTURE (2 questions minimum):**
**Q25:** What would better look like? What's missing?

---

## Step 2.4 — Question Scoring

Score every question on 5 criteria (0-10 each):
- Layer correct?
- Open-ended?
- Role-appropriate?
- Uncertainty-targeted?
- Assumption-free?

**Minimum acceptable average: 7/10 per question.**

**Q26:** Do all questions score ≥ 7? If not, which need rewriting?

---

## Step 2.5 — Hypothesis Check

**Q27:** For [Stakeholder Name], here's what I think you need: [current understanding]. Does this sound right? What's missing or wrong?

---

## Step 2.6 — Clarity Check

**Q28:** On a scale of 0-10, how confident are you that we understand what [Stakeholder] needs?

---

## Output

- `interview-scripts/*.md` — one script per Tier 1 stakeholder
- `question-sets/*.md` — layered question sets
- `session-notes/*.md` — notes from conducted interviews
