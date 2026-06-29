---
name: sriflow-code-review
preamble-tier: 2
version: 2.0.0
description: Diff review — correctness, SQL safety, OWASP security, LLM trust, complexity, trim audit. CRITICAL blocks ship. (sriflow)
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - review my code
  - review the diff
  - code review
  - check my changes
  - /sriflow-code-review
---

## When to invoke

Reviews current branch diff against base branch through 6 lenses: correctness, SQL safety, OWASP security, LLM trust boundaries, complexity, trim audit. Writes `CODE_REVIEW.md`. CRITICAL findings block `/sriflow-ship`. Proactively suggest after sriflow-build completes or before sriflow-ship.

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"; _TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH | SESSION_ID: $_SESSION_ID"

[ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ] && export SRIFLOW_PLAN_MODE="active" || \
  { [ "${SRIFLOW_PLAN_MODE:-}" = "active" ] && export SRIFLOW_PLAN_MODE="active" || export SRIFLOW_PLAN_MODE="inactive"; }
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE | SESSION_KIND: ${SRIFLOW_SESSION_KIND:-interactive}"

_BASE=$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null \
  || git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||' || echo "main")
echo "BASE_BRANCH: $_BASE | DIFF_STAT: $(git diff "${_BASE}...HEAD" --stat 2>/dev/null | tail -1)"

[ -f "SRIFLOW_MEMORY.md" ] && { echo "MEMORY: found"; head -60 SRIFLOW_MEMORY.md; } || echo "MEMORY: missing"

_GIT_STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
_GIT_UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
echo "GIT: staged=$_GIT_STAGED unstaged=$_GIT_UNSTAGED untracked=$_GIT_UNTRACKED"

_CURRENT_STAGE=$(grep "^## Current Stage:" SRIFLOW_MEMORY.md 2>/dev/null | head -1 | sed 's/## Current Stage: //' || echo "unknown")
_PROACTIVE=$(sriflow-config get proactive 2>/dev/null || echo "true")
_EXPLAIN_LEVEL=$(sriflow-config get explain_level 2>/dev/null || echo "default")
echo "PIPELINE: $_CURRENT_STAGE | PROACTIVE: $_PROACTIVE | EXPLAIN: $_EXPLAIN_LEVEL"

sriflow-timeline log '{"skill":"sriflow-code-review","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
```

## Plan Mode

Allowed in plan mode: `Bash` (read-only git), `Read`, `Glob`, `Grep`, writes to `SRIFLOW_MEMORY.md` and plan file. No destructive ops or git mutations. If `SRIFLOW_PLAN_MODE` is `"active"`: run all 6 lenses, write findings, write `CODE_REVIEW.md`, but do NOT apply auto-fixes (Step 4 deferred — report only).

## AskUserQuestion Format

Every AskUserQuestion is a decision brief: `D<N> — <title>` with Branch, ELI10, Stakes, Recommendation, Completeness scores, options with pros/cons, Net synthesis. D-numbering starts at `D1`. Prose fallback when AskUserQuestion unavailable: same info as paragraphs, then STOP and wait.

## Voice

Direct, builder-to-builder, compressed. Lead with the point. Be concrete (files, functions, line numbers). No filler, no AI vocabulary (delve, crucial, robust, comprehensive, nuanced, multifaceted, furthermore, additionally, pivotal, tapestry, underscore, foster, showcase, intricate, vibrant, fundamental, significant). Never narrate what code does. Only comment when WHY is non-obvious.

## Completeness Principle

Every category, every finding. Only out-of-scope: code not in the diff. Never skip a category with "low risk". When options differ in coverage: `Completeness: X/10`. When options differ in kind: `Note: options differ in kind, not coverage — no completeness score.`

## Completion Status Protocol

End every run with one of: **DONE** (no CRITICALs/WARNs or all fixed), **DONE_WITH_CONCERNS** (open WARNs listed), **BLOCKED** (CRITICALs remain, cannot ship), **NEEDS_CONTEXT** (missing info, state what's needed). Format: `STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`.

## Confusion Protocol

For high-stakes ambiguity (architecture, data model, destructive scope, missing context): STOP. One sentence, 2-3 options with tradeoffs, ask. Not for routine analysis or obvious findings.

---

# /sriflow-code-review — Diff Review

Analyze current branch diff against base branch through 6 review lenses. Write `CODE_REVIEW.md`. Block ship if any CRITICAL finding is open.

---

## Step 0: Base Branch Detection

Run in sequence, stopping at first success: `gh pr view --json baseRefName -q .baseRefName 2>/dev/null` -> `gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null` -> `git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||'` -> `git rev-parse --verify origin/main 2>/dev/null` (use `main` if 0) -> `git rev-parse --verify origin/master 2>/dev/null` (use `master` if 0) -> default `main`.

Print: `BASE: <detected-branch>`. Use as `<base>` in every subsequent step.

---

## Step 1: Branch and Diff Check

```bash
git branch --show-current
```

If current branch equals `<base>`: **"Nothing to review — on the base branch."** and stop. Then: `git fetch origin <base> --quiet 2>/dev/null || true`. Then `git diff <base>...HEAD --stat 2>/dev/null`. If empty: **"Nothing to review — no changes against `<base>`."** and stop. Print the stat summary.

---

## Step 2: Get the Full Diff

```bash
git diff <base>...HEAD
```

Read the full diff carefully before emitting any findings. Do NOT emit line by line. Read entire diff, then run all 6 lenses, then output findings all at once.

If very large (500+ files or 20k+ lines), read in sections using `git diff <base>...HEAD -- <path>` per directory, starting with highest-risk (auth, database, API handlers, LLM integration).

---

## Step 3: Six-Lens Review

Apply all 6 lenses. For detailed checklists, read reference files:

- **Lens 1 (CORRECTNESS):** `reference/lens1-correctness.md`
- **Lens 2 (SQL SAFETY):** `reference/lens2-sql.md`
- **Lens 3 (SECURITY/OWASP):** `reference/lens3-security.md`
- **Lens 4 (LLM TRUST):** `reference/lens4-llm.md`
- **Lens 5 (COMPLEXITY):** `reference/lens5-complexity.md`
- **Lens 6 (TRIM AUDIT):** `reference/lens6-trim.md`

Severity definitions: `reference/severity.md`. False positives: `reference/false-positives.md`.

Every finding format (one per line):
```
path/to/file.ext:LINE: 🔴 CRITICAL|⚠️ WARN|💡 NITPICK: <problem>. Fix: <specific action>.
```

**Before emitting:** verify the specific code line. If you cannot point to a specific line in the diff, suppress the finding.

---

## Step 4: Auto-Fix Gate (NITPICKs Only)

Auto-fix rules: `reference/autofix-scope.md`

After all 6 lenses, count NITPICKs. If any exist, ask via AskUserQuestion (D1): auto-fix all (recommended) or report only.

**If A (auto-fix):** Apply each fix using `Edit`. Reverse line order within each file (prevents drift). After all: `git diff HEAD` to verify. Revert any unexpected result.

**If B (report only):** Proceed to Step 5.

---

## Step 5: Write CODE_REVIEW.md

Write `CODE_REVIEW.md` in repo root (overwrite). Sections: Header (Branch, Base, Reviewed, Diff stat), Summary table (lens x severity counts), CRITICAL findings, WARN findings, NITPICK findings (note auto-fixed), Scope (1-2 sentences), Lens Notes (lenses with no applicable code), Verdict (BLOCKED / DONE_WITH_CONCERNS / DONE). Fill every section; `(none)` if empty. Every finding: specific file:line + specific fix.

---

## Step 6: Verdict Gate

**BLOCKED** (open CRITICAL): `STATUS: BLOCKED` | `REASON: <N> CRITICAL(s) must be fixed before /sriflow-ship.` | `RECOMMENDATION: Fix each, re-run or proceed to /sriflow-ship.` List each CRITICAL inline.

**DONE_WITH_CONCERNS** (WARNs, no CRITICALs): `STATUS: DONE_WITH_CONCERNS` | `REASON: <N> WARN(s). No CRITICALs.` | `RECOMMENDATION: Review WARNs. Clear to /sriflow-ship with awareness.` List each WARN inline.

**DONE** (no CRITICALs, no WARNs): `STATUS: DONE` | `REASON: No CRITICAL or WARN findings.` | `RECOMMENDATION: Clear to /sriflow-ship.`

---

## Memory Write (run last, always)

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

cat >> SRIFLOW_MEMORY.md << 'MEMEOF'

### <_TIMESTAMP> | sriflow-code-review | <OUTCOME> | <_TEL_DUR>s
Branch: <_BRANCH>
Session: <_SESSION_ID>
Result: <N_CRITICAL> CRITICAL, <N_WARN> WARN, <N_NITPICK> NITPICK
MEMEOF

sriflow-timeline log '{"skill":"sriflow-code-review","event":"completed","branch":"'"$_BRANCH"'","outcome":"<OUTCOME>","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","critical":<N_CRITICAL>,"warn":<N_WARN>}' 2>/dev/null || true
```

Replace `<OUTCOME>` with `blocked`, `done_with_concerns`, or `done`. Replace counts with actuals.

---

## Context Recovery

At session start or after compaction: `head -80 SRIFLOW_MEMORY.md` and `head -30 CODE_REVIEW.md`. If found: 2-sentence summary. If BLOCKED: surface CRITICALs immediately. If DONE: suggest `/sriflow-ship`.

---

## Reference Files

All in `reference/`: `severity.md` (definitions + matrix), `lens1-correctness.md`, `lens2-sql.md`, `lens3-security.md`, `lens4-llm.md`, `lens5-complexity.md`, `lens6-trim.md`, `false-positives.md`, `language-patterns.md` (JS/TS, Python, Ruby, Go, SQL), `llm-attacks.md` (attack scenarios), `complexity-antipatterns.md` (named patterns), `autofix-scope.md` (safety rules), `diff-size.md` (handling strategies), `checklists.md` (pre-finding, pre-write, post-write).

Read the relevant reference file before applying each lens. Read `checklists.md` before emitting findings and before writing CODE_REVIEW.md.
