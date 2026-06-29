# Merge Flow — Steps 2-3

## Step 2 — Flow Detection

Determine which deploy flow to use based on PR state.

```bash
_PR_STATE=$(gh pr view --json state -q .state 2>/dev/null || echo "none")
echo "PR_STATE: $_PR_STATE"
_PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "none")
echo "PR_NUMBER: $_PR_NUMBER"
_PR_BASE=$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null || echo "main")
echo "PR_BASE: $_PR_BASE"
```

**Decision tree:**

- `PR_STATE: OPEN` → **land-and-deploy flow** (Step 3)
- `PR_STATE: MERGED` → "PR already merged. Proceeding to direct deploy." → **direct deploy flow** (Step 4)
- `PR_STATE: CLOSED` → "PR was closed without merging. Proceeding to direct deploy from current branch." → **direct deploy flow** (Step 4)
- `PR_STATE: none` → "No PR found. Deploying current branch directly." → **direct deploy flow** (Step 4)

Tell the user which flow was selected and why before proceeding.

## Step 3 — Land-and-Deploy Flow (open PR exists)

This flow merges the PR, waits for CI to pass, then deploys.

### 3a — Show what will be merged

```bash
git log <PR_BASE>..HEAD --oneline
```

Print every commit that will merge. Format:
```
Merging N commit(s) from <_BRANCH> into <PR_BASE>:
  <sha> <message>
  <sha> <message>
```

If there are 0 commits ahead: "Branch is up to date with <PR_BASE>. Nothing to merge." STOP.

### 3b — Check for merge conflicts

```bash
git fetch origin <PR_BASE> 2>/dev/null
git merge-tree $(git merge-base HEAD origin/<PR_BASE>) HEAD origin/<PR_BASE> 2>/dev/null | grep "^<<<<<<" | wc -l
```

Or check via GitHub:
```bash
gh pr view --json mergeable -q .mergeable
```

If `CONFLICTING`: BLOCKED.

```
BLOCKED — Merge conflicts detected.

This PR cannot be merged cleanly. Resolve the conflicts on the feature branch, push the fix,
then re-run /sriflow-ship.

Conflicting: check `git status` after `git merge origin/<PR_BASE>` to see the conflicting files.
```

### 3c — Choose merge strategy

AskUserQuestion D3.

```
D3 — Merge strategy?
Branch: <_BRANCH> → <PR_BASE>
ELI10: Three ways to merge a PR into main: squash (all commits become one), merge commit (branch history
preserved with a merge commit), rebase (commits replayed linearly, no merge commit). The choice
affects how `git log`, `git bisect`, and rollback work on main going forward.
Stakes if wrong: Wrong history shape makes bisect harder and rollbacks more complicated. Squash
is safe to default; rebase or merge commit should match team convention.
Recommendation: A) Squash because it produces the cleanest main history and one meaningful commit
per PR; ideal for most projects without a strict linear-history requirement.
Note: options differ in kind, not coverage — no completeness score.
A) Squash merge (recommended)
  ✅ Clean main history: one commit per PR with the PR title as the message
  ❌ Individual commit granularity from the branch is lost after merge
B) Merge commit
  ✅ Full branch history preserved; every commit visible on main for blame and bisect
  ❌ Merge commits clutter `git log --oneline`; harder to read history at a glance
C) Rebase
  ✅ Linear history without a merge commit; every branch commit becomes a main commit
  ❌ Rewrites commit SHAs; do not use if the branch has been shared with others
Net: Squash is the safe default. Use merge commit when the team wants branch history visible.
Use rebase only if the project enforces linear history and the branch is not shared.
```

### 3d — Merge the PR

Execute the merge using the chosen strategy:

- **Squash**: `gh pr merge --squash --delete-branch --auto`
- **Merge commit**: `gh pr merge --merge --delete-branch --auto`
- **Rebase**: `gh pr merge --rebase --delete-branch --auto`

If the merge command fails:

```bash
gh pr view --json mergeStateStatus -q .mergeStateStatus
```

Report the exact error and mergeStateStatus. Common blockers:
- `BLOCKED` (required status checks failing): point to `gh pr checks`
- `BEHIND` (PR not up to date): suggest `gh pr merge --update-branch` then retry
- Permission denied: report "You do not have merge permissions on this repo."

On merge failure: BLOCKED. State exactly what failed and what to try.

### 3e — Wait for CI

After merge, poll CI every 30 seconds for a maximum of 10 minutes.

Poll command:
```bash
gh run list --limit 3 --json name,status,conclusion,createdAt,url \
  -q '.[] | "[\(.createdAt | split("T")[1] | split("Z")[0])] \(.name): \(.status) \(.conclusion // "—") \(.url)"'
```

At each poll, print one line per run in this format:
```
[HH:MM:SS] <workflow name>: <pending|in_progress|completed> <success|failure|cancelled|—> <url>
```

Continue polling until:
- **All runs show `completed success`**: "CI passed. Proceeding to deploy." → Continue to Step 5.
- **Any run shows `completed failure`**: BLOCKED.

```
BLOCKED — CI failed.

Failing run: <workflow name>
URL: <url>

Check the failing job for details: gh run view <run-id> --log-failed

Fix the failure and re-run /sriflow-ship, or if this is a known-flaky test, re-run the
CI job manually and wait for it to pass before deploying.
```

- **Any run shows `completed cancelled`**: BLOCKED. "CI was cancelled. Re-trigger and wait."
- **10 minutes elapsed with no completion**: BLOCKED.

```
BLOCKED — CI timeout after 10 minutes.

Last known status: <last poll output>

CI is still running. Check the GitHub Actions tab for status. When CI completes,
re-run /sriflow-ship to continue from the deploy step.
```

Do not guess. Do not skip CI. Every poll prints a status line so the user can see progress.
