# Documentation Management

Auto-update triggers for living documents. Keep docs in sync with code.

## Living Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **Roadmap** | `docs/development-roadmap.md` | Project phases, milestones, progress |
| **Changelog** | `docs/project-changelog.md` | All significant changes, features, fixes |
| **Architecture** | `docs/system-architecture.md` | System design, component interactions |
| **Code Standards** | `docs/code-standards.md` | Coding conventions, patterns |

## Auto-Update Triggers

Update docs when:

| Trigger | Document to Update |
|---------|-------------------|
| Feature implemented | Roadmap + Changelog |
| Major milestone reached | Roadmap |
| Bug fixed | Changelog (with severity + impact) |
| Security update | Changelog + Architecture |
| Breaking change | Changelog + Architecture + Roadmap |
| New dependency | Architecture |
| Phase status changes | Roadmap |

## Update Protocol

1. **Before**: Read current doc state
2. **During**: Maintain version consistency, proper formatting
3. **After**: Verify links, dates, cross-references
4. **Quality Check**: Ensure updates match actual implementation

## Changelog Format

```markdown
## [Version] - YYYY-MM-DD

### Added
- Feature description (#issue)

### Changed
- Change description (#issue)

### Fixed
- Bug fix description (#issue)

### Security
- Security improvement (#issue)

### Deprecated
- Deprecated feature (#issue)

### Removed
- Removed feature (#issue)
```

## Roadmap Format

```markdown
# Development Roadmap

## Phase 1: Foundation (Status: Complete)
- [x] Task 1
- [x] Task 2

## Phase 2: Core Features (Status: In Progress)
- [x] Task 1
- [ ] Task 2
- [ ] Task 3

## Phase 3: Polish (Status: Pending)
- [ ] Task 1
- [ ] Task 2
```

## Documentation Triggers for sriflow

After each skill completes, check if docs need updating:

| Skill | Doc Update |
|-------|-----------|
| `/sriflow-think` | Roadmap (new requirements) |
| `/sriflow-plan` | Roadmap (new phase) |
| `/sriflow-build` | Changelog (new feature) |
| `/sriflow-test` | Changelog (bug fixes) |
| `/sriflow-ship` | Changelog (release) |
| `/sriflow-reflect` | Roadmap (lessons learned) |

## Cross-References

- Link to existing docs instead of copying content
- Reference other plans without including full content
- Use file paths instead of code blocks where possible
- Focus on "what" and "why", not detailed "how"
