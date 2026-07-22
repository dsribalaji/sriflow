# Write CODE_REVIEW.md (Details)

Write `CODE_REVIEW.md` in the repo root. Overwrite any existing file.

## CODE_REVIEW.md Template

```markdown
# Code Review

Branch: <_BRANCH>
Base: <base>
Reviewed: <ISO 8601 timestamp>
Diff: <_DIFF_STAT from preamble>

---

## Summary

| Lens | CRITICAL | WARN | NITPICK |
|------|----------|------|---------|
| Correctness | N | N | N |
| SQL Safety | N | N | N |
| Security (OWASP) | N | N | N |
| LLM Trust | N | N | N |
| Complexity | N | N | N |
| Trim Audit | N | N | N |
| **Total** | **N** | **N** | **N** |

---

## CRITICAL (<N> findings — blocks /sriflow-ship)

<!-- If zero: -->
(none)

<!-- If findings exist: one per line in exact format -->
- `path/file.ext:LINE` [LENS] — <problem>. Fix: <specific action>.

---

## WARN (<N> findings)

<!-- If zero: -->
(none)

<!-- If findings exist: -->
- `path/file.ext:LINE` [LENS] — <problem>. Fix: <specific action>.

---

## NITPICK (<N> findings)

<!-- If zero: -->
(none)

<!-- If findings exist and were auto-fixed: -->
- `path/file.ext:LINE` [LENS] — <problem>. Auto-fixed.

<!-- If findings exist and were NOT auto-fixed: -->
- `path/file.ext:LINE` [LENS] — <problem>. Fix: <specific action>.

---

## Scope

<1-2 sentences: what files changed, what the diff accomplishes>

---

## Lens Notes

<Any lens that had no applicable code — e.g. "SQL SAFETY: no database queries in diff." or "LLM TRUST: no LLM integration in diff.">

---

## Verdict

<!-- One of: -->
**BLOCKED** — <N> CRITICAL finding(s) must be resolved before /sriflow-ship.

**DONE_WITH_CONCERNS** — <N> WARN finding(s). No CRITICALs. Clear to /sriflow-ship with awareness.

**DONE** — No CRITICAL or WARN findings. Clear to /sriflow-ship.
```

Fill every section. If a section is empty, write `(none)`. Do not omit sections.

---

## Verdict Gate Logic

**BLOCKED — if any CRITICAL finding is open:**
```
STATUS: BLOCKED
REASON: <N> CRITICAL finding(s) in CODE_REVIEW.md must be fixed before /sriflow-ship.
ATTEMPTED: All 6 lenses applied. CODE_REVIEW.md written.
RECOMMENDATION: Fix each CRITICAL finding below, then re-run /sriflow-code-review or proceed directly to /sriflow-ship once resolved.
```

**DONE_WITH_CONCERNS — if WARNs exist but no open CRITICALs:**
```
STATUS: DONE_WITH_CONCERNS
REASON: <N> WARN finding(s). No CRITICALs. CODE_REVIEW.md written.
RECOMMENDATION: Review the WARNs. Clear to /sriflow-ship with awareness of the risks listed.
```

**DONE — if no CRITICALs and no WARNs:**
```
STATUS: DONE
REASON: No CRITICAL or WARN findings. CODE_REVIEW.md written.
RECOMMENDATION: Clear to /sriflow-ship.
```
