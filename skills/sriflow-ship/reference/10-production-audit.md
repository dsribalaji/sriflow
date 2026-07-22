# 10 — Production Audit

Local evidence checks before deploy. No external data sent.

## Checks

### Dependency Audit

Run the relevant command for the project's ecosystem:

```bash
npm audit --audit-level=high 2>&1
# or
yarn audit --level high 2>&1
# or
pip audit 2>&1
# or
cargo audit 2>&1
```

Zero high/critical findings = pass. Any high/critical = WARNING (non-blocking unless severity is CRITICAL).

### Environment Check

Verify all required env vars are documented:

```bash
# Find referenced env vars in source
grep -r "process.env\.\|os.environ\|ENV\[\\|env::var" --include="*.{ts,js,py,rs}" src/ 2>/dev/null \
  | grep -oP '(?:process\.env\.|os\..environ\[.?|ENV\[.?|env::var\(.?)[A-Z_]+' \
  | sort -u > /tmp/required_env.txt

# Check documentation
grep -oP '[A-Z_]{2,}' .env.example README.md 2>/dev/null | sort -u > /tmp/documented_env.txt

# Compare
comm -23 /tmp/required_env.txt /tmp/documented_env.txt
```

Undocumented vars found = WARNING. No .env.example and no README docs = WARNING.

### Secrets Scan

Check staged files for hardcoded secrets:

```bash
git diff --cached --name-only 2>/dev/null | xargs grep -ilE "(api_key|password|secret|token|private_key)\s*[:=]\s*['\"][^'\"]{8,}" 2>/dev/null
```

Any match = CRITICAL (BLOCKED). Output the file and line for transparency.

### Build Health

Verify the build succeeds without errors:

```bash
npm run build 2>&1
# or equivalent for the project's build tool
```

Non-zero exit = CRITICAL (BLOCKED). Warnings in output = WARNING.

### Test Health

Run the test suite if it exists:

```bash
npm test 2>&1
# or equivalent
```

Any failure = CRITICAL (BLOCKED). No test script = WARNING (note it, don't block).

### Bundle Size

Check for unexpected large files in build output:

```bash
find dist/ build/ out/ .next/ -type f -size +1M 2>/dev/null
```

Large files found = WARNING. Consider code splitting or compression.

## Gate Logic

| Finding | Severity | Verdict |
|---------|----------|---------|
| Secrets found in staged files | CRITICAL | BLOCKED |
| Build fails | CRITICAL | BLOCKED |
| Tests fail | CRITICAL | BLOCKED |
| High/critical dependency vulnerabilities | WARNING | CLEAR_WITH_CONCERNS |
| Undocumented env vars | WARNING | CLEAR_WITH_CONCERNS |
| Large bundle files | WARNING | CLEAR_WITH_CONCERNS |
| No test suite | WARNING | CLEAR_WITH_CONCERNS |
| All clear | — | CLEAR |

**Decision rule:**
- Any CRITICAL → BLOCKED. List all CRITICAL findings.
- Any WARNING (no CRITICAL) → CLEAR_WITH_CONCERNS. List all warnings.
- No findings → CLEAR. Proceed to deploy.

## Output Format

```
PRODUCTION AUDIT:
✅ Build: passes
✅ Tests: 42/42 pass
✅ Secrets: none found
⚠️ Audit: 3 low-severity findings (non-blocking)
⚠️ Bundle: main.js 1.2MB (consider code splitting)
VERDICT: CLEAR / CLEAR_WITH_CONCERNS / BLOCKED
```

## When to Run

Always before Step 1 (Deploy Target Detection). This is Step 0b, after the
CODE_REVIEW/QA_REPORT gate check (Step 0a).

```
Step 0:  Gate Check (CODE_REVIEW + QA_REPORT)
Step 0b: Production Audit ← here
Step 1:  Deploy Target Detection
```
