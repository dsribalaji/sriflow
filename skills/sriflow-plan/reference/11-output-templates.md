## Output — Write PLAN.md

After all phases complete, write `PLAN.md` to the project root using the template matching your tier.

### Artifact volume by tier

| Artifact | Small | Medium | Enterprise |
|----------|-------|--------|------------|
| PLAN.md | ✓ (condensed) | ✓ (full) | ✓ (full) |
| Stakeholder register | auto-derived from THINK_OUTPUT.md | full register | full register |
| Use cases | skipped | simplified | full UC inventory |
| BRD | skipped | condensed | full BRD |
| Stories / backlog | skipped | top 5 stories | full backlog |
| Screen specs | skipped if CLI | SCREEN-* files | SCREEN-* files |
| Data dictionary | skipped | if applicable | full |
| NFRs | inline in PLAN.md | separate NFR.md | full system-design.md |

### Project type detection
Detect project medium from THINK_OUTPUT.md and user conversation:
- **CLI** — command-line tool, terminal interface
- **TUI** — terminal UI (ncurses, bubbletea, ink)
- **Web** — web app/API
- **Mobile** — mobile app
- **Library** — library/package/SDK
- **Service** — backend service/daemon

Adapt artifact output: CLI projects skip SCREEN specs, screens/, and UI-related sections. Instead output: command tree, flag reference, argument spec, exit codes.

### Small template
```markdown
# PLAN.md — [Project Name]

**Scale:** small
**Project Type:** [CLI/TUI/Web/Mobile/Library/Service]
**Generated:** [ISO 8601 timestamp]

---

## Goal
<1-2 sentence summary of what we're building and why>

## Stakeholders (auto-derived)
| Role | Person | Key Concern |
|------|--------|-------------|
| Creator/User | [name] | [primary need] |

## Tech Stack
- Runtime: [language + version]
- Key dependencies: [list]
- Distribution: [npm/pip/homebrew/binary]

## Implementation Plan
### Phase 1: Foundation
- [ ] Task — estimated time
- [ ] Task — estimated time

### Phase 2: Core Features
- [ ] Task — estimated time
- [ ] Task — estimated time

### Phase 3: Polish & Ship
- [ ] Task — estimated time
- [ ] Task — estimated time

## Architecture
<Key components, data flow, integration points — 5-10 bullet points>

## Testing Strategy
<What will be tested and how>

## Key Risks
<2-3 things that could block or delay>

## NFRs (inline)
- Performance:
- Security:
- Platform:
```


### Small Template (~50 lines)

```markdown
# PLAN.md — [Project Name]

**Scale:** small
**Generated:** [timestamp]
**BA Pipeline:** skipped (quick plan)

## Goal
<1-2 sentences>

## Features
1. <feature 1>
2. <feature 2>
3. <feature 3>
4. <feature 4> (if applicable)
5. <feature 5> (if applicable)

## Tech Stack
| Layer | Technology |
|-------|------------|
| <layer> | <tech> |

## User Stories
### US-01: <title>
As a [user], I want [feature] so that [benefit].
**Done:** <criteria>

### US-02: <title>
As a [user], I want [feature] so that [benefit].
**Done:** <criteria>

### US-03: <title>
As a [user], I want [feature] so that [benefit].
**Done:** <criteria>

## Risks
- <risk 1>
- <risk 2>

## Open Questions
- <question 1>

## Scale Detection
Tier: small
Reason: [auto-detected keyword or user confirmation]

## On-Demand Expansions
You can request enterprise-depth analysis on any section:
- "give me the NFR spec" → runs Phase 5 at enterprise depth
- "give me the use cases" → runs Phase 3 at enterprise depth
- "give me the user stories" → runs Phase 4 at enterprise depth
- "expand to full plan" → re-runs entire skill at enterprise depth
```

### Medium Template (~150-200 lines)

```markdown
# PLAN.md — [Project Name]

**Scale:** medium
**Generated:** [timestamp]
**BA Pipeline:** compressed (6 phases, inline output)

## Goal
<2-3 sentences>

## Stakeholders (Top 3-5)
| Name | Role | Top Uncertainty |
|------|------|-----------------|
| ... | ... | ... |

## Use Cases
| ID | Use Case | Actor | Priority |
|----|----------|-------|----------|
| UC-01 | ... | ... | High |
| UC-02 | ... | ... | Medium |

## Requirements
<Functional requirements listed inline>
- FR-01: <requirement> (source: UC-01)
- FR-02: <requirement> (source: UC-02)

## User Stories
| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-01 | As a... I want... | Given/When/Then |
| US-02 | As a... I want... | Given/When/Then |

## UI & Data
| Screen | Purpose | Key Fields |
|--------|---------|------------|
| ... | ... | ... |

## Architecture
| Category | Target |
|----------|--------|
| Performance | ... |
| Availability | ... |

## Implementation Sequence
| # | Task | Effort | Depends on |
|---|------|--------|------------|
| 1 | ... | ... | — |

## Risks
<Top 3 from all phases>

## Open Questions
<Any unresolved items>

## Scale Detection
Tier: medium
Reason: [auto-detected keyword or user confirmation]

## On-Demand Expansions
You can request enterprise-depth analysis on any phase:
- "expand [phase] to full depth" → re-runs that phase at enterprise depth
- "expand to full plan" → re-runs entire skill at enterprise depth
```

### Enterprise Template (current — unchanged, ~400+ lines + separate files)

```markdown
# PLAN.md
<!-- Generated by sriflow-plan v4.0.0 — BA Pipeline -->

## Goal
<2-4 sentences from Phase 1>

## Stakeholder Register
<Full table — inline>

| ID | Name | Role | Power | Interest | Top Uncertainty |
|----|------|------|-------|----------|-----------------|

## Use Cases
<Summary table — inline. Full specs in `03_use-cases/draft/UC-*.md`>

| ID | Use Case | Primary Actor | Priority | Status |
|----|----------|---------------|----------|--------|

## Requirements
<Summary — inline. Full BRD in `04_requirements/BRD.md`. Stories in `04_requirements/backlog/US-*.md`>

### BRD Summary
- **Total Requirements:** N
- **All requirements trace to use cases**

### User Stories
| ID | User Story | Use Case | INVEST | GWT |
|----|------------|----------|--------|-----|

## UI & Data
<Summary — inline. Full specs in `05_ui-and-data/screens/screen-specifications.md`. Data Dictionary in `05_ui-and-data/data-dictionary.md`>

### Screens
| ID | Screen | Purpose |
|----|--------|---------|

### Data Dictionary
- **Entities:** N
- **All fields:** type, validation, behavior, rule defined

## Architecture
<Summary — inline. Full NFR in `06_architecture/NFR.md`. System Design in `06_architecture/system-design.md`>

### Technology Stack
| Layer | Technology |
|-------|------------|

### NFR Summary
| Category | Key Metric | Target |
|----------|------------|--------|

## Implementation Sequence
| # | Task | Effort (human) | Effort (AI) | Depends on |
|---|------|----------------|-------------|------------|

## Risk Flags
<Top 3 risks from all phases>

## Open Questions
<Any unresolved items>

## Appendix: File Structure
<Directory tree of all artifacts>

## Scale Detection
Tier: enterprise
Reason: [auto-detected keyword or user confirmation]
```
