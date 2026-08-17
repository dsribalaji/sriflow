# Core Principle: Uncertainty Is Never Reduced "In General"

> "Uncertainty drops only for a named person facing a specific decision — never for some audience in the abstract."

"The stakeholders" is not one voice. It is many people, each with their own problems, their own decisions to make, and their own open questions. Treating them as a single audience is the most common route to requirements that satisfy no one.

**The BA's job:** find out who decides what, then aim every piece of analysis at the person who truly needs it.

---

# Step 1 — Confirm the Project Context (Medium / Enterprise only)

The Small tier wraps up after Q1 + S1/S2. This step applies to Medium and Enterprise only.

Before mapping stakeholders, confirm:
- What system or product are we building (in one sentence)? (already answered in Scale Detection)
- What phase is this project in? (Greenfield / Existing system / Enhancement)
- Do we have any existing documentation (BRD draft, PRD, design brief, legacy system)?
- Has any stakeholder discovery been done before? If yes — what exists?

Ask each one as its own AskUserQuestion and wait for the answer:

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

Before stakeholder mapping, optionally scan the competitive landscape.
That surfaces stakeholders you could otherwise overlook — competitors,
regulators, adjacent players in the market.

```bash
# Light market scan — run only if the user wants competitive intel
# WebSearch for: "[project domain] market landscape [current year]"
# WebSearch for: "[project domain] competitors [current year]"
# WebSearch for: "[specific feature] alternative solutions"
```

Use WebSearch to find:
- **Competitors:** Who else solves this problem? How?
- **Adjacent players:** Who touches this space but doesn't compete directly?
- **Regulatory context:** Any compliance requirements in this domain?
- **User expectations:** What do users in this market expect from similar tools?

If WebSearch is unavailable or the user declines, move on without market context.
When results come back, record key competitors and adjacent players in THINK_OUTPUT.md
under "Market Context". Let this inform stakeholder identification in Step 2.

**Time box:** at most 3 searches. Do not spiral into market analysis. This is
input for stakeholder discovery, not a market research report.

---

# Scale Branching — After Step 1 (Medium / Enterprise only)

The Small tier is already done after Q1 + S1/S2. This branch logic covers Medium and Enterprise.

### If Medium → Condensed Steps 2-7

Run Steps 2-7 with these compressions:
- **Step 2:** Identify 3-5 key stakeholders only (skip "check all that apply" categories — assign category inline)
- **Step 3:** Simplified Power/Interest to a simple list (not full table). Top 3 uncertainties only (not tiered).
- **Step 4:** Condensed Stakeholder Register — 3-5 rows, no Red/Green classification
- **Step 5:** Top 3 uncertainties ranked, no formal tiering
- **Step 6:** Disagreement Diagnostic — skip unless user flagged a vague phrase in Step 1
- **Step 7:** Interview Plan — 1-paragraph summary per stakeholder (not formal structure)

Then write THINK_OUTPUT.md with the Medium template and stop.

**"Expand [step] to full depth" handler:** when the user asks to expand a step, re-run it at enterprise depth (full questions, full templates). Regenerate the output and update THINK_OUTPUT.md.

### If Enterprise → Full Steps 2-7

Execute Steps 2-7 exactly as written, with no compression.