# Deploy Record — Steps 6-7

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
