# Direct Deploy Flow — Step 4

This flow deploys from the current branch state without merging a PR.

## 4a — Commit uncommitted changes (if any)

```bash
git status --porcelain
```

If there are staged or unstaged tracked files:

Auto-detect a conventional commit message from the diff:
```bash
git diff --cached --stat
git diff --stat
```

Generate a message in the format `<type>(<scope>): <summary>` where:
- type: `feat`, `fix`, `chore`, `refactor`, `docs`
- scope: the primary file or directory changed (optional)
- summary: one line, imperative, what changed

Show the message to the user before committing. Commit:
```bash
git add -p  # stage all tracked changes
git commit -m "<generated message>"
```

If there are untracked files: tell the user which untracked files exist and ask if any
should be included before committing.

## 4b — Push branch

```bash
git push origin <_BRANCH>
```

If push is rejected (non-fast-forward): BLOCKED. "Branch has diverged from remote. Resolve
with `git pull --rebase` then re-run /sriflow-ship."

## 4c — Run deploy command

Execute the deploy command for the detected target:

**Vercel:**
```bash
npx vercel --prod
```
Tail output. Extract the production URL from the output (look for `Production: https://...`).

**Fly.io:**
```bash
fly deploy
```
Tail output. Extract the app URL from `fly status` after deploy:
```bash
fly status --json | jq -r '.Hostname'
```

**Railway:**
```bash
railway up
```
Tail output. Extract the deploy URL from Railway output.

**GitHub Actions (push-triggered):**
Push was already done in 4b. Wait for the triggered run:
```bash
sleep 5
gh run list --limit 1 --json name,status,conclusion,url \
  -q '.[0] | "[\(.name)] \(.status) \(.conclusion // "—") \(.url)"'
```
Then poll every 30 seconds as in Step 3e until CI completes.

**Docker:**
```bash
docker build -t <project>:$_SHA .
docker push <registry>/<project>:$_SHA
```
After push: execute the deploy command (e.g., `kubectl set image`, `docker service update`,
or the platform-specific command). Ask the user for the registry and deploy target if not
in project config.

**Custom:**
Run the command the user provided in D1a. Tail output. Look for a URL in the output.

## 4d — Extract deploy URL

After the deploy command completes, extract the production URL from output. Look for:
- Lines containing `https://` followed by a hostname
- Platform-specific patterns: `Production:`, `Deployed to:`, `Your deployment is live at:`

Save as `_DEPLOY_URL`. If no URL found in output:
```bash
_DEPLOY_URL=$(cat .deploy-url 2>/dev/null || echo "unknown")
```

If still unknown: ask the user "What is the production URL for this deploy?"
