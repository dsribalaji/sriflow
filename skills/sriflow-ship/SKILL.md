---
name: sriflow-ship
preamble-tier: 2
version: 2.0.0
description: Deploy pipeline + Post-Ship Docs — gate check, auto-detect target, merge PR, wait for CI, smoke test, Diataxis coverage map, doc update. (sriflow) See reference/document-release-workflow.md.
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
  - update docs after ship
  - document release
  - update changelog
---

## When to invoke

Use when asked to "ship this", "deploy", "merge and deploy", "push to production", "release",
or "/sriflow-ship". Two flows: merge open PR then deploy, or deploy directly from current branch.
Gates on CODE_REVIEW.md (CRITICAL blocks hard) and QA_REPORT.md (failures require risk acknowledgment).

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH | SESSION_ID: $_SESSION_ID"

if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE | SESSION_KIND: ${SRIFLOW_SESSION_KIND:-interactive}"

if [ -f "SRIFLOW_MEMORY.md" ]; then echo "MEMORY: found"; head -60 SRIFLOW_MEMORY.md
else echo "MEMORY: missing — will create on first write"; fi

if [ -f "CODE_REVIEW.md" ]; then
  echo "CODE_REVIEW.md: found"
  _CRITICAL_COUNT=$(grep -c "🔴 CRITICAL" CODE_REVIEW.md 2>/dev/null || echo "0")
  echo "CRITICAL_FINDINGS: $_CRITICAL_COUNT"
  [ "$_CRITICAL_COUNT" -gt 0 ] && grep "🔴 CRITICAL" CODE_REVIEW.md
else echo "CODE_REVIEW.md: not found"; _CRITICAL_COUNT=0; fi

if [ -f "QA_REPORT.md" ]; then
  echo "QA_REPORT.md: found"
  grep "Verdict:" QA_REPORT.md 2>/dev/null || echo "Verdict: (not found)"
  _QA_FAILS=$(grep -c "FAIL\|❌" QA_REPORT.md 2>/dev/null || echo "0")
  echo "QA_FAILURES: $_QA_FAILS"
else echo "QA_REPORT.md: not found"; _QA_FAILS=0; fi

_PR=$(gh pr view --json number,state,baseRefName -q '"\(.number) [\(.state)] → \(.baseRefName)"' 2>/dev/null || echo "none")
echo "PR: $_PR"

_DEPLOY_TARGET="unknown"
[ -f "vercel.json" ] && _DEPLOY_TARGET="vercel"
[ -f "fly.toml" ] && _DEPLOY_TARGET="fly"
[ -f "railway.json" ] && _DEPLOY_TARGET="railway"
[ -f "Dockerfile" ] && [ "$_DEPLOY_TARGET" = "unknown" ] && _DEPLOY_TARGET="docker"
_GHA_DEPLOY=$(ls .github/workflows/*.yml 2>/dev/null | xargs grep -l -i "deploy\|production\|release" 2>/dev/null | head -1 || echo "")
[ -n "$_GHA_DEPLOY" ] && _DEPLOY_TARGET="${_DEPLOY_TARGET:+${_DEPLOY_TARGET}+}github-actions"
echo "DEPLOY_TARGET: $_DEPLOY_TARGET"

_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
_DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "SHA: $_SHA | DIRTY_FILES: $_DIRTY"
```

## Plan Mode

Allowed: read-only Bash, Read, Glob, Grep, writes to SRIFLOW_MEMORY.md and plan file. No git mutations, no deploys.

## AskUserQuestion

Every question is a decision brief. Format: `D<N> — title`, Branch, ELI10 (2-4 sentences + stakes), Recommendation (one), Completeness scores (or kind-note), options (≥2 ✅ ≥1 ❌ each ≥40 chars), Net. One `(recommended)` label. Destructive gates require explicit typed letter.

## Voice & Rules

Direct builder-to-builder. No filler, no em dashes, no AI vocab. Never narrate code. Comment only when WHY is non-obvious. Do the complete thing — tests, edge cases, error paths. For ambiguity: STOP, present options, ask.

**Completion:** DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT. Format: STATUS, REASON, ATTEMPTED, RECOMMENDATION.

---

## Step 0 — Gate Check

Read `reference/gate-checks.md` for full logic, question templates, block messages.

- **0a** CODE_REVIEW.md: no file = BLOCKED. Any `🔴 CRITICAL` = BLOCKED. Zero = pass.
- **0b** QA_REPORT.md: no file = Ask D0a. FAIL = Ask D0b. PASS = pass.

## Step 1 — Deploy Target

Read `reference/deploy-targets.md` for per-target commands, D1a, D1b.

Priority: vercel > fly > railway > github-actions > docker. Known = proceed. Unknown = D1a. Multiple = D1b.

## Step 2 — Flow Detection

```bash
_PR_STATE=$(gh pr view --json state -q .state 2>/dev/null || echo "none")
```
OPEN → land-and-deploy (Step 3). MERGED/CLOSED/none → direct deploy (Step 4).

## Step 3 — Land-and-Deploy (open PR)

Read `reference/merge-flow.md` for merge logic, conflict detection, D3.

1. Show commits (3a). 0 = STOP. 2. Check conflicts (3b). CONFLICTING = BLOCKED.
3. Ask strategy D3 (3c). 4. Merge (3d). Fail = BLOCKED. 5. Poll CI 30s, max 10min (3e).

## Step 4 — Direct Deploy (no PR)

Read `reference/direct-deploy.md` for platform commands, URL extraction.

1. Commit uncommitted (4a). 2. Push (4b). Non-fast-forward = BLOCKED.
3. Deploy (4c). 4. Extract URL (4d). Unknown = ask user.

## Step 5 — Smoke Test

Read `reference/smoke-test.md` for checks and reporting.

Checks: HTTP 200, non-empty `<title>`, no error indicators in body, <10s response.
All pass = DONE. Fail = DONE_WITH_CONCERNS.

## Step 6 — Deploy Record & Output

Read `reference/deploy-record.md` for format, telemetry, context recovery.

Append to SRIFLOW_MEMORY.md: `### DEPLOY | <timestamp> | <sha> | <target> | <outcome>` with details.
Output: DONE / DONE_WITH_CONCERNS / BLOCKED. Recommend `/sriflow-reflect`.

---

## Operational Rules

- Never force push. Never skip CI. Never assume deploy URL from prior runs.
- CLI missing = BLOCK with install command. Deploy non-zero = show last 30 lines verbatim.
- GitHub Actions no run after 30s = check workflow trigger.

Read: `reference/edge-cases.md` | `reference/rollback.md` | `reference/pre-checklist.md` | `reference/deploy-logs.md` | `reference/multi-target.md` | `reference/ci-polling.md`
