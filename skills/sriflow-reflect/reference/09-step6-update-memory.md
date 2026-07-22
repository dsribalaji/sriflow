# Step 6: Update SRIFLOW_MEMORY.md

After RETRO.md is written, update SRIFLOW_MEMORY.md. Make all edits with the Edit tool — not by overwriting the file.

**6a: Compress if needed.**

Count log entries in SRIFLOW_MEMORY.md: look for lines matching `### <timestamp> |` pattern. If there are more than 50 such entries:
1. Find the oldest 40 entries (first 40 by date).
2. Summarize them into a single block:

```markdown
### <earliest-date> to <40th-entry-date> | COMPRESSED | <N> entries

Summary of compressed entries:
- Stages run: [list of unique skills from compressed entries]
- Total sessions: N
- Status distribution: N DONE, N DONE_WITH_CONCERNS, N BLOCKED
- Key decisions: [any D-numbered decisions referenced in compressed entries]
- Notable events: [any BLOCKED or repeated NEEDS_CONTEXT patterns]
```

3. Replace the oldest 40 entries with this summary block using the Edit tool.
4. Keep all entries newer than the 40th oldest (i.e., entries 41+ stay intact).

Note in conversation: "Compressed 40 oldest log entries into summary block."

**6b: Append lessons block.**

Append to the end of SRIFLOW_MEMORY.md:

```markdown

### <ISO-timestamp> | sriflow-reflect | DONE | <duration>s
Branch: <_BRANCH>
Session: <_SESSION_ID>
Window: <_RETRO_SINCE> to <today>
Lessons:
- <lesson 1 from RETRO.md § 8>
- <lesson 2 from RETRO.md § 8>
- <lesson 3 from RETRO.md § 8>
Carry-forward:
- <carry-forward item 1>
- <carry-forward item 2>
- <carry-forward item 3>
```

**6c: Update stage and next priority.**

Find the line `## Current Stage:` in SRIFLOW_MEMORY.md and update it:

```
## Current Stage: reflect-complete
```

Find or add the line `## Next Priority:` and set it to the first carry-forward item from RETRO.md § 7:

```
## Next Priority: <first item from § 7 Carry-Forward, condensed to one clause>
```

If neither line exists, append both to the end of the file under a `## Status` header.

Run the memory update:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "REFLECT_DONE: duration ${_TEL_DUR}s | timestamp $_TIMESTAMP"
```

Use this duration and timestamp in the log entry appended to SRIFLOW_MEMORY.md.
