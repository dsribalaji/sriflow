# 06 — Memory, Context Recovery & Confusion

## Memory Write (run last)

After workflow completion, append to `SRIFLOW_MEMORY.md`:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Routed to: DESTINATION
MEMEOF
```

Replace `OUTCOME` with actual outcome (done/blocked/concerns). Replace `DESTINATION` with the skill routed to, or `status`/`help` if that's what was shown.

Only write memory if something happened worth recording (routing decision, status shown for mid-pipeline project). Do not write memory for a simple `/sriflow help` on a fresh project.

## Context Recovery

At session start or after context compaction:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

If memory found: give a 2-sentence summary of current state. If a next skill is implied by the current stage, suggest it once.

If no memory found: say "No SRIFLOW_MEMORY.md found. Run /sriflow-plan to start a new project."

## Confusion Protocol

For high-stakes ambiguity (architecture decisions, destructive scope, missing context that changes the routing): STOP. Name it in one sentence, present 2-3 options with tradeoffs, ask. Do not use for routine routing or obvious intent matches.
