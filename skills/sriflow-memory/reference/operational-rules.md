# Operational Rules

## Constraints

- **Never modify code.** This skill only reads and writes `SRIFLOW_MEMORY.md`.
- **Log is append-only under normal operation.** Only COMPRESS mode removes entries. COMPRESS always preserves the newest 10.
- **Threshold is 50 log entries.** Count `### ` lines in the Log section only — not in Compressed History prose. The `### ` in a prose paragraph does not count.
- **Auto-compress never prompts.** When triggered from Step 2e (log count exceeded 50 after a write), skip D1 and proceed directly to Step 3b.
- **Manual compress asks D1 when log is between 11 and 50 entries.** Skip D1 only when the preamble already showed `AUTO-COMPRESS TRIGGERED`.

## Data integrity

- **Always update `**Last Updated:**` in Summary** after any write to the Log section.
- **Outcome vocabulary is fixed.** Only four valid values: `done`, `done-with-concerns`, `blocked`, `needs-context`. Any other status from a calling skill must be mapped to one of these four before writing.
- **Duration is always in seconds and always present.** If unknown, write `0`. Never omit the duration field or write `Ns` with non-numeric N.
- **Branch and Session are required in every log entry.** Even if running in a non-git directory, write `Branch: unknown` and the `_SESSION_ID` from the preamble.
- **Note line is optional but when present must be exactly one line.** Multi-line notes must be collapsed to one line before writing. Never write a blank note line.

## Inference rules

- **Infer, don't interrogate.** Use preamble output and conversation context to fill entry fields. Only use AskUserQuestion when D1 is explicitly required (manual compress, entry count 11-50) or when mode genuinely cannot be determined from any available signal.
- **In spawned sessions:** skip all AskUserQuestion prompts. Auto-choose the recommended option and log the auto-decision as a one-line note.

## Token management

- **Word count warning at 10,000 words.** `MEMORY_WORDS` is computed in the preamble. Surface the warning after any operation if it appeared.
- **First priority after a READ that shows MEMORY_WARNING:** suggest compress before suggesting the next pipeline skill.

## Plan Mode Safe Operations

In plan mode: `Bash` (read-only commands), `Read`, `Grep`, and writes to `SRIFLOW_MEMORY.md` are allowed. No git mutations, no code changes, no file deletions.

If `SRIFLOW_PLAN_MODE` is `"active"`: run READ mode only. Do not append log entries or compress in plan mode unless the user explicitly requests it and confirms via AskUserQuestion.

## Skill Invocation During Plan Mode

If invoked in plan mode, this skill takes precedence over generic plan mode behavior. Follow steps sequentially starting from Step 0. AskUserQuestion satisfies plan mode's end-of-turn requirement. At a STOP point, stop immediately. Call ExitPlanMode only after the skill workflow completes, or if the user cancels.

## Completeness Principle

Do the complete thing. The only out-of-scope is genuinely unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence (file written, entry count, stage).
- **DONE_WITH_CONCERNS** — completed, concerns listed.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

## Confusion Protocol

For high-stakes ambiguity (would overwrite existing memory, unknown project name, destructive scope): STOP. Name the ambiguity in one sentence. Present 2-3 options with tradeoffs. Ask. Do not use for routine reads or routine log appends — those are never ambiguous.
