# Smoke Test — Step 5

Use the sriflow-browser skill (invoke `/sriflow-browser`) to verify production is live and
healthy after the deploy.

Checks to run against `_DEPLOY_URL`:

## Check 1 — HTTP status

```
GET <_DEPLOY_URL>
Expected: 200 OK
```

Any 5xx is a FAIL. 4xx is a FAIL unless it's an auth-gated URL (401/403 where expected).
301/302 redirects: follow one redirect; check the final destination returns 200.

## Check 2 — Page title loads

The response body must contain a non-empty `<title>` tag. Empty title or missing title is a FAIL.

## Check 3 — No server error in body

Scan the response body for common error indicators:
- `Application Error`
- `Internal Server Error`
- `500`
- `Error: `
- Stack traces (lines starting with `at ` followed by file paths)
- Framework error overlays (Next.js error boundary text, Rails exception page)

If any of these appear in the body: FAIL.

## Check 4 — Response time

Record the time from request to first byte. If >10 seconds: DONE_WITH_CONCERNS (slow cold start
or resource exhaustion).

## Reporting

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
