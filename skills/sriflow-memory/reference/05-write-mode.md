# Step 2 — WRITE mode

## 2a — Create file if missing (first-time init)

If `MEMORY_EXISTS: false`, detect the project name:

```bash
_PROJECT=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || basename "$PWD")
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "PROJECT: $_PROJECT"
echo "TIMESTAMP: $_TIMESTAMP"
```

Use the Write tool to create `SRIFLOW_MEMORY.md` with the initial template. Fill in the `_PROJECT` and `_TIMESTAMP` values from the bash output above. Do not use placeholders — use the actual detected values:

```markdown
# SRIFLOW_MEMORY — <project name from _PROJECT>

## Summary
**Goal:** <to be updated>
**Stack:** <to be detected>
**Current Stage:** init
**Last Updated:** <timestamp from _TIMESTAMP>
**Key Decisions:**

**Next Priority:** Run /sriflow-plan to begin.

## Log
```

After writing the initial file, `MEMORY_EXISTS` is now effectively `true`. Continue to Step 2b to append the first log entry.

## 2b — Collect entry fields

Before writing a log entry, determine all four required fields. All four are mandatory. None can be omitted.

**Field 1: timestamp**

```bash
_ENTRY_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "ENTRY_TIMESTAMP: $_ENTRY_TIMESTAMP"
```

**Field 2: skill-name**

The name of the skill that triggered this WRITE. Use the exact `name:` value from that skill's frontmatter (e.g. `sriflow-build`, `sriflow-design`, `sriflow-plan`). If called directly by the user (not from another skill), use `sriflow-memory`.

**Field 3: outcome**

One of exactly four values: `done` / `done-with-concerns` / `blocked` / `needs-context`.

Map the calling skill's completion status:
- Skill reported DONE → `done`
- Skill reported DONE_WITH_CONCERNS → `done-with-concerns`
- Skill reported BLOCKED → `blocked`
- Skill reported NEEDS_CONTEXT → `needs-context`
- Any other status → map to the nearest of these four; prefer `done-with-concerns` when uncertain.

**Field 4: duration**

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
echo "DURATION_SECONDS: $_TEL_DUR"
```

`_TEL_START` was set in the preamble. If the calling skill passed its own duration, use that value instead of recomputing. If duration is unknown for any reason, write `0`.

**Field 5 (optional): note**

A one-line description of what happened this run. If called from another skill, use that skill's outcome summary sentence. If the user passed a note via `/sriflow-memory write "<note>"`, use their note verbatim — do not paraphrase. If no note is available, omit the line entirely (do not write an empty note line).

## 2c — Append log entry

Use the Edit tool to append the new entry to the end of `SRIFLOW_MEMORY.md`. Target the `old_string` as the last line in the file or the last existing log entry. Append after it.

The entry format, exactly:

```
### <ENTRY_TIMESTAMP> | <skill-name> | <outcome> | <DURATION_SECONDS>s
Branch: <_BRANCH>
Session: <_SESSION_ID>
<optional note — only include this line if a note is available>
```

A blank line separates this entry from the previous one. Do not add a trailing blank line after the new entry.

Concrete example with all fields:

```
### 2026-06-28T14:32:07Z | sriflow-build | done | 847s
Branch: feat/auth-flow
Session: 12345-1751118727
Implemented JWT auth + refresh token rotation. All 47 tests green.
```

Concrete example without optional note:

```
### 2026-06-28T14:33:51Z | sriflow-memory | done | 12s
Branch: feat/auth-flow
Session: 12346-1751118831
```

## 2d — Update Summary metadata

After appending the log entry, use the Edit tool to update the `## Summary` section. Update only these fields — leave all others unchanged:

**`**Last Updated:**`** — always update to the `_ENTRY_TIMESTAMP` from Step 2b.

**`**Current Stage:**`** — update if the calling skill implies a stage transition:

| Calling skill | New stage (if outcome is `done`) |
|---|---|
| `sriflow-plan` | `plan` |
| `sriflow-design` | `design` |
| `sriflow-build` | `build` |
| `sriflow-code-review` | `review` |
| `sriflow-test` | `test` |
| `sriflow-reflect` | `ship` |

If the calling skill's outcome is `blocked` or `needs-context`: do NOT advance the stage. Keep it unchanged.

If the skill was `sriflow-memory` (called directly): do not change the stage.

**`**Next Priority:**`** — if the calling skill's note contains a carry-forward action (e.g. "Next: fix the SQL injection in user_lookup.ts"), update this field with that action. Otherwise leave it unchanged.

Do not modify `**Goal:**`, `**Stack:**`, `**Key Decisions:**`, or `**Compressed History:**` in WRITE mode. Those are only updated during COMPRESS, or by the user explicitly via a "remember this" invocation where the user states a new goal or decision.

**Special case — user states a new goal or decision:**

If the user said "remember this" or "save context" and their message contains a new goal statement (e.g. "remember: we're switching to GraphQL") or a new decision, update the relevant Summary field directly:

- New goal statement → update `**Goal:**`
- New decision → append to `**Key Decisions:**` as `- D<N+1>: <decision> (<today's date>)`
- New stack info → update `**Stack:**`

## 2e — Auto-compress check

After writing the entry and updating Summary, recount log entries:

```bash
_NEW_LOG_COUNT=$(grep -c "^### " SRIFLOW_MEMORY.md 2>/dev/null || echo 0)
echo "UPDATED_LOG_ENTRIES: $_NEW_LOG_COUNT"
```

If `UPDATED_LOG_ENTRIES` > 50: proceed immediately to COMPRESS mode (Step 3). This is auto-compress — skip D1 entirely, go directly to Step 3b.

## 2f — Confirm write (only if compress was NOT triggered)

If `UPDATED_LOG_ENTRIES` <= 50, report:

```
MEMORY UPDATED
════════════════════════════════════════
Skill:    <skill-name>
Outcome:  <outcome>
Stage:    <current stage after update>
Entries:  <UPDATED_LOG_ENTRIES>
File:     SRIFLOW_MEMORY.md
════════════════════════════════════════
```
