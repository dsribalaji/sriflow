# Step 5 — Category 3: Error States (Details)

Error State tests verify that failures are handled gracefully. A silent failure
(no error shown to the user, no log entry, data in ambiguous state) is worse
than a visible error. Every error state must have defined behavior.

If an Error State test cannot run because the feature is not implemented, mark it
as SKIP with note "feature not implemented — re-run after build". Only implemented
features can produce Error State failures.

## Network failures

- Request timeout — timeout error caught, user sees timeout message OR retry attempted, no hanging state
- Complete network outage — connection error caught, user sees offline message, no crash
- Partial response — parse error caught, not a crash, not silent data corruption
- Slow network degradation — loading state shown, no UI freeze, result appears when ready

## Authentication and authorization failures

- Expired session token — 401 returned, user redirected to login, no data exposed
- Invalid credentials — rejected with clear error, no information disclosure
- Insufficient permissions — 403 returned, action blocked
- CSRF / missing token — 403 returned, no state change on server

## Invalid input (server-side)

- Malformed request body — 400 returned with parse error, no crash, no stack trace
- Missing required field — 422 or 400 returned, error names the missing field
- Schema violation — validation error, clear message, no crash, no unexpected DB write

## Server errors

- 500 internal server error — user sees generic error message, no stack trace in response
- Service unavailable — upstream returns appropriate error, no crash, no partial state
- Third-party API down — feature degrades gracefully, user sees clear message
- Database constraint violation — DB error caught at service layer, user sees "already exists"

## Error State Checklist by Dependency Type

Map each external dependency the feature touches to the error states to test.

### HTTP / REST API calls (outbound)

| Error state | HTTP status | What to verify |
|-------------|-------------|----------------|
| Timeout | Connection hangs | Loading state shown; no hang |
| Connection refused | Network failure | Error caught; offline message |
| 400 Bad Request | Upstream rejects payload | Error names the field |
| 401 Unauthorized | Auth expired | Session cleared; redirect to login |
| 403 Forbidden | Upstream denies scope | Feature disabled gracefully |
| 404 Not Found | Resource gone | Handled as "not found" |
| 429 Rate Limited | Too many requests | Backoff or queue; user told to wait |
| 500 Internal | Upstream crashed | Generic error; no stack trace |
| 503 Unavailable | Upstream down | Degradation message |
| Partial body | Connection drops mid-response | Parse error caught |
| Invalid JSON | Response not valid JSON | Parse error caught; logged |

### Database operations

| Error state | Cause | What to verify |
|-------------|-------|----------------|
| Unique constraint violation | Duplicate write | 409 or "already exists"; no 500 |
| Foreign key violation | Reference to deleted record | Caught at service layer |
| Connection pool exhausted | Too many queries | Queued or rejected cleanly |
| Query timeout | Long-running query | Timeout caught; transaction rolled back |
| Disk full | Storage failure | Caught; admin alerted |
| Migration not run | Schema mismatch | Column missing error caught early |

### File system operations (if applicable)

| Error state | Cause | What to verify |
|-------------|-------|----------------|
| File not found | Path wrong | FileNotFoundError caught |
| Permission denied | No read/write access | Error caught; admin can diagnose |
| Disk full | No space for write | Write error caught; no partial file |
| File locked | Another process holds lock | Retry or fail gracefully |
| Path traversal | Input contains `../` | Normalized to safe path |

### Authentication / session

| Error state | Cause | What to verify |
|-------------|-------|----------------|
| Token expired | JWT past expiry | Redirect to login; session cleared |
| Token tampered | Signature invalid | Rejected with 401 |
| CSRF token missing | Form without token | 403; no state change |
| CSRF token reused | Token used twice | Rejected; one-use tokens invalidated |
| Session fixation | Old session ID reused | New session ID on login |
| Concurrent logout | Session deleted mid-request | Request rejected with 401 |
