# Backend: gbrain Sync

Concept doc for cross-machine session sync. The gbrain pattern keeps project
memory synchronized across machines and agents via a shared brain (local
PGLite or Supabase). sriflow-memory's state dir is local-only today;
gbrain-sync is the documented upgrade path for multi-machine work.

## Current state: local-only

`~/.sriflow/projects/<slug>/` lives on one machine. That is correct for a
single-machine workflow — no network, no sync conflicts, no auth. Nothing in
sriflow-memory assumes a remote.

## Target state: optional sync

When the user works from multiple machines, the state dir needs a sync
strategy. Two patterns, adopted conservatively:

### 1. File-based sync (git or sync tool)

- The state dir (or a subset: `learnings`, `decisions`, `timeline`) is
  pushed to a private remote and pulled on other machines.
- **Conflict rule:** JSONL append-only makes conflicts rare — most writes
  are pure appends to different lines. A conflict happens only when two
  machines compressed the same file. Resolution: keep both compression
  summaries (one per machine prefix), never merge mid-file.
- `context.json` is the conflict hotspot (single overwrite object).
  Resolution: last-write-wins by `saved_at`; older machine's context is
  superseded, not merged.

### 2. gbrain-style backend (future)

- Registered brain per remote; records carry a `machine` and `origin`
  field for provenance.
- Sync is explicit (`sriflow-memory sync`), never implicit background push.

## Provenance fields (added when sync is on)

Every record gains:

```json
{"machine":"desktop-01","origin":"local"}
```

Writes from a synced copy carry `"origin":"remote"`. This keeps the
"attributed evidence" rule from `03-operational-rules.md` intact across
machines.

## What never syncs

- `context.json` merges never — only replace (see above).
- `instincts.jsonl` project records sync, but **global** instincts
  (`~/.sriflow/instincts/global.jsonl`) are per-machine by default —
  promotion requires a conscious `sriflow-memory sync --global`.
- `analytics.jsonl` is local-only unless telemetry is explicitly on.

## Enabling

- Opt-in per project: `preferences.jsonl` →
  `{"key":"sync","value":"on","mode":"git"}` or `"mode":"gbrain"`.
- Requires a private remote. sriflow never syncs to a public destination —
  memory may contain project-internal decisions.

## Rules

1. Sync is opt-in and explicit. No background daemon.
2. Append-only wins: never rewrite a remote file's lines to "fix" a merge.
3. Provenance fields are mandatory once sync is on — unattributed remote
   records are treated as untrusted until confirmed.
4. If sync state is ambiguous (two summaries, unknown machine), the skill
   blocks and asks rather than guessing.