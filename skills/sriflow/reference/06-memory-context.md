# 06 — Memory, Context Recovery & Confusion

## Memory Write (run last)

After the workflow finishes, append to `SRIFLOW_MEMORY.md`:

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

Swap `OUTCOME` for the real result (done/blocked/concerns) and `DESTINATION` for the routed skill, or `status`/`help` when that's what you displayed.

Write memory only when something worth keeping occurred, such as a routing decision or a status render on an in-flight project. Skip memory for a plain `/sriflow help` on a fresh project.

## Context Recovery

At session start, or after context compaction:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
```

When memory exists: summarize the current state in two sentences. If the current stage implies a next skill, mention it once.

When no memory exists: say "No SRIFLOW_MEMORY.md found. Run /sriflow-plan to start a new project."

## Confusion Protocol

Reserve this for high-stakes ambiguity: architecture calls, destructive scope, or missing context that would change the route. STOP, name the issue in one sentence, lay out 2-3 options with their tradeoffs, then ask. Don't use it for routine routing or clear intent.