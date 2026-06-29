# Stale Base Guard

Pre-flight checks for `/sriflow-reflect` Step 0. Resolve `_RETRO_SINCE` from argument, then run:

```bash
_RETRO_HAS_REMOTE=$(git remote 2>/dev/null | grep -c '^origin$' || echo 0)
if [ "$_RETRO_HAS_REMOTE" = "0" ]; then
  echo "RETRO_GUARD: no 'origin' remote — proceeding (local-only repo)"
  _RETRO_GUARD_VERDICT="skip-no-remote"
fi

if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _RETRO_HEAD_REF=$(git symbolic-ref --quiet HEAD 2>/dev/null || echo "")
  if [ -z "$_RETRO_HEAD_REF" ]; then
    echo "RETRO_GUARD: detached HEAD — proceeding"
    _RETRO_GUARD_VERDICT="skip-detached"
  fi
fi

if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo "main")
  if ! git fetch origin "$_DEFAULT_BRANCH" --quiet 2>/dev/null; then
    echo "RETRO_GUARD: fetch failed (offline?) — proceeding against last-known origin"
    _RETRO_GUARD_VERDICT="warn-fetch-failed"
  fi
fi

if [ -z "${_RETRO_GUARD_VERDICT:-}" ]; then
  _RETRO_LATEST_ISO=$(git log -1 --format=%ci "origin/$_DEFAULT_BRANCH" 2>/dev/null | awk '{print $1}')
  if [ -n "$_RETRO_LATEST_ISO" ]; then
    echo "RETRO_GUARD: latest origin/$_DEFAULT_BRANCH commit on $_RETRO_LATEST_ISO"
    _RETRO_GUARD_VERDICT="check-gap"
  fi
fi
```

## Verdicts

- **check-gap:** If latest-commit older than `(today - window-days)` and window ≠ `cycle`: BLOCK. "Retro window is stale. Latest commit on `origin/<branch>` was `<DATE>`, but window covers `<since>` to `<today>`. Run `git fetch origin` and re-run."
- **Stale >30 days:** Regardless of window, warn at top of RETRO.md: "Last commit was <date>, more than 30 days ago."
- **skip-no-remote, skip-detached, warn-fetch-failed:** Proceed to Step 1 with reason noted in retro narrative.
