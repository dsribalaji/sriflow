# Operational Notes

**Never force push.** If a push is rejected, investigate the divergence and rebase or merge.
Forcing a push in a deploy flow can overwrite other people's work.

**Never skip CI.** If CI is pending after merge, wait for it. A "quick" skip that ships a
red build wastes more time than the poll.

**Never assume deploy URL from prior runs.** Extract it fresh from each deploy command's output.
URLs change on preview deploys, Fly regions, and Railway service restarts.

**Platform CLI not installed?** Report it specifically: "flyctl not found. Install with
`brew install flyctl` or `curl -L https://fly.io/install.sh | sh`." Do not try to run a
deploy without the CLI.

**Deploy command exits non-zero?** Show the last 30 lines of output verbatim. Do not
summarize or paraphrase error messages — the exact text matters for debugging.

**GitHub Actions deploy triggered by push but no run appears after 30s?** The workflow may
not be configured to trigger on push to this branch. Check:
```bash
gh workflow list
cat .github/workflows/<deploy-workflow>.yml | grep -A5 "on:"
```
Report what trigger events the workflow is configured for.

# Edge Cases and Known Failure Modes

### Vercel deploy returns a preview URL instead of production URL

Symptom: `vercel --prod` output shows a non-production URL.
Cause: Project is not linked, or `--prod` flag was ignored.
Fix: Run `vercel link` to link the project, then re-run `vercel --prod`.

### Fly deploy hangs at "Waiting for machines to be destroyed"

Symptom: `fly deploy` hangs for >5 minutes.
Cause: Unhealthy machines from a prior deploy not releasing.
Fix: Run `fly machines list` to see stuck machines, then `fly machines destroy <id>`.

### Railway deploy completes but returns the wrong service

Symptom: Deploy completes but the URL points to a different service than expected.
Cause: Multiple Railway services in the project; `railway up` deployed to the wrong one.
Fix: Check `railway status` to see which service was targeted. Use `railway link` to relink.

### GitHub Actions workflow not triggered after push

Symptom: `gh run list` shows no new runs after push.
Cause: Workflow is not triggered by `push` to this branch, or branch is excluded.
Fix: Read the workflow's `on:` block. If the branch is not listed, add it or use workflow_dispatch.

### CI passes but production smoke test shows 5xx

Symptom: CI green, but `GET <URL>` returns 500.
Cause: Runtime error not caught by tests (missing env var, DB migration failure, boot error).
Fix: Check application logs immediately:
- Vercel: `vercel logs`
- Fly: `fly logs`
- Railway: `railway logs`
- Docker: `docker logs <container>`

### Smoke test returns 200 but body contains error overlay

Symptom: HTTP 200, but the page body contains a Next.js / React error boundary or Rails exception.
Cause: The app boots and the server handles the request, but rendering fails with an uncaught exception.
Fix: Check browser console errors and server logs. This is a runtime error in the render path.

# Context Recovery

At session start or after context compaction, recover project context from SRIFLOW_MEMORY.md.

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "=== SRIFLOW CONTEXT ==="
  # Show last 5 deploy records
  grep -A10 "^### DEPLOY" SRIFLOW_MEMORY.md | tail -60
  echo "=== END CONTEXT ==="
fi
```

If a deploy record exists: give a 2-sentence summary of the last deploy (URL, SHA, outcome,
how long ago). If the last deploy was `DONE_WITH_CONCERNS`, surface the concerns again so
they are not forgotten.

If the last entry is `BLOCKED`: tell the user "Last run was blocked — <reason from record>.
Re-run /sriflow-ship to retry from the blocked step."

# AskUserQuestion Self-Check

Before calling AskUserQuestion on any question in this skill, verify:
- [ ] D<N> header present and numbered correctly (D1, D2, D3... incrementing)
- [ ] `Branch:` line present with `_BRANCH` value
- [ ] ELI10 paragraph present: plain English, 2-4 sentences, stakes named
- [ ] `Stakes if wrong:` line present (one sentence on what breaks)
- [ ] `Recommendation:` line present with concrete one-line reason
- [ ] `Completeness: A=X/10, B=Y/10` or kind-note present
- [ ] Every option has ≥2 ✅ and ≥1 ❌, each ≥40 characters
- [ ] Exactly one `(recommended)` label
- [ ] `Net:` line closes the decision
- [ ] You are calling the tool, not writing prose (unless fallback applies)
- [ ] One-way/destructive gates require explicit typed confirmation

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

**Poll behavior rules:**

1. Print a status line at every poll interval regardless of whether status changed.
2. If all runs are `completed success`: declare CI passed and proceed immediately.
3. If any run is `completed failure` or `completed cancelled`: declare blocked immediately.
4. If any run is `completed timed_out`: declare blocked — "CI run timed out in GitHub Actions."
5. Never wait for runs that were created before the merge/push event. Filter by
   `createdAt` to find runs triggered by this deploy.
6. If `gh run list` returns no runs after 60 seconds: check that the workflow trigger
   matches the branch and event type.

**Filtering to the right run:**

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

# Deploy Log Commands Reference

When a smoke test fails or the user asks to investigate a failed deploy, use these
platform-specific commands to pull live logs:

**Vercel:**
```bash
vercel logs <deployment-url> --follow
```
Or via CLI after deploy:
```bash
vercel logs --app <project-name> -n 100
```

**Fly.io:**
```bash
fly logs --app <app-name>
fly logs --app <app-name> --region <region>
```
For more detail on a specific machine:
```bash
fly machines list --app <app-name>
fly logs --machine <machine-id>
```

**Railway:**
```bash
railway logs
railway logs --service <service-name>
```

**Docker (standalone):**
```bash
docker logs <container-name> --tail 100 --follow
docker ps -a  # find container name if unknown
```

**GitHub Actions:**
```bash
gh run view <run-id> --log
gh run view <run-id> --log-failed  # only failing steps
```
Find the run ID from the poll output URL (last path segment).

**General log strategy when something goes wrong:**

1. Check deploy command output first (already shown in step output).
2. Pull platform logs for the last 10 minutes.
3. Look for: startup errors, missing env vars, crashed processes, OOM kills.
4. If the app starts but requests fail: check request logs, not just startup logs.
5. If the deploy appears to succeed but the smoke test fails: the app is up but
   something in the request path is broken — look at request-level logs.

# Pre-Deploy Checklist (internal, runs silently before Step 1)

Before executing any deploy command, verify these automatically (no AskUserQuestion needed,
just block if violated):

1. **Not on a protected branch deploying to wrong env**: if `_BRANCH` is `main` or `master`
   and the detected target is a staging-only config, warn and ask which environment to deploy.

2. **Clean working directory**: If `_DIRTY` > 0 in the direct deploy flow, auto-commit
   (Step 4a). In the land-and-deploy flow, dirty files on the feature branch are included
   in the PR; do not auto-commit them after the PR exists — they should have been committed
   to the branch already.

3. **SHA is deterministic**: Record `_SHA` before deploy. After deploy, verify the running
   version matches by checking the deploy output for a SHA or version reference. If the
   platform shows a different SHA in the deploy output, note it in the deploy record.

4. **Deploy target CLI is installed**: Before running any platform command, check the CLI
   exists:
   - Vercel: `command -v vercel` or use `npx vercel` (npx works without global install)
   - Fly: `command -v fly` or `command -v flyctl`
   - Railway: `command -v railway`
   - Docker: `command -v docker`

   If the CLI is not installed, output the install command and BLOCK:
   ```
   BLOCKED — <cli> not installed.
   Install: <install command>
   Then re-run /sriflow-ship.
   ```

5. **GitHub CLI authenticated** (for land-and-deploy flow): `gh auth status`. If not
   authenticated: BLOCK with "Run `gh auth login` then re-run /sriflow-ship."

# Rollback Guidance

When the smoke test fails or a post-deploy issue is discovered, the user may need to roll back.
This skill does not execute rollbacks automatically, but it provides the correct commands.

Tell the user: "Smoke test failed. If you need to roll back, use:"

**Vercel:**
```bash
vercel rollback <previous-deployment-url>
```
Or via the Vercel dashboard: Deployments → previous deployment → Promote to Production.

**Fly.io:**
```bash
fly releases list --app <app-name>
fly deploy --image <previous-image-sha>
```
Or:
```bash
fly releases rollback <version-number>
```

**Railway:**
Railway does not have a CLI rollback command. Use the Railway dashboard:
Dashboard → Deployments → click a previous deployment → Redeploy.

**Docker:**
```bash
docker service update --image <registry>/<project>:<previous-sha> <service-name>
```
Or for Kubernetes:
```bash
kubectl rollout undo deployment/<deployment-name>
```

**GitHub Actions (revert and re-deploy):**
```bash
git revert HEAD --no-edit
git push origin <branch>
```
Then wait for CI and the deploy workflow to run again.

Record the rollback decision in SRIFLOW_MEMORY.md:
```
### ROLLBACK | <timestamp> | from <sha> | target <target>
Reason: <why rollback was needed>
Rolled back to: <previous SHA or version>
```

# Multi-Target Projects

Some projects deploy to multiple environments in sequence (staging → production). This skill
handles the production deploy. For staging deploys before production:

If a staging environment is detected (staging workflow file, `STAGING_URL` in SRIFLOW_MEMORY.md,
or a `staging` branch convention): after Step 4 deploy succeeds, AskUserQuestion D_staging.

```
D_staging — Staging deploy available. Deploy to staging first?
Branch: <_BRANCH>
ELI10: A staging environment was detected for this project. Deploying to staging first
lets you verify the deploy works in a production-like environment before it reaches
real users. One extra minute of staging verification can prevent a bad production deploy.
Stakes if wrong: Deploying directly to production without staging means users are the
first to find any environment-specific issue.
Recommendation: A) Deploy to staging first because environment-specific issues (missing
env vars, DB connectivity, CDN config) are common and cheap to find in staging.
Completeness: A=10/10, B=7/10
A) Deploy to staging first, then production (recommended)
  ✅ Catches environment-specific issues before users see them
  ❌ Adds 2-5 minutes to the total deploy time
B) Deploy directly to production
  ✅ Fastest path to production; skips staging overhead
  ❌ Users are the first to find any staging-only configuration issue
Net: The extra time is almost always worth it. Skip staging only for trivial non-functional
changes (copy updates, config tweaks with no logic changes).
```

If user picks A: deploy to staging first using the staging-specific command, run the smoke
test against the staging URL, then proceed to production deploy. Record both in the deploy record.

# Telemetry (run last)

After workflow completion, append to SRIFLOW_MEMORY.md and log the completion event.

Replace `OUTCOME` with the actual outcome (done/done-with-concerns/blocked).

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "" >> SRIFLOW_MEMORY.md
echo "### LOG | $_TIMESTAMP | sriflow-ship | OUTCOME | ${_TEL_DUR}s" >> SRIFLOW_MEMORY.md
echo "Branch: $_BRANCH | Session: $_SESSION_ID" >> SRIFLOW_MEMORY.md
```

Log the timeline event:
```bash
_FINAL_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
cat >> SRIFLOW_MEMORY.md << EOF

<!-- sriflow-ship session end: $_SESSION_ID | SHA: $_FINAL_SHA | duration: ${_TEL_DUR}s | outcome: OUTCOME -->
EOF
```
