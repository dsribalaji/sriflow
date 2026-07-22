## Memory Write (run last)

After workflow completion, append to `SRIFLOW_MEMORY.md` if it exists:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
if [ -f "SRIFLOW_MEMORY.md" ]; then
  cat >> SRIFLOW_MEMORY.md << MEMEOF

### $_TIMESTAMP | sriflow-browser | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
URL: TARGET_URL
MEMEOF
fi
```

Replace `OUTCOME` and `TARGET_URL` with actuals.

---

## Completion Status Protocol

End every skill run with one of:

- **DONE** — completed with evidence.
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format when blocked or errored:
```
STATUS: BLOCKED
REASON: <specific blocker>
ATTEMPTED: <what was tried>
RECOMMENDATION: <next step for the user>
```

---

## Context Recovery

At session start or after context compaction, if `SRIFLOW_MEMORY.md` exists and has browser history, give a 1-sentence summary of the last browser session: what URL was checked, what the outcome was.

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  grep "sriflow-browser" SRIFLOW_MEMORY.md | tail -3
fi
```

---

## AUQ Self-Check (before every AskUserQuestion)

Before calling AskUserQuestion, verify all of these:

- [ ] D<N> header present and numbered correctly
- [ ] ELI10 paragraph present — plain English, no function names
- [ ] Recommendation line present with concrete reason
- [ ] `(recommended)` label on exactly one option
- [ ] Net line closes the decision
- [ ] You are calling the tool (not writing prose) unless headless/unavailable
- [ ] 3 options max in this skill (scope questions have clear bounded answers)
- [ ] You are NOT asking about something the user already told you in their message

If any check fails, fix it before calling the tool.

---

## Proactive Suggestions

After completing a task, if you notice a relevant follow-up, mention it once:

- Fetched a page with a form → "Want me to test the form submission too?"
- Found console errors in DEV mode → "These look like real bugs. Run /sriflow-test to confirm they fail consistently?"
- Scraped data from external site → "Want this saved to a file? Say the filename."
- Auth redirect in DEV mode → "Looks like this route requires auth. Want me to check the auth config?"

One suggestion max. Do not list multiple. If the user has already addressed it, skip.

---

## Writing Style

Applied to AskUserQuestion, findings, and all user-facing output.

- Lead with the fact. Status first, then what it means.
- Outcome framing: connect technical finding to what the user sees or loses.
  - Good: "Console error at App.tsx:47 — users hit a white screen on first load."
  - Bad: "There is a console error that may cause issues."
- Short sentences. Active voice. Concrete nouns.
- No filler. "I've successfully navigated" → delete; just report what you found.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, fundamental.
