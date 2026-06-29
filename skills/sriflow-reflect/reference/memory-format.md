# SRIFLOW_MEMORY.md Format Reference

Reading and writing rules for SRIFLOW_MEMORY.md. Required for correct parsing and writing.

---

## Expected Top-Level Structure

```markdown
# SRIFLOW_MEMORY — <project name>

## Goal
<One paragraph: what this project is trying to accomplish.>

## Started
<ISO date when the project was created or when memory was initialized.>

## Current Stage: <stage-name>

## Next Priority: <one-clause description of the most urgent next action>

## Summary
<Rolling summary of the project state. Updated by /sriflow-memory and /sriflow-reflect.>
Last cycle complete: <ISO timestamp>. Next priority: <item>.

## Log

### <ISO-timestamp> | <skill-name> | <STATUS> | <duration>s
<Optional context lines: Branch, Session, notes from the skill run.>

### <ISO-timestamp> | <skill-name> | <STATUS> | <duration>s
...
```

---

## Log Entry Patterns to Recognize

**Standard skill log entry:**
```
### 2026-06-21T14:32:00Z | sriflow-build | DONE | 1842s
Branch: main
Session: 12345-1750512720
```

**Decision record (from AUQ in any skill):**
```
### 2026-06-20T11:15:00Z | sriflow-plan | DONE | 920s
Branch: feature/auth
D1: Chose JWT stateless tokens over session table — stateless avoids DB dependency for auth
D2: Deferred mobile layout to next cycle — desktop-only MVP
```

**Deploy record:**
```
### DEPLOY | 2026-06-22T16:00:00Z | production | sha:abc1234
```

**Prior retro lessons block:**
```
### 2026-06-14T18:00:00Z | sriflow-reflect | DONE | 340s
Branch: main
Lessons:
- DESIGN.md lacked responsive specs; build stalled 2 sessions
- Code review found 3 SQL injection risks; add review before ship next cycle
- QA ran after ship instead of before; reverse order next time
Carry-forward:
- Add responsive specs template to DESIGN.md
- Run /sriflow-code-review before /sriflow-ship
- Add integration tests for auth endpoints
```

---

## Parsing These Patterns

1. Reconstruct which pipeline stages ran and when (for § 3 Where Time Went)
2. Extract D-numbered decisions for § 4 Decision Quality review
3. Find prior carry-forward items for § 2b Prior Carry-Forward Resolution
4. Determine the start date for `cycle` window mode
5. Count log entries to determine if compression is needed (> 50 entries)

---

## Writing Rules

1. **Never overwrite the full file.** Use Edit (surgical replacement) or Bash append. Overwriting loses prior log entries.
2. **Stage and Next Priority lines must be on their own lines.** The regex `^## Current Stage:` and `^## Next Priority:` must match.
3. **Compression must preserve the Summary section.** The `## Summary` block and everything above it (Goal, Started, Current Stage, Next Priority) is never compressed. Only `## Log` entries are compressed.
4. **Timestamps are UTC ISO-8601.** Use `date -u +%Y-%m-%dT%H:%M:%SZ` in bash.
5. **Duration in seconds.** Always log `${_TEL_DUR}s` — not minutes, not "~Xh". Seconds enables programmatic analysis.

---

## Compression Format (> 50 entries)

When compressing the oldest 40 entries, replace them with:

```markdown
### <earliest-date> to <40th-entry-date> | COMPRESSED | <N> entries

Summary of compressed entries:
- Stages run: [list of unique skills from compressed entries]
- Total sessions: N
- Status distribution: N DONE, N DONE_WITH_CONCERNS, N BLOCKED
- Key decisions: [any D-numbered decisions referenced in compressed entries]
- Notable events: [any BLOCKED or repeated NEEDS_CONTEXT patterns]
```
