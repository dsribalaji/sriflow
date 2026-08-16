# 03 — Operational Rules

The hard rules that keep the memory system trustworthy. Violating these is a
worse failure than losing data — it makes the data unusable.

## 1. Append-only

- The JSONL files are append-only. The only rewrite allowed is the
  compression pass in `02-compression.md`.
- `context.json` is the single exception — it is an overwrite file by
  design (one object, current state).
- Never edit a historical record in place. Corrections are **new records**
  that supersede the old one (e.g., a decision record marked
  `"superseded_by":"D-014"`).
- No `sed -i`, no mid-file deletion, no reordering lines. If a file is
  corrupt, quarantine it to `<file>.corrupt-<date>` and start fresh — never
  hand-repair the tail.

## 2. No secrets, ever

- **Never write** API keys, tokens, passwords, private keys, connection
  strings, or personal data (SSN, real addresses, medical records) into any
  file under `~/.sriflow/`.
- This includes `context.json`, `eureka.jsonl`, `analytics.jsonl`, and
  compression summaries. Summaries can leak secrets through truncation —
  scrub before summarizing.
- **Do not write secret *names*** in a way that invites filling them later
  ("password is in .env" is fine; "password: hunter2" is not).
- If a record would embed a secret, write a placeholder reference
  (`"key":"env:API_KEY"`) instead and note where the real value lives.
- Secrets belong in the environment / secret manager. sriflow-memory is a
  state store, not a vault.

## 3. One record, one fact

- Each JSONL line must be self-contained: a reader that sees only that line
  can interpret it without the surrounding file.
- Every record carries `ts`, and — where it matters — `id`, `status`,
  `source` (who/what produced it). See `04-examples.md`.

## 4. Write-then-log

- After any memory write, append a log entry to `SRIFLOW_MEMORY.md` (the
  in-repo projection). The JSONL files are the machine state; the markdown
  log is the human-readable trail. Both must reflect the same event.

## 5. Fail loud

- If `~/.sriflow/` is unwritable or a file is corrupt, return **BLOCKED**.
  Do not silently proceed without memory.
- If a read finds a malformed JSONL line, report the line number and skip
  only that line; continue the read.

## 6. No cross-project bleed

- Never read or write another project's state dir. `analytics.jsonl` is the
  only file read across projects (aggregate counts only), and only when
  telemetry is on.
- Instincts are project-scoped by default (see backends/instinct-evolution.md).