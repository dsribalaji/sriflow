# Orchestration Protocol

Subagent patterns for complex tasks. Chain when dependencies exist, parallelize when independent.

## Sequential Chaining

Chain subagents when tasks have dependencies or require outputs from previous steps.

### Standard Chains

**Feature Development:**
```
planner → builder → tester → reviewer
```

**New System Component:**
```
researcher → designer → builder → docs-manager
```

**Bug Fix:**
```
investigator → builder → tester → reviewer
```

### Rules
- Each agent completes fully before the next begins
- Pass context and outputs between agents in the chain
- If any agent fails, stop and reassess
- Never skip a step in the chain

## Parallel Execution

Spawn multiple subagents simultaneously for independent tasks.

### Safe Parallel Patterns

**Independent Components:**
```
builder(component-a) + builder(component-b) + docs-manager
```

**Multiple Feature Branches:**
```
builder(feature-1) + builder(feature-2)
```

**Cross-Platform:**
```
builder(iOS) + builder(Android)
```

### Rules
- Ensure no file conflicts or shared resource contention
- Plan integration points before parallel execution begins
- Merge strategy: feature branches merge to main, not to each other
- If conflict detected, stop parallel execution and serialize

## Agent Roles

| Agent | Responsibility | Output |
|-------|---------------|--------|
| **planner** | Create implementation plan | PLAN.md |
| **researcher** | Investigate technical topics | Research report |
| **builder** | Implement code | Working code |
| **tester** | Run tests, analyze results | QA_REPORT.md |
| **reviewer** | Code review | CODE_REVIEW.md |
| **docs-manager** | Update documentation | Updated docs |
| **debugger** | Investigate bugs | Root cause analysis |

## Context Passing

When chaining agents, pass:
1. **Input**: What the agent needs to start
2. **Output**: What the agent produces
3. **Constraints**: What the agent must respect
4. **Context**: Relevant background information

### Context Format

```markdown
## Agent Handoff

### From: [Previous Agent]
### To: [Next Agent]

## Input
[What the next agent needs to start]

## Output from Previous
[Summary of what was produced]

## Constraints
[Rules the next agent must follow]

## Context
[Relevant background]
```

## Error Handling

If an agent fails:
1. Stop the chain
2. Read the failure report
3. Fix the issue (or ask for clarification)
4. Restart from the failed agent (not from the beginning)

## Token Efficiency

- Pass summaries, not full outputs
- Reference files instead of including content
- Use cross-references between plans
- Keep agent handoffs under 500 tokens
