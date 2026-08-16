# Pattern — CI Polling

The discipline and format for waiting on CI after a merge or push. CI is sacred in this pipeline — a deploy without green CI is the one hard rule that never bends. This pattern defines the polling loop, the status format, and the filtering that makes polling correct.

## The polling loop

After merge/push, poll GitHub Actions (or the platform's CI) until the run that this deploy triggered reaches a terminal state.

**Cadence:** every 30 seconds. Print a status line every poll regardless of change — silence reads as a hang.

```
[14:23:01] CI / test (push): in_progress — https://github.com/org/repo/actions/runs/123
[14:23:31] CI / test (push): completed success — https://github.com/org/repo/actions/runs/123
```

**Terminal decision:**
- All runs for this event → `completed success`: CI passed, proceed.
- Any run → `completed failure` / `cancelled`: BLOCKED immediately.
- Any run → `completed timed_out`: BLOCKED — "CI run timed out".
- Still running past a reasonable bound (10+ min for a normal suite): report the duration, continue polling, don't guess.

## The critical filter

**Never watch old runs.** CI history is full of runs from previous pushes; the only runs that matter are created after this deploy's merge/push event. Filter by creation time:

```bash
_MERGE_TIME=$(date +%s)
gh run list --limit 10 --json name,status,conclusion,url,createdAt \
  -q '.[] | select(.createdAt > "<iso merge time>") | "\(.name): \(.status)"'
```

Waiting on a stale run (which always ends green) while the real run fails is the classic false-pass. Filter first, then poll.

## Run appearance delay

A run can take 10-30s to appear after the push event. Wait up to 60s for a run to appear before declaring "no CI triggered". If after 60s nothing appears:

- Check the workflow's `on:` triggers match the branch and event (`cat .github/workflows/*.yml | grep -A5 "on:"`).
- Report what triggers the workflow is configured for — a workflow that only fires on `pull_request` will never run on a push to a feature branch.

## Rules

1. CI is sacred — never deploy on red, never skip the poll because the change is "small".
2. Filter by event time; never watch pre-deploy runs.
3. Print a line every poll; never leave the user guessing.
4. Terminal status decides immediately: all-green proceeds, any-red blocks.
5. A workflow that never fires is a configuration bug — report the trigger config, do not hand-wave past it.
6. Record the CI outcome (passed, duration, run url) in the deploy record — the canary window and the retro skill both read it.

## Platform variations

- **GitHub Actions:** `gh run list` / `gh run watch <id>` (interactive follow).
- **GitLab:** `glab ci status`.
- **Local/self-hosted:** the CI runner's webhook output or its status endpoint — same cadence and filter logic.
- **No CI configured:** a CONCERN in the deploy record — this deploy shipped without a gate.

## Integration

Used by `/sriflow-ship` Steps 3e (land-and-deploy) and 4c (direct deploy). The format is shared with the operational reference (`reference/09-references.md`); this file is the pattern — the why and the rules — while that file carries the exact commands.