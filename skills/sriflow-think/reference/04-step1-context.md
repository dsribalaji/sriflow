# Core Principle: Uncertainty Is Never Reduced "In General"

> "Uncertainty is never reduced 'in general.' It's reduced for a specific person who has to decide something."

"The stakeholders" are not one voice. They are multiple people with distinct problems, distinct decisions to make, and distinct uncertainties to resolve. Treating them as one audience is the single most common cause of requirements that satisfy nobody.

**The BA's job:** Map who decides what — then aim each piece of analysis at the person who actually needs it.

---

# Step 1 — Confirm the Project Context (Medium / Enterprise only)

Small tier already completed after Q1 + S1/S2. This step is for Medium and Enterprise only.

Before mapping stakeholders, confirm:
- What system or product are we building (in one sentence)? (already answered in Scale Detection)
- What phase is this project in? (Greenfield / Existing system / Enhancement)
- Do we have any existing documentation (BRD draft, PRD, design brief, legacy system)?
- Has any stakeholder discovery been done before? If yes — what exists?

Ask these questions precisely (one AskUserQuestion per question, wait for answer):

**Q2:** What phase is this project in?
- A) Greenfield (no existing system)
- B) Existing system (enhancement/modification)
- C) Migration (moving from old to new)

**Q3:** Do we have any existing documentation?
- A) No documentation
- B) BRD draft exists
- C) PRD exists
- D) Design brief exists
- E) Legacy system docs exist

**Q4:** Has any stakeholder discovery been done before?
- A) No — starting fresh
- B) Yes — partial stakeholder list exists
- C) Yes — full register exists (skip to Step 5)

---

# Step 1b — Market Research (Medium / Enterprise, optional)

Before mapping stakeholders, optionally research the competitive landscape.
This helps identify stakeholders you might miss (competitors, regulators,
adjacent market players).

```bash
# Quick market context — run if user wants competitive intelligence
# WebSearch for: "[project domain] market landscape [current year]"
# WebSearch for: "[project domain] competitors [current year]"
# WebSearch for: "[specific feature] alternative solutions"
```

Use WebSearch to find:
- **Competitors:** Who else solves this problem? How?
- **Adjacent players:** Who touches this space but doesn't compete directly?
- **Regulatory context:** Any compliance requirements in this domain?
- **User expectations:** What do users in this market expect from similar tools?

If WebSearch is unavailable or user skips: proceed without market context.
If results found: note key competitors and adjacents in THINK_OUTPUT.md
under "Market Context". Use this to inform stakeholder identification in Step 2.

**Time box:** 3 searches max. Do not rabbit-hole into market analysis. This is
stakeholder discovery input, not a market research report.

---

# Scale Branching — After Step 1 (Medium / Enterprise only)

Small tier already finished after Q1 + S1/S2. This branching is for Medium and Enterprise.

### If Medium → Condensed Steps 2-7

Run Steps 2-7 with these compressions:
- **Step 2:** Identify 3-5 key stakeholders only (skip "check all that apply" categories — assign category inline)
- **Step 3:** Simplified Power/Interest to a simple list (not full table). Top 3 uncertainties only (not tiered).
- **Step 4:** Condensed Stakeholder Register — 3-5 rows, no Red/Green classification
- **Step 5:** Top 3 uncertainties ranked, no formal tiering
- **Step 6:** Disagreement Diagnostic — skip unless user flagged a vague phrase in Step 1
- **Step 7:** Interview Plan — 1-paragraph summary per stakeholder (not formal structure)

Then write THINK_OUTPUT.md (Medium template) and finish.

**"Expand [step] to full depth" handler:** If user requests expansion on any step, re-run that step at enterprise depth (full questions, full templates). Regenerate output and update THINK_OUTPUT.md.

### If Enterprise → Full Steps 2-7

Run Steps 2-7 exactly as written. No compression.
