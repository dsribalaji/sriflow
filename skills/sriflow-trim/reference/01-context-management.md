# Context Management

Token budget awareness. Cross-references instead of duplication. Fresh context for each phase.

## Token Budget

User controls response depth: "brief" / "normal" / "exhaustive".

| Level | Behavior | Use when |
|-------|----------|----------|
| **brief** | 1-3 sentences | Quick questions, status checks |
| **normal** | Standard trim output | Default for most tasks |
| **exhaustive** | Full detail, examples, edge cases | Architecture decisions, complex debugging |

## Cross-References Rule

**Never copy content between files.** Instead:

- Link to existing documentation
- Reference other plans without including content
- Use file paths instead of code blocks where possible
- Focus on "what" and "why", not detailed "how"

### Bad (Duplication)
```markdown
## Architecture
The system uses a microservices architecture with the following components:
[500 lines of architecture details]
```

### Good (Cross-Reference)
```markdown
## Architecture
See `docs/system-architecture.md` for full architecture details.
Key decision: microservices for independent deployment.
```

## Context Refresh Triggers

Start fresh context when:
- Starting a new development phase
- Switching between work types (feature → bugfix)
- After major context accumulation (>8000 tokens)
- When agent handoffs occur

## Plan File Organization

```
plans/
├── plan.md                    # Overview (<80 lines)
├── phases/
│   ├── phase-01-setup.md     # Detailed phase
│   ├── phase-02-implement.md
│   └── phase-03-test.md
└── research/
    └── researcher-01-report.md
```

### Overview Plan (plan.md)
- Keep generic and under 80 lines
- List each phase with status/progress
- Link to detailed phase files
- Key dependencies

### Phase Files (phase-XX-name.md)
- Context links (not full content)
- Overview + priority + status
- Key insights from research
- Requirements (functional + non-functional)
- Related code files (list, not content)
- Implementation steps
- Success criteria
- Risk assessment

## Agent Handoff Context

When passing context between agents:

```markdown
## Agent Handoff

### From: [Agent] → To: [Agent]

## Input
[What the next agent needs]

## Output from Previous
[Summary, not full output]

## Constraints
[Rules to follow]

## Context
[Relevant background, under 500 tokens]
```

## Token Efficiency Patterns

1. **Summarize, don't quote**: Pass 2-sentence summary, not 20-line block
2. **Reference files**: "See `path/to/file.md`" > copy content
3. **Use tables**: Compact format for structured data
4. **Bullet points**: Shorter than paragraphs
5. **Code paths**: `src/auth/middleware.ts` > full file content
