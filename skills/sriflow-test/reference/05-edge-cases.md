# Step 4 — Category 2: Edge Cases (Details)

Edge Cases find the gaps in happy-path assumptions. Run these systematically.
A failure here is not a blocker unless it corrupts data or causes security issues,
but it must be documented.

If an Edge Case test cannot run because the feature is not implemented, mark it
as SKIP with note "feature not implemented — re-run after build". Only implemented
features can produce Edge Case failures.

## String inputs

For every string input the feature accepts:

- Empty string `""` — graceful rejection or defined empty-state behavior
- Whitespace-only `"   "` — treated as empty OR rejected, not silently accepted
- Max length — accepted without truncation or error
- Over max length by 1 — rejected with clear error OR silently truncated per spec
- SQL injection `"'; DROP TABLE users; --"` — treated as literal string, no DB error
- XSS string `"<script>alert('xss')</script>"` — rendered as escaped text
- Unicode and emoji — stored and returned correctly, no encoding errors
- Null byte `"hello\x00world"` — handled without crash, stripped or rejected

## Numeric inputs

For every numeric input the feature accepts:

- Zero `0` — handled per spec (may be valid or invalid)
- Negative `-1` — rejected if spec requires positive
- Maximum integer `2147483647` — no overflow
- Float where integer expected `3.14` — truncated, rounded, or rejected per spec
- Non-numeric string `"abc"` — type error caught, clear rejection

## File inputs (if applicable)

Skip if the feature does not handle file uploads or reads.

- Empty file (0-byte) — rejected with clear error, no crash
- Max size file — accepted without error
- Over size limit by 1 byte — rejected with clear error message
- Wrong file type — rejected before processing, no crash
- Corrupted file — parse error caught, not a crash

## Time and date inputs (if applicable)

Skip if the feature does not handle dates or times.

- Past date (1970-01-01) — accepted or rejected per spec, never crashes
- Far future date (2099-12-31) — accepted or rejected per spec, no overflow
- DST transition moment — stored in UTC, retrieved in correct local time
- Timezone edge case (UTC+14 and UTC-12) — no date boundary shift

## Concurrent actions (if applicable)

Skip if the feature is read-only or has no concurrency surface.

- Rapid repeat submission (double-submit) — idempotent OR rejected, no duplicate data
- Concurrent conflicting writes — last write wins OR conflict detected, no corruption

## Edge Case Checklist by Input Type

Use this checklist when building the test matrix.

### String fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Empty string | Undefined behavior on null split | Always |
| Whitespace only | Stored as spaces, breaks search | Always |
| At max length | Off-by-one on validation | When field has limit |
| Over max length | Truncation vs rejection inconsistency | When field has limit |
| SQL injection | DB query injection | Always |
| XSS | Script execution in browser | Always |
| Unicode BMP | Encoding errors | When any user input |
| Unicode supplementary | 4-byte chars break str.length | When emoji/math |
| Null byte | Truncates C strings | When touching filesystems |
| Path traversal | Directory escape | When used in file paths |
| CRLF injection | Log/header injection | When written to logs/headers |

### Numeric fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Zero | Divide-by-zero | Always |
| Negative | Sign assumption | When non-negative assumed |
| Max safe integer | Precision loss in JS | Always in JS |
| Max 32-bit int | Integer overflow in DB | When stored as INT |
| Float where int expected | Truncation | When field is integer |
| String in numeric field | Type coercion | Always |

### Boolean / flag fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| True / false both | Logic branches both tested | Always |
| String "true"/"false" | Type coercion | When input from form |
| 1 / 0 as boolean | Coercion differs by language | When numeric boolean |
| Missing / undefined | Treated as false vs error | Always |

### Array / list fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Empty array | Null handling vs empty collection | Always |
| Single item | Off-by-one in loop logic | Always |
| Duplicate items | Dedup logic, constraints | When uniqueness expected |
| Very large array | Memory pressure, timeout | When unbounded |
| Array with null items | Null breaks iteration | Always |

### Date / time fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Unix epoch | Treated as null/zero | When stored as timestamp |
| Far future | Overflow in date libs | Always |
| Leap day | Rejected on non-leap years | When date arithmetic used |
| DST spring-forward | Time doesn't exist | When timezone-aware |
| DST fall-back | Ambiguous time | When timezone-aware |
| Timezone offset extremes | Date boundary shifts | When displaying by user tz |
