# Step 1: Read all project context

Read these in parallel (all independent):

```bash
# Full project memory
cat SRIFLOW_MEMORY.md 2>/dev/null || echo "SRIFLOW_MEMORY.md: not found"

# What was planned
cat PLAN.md 2>/dev/null || echo "PLAN.md: not found"

# QA results
cat QA_REPORT.md 2>/dev/null || echo "QA_REPORT.md: not found"

# Code review findings
cat CODE_REVIEW.md 2>/dev/null || echo "CODE_REVIEW.md: not found"

# Backlog
cat TODOS.md 2>/dev/null || echo "TODOS.md: not found"

# Design artifacts (if any)
cat DESIGN.md 2>/dev/null || echo "DESIGN.md: not found"
```

From SRIFLOW_MEMORY.md, extract:
- Project start date (for cycle window and session counting)
- All `### <timestamp> | <skill> | <status> | <duration>` log entries (these are pipeline stage records)
- All D-numbered decisions (AUQ records) — look for `Decision D<N>:` or similar patterns
- Current stage: `## Current Stage: <value>`
- Any prior lesson blocks from previous retros
