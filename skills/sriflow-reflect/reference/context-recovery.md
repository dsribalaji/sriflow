# Context Recovery and Telemetry

## Context Recovery

At session start or after context compaction:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then echo "=== SRIFLOW CONTEXT ==="; cat SRIFLOW_MEMORY.md; echo "=== END CONTEXT ==="; fi
if [ -f "RETRO.md" ]; then echo "=== RETRO (last cycle) ==="; head -60 RETRO.md; echo "=== END RETRO ==="; fi
```

2-sentence welcome-back summary covering current stage and next priority. If stage is `reflect-complete`, suggest `/sriflow-plan`.

## Telemetry (run last)

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "SRIFLOW_REFLECT_COMPLETE: branch=$_BRANCH duration=${_TEL_DUR}s session=$_SESSION_ID ts=$_TIMESTAMP"
```

This line is parsed by SRIFLOW_MEMORY.md log tooling. Do not modify its format.
