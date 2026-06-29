# Edge Case Checklist by Input Type

Use this checklist when building the test matrix. Check off each input type
the feature exposes and generate at least one test per row.

## String fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Empty string `""` | Undefined behavior on null split, empty-key DB write | Always |
| Whitespace only `"   "` | Stored as spaces, displays as blank, breaks search | Always |
| At max length | Off-by-one on validation, silent truncation | When field has a limit |
| Over max length by 1 | Truncation vs rejection inconsistency | When field has a limit |
| SQL injection `'; DROP TABLE--` | DB query injection if input not parameterized | Always |
| XSS `<script>alert(1)</script>` | Script execution in browser if output not escaped | Always |
| HTML entities `&amp; &lt; &gt;` | Double-escaping or unescaped display | When rendered in HTML |
| Unicode BMP `日本語` | Encoding errors, byte-vs-char length confusion | When any user input |
| Unicode supplementary `𝄞 🌍` | 4-byte chars break naive `str.length` checks | When emoji/music/math |
| Null byte `\x00` | Truncates C strings; bypasses suffix checks | When touching filesystems |
| Path traversal `../../etc/passwd` | Directory escape if stored as filename | When used in file paths |
| CRLF injection `\r\n` | Log injection, header injection | When written to logs/headers |

## Numeric fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Zero `0` | Divide-by-zero, falsy check treating 0 as empty | Always |
| Negative `-1` | Sign assumption in business logic | When non-negative assumed |
| Max safe integer `2^53 - 1` | Precision loss in JS float arithmetic | Always in JS |
| Max 32-bit int `2147483647` | Integer overflow in DB column | When stored as INT |
| Max 32-bit int + 1 `2147483648` | Overflow wraps to negative | When stored as INT |
| Float `3.14159` | Truncation or rejected where int expected | When field is integer |
| Negative float `-0.001` | Sign and precision both hit | When float expected |
| String `"abc"` in numeric field | Type coercion producing NaN or 0 | Always |
| Extremely large float `1e308` | Infinity, overflow | When float expected |

## Boolean / flag fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| True / false both submitted | Logic branches both tested | Always |
| String "true" / "false" | Type coercion treating string as truthy | When input from form |
| `1` / `0` as boolean | Coercion behavior differs by language | When numeric boolean |
| Missing / undefined | Treated as false vs error | Always |

## Array / list fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Empty array `[]` | Null handling vs empty collection | Always |
| Single item `[x]` | Off-by-one in loop logic | Always |
| Duplicate items `[x, x]` | Dedup logic, constraint violations | When uniqueness expected |
| Very large array (1000+ items) | Memory pressure, timeout, pagination | When unbounded |
| Array with null items `[null, x]` | Null inside collection breaks iteration | Always |

## Date / time fields

| Edge | Risk if missed | Generate test? |
|------|---------------|----------------|
| Unix epoch `1970-01-01T00:00:00Z` | Treated as null/zero in some ORMs | When stored as timestamp |
| Far future `2099-12-31` | Overflow in some date libs | Always |
| Leap day `2000-02-29` | Rejected on non-leap years | When date arithmetic used |
| DST spring-forward `2026-03-08T02:30:00 US/Eastern` | Time doesn't exist; some libs throw | When timezone-aware |
| DST fall-back `2026-11-01T01:30:00 US/Eastern` | Ambiguous time; store UTC to avoid | When timezone-aware |
| Timezone offset `+14:00` / `-12:00` | Date boundary shifts by a full day | When displaying by user tz |
| ISO string with Z vs +00:00 | Parsed differently by some parsers | When both formats accepted |
