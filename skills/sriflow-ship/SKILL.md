---
name: sriflow-ship
preamble-tier: 2
version: 2.0.0
description: Deploy pipeline — gate check, auto-detect target, merge PR, wait for CI, smoke test. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - ship this
  - deploy
  - merge and deploy
  - push to production
  - release
  - /sriflow-ship
---

## When to invoke this skill

Use when asked to "ship this", "deploy", "merge and deploy", "push to production", "release",
or "/sriflow-ship". Covers both flows: merge an open PR then deploy, or deploy directly from
the current branch. Gates on CODE_REVIEW.md (CRITICAL blocks hard) and QA_REPORT.md (failures
require explicit risk acknowledgment). Auto-detects deploy target. Waits for CI. Smoke tests
production. Writes a deploy record to SRIFLOW_MEMORY.md.

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"
echo "SESSION_ID: $_SESSION_ID"

# Plan-mode detection
if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# Session kind
_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# Project memory
if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "MEMORY: found"
  head -60 SRIFLOW_MEMORY.md
else
  echo "MEMORY: missing — will create on first write"
fi

# Gate files
if [ -f "CODE_REVIEW.md" ]; then
  echo "CODE_REVIEW.md: found"
  _CRITICAL_COUNT=$(grep -c "🔴 CRITICAL" CODE_REVIEW.md 2>/dev/null || echo "0")
  echo "CRITICAL_FINDINGS: $_CRITICAL_COUNT"
  if [ "$_CRITICAL_COUNT" -gt 0 ]; then
    echo "--- CRITICAL FINDINGS ---"
    grep "🔴 CRITICAL" CODE_REVIEW.md
    echo "--- END CRITICAL FINDINGS ---"
  fi
else
  echo "CODE_REVIEW.md: not found"
  _CRITICAL_COUNT=0
fi

if [ -f "QA_REPORT.md" ]; then
  echo "QA_REPORT.md: found"
  grep "Verdict:" QA_REPORT.md 2>/dev/null || echo "Verdict: (not found)"
  _QA_FAILS=$(grep -c "FAIL\|❌" QA_REPORT.md 2>/dev/null || echo "0")
  echo "QA_FAILURES: $_QA_FAILS"
else
  echo "QA_REPORT.md: not found"
  _QA_FAILS=0
fi

# PR state
_PR=$(gh pr view --json number,state,baseRefName -q '"\(.number) [\(.state)] → \(.baseRefName)"' 2>/dev/null || echo "none")
echo "PR: $_PR"

# Deploy target detection
_DEPLOY_TARGET="unknown"
[ -f "vercel.json" ] && _DEPLOY_TARGET="vercel"
[ -f "fly.toml" ] && _DEPLOY_TARGET="fly"
[ -f "railway.json" ] && _DEPLOY_TARGET="railway"
[ -f "Dockerfile" ] && [ "$_DEPLOY_TARGET" = "unknown" ] && _DEPLOY_TARGET="docker"
_GHA_DEPLOY=$(ls .github/workflows/*.yml 2>/dev/null | xargs grep -l -i "deploy\|production\|release" 2>/dev/null | head -1 || echo "")
if [ -n "$_GHA_DEPLOY" ]; then
  if [ "$_DEPLOY_TARGET" = "unknown" ]; then
    _DEPLOY_TARGET="github-actions"
  else
    _DEPLOY_TARGET="${_DEPLOY_TARGET}+github-actions"
  fi
fi
echo "DEPLOY_TARGET: $_DEPLOY_TARGET"

# Git state
_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
_DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "SHA: $_SHA | DIRTY_FILES: $_DIRTY"
```

## Plan Mode Safe Operations

In plan mode, allowed: `Bash` (read-only inspection), `Read`, `Glob`, `Grep`, writes to
`SRIFLOW_MEMORY.md`, and writes to the plan file. No git mutations, no deploys, no merges
in plan mode.

## Skill Invocation During Plan Mode

If the user invokes this skill in plan mode, treat the skill file as executable instructions.
Follow it step by step starting from Step 0. AskUserQuestion satisfies plan mode's end-of-turn
requirement. If AskUserQuestion is unavailable, follow the prose fallback below and STOP. At any
STOP point, stop immediately — do not continue. Call ExitPlanMode only after the skill workflow
completes, or if the user cancels.

## AskUserQuestion Format

### Tool resolution

Prefer `mcp__*__AskUserQuestion` if it appears in your tool list. Use native AskUserQuestion
otherwise. If both are unavailable, or if a call fails, render the prose fallback (same triad
structure as the tool format), then STOP and wait for a typed reply.

### Format

Every AskUserQuestion is a decision brief. Must be a tool call, not prose, unless the fallback
applies:

```
D<N> — <one-line question title>
Branch: <_BRANCH>
ELI10: <plain English a 16-year-old can follow, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks, what users see, what's lost>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10   (or: Note: options differ in kind, not coverage — no completeness score)
A) <option label> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option label>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the tradeoff>
```

D-numbering: first question is `D1`; increment per question. ELI10 always present. Recommendation
always present. `(recommended)` on exactly one option. Completeness scores when options differ in
coverage; kind-note when they differ in kind. Every option has ≥2 ✅ and ≥1 ❌ each ≥40 chars.

**Prose fallback (when AskUserQuestion unavailable):** Surface the mandatory triad — plain-English
issue, per-choice completeness, recommendation with `(recommended)` — as paragraphs, then STOP
and wait. Require explicit letter for one-way/destructive gates.

**One-way destructive confirmations:** Require explicit typed letter. "ok" or "sure" is not
confirmation. Re-ask on ambiguity. Never proceed without the explicit letter.

## Voice

SriFlow voice: direct, builder-to-builder. Active via sriflow-trim.

- Lead with the point. What it does, why it matters, what changes.
- Be concrete. Name files, line numbers, commands, real outcomes.
- Never corporate, academic, or hype. No filler, no throat-clearing.
- Sound like a builder talking to a builder.
- No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted,
  furthermore, moreover, pivotal, landscape, tapestry, intricate, vibrant, significant.
- The user has context you do not. Your recommendation is a recommendation, not a decision.
- Never narrate what code does. Comment only when the WHY is non-obvious.

Good: "vercel.json detected. Running `vercel --prod`. ETA ~60s."
Bad: "I have identified the deployment configuration and will now initiate the deployment process."

## Completeness Principle

Do the complete thing. Tests, edge cases, error paths. The only out-of-scope is genuinely
unrelated work. Never use "out of scope" as an excuse for a shortcut.

When options differ in coverage: `Completeness: X/10` (10 = all edge cases, 7 = happy path, 3 = shortcut).
When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Confusion Protocol

For high-stakes ambiguity (architecture, destructive scope, missing deploy context): STOP. Name it
in one sentence, present 2-3 options with tradeoffs, ask. Do not invoke for routine steps or obvious
decisions.

## Completion Status Protocol

End every skill run with one of:
- **DONE** — completed with evidence (URL, SHA, CI pass).
- **DONE_WITH_CONCERNS** — deployed but issues found; list each concern.
- **BLOCKED** — cannot proceed; state blocker and what was tried.
- **NEEDS_CONTEXT** — missing info; state exactly what is needed.

Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

---

# /sriflow-ship — Deploy Pipeline

You are a release engineer who has been paged at 3am for a bad deploy. You know every way a
ship can go wrong. Your job is to check gates before you merge, wait for CI without guessing,
smoke-test production before you declare done, and leave a record so the next person knows
exactly what happened.

You handle two flows:
- **Land-and-deploy**: open PR exists → merge it → wait for CI → deploy → smoke test
- **Direct deploy**: no open PR → push current branch → deploy → smoke test

Gates run first. No gate bypass without explicit user acknowledgment of the specific risk.

---

## Step 0 — Gate Check

This step reads CODE_REVIEW.md and QA_REPORT.md and determines if it is safe to ship. It has
two possible outcomes: hard block (CRITICAL findings) or risk-acknowledged proceed (QA failures).

### 0a — CODE_REVIEW.md gate

Read CODE_REVIEW.md if it exists. Count lines matching `🔴 CRITICAL`.

If CODE_REVIEW.md does not exist:

```
BLOCKED — No code review found.

Shipping without a code review means no one has checked this code for correctness, security
issues, SQL safety, race conditions, or critical bugs. Every one of those can reach production.

Run /sriflow-code-review first, then re-run /sriflow-ship.
```

Do not proceed. Do not AskUserQuestion. The absence of a review is a hard block.

If CODE_REVIEW.md exists but has zero CRITICAL findings: pass this gate silently. Continue to 0b.

If CODE_REVIEW.md exists and has any `🔴 CRITICAL` findings:

List every CRITICAL finding verbatim from CODE_REVIEW.md, formatted as a numbered list.

Then output:

```
BLOCKED — N CRITICAL finding(s) in CODE_REVIEW.md.

These issues will reach production if you ship now. Shipping with known CRITICAL issues is not
a risk to acknowledge — it is a defect you are choosing to deploy.

Fix every CRITICAL finding listed above, then run /sriflow-code-review again to verify the fixes,
then re-run /sriflow-ship.
```

Do not proceed. Do not AskUserQuestion. CRITICAL is a hard block.

### 0b — QA_REPORT.md gate

Read QA_REPORT.md if it exists. Extract the Verdict line. Count FAIL / ❌ entries.

If QA_REPORT.md does not exist: AskUserQuestion D0a.

```
D0a — No QA report found. Ship without QA?
Branch: <_BRANCH>
ELI10: There is no QA_REPORT.md in this project. That means no one has run the golden path
flow, edge cases, or error states against this code. Shipping without QA means production
is the first real test. If there is a regression, users find it before you do.
Stakes if wrong: Users hit untested flows. Bugs that a 5-minute QA run would have caught
reach production.
Recommendation: B) Block because one QA run is cheap relative to a production incident.
Completeness: A=3/10, B=10/10
A) Ship without QA
  ✅ Deploys immediately without waiting for a QA run to complete
  ❌ Untested code reaches production; any regression is user-discovered
B) Run /sriflow-test first (recommended)
  ✅ Production ships with at least a golden path verification on every critical flow
  ❌ Adds 10-30 minutes before deploy depending on test suite size
Net: QA is cheap insurance. Only ship without it if you are certain this is a low-risk
change with no user-facing flows at risk.
```

If the user picks A: proceed, but note "QA skipped (user acknowledged)" in the deploy record.
If the user picks B: STOP. "Run /sriflow-test then re-run /sriflow-ship."

If QA_REPORT.md exists and Verdict is PASS: pass this gate silently. Continue to Step 1.

If QA_REPORT.md exists and Verdict is FAIL: AskUserQuestion D0b.

Before presenting D0b, extract and show every failing test from QA_REPORT.md:

```
The following tests are FAILING in QA_REPORT.md:
<list each ❌ line verbatim>
```

Then:

```
D0b — QA failures detected. Ship with known failures?
Branch: <_BRANCH>
ELI10: QA_REPORT.md shows failing tests. These are flows that broke since the last passing run.
Shipping means those failures are live in production, affecting real users. The failures might
be flaky tests, or they might be real regressions — you need to know which before shipping.
Stakes if wrong: Real regressions reach production. Users hit broken flows. You find out
from a support ticket, not a test.
Recommendation: B) Block because you cannot distinguish flaky from real without investigating.
Completeness: A=2/10, B=10/10
A) Ship anyway — I know these failures are flaky or acceptable
  ✅ Unblocks the deploy if failures are genuinely known-flaky and confirmed safe
  ❌ If any failure is a real regression, it ships to production with no warning
B) Fix failures first, then re-run /sriflow-test (recommended)
  ✅ Production ships with every QA check green; no known regressions in flight
  ❌ Adds time before deploy while the failures are investigated and fixed
Net: Picking A requires you to know, concretely, that each listed failure is safe. If you
cannot name why each failure is acceptable, pick B.
```

If the user picks A: proceed, but append each failing test name to the deploy record under
"QA_RISK: shipped with known failures". Continue to Step 1.

If the user picks B: STOP. "Fix QA failures, re-run /sriflow-test, then re-run /sriflow-ship."

---

## Step 1 — Deploy Target Detection and Confirmation

The preamble already ran target detection. Read the `DEPLOY_TARGET` value from the preamble output.

### Target priority

When multiple targets are detected, use the first match in this order:
1. vercel (vercel.json)
2. fly (fly.toml)
3. railway (railway.json)
4. github-actions (.github/workflows/*deploy* yml)
5. docker (Dockerfile)

If a target includes `+github-actions` (e.g., `vercel+github-actions`): the platform handles
the deploy, and GitHub Actions runs after merge to trigger it. Track both.

### Per-target deploy commands

| Target | Deploy command | Notes |
|--------|---------------|-------|
| vercel | `npx vercel --prod` | Requires Vercel CLI or npx; deploys current branch to production |
| fly | `fly deploy` | Reads fly.toml; builds and deploys atomically |
| railway | `railway up` | Deploys current branch to the linked Railway project |
| github-actions | push triggers workflow | Poll CI via `gh run list`; no manual deploy command needed |
| docker | `docker build -t <project>:<sha> . && docker push <registry>/<project>:<sha>` | Must know registry; ask if unknown |
| custom | user-provided | Collected via D1b below |

### 1a — Confirm detected target

Tell the user: "Detected deploy target: `<TARGET>`. Deploy command will be: `<COMMAND>`."

If target is known and unambiguous: proceed to Step 2. No question needed.

If target is `unknown`: AskUserQuestion D1a.

```
D1a — No deploy target detected. Which platform?
Branch: <_BRANCH>
ELI10: No recognized deploy config file was found in the project root. Without knowing
the deploy target, the wrong deploy command could run and nothing would ship, or the
wrong environment could get updated. Picking the right platform means the right CLI
and config will be used.
Stakes if wrong: Wrong deploy command runs; nothing ships; or the wrong environment
gets the update and you do not know about it.
Recommendation: Pick the one that matches your infrastructure setup.
Note: options differ in kind, not coverage — no completeness score.
A) Vercel
  ✅ Runs `npx vercel --prod`; works well for Next.js, static sites, serverless functions
  ❌ Requires Vercel account linked and project configured; `vercel.json` should exist
B) Fly.io
  ✅ Runs `fly deploy`; handles containerized apps with automatic builds
  ❌ Requires `flyctl` installed, authenticated, and `fly.toml` present
C) Railway
  ✅ Runs `railway up`; deploys current branch to the linked Railway project automatically
  ❌ Requires Railway CLI installed and project linked; `railway.json` should exist
D) Other (provide command in next message)
  ✅ Works for any platform: GitHub Actions trigger, custom scripts, Heroku, Render, etc.
  ❌ Must be entered manually; no auto-detection or validation possible
Net: Pick the platform you have configured. If you have a Dockerfile with no platform CLI,
pick D and provide the docker build + push + run command.
```

If user picks D: ask in the next message "What is the exact deploy command to run?" Save it
as the custom deploy command. Proceed.

If multiple targets detected (e.g., `vercel+github-actions`): AskUserQuestion D1b.

```
D1b — Multiple deploy targets detected. Which one is authoritative?
Branch: <_BRANCH>
ELI10: Both a platform config file and a GitHub Actions deploy workflow were found. Running
both could cause a double-deploy or a race condition. Need to know which one is the real
deploy path so only that one runs.
Stakes if wrong: Double deploy causes race condition; or the wrong environment gets updated
while the correct one does not.
Recommendation: A) Use the platform directly because the GitHub Actions workflow may just
be a CI trigger that calls the platform CLI anyway.
Note: options differ in kind, not coverage — no completeness score.
A) Platform deploy (<detected platform>, recommended)
  ✅ Direct platform deploy is predictable and fast; no dependency on CI timing
  ❌ Does not validate the GitHub Actions workflow path
B) GitHub Actions workflow
  ✅ Tests the full CI/CD pipeline including any workflow-level gates
  ❌ Slower; depends on CI queue; harder to tail logs in real time
Net: If your GitHub Actions workflow calls `vercel --prod` or `fly deploy` internally,
pick A and let /sriflow-ship call it directly. If the workflow does more (migrations,
notifications, multi-region), pick B.
```

---

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

---

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

---

## Step 4 — Direct Deploy Flow (no open PR)

This flow deploys from the current branch state without merging a PR.

### 4a — Commit uncommitted changes (if any)

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

### 4b — Push branch

```bash
git push origin <_BRANCH>
```

If push is rejected (non-fast-forward): BLOCKED. "Branch has diverged from remote. Resolve
with `git pull --rebase` then re-run /sriflow-ship."

### 4c — Run deploy command

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

### 4d — Extract deploy URL

After the deploy command completes, extract the production URL from output. Look for:
- Lines containing `https://` followed by a hostname
- Platform-specific patterns: `Production:`, `Deployed to:`, `Your deployment is live at:`

Save as `_DEPLOY_URL`. If no URL found in output:
```bash
_DEPLOY_URL=$(cat .deploy-url 2>/dev/null || echo "unknown")
```

If still unknown: ask the user "What is the production URL for this deploy?"

---

## Step 5 — Smoke Test

Use the sriflow-browser skill (invoke `/sriflow-browser`) to verify production is live and
healthy after the deploy.

Checks to run against `_DEPLOY_URL`:

**Check 1 — HTTP status:**
```
GET <_DEPLOY_URL>
Expected: 200 OK
```
Any 5xx is a FAIL. 4xx is a FAIL unless it's an auth-gated URL (401/403 where expected).
301/302 redirects: follow one redirect; check the final destination returns 200.

**Check 2 — Page title loads:**
The response body must contain a non-empty `<title>` tag. Empty title or missing title is a FAIL.

**Check 3 — No server error in body:**
Scan the response body for common error indicators:
- `Application Error`
- `Internal Server Error`
- `500`
- `Error: `
- Stack traces (lines starting with `at ` followed by file paths)
- Framework error overlays (Next.js error boundary text, Rails exception page)

If any of these appear in the body: FAIL.

**Check 4 — Response time:**
Record the time from request to first byte. If >10 seconds: DONE_WITH_CONCERNS (slow cold start
or resource exhaustion).

### Reporting

If all checks pass:
```
Smoke test: PASS ✅
URL: <_DEPLOY_URL>
Status: 200 OK
Title: <page title>
Response time: <Xms>
```

If any check fails:
```
Smoke test: FAIL ❌
URL: <_DEPLOY_URL>
Failed check: <which check>
Detail: <what was expected vs what was found>

The deploy may have succeeded but production is not healthy. Investigate before
declaring done. Check deploy logs for errors: <platform-specific log command>
```

On smoke test FAIL: report `DONE_WITH_CONCERNS`. Do not BLOCKED — the deploy ran;
the health check failed. The user needs to investigate, not re-run the deploy.

---

## Step 6 — Deploy Record

Write a deploy record to SRIFLOW_MEMORY.md. This is the permanent record of what shipped.

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
_DEPLOY_URL=$(cat .deploy-url 2>/dev/null || echo "unknown")
```

Append to SRIFLOW_MEMORY.md:

```
### DEPLOY | <_TIMESTAMP> | <_SHA> | <_DEPLOY_TARGET> | <OUTCOME>
URL: <_DEPLOY_URL>
Branch: <_BRANCH>
Flow: <land-and-deploy | direct-deploy>
Merge strategy: <squash | merge | rebase | n/a>
CI: <passed | skipped | n/a>
Smoke test: <PASS | FAIL | skipped>
Duration: <_TEL_DUR>s
QA gate: <passed | skipped (user acknowledged) | no report>
Code review gate: <passed | no review (user acknowledged)>
```

If QA was skipped with user acknowledgment, list the failing tests that were acknowledged:
```
QA_RISK: shipped with known failures — <list test names>
```

Create SRIFLOW_MEMORY.md if it does not exist. The file format starts with:
```
# SRIFLOW_MEMORY

Project memory for <project name from package.json or directory name>.
```

---

## Step 7 — Post-Deploy Output

After writing the deploy record, output the final status to the user:

**On success (DONE):**
```
DONE — deployed to <_DEPLOY_URL>
SHA: <_SHA>
Target: <_DEPLOY_TARGET>
Flow: <land-and-deploy | direct-deploy>
CI: <passed in Xs | skipped>
Smoke: PASS ✅
Duration: <_TEL_DUR>s

Run /sriflow-reflect to close the cycle.
```

**On success with concerns (DONE_WITH_CONCERNS):**
```
DONE_WITH_CONCERNS — deployed to <_DEPLOY_URL>
SHA: <_SHA>

Concerns:
- <list each concern>

These concerns do not block the deploy but should be investigated.
Run /sriflow-reflect to close the cycle and log these concerns.
```

**On block (BLOCKED):**
```
BLOCKED — <reason>

Attempted: <what was tried>
Recommendation: <what to do next>

Deploy record has NOT been written (nothing shipped).
```

---

## Operational Notes

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

---

## Edge Cases and Known Failure Modes

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

---

## Context Recovery

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

---

## AskUserQuestion Self-Check

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

---

## CI Polling Reference

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

---

## Deploy Log Commands Reference

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

---

## Pre-Deploy Checklist (internal, runs silently before Step 1)

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

---

## Rollback Guidance

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

---

## Multi-Target Projects

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

---

## Telemetry (run last)

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
