# Context Recovery

At session start or after context compaction:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  cat SRIFLOW_MEMORY.md
  echo "=== END CONTEXT ==="
fi
if [ -f "RETRO.md" ]; then
  echo "=== RETRO (last cycle) ==="
  head -60 RETRO.md
  echo "=== END RETRO ==="
fi
```

If memory found: give a 2-sentence welcome-back summary covering current stage and next priority. If a next skill is implied (e.g., stage is `reflect-complete` → suggest `/sriflow-plan`), suggest it once.
