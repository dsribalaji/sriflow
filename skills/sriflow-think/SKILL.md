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
  signal: DONE when all Tier 1 uncertainties have resolution plan and clarity check ≥ 8/10
---

# /sriflow-think — Stakeholder Discovery (Phase 1)

## When to invoke this skill

Phase 1 of the BA pipeline. Use when starting any project from zero, when a requirement is
attributed to a group label ("leadership," "the business," "users"), when stakeholders disagree
and you need to understand why, or when you need to plan who to interview and in what order.

Proactively invoke this skill before beginning any elicitation session, interview plan, BRD section,
or requirements workshop. If anyone refers to "the stakeholders" as one voice — invoke this skill first.

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

# Plan-mode detection
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
elif [ "${SRIFLOW_PLAN_MODE:-}" = "active" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="inactive"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Session kind
_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# BA Pipeline: disable caveman/ponytail trim — BA output needs full detail
echo "TRIM: disabled (BA pipeline active)"

# Project memory
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -80 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Git state
_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
echo "GIT_STAGED: $_GIT_STAGED | UNSTAGED: $_GIT_UNSTAGED | UNTRACKED: $_GIT_UNTRACKED"

# Pipeline stage tracking
_CURRENT_STAGE=$(grep "^## Current Stage:" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/## Current Stage: //' || echo "unknown")
echo "PIPELINE_STAGE: $_CURRENT_STAGE"

# Config
_PROACTIVE=$(sriflow-config get proactive 2>/dev/null || echo "true")
_TELEMETRY=$(sriflow-config get telemetry 2>/dev/null || echo "off")
_EXPLAIN_LEVEL=$(sriflow-config get explain_level 2>/dev/null || echo "default")
echo "PROACTIVE: $_PROACTIVE"
echo "TELEMETRY: $_TELEMETRY"
echo "EXPLAIN_LEVEL: $_EXPLAIN_LEVEL"

# Context restore
if sriflow-context show 2>/dev/null | grep -q "branch"; then
  echo "CONTEXT: restored"
  sriflow-context show 2>/dev/null
else
  echo "CONTEXT: fresh session"
fi

# Learnings
_LEARN_COUNT=$(sriflow-learnings count 2>/dev/null || echo "0")
echo "LEARNINGS: $_LEARN_COUNT entries"

# Decisions
_DECISION_COUNT=$(sriflow-decisions count 2>/dev/null || echo "0")
echo "DECISIONS: $_DECISION_COUNT entries"

# Timeline
sriflow-timeline log '{"skill":"sriflow-think","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```

## Plan Mode Safe Operations

In plan mode, allowed: `Bash` (read-only), `Read`, `Glob`, `Grep`, writes to `SRIFLOW_MEMORY.md`, and writes to the plan file. No destructive file operations or git mutations in plan mode.

## Skill Invocation During Plan Mode

If the user invokes this skill in plan mode, follow it step by step starting from Step 1. AskUserQuestion satisfies plan mode's end-of-turn requirement. At a STOP point, stop immediately. Call ExitPlanMode only after the skill workflow completes.

If `SRIFLOW_PLAN_MODE` is `"active"`: do not run destructive ops. Read files, analyze, report findings, write to plan file.

## AskUserQuestion Format

Every AskUserQuestion is a decision brief:

```
D<N> — <one-line question title>
Branch: <_BRANCH value>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro, ≥40 chars>
  ❌ <con, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment per question.
ELI10 always present. Recommendation always present. (recommended) on exactly one option.

If AskUserQuestion is unavailable: render as prose with same triad (ELI10, completeness, recommendation), then STOP.

## Voice

SriFlow voice: direct, builder-to-builder. **BA mode — trim disabled for full detail.**

This skill produces reference documentation (Stakeholder Registers, Interview Plans, Uncertainty Maps). Compression loses critical signal. Write full sentences, complete thoughts, detailed analysis. No caveman, no ponytail — BA output must be unambiguous and thorough.

- Lead with the point. What it does, why it matters, what changes.
- Be concrete. Name files, functions, line numbers, commands, real numbers.
- Never corporate, academic, or hype. No filler.
- Sound like a builder talking to a builder.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted.
- The user has context you do not. Cross-model agreement is a recommendation, not a decision.
- Write complete sentences for all artifacts — these are reference documents, not code comments.

Good: "auth.ts:47 returns undefined when the cookie expires. Fix: null check + redirect /login."
Bad: "I've identified a potential issue in the authentication flow that may cause problems."

## Completeness Principle

Do the complete thing. Tests, edge cases, error paths. The only out-of-scope is genuinely unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence.
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

If memory found: give a 2-sentence summary of current state. If a next skill is implied by the current stage, suggest it once.

## Confusion Protocol

For high-stakes ambiguity (architecture, data model, destructive scope, missing context): STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Do not use for routine coding or obvious changes.

---

# Scale Detection

Before any analysis, detect project scale. This determines pipeline depth.

**Auto-detect from user's opening message:**

| Tier | Keywords | Timeline |
|------|----------|----------|
| **Small** | "personal", "quick", "side project", "hobby", "small", "simple", "just me", "weekend", "internal tool", "script" | < 1 week |
| **Medium** | "team", "startup", "client", "feature", "module", "need by", "users will", "new endpoint", "new page" | 1-4 weeks |
| **Enterprise** | "enterprise", "compliance", "multi-team", "department", "audit", "regulatory", "migration", "multiple systems", "organization" | 1+ months |
| **Mixed/unclear** | Default to Medium | — |

**Keyword priority:** Small keywords override Medium keywords (personal/quick/script are more specific than team/feature). Enterprise keywords override all (compliance/regulatory are more specific). Example: "personal quick script for my team" → Small. "Quick compliance tool" → Enterprise.

If the user can't determine the scale or says "I don't know," default to Medium and proceed.

If THINK_OUTPUT.md already exists: "A previous think session exists. Update it or start fresh?"

**Ask Q1 first (required for all tiers):**

**Q1:** What system or product are we building? (One sentence — concrete noun: API, UI, CLI tool, data pipeline, service)

**Then confirm scale:**

```
Based on your answer above, this looks like a **[S/M/E]** project ([timeline]). Correct?
A) Yes, proceed as [S/M/E] (recommended)
B) Upgrade to [next tier]
C) Downgrade to [lower tier]
D) Skip — run full pipeline regardless
E) I don't know — default to Medium
```

**Branch by tier:**

### If Small → Skip to Output (immediately after Q1)

Show skip summary:
```
Small project — simplified think.
Skipping: Q2-Q4 (project phase, docs, stakeholder discovery), Stakeholder Register, 
Power/Interest Map, Uncertainty Prioritization, Disagreement Diagnostic, Interview Plan.
You can request any on-demand: "give me the stakeholder register", "give me the 
interview plan", "give me the disagreement log"
```

Ask 3 additional clarifying questions:
- **S1:** Who will use this? (1 person? a team? customers?)
- **S1.5:** What are the key features? List 3-5. (e.g., "log expense", "view monthly summary", "export CSV")
- **S2:** What does "done" look like? (observable criterion: "I can upload a file and see it in the list")

Then write THINK_OUTPUT.md (Small template) and finish. **Do NOT proceed to Step 1.**

### If Medium → Condensed Steps 2-7

Show skip summary:
```
Medium project — condensed think.
Condensing: Full stakeholder categories → 3-5 key stakeholders only. 
Formal interview plan → 1-paragraph summary per stakeholder. 
Detailed disagreement diagnostic → skip unless vague phrase flagged.
Full depth available on any step: "expand [step] to full depth"
```

Ask Q2-Q4 from Step 1, then run Steps 2-7 with compression.

**Mid-pipeline expand:** After each step completes, if user says "expand [step]", re-run that step at enterprise depth before proceeding to next step.

### If Enterprise → Full Pipeline (unchanged)

Proceed to Step 1 (Q2-Q4) and run Steps 2-7 exactly as written.

---

# Core Principle: Uncertainty Is Never Reduced "In General"

> "Uncertainty is never reduced 'in general.' It's reduced for a specific person who has to decide something."

"The stakeholders" are not one voice. They are multiple people with distinct problems, distinct decisions to make, and distinct uncertainties to resolve. Treating them as one audience is the single most common cause of requirements that satisfy nobody.

**The BA's job:** Map who decides what — then aim each piece of analysis at the person who actually needs it.

---

## Step 1 — Confirm the Project Context (Medium / Enterprise only)

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

## Step 1b — Market Research (Medium / Enterprise, optional)

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

## Scale Branching — After Step 1 (Medium / Enterprise only)

Small tier already finished after Q1 + S1/S2. This branching is for Medium and Enterprise.

### If Medium → Condensed Steps 2-7

Run Steps 2-7 with these compressions:
- **Step 2:** Identify 3-5 key stakeholders only (skip "check all that apply" categories — assign category inline)
- **Step 3:**简化 Power/Interest to a simple list (not full table). Top 3 uncertainties only (not tiered).
- **Step 4:** Condensed Stakeholder Register — 3-5 rows, no Red/Green classification
- **Step 5:** Top 3 uncertainties ranked, no formal tiering
- **Step 6:** Disagreement Diagnostic — skip unless user flagged a vague phrase in Step 1
- **Step 7:** Interview Plan — 1-paragraph summary per stakeholder (not formal structure)

Then write THINK_OUTPUT.md (Medium template) and finish.

**"Expand [step] to full depth" handler:** If user requests expansion on any step, re-run that step at enterprise depth (full questions, full templates). Regenerate output and update THINK_OUTPUT.md.

### If Enterprise → Full Steps 2-7

Run Steps 2-7 exactly as written below. No compression.

---

## Step 2 — Identify: Who Is in the System? (Enterprise / Medium-depth)

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

## Output — Write THINK_OUTPUT.md

After all steps complete, write `THINK_OUTPUT.md` to the project root using the template matching your tier.

### Small Template (~30 lines)

```markdown
# THINK_OUTPUT.md — [Idea/Project Name]

**Scale:** small
**Generated:** [ISO 8601 timestamp]
**Branch:** [_BRANCH]
**Session:** [_SESSION_ID]

---

## What We're Building
<From Q1: 1-2 sentences describing the system>

## User
<From S1: Who uses this? (1 person? a team? customers?)>

## Features
1. <feature 1>
2. <feature 2>
3. <feature 3>

## Done =
<From S2: One observable criterion — "I can [action] and see [result]">

## Scale Detection
Tier: small
Reason: [auto-detected keyword or user confirmation]
Override: [none / user upgraded from X]

## On-Demand Expansions
You can request enterprise-depth analysis on any section:
- "give me the stakeholder register" → runs full Step 2-4
- "give me the interview plan" → runs full Step 7
- "give me the disagreement log" → runs full Step 6
- "expand to full think" → re-runs entire skill at enterprise depth
```

### Medium Template (~80 lines)

```markdown
# THINK_OUTPUT.md — [Idea/Project Name]

**Scale:** medium
**Generated:** [ISO 8601 timestamp]
**Branch:** [_BRANCH]
**Session:** [_SESSION_ID]

---

## Stakeholder Register (Top 3-5)

| Name / Role | Category | Top Uncertainty |
|-------------|----------|-----------------|
| [Name, Title] | [Decision-Maker / SME / User / Tech Gatekeeper] | "[Specific open question]" |

## Power/Interest Summary

- **High Power / High Interest:** [Names — these drive the project]
- **High Power / Low Interest:** [Names — keep satisfied]
- **Low Power / High Interest:** [Names — keep informed]
- **Low Power / Low Interest:** [Names — monitor]

## Uncertainty Priority (Top 3)

1. [Stakeholder]: "[Their uncertainty]" — blocks: [what gets wrong]
2. [Stakeholder]: "[Their uncertainty]" — affects: [feature area]
3. [Stakeholder]: "[Their uncertainty]" — low-risk deferral: [why it can wait]

## Disagreement Log
<Leave blank unless user flagged a vague phrase>

| Phrase | Stakeholder A | A's meaning | Stakeholder B | B's meaning | Status |
|--------|---------------|-------------|---------------|-------------|--------|

## Interview Summary
<1-paragraph summary per key stakeholder — not formal structure>

## Scale Detection
Tier: medium
Reason: [auto-detected keyword or user confirmation]
Override: [none / user upgraded from X]

## On-Demand Expansions
You can request enterprise-depth analysis on any step:
- "expand [step] to full depth" → re-runs that step at enterprise depth
- "expand to full think" → re-runs entire skill at enterprise depth
```

### Enterprise Template (current — unchanged)

```markdown
# THINK_OUTPUT.md — [Idea/Project Name]

**Generated:** [ISO 8601 timestamp]
**Branch:** [_BRANCH]
**Session:** [_SESSION_ID]

---

## Stakeholder Register
[Full table from Step 4]

## Power/Interest Map
[2×2 grid with stakeholder placement]

## Uncertainty Priority Register
[Tier 1/2/3 ranking with rationale]

## Disagreement Log
[Vague phrases + diverging stakeholder definitions]

## Interview Plan
[Sequenced plan: who, goal, primary uncertainty, date]

## Scale Detection
Tier: enterprise
Reason: [auto-detected keyword or user confirmation]
Override: [none / user downgraded from X]
```

---

## Phase Gate

**Tier-specific gates:**

| Tier | Gate Criteria |
|------|---------------|
| **Small** | Q1 answered + user identified + 1 done criterion defined |
| **Medium** | Top 3-5 stakeholders named + top uncertainty identified + 1-paragraph interview summary |
| **Enterprise** | Every Tier 1 stakeholder named, their top uncertainty is documented, a resolution plan exists, and the clarity check score ≥ 8/10 |

**DONE signal:** Gate criteria met for your tier. See table above.

**Next skill:** `/sriflow-plan` — convert discovery findings into a structured implementation plan.

---

## Post-DONE: Expand Handler

After DONE signal, if user requests expansion:
- "expand [step] to full depth" → re-enter skill at that step, run at enterprise depth, regenerate THINK_OUTPUT.md
- "expand to full think" → re-enter skill from Step 1 at enterprise depth, overwrite THINK_OUTPUT.md
- "give me the stakeholder register" → run Steps 2-4 at enterprise depth, append to THINK_OUTPUT.md
- "give me the interview plan" → run Step 7 at enterprise depth, append to THINK_OUTPUT.md
- "give me the disagreement log" → run Step 6 at enterprise depth, append to THINK_OUTPUT.md

---

## Update vs Start Fresh

If THINK_OUTPUT.md exists when skill is invoked:
- **Update** = re-run skill at same tier, overwrite THINK_OUTPUT.md. Preserve existing answers where possible.
- **Start fresh** = delete existing THINK_OUTPUT.md, run skill from scratch at newly detected tier.

Ask: "A previous think session exists. Update it or start fresh?"
- A) Update — keep same tier, refresh answers (recommended)
- B) Start fresh — delete and re-run from scratch

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

---

## Memory Write (run last)

After workflow completion, append to `SRIFLOW_MEMORY.md`:

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

Replace `OUTCOME` with the actual outcome (done/blocked/concerns).
