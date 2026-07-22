# Step 4 — Token budget warning (all modes)

After any operation completes, if the preamble echoed `MEMORY_WARNING`, surface it:

```
Memory growing large — run /sriflow-memory compress to reduce token overhead.
```

This fires after READ, WRITE, or COMPRESS. After a COMPRESS run that still leaves the file large (unusual — can happen with very long entry notes), also add: "Consider shortening future log entry notes to one line each."

---

# Step 5 — How other sriflow skills invoke WRITE mode

Every sriflow skill calls `/sriflow-memory` on its completion. The calling convention:

**Invocation pattern from another skill:**

The calling skill passes a single string argument to `/sriflow-memory write` with this format:

```
/sriflow-memory write "<skill-name> | <outcome> | <duration>s | <one-line note>"
```

Example from sriflow-build:

```
/sriflow-memory write "sriflow-build | done | 847s | JWT auth complete, refresh token rotation working, all 47 tests green"
```

Example from sriflow-plan when blocked:

```
/sriflow-memory write "sriflow-plan | blocked | 203s | Blocked on missing stakeholder requirements for payment module — awaiting input"
```

**What sriflow-memory does with this invocation:**

1. Parses the four pipe-separated fields: skill-name, outcome, duration, note.
2. Runs Step 2b using those values (skipping the duration bash computation — uses the passed duration directly).
3. Runs Steps 2c, 2d, 2e as normal.
4. Reports the MEMORY UPDATED confirmation block.

**Calling skill responsibility:**

The calling skill is responsible for:
- Computing its own duration (`_TEL_END - _TEL_START` in seconds).
- Mapping its completion status to one of the four outcome values.
- Writing a one-line note that captures what it actually did or why it was blocked.

The calling skill is NOT responsible for:
- Reading `SRIFLOW_MEMORY.md` before writing.
- Checking whether compress is needed (sriflow-memory handles this).
- Updating the Summary section (sriflow-memory handles this).

**Stage transition responsibility:**

Only sriflow-memory updates `**Current Stage:**` in the Summary. The calling skill never modifies that field directly. The stage table in Step 2d defines the transitions.

---

# Step 6 — Suggest next skill (all modes)

After READ or after any WRITE that did not trigger auto-compress: if the current stage implies a next skill, suggest it once in one line. Use the table from Step 1b.

After auto-compress: do not suggest a next skill. The compress confirmation block is the terminal output.

After manual compress confirmed and run: output the Step 3f confirmation, then suggest the next skill based on current stage.

---

# Important Rules

**Operational constraints:**
- **Never modify code.** This skill only reads and writes `SRIFLOW_MEMORY.md`.
- **Log is append-only under normal operation.** Only COMPRESS mode removes entries. COMPRESS always preserves the newest 10.
- **Threshold is 50 log entries.** Count `### ` lines in the Log section only — not in Compressed History prose. The `### ` in a prose paragraph does not count.
- **Auto-compress never prompts.** When triggered from Step 2e (log count exceeded 50 after a write), skip D1 and proceed directly to Step 3b.
- **Manual compress asks D1 when log is between 11 and 50 entries.** Skip D1 only when the preamble already showed `AUTO-COMPRESS TRIGGERED`.

**Data integrity:**
- **Always update `**Last Updated:**` in Summary** after any write to the Log section.
- **Outcome vocabulary is fixed.** Only four valid values: `done`, `done-with-concerns`, `blocked`, `needs-context`. Any other status from a calling skill must be mapped to one of these four before writing.
- **Duration is always in seconds and always present.** If unknown, write `0`. Never omit the duration field or write `Ns` with non-numeric N.
- **Branch and Session are required in every log entry.** Even if running in a non-git directory, write `Branch: unknown` and the `_SESSION_ID` from the preamble.
- **Note line is optional but when present must be exactly one line.** Multi-line notes must be collapsed to one line before writing. Never write a blank note line.

**Inference rules:**
- **Infer, don't interrogate.** Use preamble output and conversation context to fill entry fields. Only use AskUserQuestion when D1 is explicitly required (manual compress, entry count 11-50) or when mode genuinely cannot be determined from any available signal.
- **In spawned sessions:** skip all AskUserQuestion prompts. Auto-choose the recommended option and log the auto-decision as a one-line note.

**Token management:**
- **Word count warning at 10,000 words.** `MEMORY_WORDS` is computed in the preamble. Surface the warning after any operation if it appeared.
- **First priority after a READ that shows MEMORY_WARNING:** suggest compress before suggesting the next pipeline skill.
