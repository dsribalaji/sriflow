# Plan Templates

Three typed templates for different work categories. Pick the right template before planning.

## Template Selection

| Template | Use when | Scope |
|----------|----------|-------|
| **Feature** | New functionality, endpoints, services, modules | Medium-Large |
| **Bug Fix** | Specific issues, errors, broken functionality | Small-Medium |
| **Refactor** | Improve structure, performance, maintainability | Medium-Large |

## Feature Implementation Template

```markdown
# [Feature Name] Implementation Plan

**Date**: YYYY-MM-DD
**Type**: Feature Implementation
**Status**: Planning
**Context Tokens**: <200 words

## Executive Summary
Brief 2-3 sentence description of the feature and its business value.

## Context Links
- **Related Plans**: [List other plan files - no full content]
- **Dependencies**: [External systems, APIs, existing features]
- **Reference Docs**: [Link to docs]

## Requirements
### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Non-Functional Requirements
- [ ] Performance target
- [ ] Security requirement
- [ ] Scalability requirement

## Architecture Overview
```mermaid
[Simple component diagram]
```

### Key Components
- **Component 1**: Brief description
- **Component 2**: Brief description

### Data Models
- **Model 1**: Key fields
- **Model 2**: Key fields

## Implementation Phases

### Phase 1: [Name] (Est: X days)
**Scope**: Specific boundaries
**Tasks**:
1. [ ] Task 1 - file: `path/to/file.ts`
2. [ ] Task 2 - file: `path/to/file.ts`

**Acceptance Criteria**:
- [ ] Criteria 1
- [ ] Criteria 2

### Phase 2: [Name] (Est: X days)
[Repeat structure]

## Testing Strategy
- **Unit Tests**: Specific test coverage targets
- **Integration Tests**: Key interaction points
- **E2E Tests**: Critical user flows

## Security Considerations
- [ ] Security item 1
- [ ] Security item 2

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Risk 1 | High | Mitigation strategy |

## Quick Reference
### Key Commands
```bash
npm run command
```

### Configuration Files
- `config/file.ts`: Purpose
- `.env.example`: Environment variables

## TODO Checklist
- [ ] Phase 1 Task 1
- [ ] Phase 1 Task 2
- [ ] Phase 2 Task 1
- [ ] Testing complete
- [ ] Documentation updated
- [ ] Code review passed
```

## Bug Fix Template

```markdown
# [Bug Fix] Implementation Plan

**Date**: YYYY-MM-DD
**Type**: Bug Fix
**Priority**: [Critical/High/Medium/Low]
**Context Tokens**: <150 words

## Executive Summary
Brief description of the bug and its impact.

## Issue Analysis
### Symptoms
- [ ] Symptom 1
- [ ] Symptom 2

### Root Cause
Brief explanation of the underlying cause.

### Evidence
- **Logs**: Reference to log files (don't include full logs)
- **Error Messages**: Key error patterns
- **Affected Components**: List of impacted files/modules

## Context Links
- **Related Issues**: [GitHub issue numbers]
- **Recent Changes**: [Relevant commits or PRs]
- **Dependencies**: [Related systems]

## Solution Design
### Approach
High-level fix strategy in 2-3 sentences.

### Changes Required
1. **File 1** (`path/to/file.ts`): Brief change description
2. **File 2** (`path/to/file.ts`): Brief change description

### Testing Changes
- [ ] Update existing tests
- [ ] Add new test cases
- [ ] Validate fix doesn't break existing functionality

## Implementation Steps
1. [ ] Step 1 - file: `path/to/file.ts`
2. [ ] Step 2 - file: `path/to/file.ts`
3. [ ] Run test suite
4. [ ] Validate fix in relevant environments

## Verification Plan
### Test Cases
- [ ] Test case 1: Expected behavior
- [ ] Test case 2: Edge case handling
- [ ] Regression test: Ensure no new issues

### Rollback Plan
If the fix causes issues:
1. Revert commit: `git revert <commit-hash>`
2. Restore previous behavior in files X, Y, Z

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Risk 1 | Medium | Mitigation plan |

## TODO Checklist
- [ ] Implement fix
- [ ] Update tests
- [ ] Run full test suite
- [ ] Code review
- [ ] Deploy and verify
```

## Refactoring Template

```markdown
# [Component/Module] Refactoring Plan

**Date**: YYYY-MM-DD
**Type**: Refactoring
**Scope**: [Module/Component/System level]
**Context Tokens**: <200 words

## Executive Summary
Brief description of what is being refactored and why.

## Current State Analysis
### Issues with Current Implementation
- [ ] Issue 1: Performance bottleneck
- [ ] Issue 2: Code maintainability
- [ ] Issue 3: Technical debt

### Metrics (Before)
- **Performance**: Current benchmarks
- **Code Quality**: Complexity metrics
- **Test Coverage**: Current percentage

## Context Links
- **Affected Modules**: [List without full content]
- **Dependencies**: [Other systems impacted]
- **Related Documentation**: [Links to docs]

## Refactoring Strategy
### Approach
High-level strategy for the refactoring in 2-3 sentences.

### Architecture Changes
```mermaid
[Before/After comparison diagram]
```

### Key Improvements
- **Improvement 1**: Brief description
- **Improvement 2**: Brief description

## Implementation Plan

### Phase 1: Preparation (Est: X days)
**Scope**: Setup and preparation work
1. [ ] Create comprehensive tests for current functionality
2. [ ] Document current behavior
3. [ ] Identify all dependencies

### Phase 2: Core Refactoring (Est: X days)
**Scope**: Main refactoring work
1. [ ] Refactor component A - file: `path/to/file.ts`
2. [ ] Refactor component B - file: `path/to/file.ts`
3. [ ] Update integration points

### Phase 3: Integration & Testing (Est: X days)
**Scope**: Validation and cleanup
1. [ ] Integration testing
2. [ ] Performance validation
3. [ ] Documentation updates

## Backward Compatibility
- **Breaking Changes**: [List any breaking changes]
- **Migration Path**: [Steps for users/systems]
- **Deprecation Timeline**: [If applicable]

## Success Metrics (After)
- **Performance**: Target improvements
- **Code Quality**: Target metrics
- **Test Coverage**: Target percentage

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | High | Comprehensive testing |
| Performance regression | Medium | Benchmarking |

## TODO Checklist
- [ ] Phase 1: Preparation complete
- [ ] Phase 2: Core refactoring complete
- [ ] Phase 3: Integration complete
- [ ] Performance benchmarks validated
- [ ] Documentation updated
- [ ] Code review passed
```

## Context Management Best Practices

- **Executive Summary**: Max 3 sentences
- **Context Links**: Reference files, don't include full content
- **Tasks**: Max 10 per phase
- **Context Tokens**: Target <200 words for summaries
- **Cross-References**: Link to existing docs, reference other plans without copying content
- **Focus**: "What" and "why", not detailed "how"

## Quality Checklist

Before finalizing any plan:
- [ ] Executive summary is clear and concise
- [ ] Tasks are specific and actionable
- [ ] File paths are included for implementation tasks
- [ ] Success criteria are measurable
- [ ] Context links are used instead of full content
- [ ] TODO checklist is complete and realistic
