# SRIFLOW_MEMORY.md File Structure

## Pre-compress (canonical)

```markdown
# SRIFLOW_MEMORY — <project name>

## Summary
**Goal:** <the current build goal, one concrete sentence>
**Stack:** <detected or stated tech stack, e.g. "Next.js 14 + Postgres + Vercel">
**Current Stage:** <one of: init | plan | design | build | review | test | ship>
**Last Updated:** <ISO-8601 UTC timestamp, e.g. 2026-06-28T14:32:07Z>
**Key Decisions:**
- D1: <decision and its outcome, with date>
- D2: <decision and its outcome, with date>

**Next Priority:** <the most important thing to do next session, in one line>

## Log
### 2026-06-10T09:15:22Z | sriflow-plan | done | 312s
Branch: main
Session: 45231-1749547822
Completed BA phases 1-4. Auth module scope locked. Postgres chosen over SQLite.

### 2026-06-11T11:03:07Z | sriflow-design | done | 540s
Branch: feat/auth
Session: 45232-1749634987
Wireframes approved. Component spec written to DESIGN.md.

### 2026-06-12T16:22:44Z | sriflow-build | done-with-concerns | 1203s
Branch: feat/auth
Session: 45233-1749742964
JWT auth implemented. Refresh token rotation works. SQL injection concern raised by code review.
```

The `## Log` section is append-only. Newest entries at the bottom. Each entry begins with `### ` followed by the four required fields separated by ` | `.

## Post-compress (canonical)

```markdown
# SRIFLOW_MEMORY — <project name>

## Summary
**Goal:** <preserved from pre-compress — not changed>
**Stack:** <preserved from pre-compress — not changed>
**Current Stage:** <preserved from pre-compress — not changed>
**Last Updated:** <current UTC timestamp at time of compress>
**Key Decisions:**
- D1: <prior decision — preserved verbatim>
- D2: <prior decision — preserved verbatim>
- D3: <new decision extracted during compress — appended>

**Compressed History:** 2026-05-10T09:00:00Z to 2026-06-15T17:42:07Z
From 2026-05-10 to 2026-06-15 (40 entries): <prose summary>.

**Lessons:** <lessons extracted from notes — omit this field entirely if none>
**Next Priority:** <preserved or updated carry-forward action>

## Log (newest 10)
### 2026-06-16T08:11:02Z | sriflow-build | done | 1023s
Branch: feat/payments
Session: 45265-1750057862
Payment module scaffolded. Stripe webhook endpoint tested locally.

### 2026-06-16T14:30:07Z | sriflow-code-review | done-with-concerns | 318s
Branch: feat/payments
Session: 45266-1750078207
Two concerns: missing idempotency key on Stripe charge, rate limiting not implemented.

<... 8 more entries following the same structure>
```

## Initial template (first creation)

The exact file written on first creation. No deviations:

```markdown
# SRIFLOW_MEMORY — <project name>

## Summary
**Goal:** <to be updated>
**Stack:** <to be detected>
**Current Stage:** init
**Last Updated:** <ISO-8601 UTC timestamp>
**Key Decisions:**

**Next Priority:** Run /sriflow-plan to begin.

## Log
```

The `## Log` section is intentionally left empty (no entries) at creation. The first log entry is appended immediately after creation. The blank line after `## Log` is required — it gives the Edit tool a clean target for the first append.
