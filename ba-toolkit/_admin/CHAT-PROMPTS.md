# CHAT-PROMPTS.md — BA Toolkit Prompt Playbook

Copy-pasteable prompts for every skill in the BA pipeline.
Paste directly into GitHub Copilot Chat or Claude Code. Replace `[PLACEHOLDERS]` with your project details.

---

## How to Use

1. Pick the prompt for the phase you're in
2. Replace every `[PLACEHOLDER]` with your actual content
3. Paste into your AI assistant
4. The skill takes over from there

**Pipeline order:**
```
/discover → /elicit → /usecase → /audit-brd → /story → /mockup → /data-map → /nfr
```

---

## Phase 1 — /discover

### Prompt 1a: Fresh project start

```
/discover

I'm starting a new project. Here's what I know:

Project: [One-sentence description of what system we're building]
Client / Organisation: [Who is this for?]
Business problem: [What pain or gap does this address?]
Known stakeholders so far: [List any names/roles you already know — or "none yet"]
Existing documentation: [Any BRD draft, PRD, brief, or existing system — or "none"]
Timeline: [When does this need to be delivered?]

Please run the Stakeholder Discovery framework and produce:
1. A full stakeholder inventory with categories
2. A Power/Interest map
3. The Uncertainty Priority register (Tier 1/2/3)
4. A Disagreement Diagnostic pass on any shared phrases in the project description
5. An Interview Plan for Tier 1 stakeholders

Save outputs to 01_discovery/.
```

### Prompt 1b: Audit an existing stakeholder list

```
/discover

I have an existing stakeholder list that needs auditing. Please review it and:
1. Flag any generic group labels (RED)
2. Identify missing stakeholder categories
3. Surface any stakeholders who should be Tier 1 but aren't identified
4. Run the Disagreement Diagnostic on any vague shared terms

Here is my current list:
[Paste your existing stakeholder list or table]
```

### Prompt 1c: A stakeholder keeps disagreeing

```
/discover

We have a recurring disagreement between stakeholders. Please run the Disagreement Diagnostic.

The phrase causing disagreement: "[The phrase everyone says they agree on]"

What Stakeholder A ([Name, Role]) seems to mean: "[Their description]"
What Stakeholder B ([Name, Role]) seems to mean: "[Their description]"

Please:
1. Formalise the divergence into the Disagreement Log format
2. Generate the diagnostic question to ask each stakeholder
3. Describe what architectural choices depend on the resolution
```

---

## Phase 2 — /elicit

### Prompt 2a: Generate an interview script

```
/elicit

Mode: Script

Please generate a full interview script for:
Stakeholder: [Full name], [Title]
Their Tier 1 uncertainty: "[The exact uncertainty from the register]"
Domain context: [What system or process this interview covers]
Prior context: [What we already know about their view — or "none"]
Duration: [30 / 45 / 60 minutes]

Save the script to 02_elicitation/interview-scripts/INT-[###]_[Role]_[YYYY-MM-DD].md
```

### Prompt 2b: Generate a layered question set

```
/elicit

Mode: Generate

Please generate a 10-question set for:
Stakeholder: [Name], [Title] — [Tier: C-Level / Manager / End User]
Goal: Resolve the uncertainty: "[Exact uncertainty from the register]"
Domain: [What system, process, or feature area]
Layer distribution: [Default (3/2/3/2) / Custom: e.g., "4 Explore, 3 Context, 2 Process, 1 Idea"]

Score every question against the 5-criterion rubric and rewrite any scoring < 7.

Save to 02_elicitation/question-sets/QS-[###]_[Topic].md
```

### Prompt 2c: Review and score existing questions

```
/elicit

Mode: Review

Please review and score these interview questions. For each question:
1. Score it on all 5 criteria (0–10 each)
2. Flag any scoring < 7
3. Rewrite every flagged question to score ≥ 8

Stakeholder this is for: [Name, Role]
Target uncertainty: "[Uncertainty]"

Here are the questions:
[Paste your existing questions]
```

### Prompt 2d: Black box reverse engineering

```
/elicit

Mode: Reverse Engineer

Please perform a Black Box analysis of [System Name].

Source artifact: [Description of what I'm providing — e.g., "two HTML prototype files" / "11 screenshots of the legacy system" / "a demo recording transcript"]

[Paste or attach the content]

Please produce:
1. Entity inventory with observed attributes
2. CRUD operations per entity
3. Confirmed business rules (with UI evidence)
4. Inferred business rules (with confidence level)
5. Status / lifecycle state machine if applicable
6. Ambiguities and gaps list
7. Prioritised SME question list

Save to 02_elicitation/reverse-engineering/RE-[###]_[SystemName]_blackbox.md
```

### Prompt 2e: Simulate stakeholder responses (test your questions)

```
/elicit

Mode: Simulate

Please role-play as [Stakeholder Name] ([Title], [brief background]).
Their perspective: [What you know about their views, concerns, and role]

I want to test this interview script by running through it with you playing the stakeholder.
Push back where the questions are leading, vague, or would not yield the target uncertainty.
After each answer, note (in brackets) whether the question was effective.

Here is the interview script:
[Paste your script]
```

---

## Phase 3 — /usecase

### Prompt 3a: Write a Use Case from elicitation notes

```
/usecase

Please write a Use Case for:
Feature: [Feature or system capability name]
Primary actor: [Specific role]
Goal: [What the actor is trying to accomplish — one sentence]
Source: [Which interview / RE report / BRD requirement this comes from]
Context: [Any relevant business rules or constraints already known]

[Paste any relevant elicitation notes, session notes, or RE findings]

Please produce a complete UC specification including:
- Header (goal level, preconditions, postconditions)
- Basic flow (numbered steps)
- At least 2 alternate flows
- All exception flows with exact error messages
- Business rules table
- Verdict checklist

Save to 03_use-cases/draft/UC-[###]_[VerbNoun].md
Update 03_use-cases/uc-inventory.md
```

### Prompt 3b: Review an existing Use Case for completeness

```
/usecase

Please review this Use Case and score it against the GREEN verdict checklist.
For every RED item, provide the specific fix needed.

[Paste the UC content]
```

### Prompt 3c: Convert a BRD section into Use Cases

```
/usecase

Please convert this BRD requirements section into Use Cases.
For each requirement, determine the appropriate goal level (Sea Level / Kite / Fish)
and produce a UC specification.

BRD section:
[Paste BRD section]

Stakeholder Register (for actor identification):
[Paste or summarise the stakeholder register]
```

---

## Phase 4a — /audit-brd

### Prompt 4a-1: Full BRD audit

```
/audit-brd

Please perform a full uncertainty audit on this BRD.

For every requirement:
1. Score it on the Uncertainty Reduction Scale (0–10)
2. Identify the uncertainty type (Type 1 / 2 / 3)
3. List which audit checklist items it fails
4. Produce a rewritten version scoring ≥ 8

After the audit, produce:
- Summary table (total requirements, GREEN/AMBER/RED counts)
- Assumptions to add to the Open Assumptions Register
- Priority order for fixing RED requirements

Here is the BRD:
[Paste BRD content]
```

### Prompt 4a-2: Score a single requirement

```
/audit-brd

Please score this requirement and rewrite it if it scores < 7:

Requirement: "[Paste the requirement text]"
Context: [Feature area, actor, any known business rules]

Score it against all 8 audit checklist items and provide the rewritten version.
```

### Prompt 4a-3: Write a new BRD from scratch

```
/audit-brd

Please help me write a BRD for this project.

Project name: [Name]
Business problem: [Description]
Confirmed stakeholders and their needs: [Paste from stakeholder register]
Confirmed Use Cases: [List UC-001, UC-002, etc.]
Out of scope items: [List what's explicitly excluded]
Known constraints: [Technical, timeline, budget, regulatory]

Please produce a complete BRD-v1.0 draft with all requirements pre-scored.

Save to 04_requirements/brd/BRD-v1.0_[ProjectName].md
```

---

## Phase 4b — /story

### Prompt 4b-1: Generate User Stories from a Use Case

```
/story

Please generate User Stories from this approved Use Case.

Use Case: [Paste UC-[###] content or reference the file]
BRD requirements this UC covers: [Req-1.1, Req-1.2, etc.]

For each story:
1. Write the story in As a / I want / so that format
2. Run the INVEST check (identify any failures)
3. Write GWT acceptance criteria (happy path + at least 2 edge cases)
4. Check testability — replace any adjectives without thresholds
5. Identify and declare all dependencies
6. Apply the 15-second estimate test

Save each story to 04_requirements/backlog/draft/US-[###]_[VerbNoun].md
```

### Prompt 4b-2: Review and fix a story

```
/story

Please review this User Story and fix all INVEST failures.

[Paste the story content]

For each failure:
1. Name the INVEST letter that fails
2. Explain why it fails
3. Provide the rewritten version that fixes it

Then re-run INVEST on the rewritten version to confirm GREEN.
```

### Prompt 4b-3: Split an oversized story

```
/story

This story is too large for a single sprint. Please split it.

[Paste the story]

For each split story:
1. Ensure each is independently deliverable
2. Declare any sequencing dependency between the new stories
3. Write GWT criteria for each
4. Confirm each passes INVEST
```

---

## Phase 5a — /mockup

### Prompt 5a-1: Annotate a screen from a description

```
/mockup

Please produce a full screen specification for:
Screen name: [Name]
Linked User Story: US-[###] — [Title]
Linked Use Case: UC-[###] — [Title]

Screen description / sketch:
[Describe the screen layout, sections, and fields — or paste a text description of a mockup]

For every element on this screen, answer all 12 annotation questions:
control type, data type, required/optional, max length, default value, validation, error message,
editable-by roles, triggers, data source, PII flag, business rule.

Zero [TBD] placeholders allowed.

Save to 05_ui-and-data/prototypes/SCREEN-[Name]_mockup.md
```

### Prompt 5a-2: Review a mockup for completeness

```
/mockup

Please review this screen specification and flag every element that is missing any of the
12 annotation properties. For each gap, generate the specific question to ask the stakeholder.

[Paste the screen spec]
```

---

## Phase 5b — /data-map

### Prompt 5b-1: Build a data dictionary from a screen spec

```
/data-map

Please build a Feature Data Dictionary from this screen specification and User Story.

User Story: US-[###] — [Title]
Use Case: UC-[###]

Screen specification:
[Paste SCREEN-[Name]_mockup.md content]

User Story acceptance criteria:
[Paste ACs]

Please produce:
1. Full data dictionary table (all fields, lower_snake_case names, types, constraints, rules, PII)
2. Derived/calculated fields with formulas
3. Permissions matrix by role
4. FK relationships with ON DELETE / ON UPDATE behavior
5. PII inventory
6. DoR checklist

Save to 05_ui-and-data/data-dicts/FEAT-[Name]_datadict.md
```

---

## Phase 6 — /nfr

### Prompt 6a-1: Full NFR discovery session

```
/nfr

Please run a full NFR discovery for this project.

Step 1: Extract implicit NFRs from this BRD:
[Paste BRD content or key sections]

Step 2: Run stakeholder NFR questions for:
[Paste stakeholder register or list key stakeholders with their roles]

Step 3: Produce the NFR Specification covering:
- Performance (response time, load, throughput)
- Availability (uptime, RTO, RPO)
- Security (encryption, auth, session)
- Scalability (concurrent users, data volume)
- Compliance (regulation, data residency, retention, audit log)
- Maintainability (deploy frequency, observability)
- Cost (infrastructure budget cap)

Every NFR must have: numeric target + business reason + measurement method.

Step 4: Identify conflicts between NFRs
Step 5: Produce architecture implications for all Tier 1 NFRs

Save to 06_architecture/
```

### Prompt 6a-2: Score and improve an existing NFR

```
/nfr

Please review these NFRs and identify which ones are not yet specific enough to constrain architecture.

For each vague NFR:
1. Identify what's missing (numeric target / business reason / measurement method)
2. Generate the stakeholder question that would produce the missing information
3. Provide a rewritten version that would score GREEN

[Paste existing NFR list]
```

---

## Optional — /backlog (Jira Sync)

### Prompt: Sync approved stories to Jira

```
/backlog

Please sync all approved User Stories to Jira.

Jira project key: [PROJECT-KEY]
Jira instance: [your-org.atlassian.net]

Stories to sync: all files in 04_requirements/backlog/approved/ with verdict: GREEN

For each story:
1. Confirm verdict = GREEN before filing (skip any RED or DRAFT)
2. Map all fields per the Jira mapping table
3. Record the Jira key back into the story's YAML header
4. Log the sync in _admin/decisions-log.md

Stories to EXCLUDE: [List any story IDs that should not be synced yet]
```

---

## Utility Prompts

### Check phase gate readiness

```
Please check whether [Phase N] is complete and the gate to [Phase N+1] is open.

Phase [N] outputs are in [folder path].

Gate criteria:
[Paste the gate rule from AGENTS.md]

List every criterion that is not yet met.
```

### Update the UC Inventory

```
Please update 03_use-cases/uc-inventory.md to reflect the current status of all Use Cases.

Scan all files in 03_use-cases/draft/ and 03_use-cases/approved/ and update:
- Status column
- Verdict column
- Linked Stories column (cross-reference with 04_requirements/backlog/)
- Linked Screens column (cross-reference with 05_ui-and-data/prototypes/)
- Status Breakdown totals
- Traceability Check checklist
```

### Generate a traceability matrix

```
Please produce a full traceability matrix for this project.

Scan all artifact folders and produce a table showing:

| Stakeholder | BRD Req | UC | User Story | Screen | Data Dict |
|-------------|---------|-----|------------|--------|-----------|

Flag any gaps (a row with a missing link = orphaned artifact).
```
