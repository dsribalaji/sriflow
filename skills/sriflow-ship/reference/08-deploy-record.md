# Step 6 — Deploy Record

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

# Step 7 — Post-Deploy Output

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
