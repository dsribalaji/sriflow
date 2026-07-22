# 23 — Continuous Learning

## Overview

After each retro, extract atomic observations and convert them into "instincts" — reusable patterns with confidence scores. Instincts evolve over time: high-confidence patterns become rules, low-confidence patterns get pruned.

## Observation Capture

After each retro (Step 5), extract **1–3 atomic observations** from the cycle.

An observation is:
- **What worked** — something that produced a clear positive outcome
- **What didn't** — something that caused friction, rework, or failure
- **What was surprising** — something that contradicted prior assumptions

Format each observation as one sentence, specific enough to act on:
```
"Running QA before commit caught 3 regressions" (worked)
"Plan phase skipped stakeholder mapping, caused 2 rewrites" (didn't work)
"Smaller PRs reviewed faster despite same total LOC" (surprising)
```

## Instinct Creation

Convert observations into **instincts**. Each instinct has:

| Field | Description |
|-------|-------------|
| `pattern` | Short label for what triggers this instinct (e.g., "large PRs slow review") |
| `action` | What to do when pattern detected (e.g., "split PRs >200 LOC") |
| `confidence` | 0.0–1.0 score based on evidence strength |
| `evidence` | Count of independent observations supporting this instinct |
| `source` | Retro date or observation origin |

Start new instincts at `confidence: 0.5`, `evidence: 1`.

## Instinct Evolution

### Promotion to Rule
When `confidence > 0.8` AND `evidence >= 3`:
- Promote to a **rule**: always apply this instinct at cycle start
- Add `## Rules` section under Instincts in SRIFLOW_MEMORY.md

### Confidence Boost
When an instinct fires (applies to current cycle and produces positive outcome):
- Increase confidence by `0.1` (capped at 1.0)
- Increment evidence count by 1

### Demotion
When `confidence < 0.3` after `evidence >= 5`:
- Demote or remove instinct
- Log removal reason in retro

### Decay
When an instinct hasn't fired in 5+ cycles:
- Decrease confidence by `0.05` per idle cycle (floored at 0.0)

## Storage Format

Append to SRIFLOW_MEMORY.md under `## Instincts` section:

```
## Instincts

### INSTINCT | large PRs slow review | confidence: 0.7 | evidence: 3
Action: Split PRs >200 LOC into smaller chunks
Source: retro 2026-06-15

### INSTINCT | skip QA rework later | confidence: 0.9 | evidence: 4
Action: Run QA before commit, never after
Source: retro 2026-06-20

### RULE | always read SRIFLOW_MEMORY.md first | confidence: 0.95 | evidence: 6
Action: Start every cycle by reading memory file
Source: promoted from INSTINCT on 2026-06-25
```

## Application

At start of each new cycle:

1. Read `## Instincts` and `## Rules` from SRIFLOW_MEMORY.md
2. For each rule: apply it unconditionally
3. For each instinct: check if current cycle matches the pattern
   - If yes → log `INSTINCT FIRED: <pattern>` in RETRO.md
   - If no → log `INSTINCT SKIP: <pattern> — <reason>` (brief, one line)
4. After cycle completes: update confidence scores based on outcomes

## Conflict Resolution

When two instincts or rules conflict on the same decision:

1. Use the one with **higher confidence**
2. If confidence is equal, use the one with **more evidence**
3. Log conflict in RETRO.md:
   ```
   CONFLICT: "<instinct A>" vs "<instinct B>" → chose <winner> (confidence: X vs Y)
   ```
4. If conflict recurs 3+ times, create a meta-rule that disambiguates

## Integration Points

- **Step 5 (retro template):** Add observation extraction after § Lessons
- **Step 6 (memory update):** Append instinct updates under `## Instincts`
- **Step 11b (this step):** Run full evolution cycle (promote, decay, prune)
- **Context recovery:** Read instincts alongside memory at session start
- **Self-improvement:** Feed instinct performance back into observation log
