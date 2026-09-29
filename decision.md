# decision.md — SriFlow

Decisions taken in this project, newest first. Each entry: date, decider,
the decision, the rationale, and status (active/superseded). The git history
remains the commit log; this file records *why*.

## 2026-09-29 — install.sh: Copilot destination made explicit (Ruby, active)

- **Decision:** changed the Copilot `DEST` in `install.sh` from the bare
  relative path `.github/copilot-skills` to `$PWD/.github/copilot-skills`
  with a comment.
- **Rationale:** the bare relative path silently installed into whatever
  directory the installer happened to run from. The new form behaves
  identically but makes the project-local intent explicit, so the next
  reader doesn't "fix" it into `$HOME` by mistake.
- **Status:** active.

## 2026-09-29 — Adopt per-repo decision log (SB, active)

- **Decision:** every repository gets a `decision.md` file logging each
  commit's rationale and every critical/project decision, maintained
  going forward.
- **Rationale:** SB wants the reasoning behind changes to live next to the
  code, per repository, instead of only in chat history.
- **Status:** active. This file is its first instance.
