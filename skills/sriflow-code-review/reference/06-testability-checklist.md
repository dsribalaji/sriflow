# Shift-Left Testing Checklist

## 1. Three Amigos Session Format (15–30 min)

**Who:** Developer + QA + Product Owner (or equivalent)
**What:** Review upcoming feature before building

### Agenda

| Phase | Time | Owner | Content |
|-------|------|-------|---------|
| 1. Intent | 5 min | Product Owner | Explains feature goal, user value, success criteria |
| 2. Technical approach | 5 min | Developer | Explains implementation plan, data flow, dependencies |
| 3. Test scenarios | 10 min | QA | Identifies happy path, edge cases, error states |
| 4. Risks & acceptance | 10 min | All | Identify risks, edge cases, acceptance criteria together |

**Output:** Shared understanding + test scenarios identified *before* code is written.

---

## 2. PR Review Checklist for Testability

- [ ] Tests exist for new code
- [ ] Tests cover happy path + error states
- [ ] Tests are deterministic (no flaky patterns)
- [ ] Code is testable (not tightly coupled, dependencies injectable)
- [ ] Mocks/stubs used appropriately (not over-mocked)
- [ ] Test names describe behavior, not implementation
- [ ] No test interdependencies (tests run independently)

---

## 3. TDD Decision Guide

| Scenario | TDD? | Why |
|----------|------|-----|
| New feature with clear spec | **Yes** | Red-green-refactor catches spec misunderstandings |
| Bug fix | **Yes** | Write failing test first, verify fix works |
| Refactor (no behavior change) | **Maybe** | Existing tests should cover, add if gap |
| Exploration/spike | **No** | Don't know enough to write tests yet |
| UI styling | **No** | Visual changes need visual verification |
| Performance optimization | **Maybe** | Benchmark first, then optimize, then test |

---

## 4. Definition of Done Template

- [ ] Code complete
- [ ] Unit tests pass (≥80% coverage for new code)
- [ ] Integration tests pass
- [ ] No CRITICAL security findings
- [ ] No CRITICAL code review findings
- [ ] Documentation updated (if applicable)
- [ ] Tested on staging environment
- [ ] Product owner accepted

---

## 5. Integration with sriflow-code-review

| Phase | Checkpoint | Action |
|-------|------------|--------|
| Phase 2 (High-Level Review) | Testability of architecture | Verify dependencies are injectable, modules are loosely coupled, data flow is testable |
| Phase 3 (Line-by-Line) | Apply testability checklist | Check each item from §2 against the diff |
| Finding classification | Missing tests or untestable code | Add `[important]` finding — blocks ship if untestable |

---

## 6. Integration with sriflow-plan

| Phase | Testability Checkpoint | Action |
|-------|------------------------|--------|
| Phase 4 (Requirements) | Include testability in requirements | Acceptance criteria must include testable conditions, not vague outcomes |
| Phase 6 (Architecture) | Design for testability | Verify architecture supports injection, mocking, independent test runs |
