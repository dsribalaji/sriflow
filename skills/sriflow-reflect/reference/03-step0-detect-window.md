# Step 0: Detect time window + stale base guard

Resolve `_RETRO_SINCE` from the argument. For `cycle`, read the start date from SRIFLOW_MEMORY.md. Then run the pre-flight guard:

```bash
# Set _RETRO_SINCE to the midnight-aligned date string, e.g. "2026-06-21T00:00:00"
# For 7d default (today 2026-06-28): _RETRO_SINCE="2026-06-21T00:00:00"
# For cycle: _RETRO_SINCE="<start-date-from-memory>T00:00:00"

# Pre-check A: no remote configured?
_RETRO_HAS_REMOTE=$(git remote 2>/dev/null | grep -c '^origin$' || echo 0)
if [ "$_RETRO_HAS_REMOTE" = "0" ]; then
  echo "RETRO_GUARD: no 'origin' remote — proceeding (local-only repo)"
  _RETRO_GUARD_VERDICT="skip-no-remote"
fi

# Pre-check B: detached HEAD?
if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _RETRO_HEAD_REF=$(git symbolic-ref --quiet HEAD 2>/dev/null || echo "")
  if [ -z "$_RETRO_HEAD_REF" ]; then
    echo "RETRO_GUARD: detached HEAD — proceeding"
    _RETRO_GUARD_VERDICT="skip-detached"
  fi
fi

# Pre-check C: fetch origin; warn and proceed if offline
if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo "main")
  if ! git fetch origin "$_DEFAULT_BRANCH" --quiet 2>/dev/null; then
    echo "RETRO_GUARD: fetch failed (offline?) — proceeding against last-known origin"
    _RETRO_GUARD_VERDICT="warn-fetch-failed"
  fi
fi

# Pre-check D: check whether latest commit is within the window
if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _RETRO_LATEST_ISO=$(git log -1 --format=%ci "origin/$_DEFAULT_BRANCH" 2>/dev/null | awk '{print $1}')
  if [ -n "$_RETRO_LATEST_ISO" ]; then
    echo "RETRO_GUARD: latest origin/$_DEFAULT_BRANCH commit on $_RETRO_LATEST_ISO"
    _RETRO_GUARD_VERDICT="check-gap"
  fi
fi
```

After running: evaluate `RETRO_GUARD: latest ... commit on <DATE>` against today and the window. If the latest-commit date is older than `(today - window-days)`, and the window is not `cycle`:

BLOCK with: "Retro window is stale. Latest commit on `origin/<branch>` was `<DATE>`, but the window covers `<since>` to `<today>`. This usually means the branch is stale or `origin/<branch>` hasn't been fetched. Run `git fetch origin` and re-run /sriflow-reflect." Stop until resolved.

Also: if the last commit is more than 30 days ago regardless of window, warn at the top of RETRO.md: "Reviewing a stale branch. Last commit was `<DATE>`. Findings may not reflect current state."

Skip paths (`skip-no-remote`, `skip-detached`, `warn-fetch-failed`) proceed to Step 1 with the cited reason noted in the retro narrative.
