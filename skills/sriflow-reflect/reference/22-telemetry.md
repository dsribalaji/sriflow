# Telemetry (run last)

After workflow completion:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "SRIFLOW_REFLECT_COMPLETE: branch=$_BRANCH duration=${_TEL_DUR}s session=$_SESSION_ID ts=$_TIMESTAMP"
```

This line is parsed by SRIFLOW_MEMORY.md log tooling. Do not modify its format.
