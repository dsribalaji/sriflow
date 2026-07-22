# Step 2 — Flow Detection

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
