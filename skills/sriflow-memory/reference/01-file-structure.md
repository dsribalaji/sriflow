# 01 — Full ~/.sriflow/ Directory Layout

All per-project state is isolated by project slug. The slug is the
kebab-case project name (matching the sriflow-init `SRIFLOW_PROJECT_NAME`),
or a slugified repo name when running outside an initialized project.

## Global

```
~/.sriflow/
├── config.yaml                # global config (proactive, telemetry, etc.)
├── bin/                       # sriflow helper CLIs (on PATH)
└── projects/
    ├── <slug>/                # one dir per project
    │   ├── context.json       # current branch, session, saved context
    │   ├── learnings.jsonl    # append-only learning entries
    │   ├── decisions.jsonl    # D-numbered decisions with rationale
    │   ├── timeline.jsonl     # event timeline (skill start/complete)
    │   ├── questions.jsonl    # D-numbered questions and answers
    │   ├── preferences.jsonl  # user preferences per project
    │   ├── analytics.jsonl    # skill usage analytics (opt-in)
    │   ├── eureka.jsonl       # breakthrough insights
    │   ├── reviews.jsonl      # code review records
    │   ├── instincts.jsonl    # observations w/ confidence
    │   ├── context-logs/      # (future) per-session context snapshots
    │   └── .compressed/       # (future) compression archives
    └── <other-slug>/          # isolated per project
```

## Per-file format summary

| File | Format | Written by |
|------|--------|-----------|
| `context.json` | JSON (single object, overwritten) | sriflow-context save/show |
| `learnings.jsonl` | JSONL, append | sriflow-learnings |
| `decisions.jsonl` | JSONL, append | sriflow-decisions |
| `timeline.jsonl` | JSONL, append | sriflow-timeline |
| `questions.jsonl` | JSONL, append | sriflow-think |
| `preferences.jsonl` | JSONL, append | sriflow-config per project |
| `analytics.jsonl` | JSONL, append | sriflow skills (opt-in) |
| `eureka.jsonl` | JSONL, append | sriflow-reflect / eureka moments |
| `reviews.jsonl` | JSONL, append | sriflow-code-review |
| `instincts.jsonl` | JSONL, append | sriflow-memory (instinct backend) |

## Conventions

1. **One line = one JSON object**, valid JSONL. No pretty-printed multi-line
   records in the append-only files.
2. **UTF-8 only.** Non-UTF-8 bytes are rejected on read.
3. Every record carries a `ts` (ISO-8601 UTC) timestamp. Files that need
   ordering beyond time use a `seq` integer.
4. The directory is created lazily on first write — never scaffolded into
   the repo. It lives outside the project; git never sees it.
5. Project files inside the repo (`SRIFLOW_MEMORY.md`, `THINK_OUTPUT.md`,
   `PLAN.md`) are the **projections**; the `~/.sriflow/` files are the
   **source of truth** for machine-readable state.

## Path resolution

```
PROJECT_SLUG=<kebab-case name>
STATE_DIR="$HOME/.sriflow/projects/$PROJECT_SLUG"
mkdir -p "$STATE_DIR"
```

If `SRIFLOW_PROJECT_NAME` is unset, derive the slug from the git remote or
the working directory basename, and warn when it's ambiguous.