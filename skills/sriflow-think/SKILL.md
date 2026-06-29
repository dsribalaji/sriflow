---
name: sriflow-think
preamble-tier: 2
version: 1.0.0
description: >
  BA Pipeline Phase 1 — Stakeholder Discovery. Maps every named stakeholder by power,
  interest, and top uncertainty. Runs Disagreement Diagnostic on vague phrases.
  Produces: Stakeholder Register, Power/Interest Map, Uncertainty Priority, Interview Plan.
  ALWAYS start here. Never begin elicitation without completed Phase 1.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - AskUserQuestion
triggers:
  - I have an idea
  - think through this
  - start a new product
  - ideate
  - help me think
  - who are the stakeholders
  - map the stakeholders
  - /sriflow-think
next-skill: /sriflow-plan
outputs:
  - THINK_OUTPUT.md
  - 01_discovery/stakeholder-register.md
  - 01_discovery/power-interest-map.md
  - 01_discovery/uncertainty-priority.md
  - 01_discovery/disagreement-log.md
  - 01_discovery/interview-plan.md
gate:
  rule: Every Tier 1 stakeholder named with top uncertainty before proceeding
  signal: DONE when all Tier 1 uncertainties have resolution plan and clarity check >= 8/10
---

# /sriflow-think — Stakeholder Discovery (Phase 1)

## When to invoke

Phase 1 of the BA pipeline. Starting any project from zero, when a requirement is attributed to a group label ("leadership," "the business," "users"), when stakeholders disagree, or when you need to plan who to interview and in what order.

## Preamble / Plan Mode / Voice

Run standard sriflow preamble (branch, session, plan mode, memory, git, config, timeline). Disable caveman/ponytail trim — BA output needs full detail. Plan mode: read-only ops, no destructive mutations. Voice: full sentences, no trim, no AI vocab (delve/crucial/robust/comprehensive/nuanced/multifaceted), no em dashes.

## AskUserQuestion

Decision brief: D-number, ELI10, stakes if wrong, recommendation, completeness (X/10), A/B pros/cons (>=40 chars). One (recommended). If unavailable: prose with same triad, then STOP.

## Completion / Confusion

End: DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT. High-stakes ambiguity: STOP, name it, 2-3 options with tradeoffs.

---

# Core Principle

> "Uncertainty is never reduced 'in general.' It's reduced for a specific person who has to decide something."

"The stakeholders" are not one voice. Multiple people, distinct problems, distinct decisions, distinct uncertainties. Treating them as one audience causes requirements that satisfy nobody.

**BA's job:** Map who decides what — aim each piece of analysis at the person who needs it.

---

# Scale Detection

| Tier | Keywords | Timeline |
|------|----------|----------|
| **Small** | "personal", "quick", "side project", "hobby", "small", "simple", "just me", "weekend", "internal tool", "script" | < 1 week |
| **Medium** | "team", "startup", "client", "feature", "module", "need by", "users will", "new endpoint", "new page" | 1-4 weeks |
| **Enterprise** | "enterprise", "compliance", "multi-team", "department", "audit", "regulatory", "migration", "multiple systems", "organization" | 1+ months |

Keyword priority: Small overrides Medium. Enterprise overrides all. Default: Medium.

**Q1 (required):** What system or product are we building? (One sentence — concrete noun)

Confirm scale, then branch:

- **Small:** Ask S1 (who uses this?), S1.5 (key features 3-5), S2 (done criterion). Write THINK_OUTPUT.md (Small template from `reference/output-templates.md`). Finish. Do NOT proceed to Step 1.
- **Medium:** Ask Q2-Q4. Run Steps 2-7 compressed (3-5 stakeholders, 1-paragraph summaries, skip disagreement unless flagged). "expand [step] to full depth" available.
- **Enterprise:** Ask Q2-Q4. Full Steps 2-7.

---

## Step 1 — Project Context (Medium / Enterprise)

**Q2:** Phase? A) Greenfield B) Existing system C) Migration

**Q3:** Existing docs? A) None B) BRD draft C) PRD D) Design brief E) Legacy docs

**Q4:** Prior stakeholder discovery? A) No B) Partial list C) Full register (skip to Step 5)

**Step 1b — Market Research (optional):** WebSearch for competitors, adjacents, regulatory context. 3 searches max.

---

## Step 2 — Identify Stakeholders

Read `reference/stakeholder-categories.md` for discovery questions and the 6 stakeholder categories (Decision-Maker, SME, End User, Technical Gatekeeper, Affected Party, Regulator/Auditor).

Ask discovery questions, assign categories, produce list with name/title/category/notes.

## Step 3 — Map Power, Interest, Uncertainty

Read `reference/power-interest-mapping.md` for the full framework and CRM example.

Assess each stakeholder: Power (H/M/L), Interest (H/M/L), Top Uncertainty. Fill: "This will help [name] decide [specific thing]."

## Step 4 — Stakeholder Register

Read `reference/stakeholder-register.md` for the register template and Red/Green rules.

Produce full register. Generic group labels = automatically RED. Name individuals.

## Step 5 — Uncertainty Prioritization

Read `reference/uncertainty-priority.md` for tier definitions and ranked list template.

- **Tier 1 (This Week):** High power + high uncertainty. Blocks scope/architecture.
- **Tier 2 (Before Sprint):** Medium power/uncertainty shaping major features.
- **Tier 3 (Before Build Completes):** Low power/peripheral. Important but not blocking.

Resolve Tier 1 before writing requirements. Tier 2 before sprint begins.

## Step 6 — Disagreement Diagnostic

Read `reference/disagreement-diagnostic.md` for warning signals, diagnostic questions, and the Dashboard Disaster example.

When stakeholders use the same word for different things: ask each separately. Log in disagreement table.

## Step 7 — Interview Plan

Read `reference/interview-plan.md` for the 5-section structure (open, pain, success, test hypotheses, clarity check).

For each Tier 1/2 stakeholder. After every interview: update register, flag disagreements.

---

## Output

Write `THINK_OUTPUT.md` using the template matching your tier. Read `reference/output-templates.md` for Small/Medium/Enterprise templates.

## Phase Gate

| Tier | Gate |
|------|------|
| **Small** | Q1 answered + user identified + done criterion defined |
| **Medium** | Top 3-5 stakeholders named + top uncertainty + 1-paragraph interview summary |
| **Enterprise** | Every Tier 1 named, uncertainty documented, resolution plan exists, clarity >= 8/10 |

**Next:** `/sriflow-plan`

## Post-DONE: Expand Handler

- "expand [step] to full depth" -> re-enter at that step, enterprise depth, regenerate
- "expand to full think" -> re-enter from Step 1, enterprise depth, overwrite
- "give me the stakeholder register" -> Steps 2-4 enterprise depth
- "give me the interview plan" -> Step 7 enterprise depth
- "give me the disagreement log" -> Step 6 enterprise depth

## Update vs Start Fresh

THINK_OUTPUT.md exists? Ask: Update (keep tier, refresh) or Start fresh (delete, re-run).

## Anti-Patterns

Read `reference/anti-patterns.md` for the full table and Clarity Check (0-10 scale). Key: name individuals not groups, interview quiet stakeholders, update register after interviews, silence != agreement.

---

## Memory Write (run last)

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-think | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Scale: $SCALE_TIER
Stakeholders mapped: [count]
Tier 1 uncertainties: [count]
MEMEOF

sriflow-timeline log '{"skill":"sriflow-think","event":"completed","branch":"'"$_BRANCH"'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","scale":"'"$SCALE_TIER"'"}' 2>/dev/null
```
