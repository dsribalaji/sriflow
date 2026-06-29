# CI Polling Reference

The CI poll format used in Step 3e and Step 4c (GitHub Actions flow):

```
[HH:MM:SS] <workflow name>: <status> <conclusion> <url>
```

Where:
- `HH:MM:SS`: current time when poll ran
- `status`: `queued`, `in_progress`, `completed`
- `conclusion`: `success`, `failure`, `cancelled`, `timed_out`, `skipped`, or `—` (still running)
- `url`: GitHub URL for the specific run

Example output sequence during a poll:
```
[14:23:01] CI / test (push): in_progress — https://github.com/org/repo/actions/runs/123
[14:23:31] CI / test (push): in_progress — https://github.com/org/repo/actions/runs/123
[14:24:01] CI / test (push): completed success https://github.com/org/repo/actions/runs/123
```

Poll command (run every 30s):
```bash
_POLL_TIME=$(date +%H:%M:%S)
gh run list --limit 5 --json name,status,conclusion,url,createdAt \
  --jq '.[] | "[\(now | strftime("%H:%M:%S"))] \(.name): \(.status) \(.conclusion // "—") \(.url)"' \
  2>/dev/null || \
gh run list --limit 5 --json name,status,conclusion,url \
  -q '.[] | "[\(.name)]: \(.status) \(.conclusion // "—") \(.url)"'
```

## Poll behavior rules

1. Print a status line at every poll interval regardless of whether status changed.
2. If all runs are `completed success`: declare CI passed and proceed immediately.
3. If any run is `completed failure` or `completed cancelled`: declare blocked immediately.
4. If any run is `completed timed_out`: declare blocked — "CI run timed out in GitHub Actions."
5. Never wait for runs that were created before the merge/push event. Filter by
   `createdAt` to find runs triggered by this deploy.
6. If `gh run list` returns no runs after 60 seconds: check that the workflow trigger
   matches the branch and event type.

## Filtering to the right run

After merge, the triggered run may take 10-30 seconds to appear. Wait up to 60s for a run
to appear before flagging "no CI triggered":

```bash
_MERGE_TIME=$(date +%s)
# Wait for a run created after the merge
for i in $(seq 1 6); do
  _RUN=$(gh run list --limit 10 --json name,status,conclusion,url,createdAt \
    -q '.[] | select(.createdAt > "'$(date -u -d @$_MERGE_TIME +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -r $_MERGE_TIME +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "0")'" ) | "\(.name): \(.status)"' \
    2>/dev/null || echo "")
  [ -n "$_RUN" ] && echo "CI triggered: $_RUN" && break
  echo "Waiting for CI to appear... (${i}0s)"
  sleep 10
done
```
