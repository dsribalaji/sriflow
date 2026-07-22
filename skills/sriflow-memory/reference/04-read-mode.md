# Step 0 — Detect mode

Parse the user's invocation and preamble output to determine which mode to run:

**WRITE mode** — triggered by any of:
- Another sriflow skill called this skill on its completion (most common path — the calling skill passes `skill | outcome | duration | note` in its invocation).
- User says "save context", "remember this", "update memory", "log this", or passes `/sriflow-memory write "<note>"`.
- `MEMORY_EXISTS: false` and no explicit mode signal → first-time init, then WRITE the first entry.

**READ mode** — triggered by any of:
- User says `/sriflow-memory`, "read memory", "what's our context", "where were we", "what was I doing", "restore context", "what's the current goal".
- Preamble shows `MEMORY_EXISTS: true` and the context indicates a new session starting (no calling skill, no note to write).

**COMPRESS mode** — triggered by any of:
- User says `/sriflow-memory compress`, "compress memory", "shrink memory".
- Preamble shows `AUTO-COMPRESS TRIGGERED` (log count > 50). In this case, auto-compress skips the D1 confirmation AskUserQuestion entirely.

**Ambiguous**: if mode cannot be determined from context and preamble, default to READ if `MEMORY_EXISTS: true`, WRITE (init) if `MEMORY_EXISTS: false`.

---

# Step 1 — READ mode

## 1a — Check memory exists

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY_FOUND"
else
  echo "NO_MEMORY_FILE"
fi
```

If `NO_MEMORY_FILE`: output the following and stop. Do not create the file in READ mode — creation happens only in WRITE mode.

```
No memory yet. Starting fresh.

Run /sriflow-plan to begin, or say "save context" after your first session to
create SRIFLOW_MEMORY.md with your goal and stack.
```

## 1b — Read and surface the full file

Read `SRIFLOW_MEMORY.md` using the Read tool (not bash cat — the Read tool is preferred for file access).

Surface content in this order:

**1. Show the full Summary section verbatim.** Every field: Goal, Stack, Current Stage, Last Updated, Key Decisions, Compressed History (if present), Lessons (if present), Next Priority.

**2. Show the last 10 log entries verbatim**, newest last (same order as in the file). If the file has a `## Log (newest 10)` section (post-compress), show all entries in that section. If the log has fewer than 10 entries, show all of them.

**3. Output a 2-sentence context summary** in this exact format:

```
Current goal: <Goal value>. Last action: <skill-name> — <outcome> on <date from the last log entry's timestamp, formatted as YYYY-MM-DD>.
```

Example:
```
Current goal: Build JWT auth with refresh token rotation for the user API. Last action: sriflow-build — done-with-concerns on 2026-06-12.
```

**4. Suggest the next skill** based on Current Stage:

| Current Stage | Suggested Next Skill | Trigger Condition |
|---|---|---|
| `init` | `/sriflow-plan` | No planning done yet |
| `plan` | `/sriflow-design` | Plan complete, need wireframes |
| `design` | `/sriflow-build` | Design locked, ready to build |
| `build` | `/sriflow-code-review` | Build complete, need review |
| `review` | `/sriflow-test` | Review passed, need QA |
| `test` | Consult `/sriflow` front door | Tests green, ready to ship |
| `ship` | `/sriflow-reflect` | Shipped, run retrospective |
| `unknown` | `/sriflow-plan` | State unclear, start over |

Output the suggestion as: "Current stage is `<stage>` — suggested next: `/<skill>`."

Only suggest once. If the last log entry's outcome is `blocked`, add: "Last action was blocked — resolve the blocker before advancing stage."

## 1c — Token budget warning

If the preamble echoed `MEMORY_WARNING`, surface it now as a standalone line:

```
Memory growing large — run /sriflow-memory compress to reduce token overhead.
```

---

## Context Recovery

At session start or after context compaction, recover project context:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  head -60 SRIFLOW_MEMORY.md
  echo "..."
  echo "=== RECENT LOG ENTRIES ==="
  grep -n "^### " SRIFLOW_MEMORY.md | tail -10
  echo "=== END CONTEXT ==="
else
  echo "NO_MEMORY_FILE"
fi
```

If memory found: give a 2-sentence welcome-back summary from the Summary section. If the current stage implies a next skill (see Step 1b table), suggest it once in one line.
