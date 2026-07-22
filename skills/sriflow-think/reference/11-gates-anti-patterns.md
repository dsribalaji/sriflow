# Phase Gate

**Tier-specific gates:**

| Tier | Gate Criteria |
|------|---------------|
| **Small** | Q1 answered + user identified + 1 done criterion defined |
| **Medium** | Top 3-5 stakeholders named + top uncertainty identified + 1-paragraph interview summary |
| **Enterprise** | Every Tier 1 stakeholder named, their top uncertainty is documented, a resolution plan exists, and the clarity check score ≥ 8/10 |

**DONE signal:** Gate criteria met for your tier. See table above.

**Next skill:** `/sriflow-plan` — convert discovery findings into a structured implementation plan.

---

# Post-DONE: Expand Handler

After DONE signal, if user requests expansion:
- "expand [step] to full depth" → re-enter skill at that step, run at enterprise depth, regenerate THINK_OUTPUT.md
- "expand to full think" → re-enter skill from Step 1 at enterprise depth, overwrite THINK_OUTPUT.md
- "give me the stakeholder register" → run Steps 2-4 at enterprise depth, append to THINK_OUTPUT.md
- "give me the interview plan" → run Step 7 at enterprise depth, append to THINK_OUTPUT.md
- "give me the disagreement log" → run Step 6 at enterprise depth, append to THINK_OUTPUT.md

---

# Update vs Start Fresh

If THINK_OUTPUT.md exists when skill is invoked:
- **Update** = re-run skill at same tier, overwrite THINK_OUTPUT.md. Preserve existing answers where possible.
- **Start fresh** = delete existing THINK_OUTPUT.md, run skill from scratch at newly detected tier.

Ask: "A previous think session exists. Update it or start fresh?"
- A) Update — keep same tier, refresh answers (recommended)
- B) Start fresh — delete and re-run from scratch

---

# Anti-Patterns to Reject

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| "Leadership needs better visibility." | "Leadership" is 2–5 people with different needs. | Name each leader. Interview separately. |
| Interviewing only the loudest voice | Quiet stakeholders often have highest-impact uncertainties | Map every category; use the register to identify gaps |
| Treating the sponsor as the only decision-maker | End users who reject the system at launch are also decision-makers | Include End User uncertainty as Tier 1 if adoption is a risk |
| Stakeholder list not updated after interviews | New stakeholders surface mid-discovery | Treat the register as a living document |
| Assuming agreement because nobody objected | Silence is not agreement; it's often unexpressed confusion | Use the clarity check (0–10) at the end of every interview |

---

# The Clarity Check — Use in Every Meeting

> "On a scale of 0 to 10, how confident are you that we understand what you need?"

- **0–5:** Stop. More work required before proceeding.
- **6–7:** Identify the specific gaps keeping them from an 8 and close those gaps.
- **8–10:** Document the confidence level, who gave it, and the date. Proceed.

**If the number didn't move after your analysis — your work didn't land.**
