# Health Check Workflow (absorbed from gstack/health)

Code quality dashboard. Runs existing project tools, computes weighted 0-10 composite score, tracks trends.

**HARD GATE:** Do NOT fix issues. Produce dashboard and recommendations only.

---

## Step 1: Detect Health Stack

Read CLAUDE.md for `## Health Stack` section. If found, use those tools. Otherwise auto-detect:

```bash
# Type checker
[ -f tsconfig.json ] && echo "TYPECHECK: tsc --noEmit"

# Linter
[ -f biome.json ] || [ -f biome.jsonc ] && echo "LINT: biome check ."
ls eslint.config.* .eslintrc.* .eslintrc 2>/dev/null | head -1 | xargs -I{} echo "LINT: eslint ."
[ -f pyproject.toml ] && grep -q "ruff\|pylint" pyproject.toml 2>/dev/null && echo "LINT: ruff check ."

# Test runner
[ -f package.json ] && grep -q '"test"' package.json 2>/dev/null && echo "TEST: bun test"
[ -f pyproject.toml ] && grep -q "pytest" pyproject.toml 2>/dev/null && echo "TEST: pytest"
[ -f Cargo.toml ] && echo "TEST: cargo test"
[ -f go.mod ] && echo "TEST: go test ./..."

# Dead code
command -v knip >/dev/null 2>&1 && echo "DEADCODE: knip"
[ -f package.json ] && grep -q '"knip"' package.json 2>/dev/null && echo "DEADCODE: npx knip"

# Shell linting
command -v shellcheck >/dev/null 2>&1 && ls *.sh scripts/*.sh bin/*.sh 2>/dev/null | head -1 | xargs -I{} echo "SHELL: shellcheck"
```

Persist detected tools to CLAUDE.md `## Health Stack` section for future runs.

---

## Step 2: Run Tools

For each detected tool:
1. Record start time
2. Run command, capture stdout + stderr
3. Record exit code
4. Record end time
5. Capture last 50 lines of output

Run sequentially. If tool not installed, record as `SKIPPED` with reason, not failure.

---

## Step 3: Score Each Category

| Category | Weight | 10 | 7 | 4 | 0 |
|-----------|--------|------|-----------|------------|-----------|
| Type check | 22% | Clean (exit 0) | <10 errors | <50 errors | >=50 errors |
| Lint | 18% | Clean (exit 0) | <5 warnings | <20 warnings | >=20 warnings |
| Tests | 28% | All pass (exit 0) | >95% pass | >80% pass | <=80% pass |
| Dead code | 13% | Clean (exit 0) | <5 unused exports | <20 unused | >=20 unused |
| Shell lint | 9% | Clean (exit 0) | <5 issues | >=5 issues | N/A (skip) |

**Parsing output:**
- tsc: count lines matching `error TS`
- biome/eslint/ruff: count error/warning patterns
- Tests: exit 0 = 10, exit non-zero = 4 (if only exit code available)
- knip: count unused exports/files/dependencies
- shellcheck: count distinct findings

**Composite score:**
```
composite = (typecheck * 0.22) + (lint * 0.18) + (test * 0.28) + (deadcode * 0.13) + (shell * 0.09)
```
If category skipped, redistribute weight proportionally.

---

## Step 4: Present Dashboard

```
CODE HEALTH DASHBOARD
═════════════════════
Project: <name>
Branch:  <branch>
Date:    <today>

Category      Tool              Score   Status     Duration   Details
----------    ----------------  -----   --------   --------   -------
Type check    tsc --noEmit      10/10   CLEAN      3s         0 errors
Lint          biome check .      8/10   WARNING    2s         3 warnings
Tests         bun test          10/10   CLEAN      12s        47/47 passed
Dead code     knip               7/10   WARNING    5s         4 unused exports
Shell lint    shellcheck        10/10   CLEAN      1s         0 issues

COMPOSITE SCORE: 9.1 / 10
Duration: 23s total
```

Status labels: 10=CLEAN, 7-9=WARNING, 4-6=NEEDS WORK, 0-3=CRITICAL.

If any category <7, list top issues from that tool's output.

---

## Step 5: Persist to Health History

Append JSONL line to `~/.sriflow/projects/<slug>/health-history.jsonl`:
```json
{"ts":"2026-03-31T14:30:00Z","branch":"main","score":9.1,"typecheck":10,"lint":8,"test":10,"deadcode":7,"shell":10,"duration_s":23}
```

---

## Step 6: Trend Analysis + Recommendations

Read last 10 entries from health-history.jsonl. Show trend table. If score dropped vs previous run, identify which categories declined and correlate with tool output.

**Recommendations by impact:** Rank by `weight * (10 - score)` descending. Only show categories below 10.

---

## Rules

1. **Wrap, don't replace.** Run project's own tools. Never substitute own analysis.
2. **Read-only.** Never fix issues.
3. **Respect CLAUDE.md.** If Health Stack configured, use those exact commands.
4. **Skipped ≠ failed.** Tool not available → skip gracefully, redistribute weight.
5. **Show raw output for failures.** Include actual output so user can act.
6. **First run:** "First health check — no trend data yet."
