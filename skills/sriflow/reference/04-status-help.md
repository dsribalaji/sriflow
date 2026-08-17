# 04 — Status & Help Display

## Step 3 — Status and Help display

### Pipeline status (triggered by: "status", "where am I", "what stage", "pipeline status")

Pull the artifact detection output from Step 0 and `_CURRENT_STAGE` from the preamble, then compute the markers:

- ✅ = this stage's artifact file exists on disk
- ⏳ = current stage according to `SRIFLOW_MEMORY.md` (or the first stage with no artifact when memory is missing)
- ⬜ = not started yet

Render:

```
SRIFLOW PIPELINE — <_PROJECT_NAME>
Branch: <_BRANCH>

✅ /sriflow-plan          PLAN.md (<date>)
✅ /sriflow-plan-review   PLAN_REVIEW.md (<date>)
⏳ /sriflow-design        IN PROGRESS
⬜ /sriflow-build
⬜ /sriflow-code-review
⬜ /sriflow-test
⬜ /sriflow-ship
⬜ /sriflow-reflect

Next: /sriflow-design
```

Rules:
- Put the date next to ✅ stages as `(YYYY-MM-DD)`.
- Put `IN PROGRESS` next to the ⏳ stage.
- With no artifacts and no memory: everything ⬜ except `/sriflow-plan`, which is ⏳.
- With every artifact present: all ✅, then `Next: /sriflow-reflect` (or "Pipeline complete" when RETRO.md exists).
- `/sriflow-browser` and `/sriflow-memory` are not pipeline stages; leave them out of the status. They are utilities you can use at any stage.
- `/sriflow-trim` runs always; omit it from the status.

### Help listing (triggered by: "help", "what skills", "what can sriflow do", "/sriflow help")

```
SRIFLOW SKILLS

Pipeline (run in order):
  /sriflow-plan         BA pipeline — idea to PLAN.md (6 phases: Discovery → Elicitation → Use Cases → Requirements → UI & Data → Architecture)
  /sriflow-plan-review  Three-lens review — CEO, Design, Eng. Scores 0-10. Blocks ship if any lens < 7.
  /sriflow-design       Wireframes → DESIGN.md → HTML mockups. Iterative review loop.
  /sriflow-build        Implement the approved design. Pre-build safety check. sriflow-trim enforces minimal code.
  /sriflow-code-review  Diff review — security, correctness, complexity. CRITICAL findings block ship.
  /sriflow-test         QA — golden path, edge cases, error states, regression. Produces QA_REPORT.md.
  /sriflow-ship         Deploy — gate check, merge PR, wait for CI, smoke test.
  /sriflow-reflect      Retro — metrics, lessons learned, RETRO.md. Updates memory.

Utilities (available any stage):
  /sriflow-browser      Headless Chromium — screenshots, navigation, scraping, automation. ~100ms/command.
  /sriflow-memory       Context — read, write, compress SRIFLOW_MEMORY.md.
  /sriflow-trim         Always-on — compressed speech + minimal code enforcement (ponytail mode).
  /sriflow-validate     Validate skills against the Agent Skills spec — checks frontmatter format.

Notes:
  /sriflow-think → now merged into /sriflow-plan. Both route the same way.
  Run /sriflow (this skill) any time to get status or routing help.
```

### Upgrade check (triggered by: "upgrade", "update sriflow", "check for updates")

```bash
_SRIFLOW_VERSION=$(cat VERSION 2>/dev/null || echo "0.0.0")
_REMOTE_VERSION=$(timeout 2 git ls-remote --tags origin 2>/dev/null | grep -oP 'refs/tags/v\K[0-9.]+$' | tail -1 || echo "")
```

Compare `_SRIFLOW_VERSION`, the installed version, with `_REMOTE_VERSION`, the newest tag on origin.

```
SRIFLOW VERSION CHECK

Installed: v<_SRIFLOW_VERSION>
Latest:    v<_REMOTE_VERSION>

<If same:>
✓ Up to date.

<If remote is newer:>
Update available: v<_SRIFLOW_VERSION> → v<_REMOTE_VERSION>
To upgrade: cd <project-root> && git pull origin main

<If remote check failed (offline/private repo):>
Could not reach remote. Installed v<_SRIFLOW_VERSION>. Run 'git fetch --tags' when online.
```

Rules:
- The preamble runs the version check (non-blocking, 2s timeout). On success, show the result. On silent failure, drop the upgrade section.
- Never upgrade automatically. Always print the command for the user to run.
- When the VERSION file is missing: print "VERSION: unknown" and skip the check.