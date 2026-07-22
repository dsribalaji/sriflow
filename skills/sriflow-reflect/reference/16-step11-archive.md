# Step 11: Save retro snapshot (optional, if RETRO archive pattern detected)

If the project has a `retros/` directory or a pattern of dated retro files (`RETRO-YYYY-MM-DD.md`), save a copy:

```bash
# Check for retro archive directory
ls -d retros/ 2>/dev/null || echo "no retros dir"
ls RETRO-*.md 2>/dev/null | head -3 || echo "no dated retros"
```

If a `retros/` directory exists: copy RETRO.md to `retros/RETRO-<today>.md` (do not overwrite the working RETRO.md).
If dated retro files exist in the root: copy RETRO.md to `RETRO-<today>.md`.
If neither pattern is detected: skip. Note: "No retro archive pattern detected. To enable retro history, create a `retros/` directory."

Do NOT create the archive directory or pattern speculatively. Only use patterns already established in the project.
