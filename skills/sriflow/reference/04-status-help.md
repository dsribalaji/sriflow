# 04 — Status & Help Display

## Step 3 — Status and Help display

### Pipeline status (triggered by: "status", "where am I", "what stage", "pipeline status")

Read artifact detection output from Step 0. Read `_CURRENT_STAGE` from preamble. Compute markers:

- ✅ = artifact file for this stage exists on disk
- ⏳ = this is the current stage per `SRIFLOW_MEMORY.md` (or first stage without artifact if memory absent)
- ⬜ = not yet started

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
- Show date next to ✅ stages in `(YYYY-MM-DD)` format.
- Show `IN PROGRESS` next to ⏳ stage.
- If no artifacts and no memory: all ⬜ except `/sriflow-plan` which is ⏳.
- If all artifacts exist: all ✅, `Next: /sriflow-reflect` (or "Pipeline complete" if RETRO.md exists).
- `/sriflow-browser` and `/sriflow-memory` are not pipeline stages — omit from status. They are utilities available at any stage.
- `/sriflow-trim` is always-on — omit from status.

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

Compare `_SRIFLOW_VERSION` (installed) against `_REMOTE_VERSION` (latest tag on origin).

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
- Version check runs in preamble (non-blocking, 2s timeout). If it succeeds,
  show result. If it fails silently, skip upgrade section.
- Do not auto-upgrade. Always show the command for the user to run.
- If VERSION file is missing: show "VERSION: unknown" and skip check.
