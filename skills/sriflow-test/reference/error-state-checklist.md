# Error State Checklist by Dependency Type

Map each external dependency the feature touches to the error states to test.

## HTTP / REST API calls (outbound)

| Error state | HTTP status / behavior | What to verify |
|-------------|----------------------|----------------|
| Timeout | Connection hangs past threshold | Loading state shown; no hang; retry or error msg |
| Connection refused | Network-level failure | Error caught; user sees offline message |
| 400 Bad Request | Upstream rejects our payload | Our error handling names the field; not "unknown error" |
| 401 Unauthorized | Upstream auth expired | Session cleared; user redirected to login |
| 403 Forbidden | Upstream denies our key/scope | Feature disabled gracefully; not a crash |
| 404 Not Found | Resource no longer exists | Handled as "not found"; not as a 500 |
| 429 Rate Limited | Too many requests | Backoff or queue; user told to wait; no data loss |
| 500 Internal | Upstream crashed | Caught; user sees generic error; no stack trace exposed |
| 503 Unavailable | Upstream down for maintenance | Degradation message; retry-after respected if header present |
| Partial body | Connection drops mid-response | Parse error caught; not a crash; not silent |
| Invalid JSON | Response body is not valid JSON | Parse error caught; logged; user sees error |
| Redirect loop | Upstream keeps redirecting | Limit followed redirects; cycle detected and broken |

## Database operations

| Error state | Cause | What to verify |
|-------------|-------|---------------|
| Unique constraint violation | Duplicate write | 409 or domain error; "already exists" message; no 500 |
| Foreign key violation | Reference to deleted record | Caught at service layer; clear error; no orphan data |
| Connection pool exhausted | Too many concurrent queries | Queued or rejected cleanly; not a deadlock |
| Query timeout | Long-running query | Timeout caught; transaction rolled back; no partial write |
| Disk full | Storage layer failure | Caught; admin alerted; user sees service unavailable |
| Migration not run | Schema mismatch | Column missing error caught early; clear diagnostic |

## File system operations

| Error state | Cause | What to verify |
|-------------|-------|---------------|
| File not found | Path wrong or file deleted | FileNotFoundError caught; not a crash |
| Permission denied | Process lacks read/write access | Error caught; not a crash; admin can diagnose |
| Disk full | No space for write | Write error caught; no partial file left; user notified |
| File locked | Another process holds exclusive lock | Retry or fail gracefully; no deadlock |
| Path traversal | Input contains `../` sequences | Normalized to safe path; escape blocked |

## Authentication / session

| Error state | Cause | What to verify |
|-------------|-------|---------------|
| Token expired | JWT or session past expiry | Redirect to login; session cleared; no data exposed |
| Token tampered | Signature invalid | Rejected with 401; not a 500 |
| CSRF token missing | Form submitted without token | 403; no state change |
| CSRF token reused | Token used twice (replay) | Rejected; one-use tokens invalidated |
| Session fixation | Old session ID reused post-login | New session ID issued on login; old ID invalidated |
| Concurrent logout | Session deleted while request in flight | Request rejected with 401; not a crash |
