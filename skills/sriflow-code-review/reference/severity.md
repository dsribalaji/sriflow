# Severity Definitions and Matrix

## Severity Levels

- **CRITICAL** — must be fixed before ship. Data loss risk, security vulnerability, logic error that breaks a core function, SQL injection, XSS, auth bypass. Ship is BLOCKED.
- **WARN** — not immediately dangerous but will cause problems. Missing error handling on critical path, N+1 query under real load, race condition under concurrency, partial auth coverage.
- **NITPICK** — style, simplification, or trim violation. Low urgency. Safe to auto-fix.

## Severity x Category Matrix

Use this table to calibrate severity when in doubt. When a finding spans categories (e.g., LLM output fed into SQL), apply the highest applicable severity.

| Category | CRITICAL | WARN | NITPICK |
|----------|----------|------|---------|
| Correctness | Core function broken, data loss | Edge case bug, non-critical path | Reads ambiguously but works |
| SQL Safety | Any injection vector | Unbounded query, missing transaction | N/A — SQL findings are CRITICAL or WARN only |
| Security | Injection, auth bypass, XSS, SSRF, secrets in code | Data exposure, misconfiguration, missing rate limit | Missing security event logging |
| LLM Trust | User content in prompt without sanitization, LLM output executed/injected | Unvalidated structured output, unbounded context | Raw response passthrough, no behavior change |
| Complexity | Complexity masks a security/correctness boundary | Complexity creates maintenance trap | YAGNI, dead code, wrappers, unnecessary abstraction |
| Trim Audit | N/A | N/A | Debug logs, commented code, obvious comments, redundant imports |

## Finding Verification

Before emitting any finding: verify the specific code line that motivates it. If you cannot point to a specific line in the diff, suppress the finding. Unverified pattern-matches are not findings — they are speculation.
