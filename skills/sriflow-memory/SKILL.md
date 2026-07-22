---
name: sriflow-memory
preamble-tier: 2
version: 3.0.0
category: utility
related: sriflow-reflect, sriflow (router), all skills
description: "Per-project memory system. JSONL backends for learnings, decisions, timeline, context. Auto-compression at 50 entries. Absorbs: ruflo AgentDB patterns, ECC instinct system, gstack gbrain sync. Not for: code review — use sriflow-code-review. Not for: planning — use sriflow-plan."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - save context
  - remember this
  - log this
  - what do we know
  - show memory
  - /sriflow-memory
---

# /sriflow-memory — Per-Project Memory System

## When to invoke

Auto-invoked by most pipeline skills. Manually when user says "save this", "remember this", "log this", "what do we know". Manages per-project state in ~/.sriflow/projects/<slug>/ with JSONL files. Auto-compresses when >50 entries.

## Data files

| File | Format | Content |
|------|--------|---------|
| `context.json` | JSON | Current branch, session, saved context |
| `learnings.jsonl` | JSONL | Append-only learning entries |
| `decisions.jsonl` | JSONL | D-numbered decisions with rationale |
| `timeline.jsonl` | JSONL | Event timeline (skill start/complete) |
| `questions.jsonl` | JSONL | D-numbered questions and answers |
| `preferences.jsonl` | JSONL | User preferences per project |
| `analytics.jsonl` | JSONL | Skill usage analytics (opt-in) |
| `eureka.jsonl` | JSONL | Eureka moments (breakthrough insights) |
| `reviews.jsonl` | JSONL | Code review records |
| `instincts.jsonl` | JSONL | ECC-style instinct log (observations with confidence scores) |

## Reference files

| File | Content |
|------|---------|
| `reference/01-file-structure.md` | Full ~/.sriflow/ directory layout |
| `reference/02-compression.md` | Auto-compression rules (>50 → summarize oldest 40) |
| `reference/03-operational-rules.md` | Append-only, no secret storage |
| `reference/04-examples.md` | Example usage for each data file |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **ruflo AgentDB** | HNSW vector search concept | `reference/backends/vector-search.md` — tag-based search over JSONL embeddings |
| **ruflo HybridBackend** | SQLite + AgentDB hybrid | Documented as future upgrade path |
| **ruflo memory consolidation** | Cross-session memory compaction | `reference/backends/consolidation.md` |
| **ECC instinct system** | Observations with confidence scores (0-100) | `instincts.jsonl` backend |
| **ECC continuous learning** | Instinct evolution (confidence decay, promotion) | `reference/backends/instinct-evolution.md` |
| **gstack gbrain sync** | Cross-machine session sync | `reference/backends/gbrain-sync.md` |

## Voice
Direct, builder-to-builder, compressed via sriflow-trim. No AI vocabulary. Name files and paths exactly.

## Workflow
1. Check SRIFLOW_MEMORY.md for current state
2. Read/write appropriate JSONL file
3. If entries > 50, trigger compression
4. Append to SRIFLOW_MEMORY.md log

## Completion Status
- **DONE** — memory updated.
- **BLOCKED** — cannot read/write state directory.
