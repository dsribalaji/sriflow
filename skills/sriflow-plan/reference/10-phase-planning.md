# Phase-Based Planning

Research → Implementation → Testing flow. Each phase has gates. Gates must pass before next phase opens.

## Flow

```
Research → Plan → Implement → Test → Review → Ship
   ↓         ↓         ↓         ↓       ↓       ↓
 Report    PLAN.md   Code    QA_REPORT  CR     Deploy
```

## Phase Structure

### Phase 0: Research (if needed)
**When**: New technology, unclear architecture, multiple approaches
**Output**: Research report with pattern comparison (A/B/C)
**Gate**: Decision made, approach selected

### Phase 1: Planning
**When**: Always
**Output**: PLAN.md with phases, tasks, success criteria
**Gate**: All questions answered, no BLOCKED items

### Phase 2: Implementation
**When**: PLAN.md approved
**Output**: Working code
**Gate**: Code compiles, tests pass, lint clean

### Phase 3: Testing
**When**: Implementation complete
**Output**: QA_REPORT.md
**Gate**: GP passes, no Critical bugs

### Phase 4: Review
**When**: Testing passes
**Output**: CODE_REVIEW.md
**Gate**: No blocking findings

### Phase 5: Ship
**When**: Review passes
**Output**: Deployed + smoke tested
**Gate**: CI green, smoke test pass

## Research Report Format

```markdown
# Research Report: [Topic]

**Date:** YYYY-MM-DD
**Scope:** What was investigated

## Executive Summary
2-3 sentence summary of findings and recommendation.

## Key Findings

### 1. [Pattern A Name]
**Description**: What it is
**Pros**: Advantages
**Cons**: Disadvantages
**Use case**: When to use

### 2. [Pattern B Name]
[Same structure]

### 3. [Pattern C Name]
[Same structure]

## Recommendation
Which pattern to use and why.

## References
- [Link 1]
- [Link 2]
```

## Phase File Format

```markdown
# Phase XX: [Name]

**Date:** YYYY-MM-DD
**Priority:** P0/P1/P2
**Status:** pending/in_progress/completed
**Estimated Effort:** X-Y hours
**Depends On:** [Previous phases]

---

## Overview
What this phase achieves.

## Key Insights (from research)
Important findings that affect implementation.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Related Code Files
List of files to modify/create/delete.

## Implementation Steps
### 1. Step One
Detailed instructions.

### 2. Step Two
Detailed instructions.

## Success Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Validation
How to verify this phase is complete.
```

## Plan Overview Format

```markdown
# [Plan Name]

**Date:** YYYY-MM-DD
**Status:** In Progress
**Goal:** What we're building

---

## Overview
Brief description.

## Key Decisions
1. **Decision**: Rationale
2. **Decision**: Rationale

## Phases

| # | Phase | Priority | Status | Doc |
|---|-------|----------|--------|-----|
| 01 | Research | P0 | completed | [link] |
| 02 | Planning | P0 | completed | [link] |
| 03 | Implementation | P0 | in_progress | [link] |
| 04 | Testing | P0 | pending | [link] |

## Dependencies
- Research: [link to research report]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

## Gates

Every phase has a gate. Gate = checklist of conditions that must be true before next phase opens.

| Phase | Gate Conditions |
|-------|-----------------|
| Research → Planning | Decision made, approach selected |
| Planning → Implementation | PLAN.md complete, all questions answered |
| Implementation → Testing | Code compiles, lint clean, no obvious bugs |
| Testing → Review | QA_REPORT.md written, GP passes |
| Review → Ship | CODE_REVIEW.md written, no blocking findings |
| Ship → Done | CI green, smoke test pass |

## Context Refresh Triggers

Start a new plan phase when:
- Starting a new development phase
- Switching between work types (feature → bugfix)
- After major context accumulation (>8000 tokens)
- When agent handoffs occur
