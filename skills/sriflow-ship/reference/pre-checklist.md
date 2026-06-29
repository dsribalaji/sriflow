# Pre-Deploy Checklist

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
