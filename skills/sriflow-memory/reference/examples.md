# Log Entry Examples

## Complete entry (all fields)

```
### 2026-06-28T14:32:07Z | sriflow-build | done | 847s
Branch: feat/auth-flow
Session: 12345-1751118727
Implemented JWT auth + refresh token rotation. All 47 tests green.
```

## Entry without optional note

```
### 2026-06-28T14:33:51Z | sriflow-memory | done | 12s
Branch: feat/auth-flow
Session: 12346-1751118831
```

## Entry from another skill (sriflow-plan, blocked)

```
### 2026-06-29T09:15:00Z | sriflow-plan | blocked | 203s
Branch: main
Session: 12350-1751188100
Blocked on missing stakeholder requirements for payment module — awaiting input
```

## Entry from code-review with concerns

```
### 2026-06-30T11:45:22Z | sriflow-code-review | done-with-concerns | 318s
Branch: feat/payments
Session: 12360-1751280322
Two concerns: missing idempotency key on Stripe charge, rate limiting not implemented.
```

## Confirmation block (WRITE, no compress)

```
MEMORY UPDATED
════════════════════════════════════════
Skill:    sriflow-build
Outcome:  done
Stage:    build
Entries:  15
File:     SRIFLOW_MEMORY.md
════════════════════════════════════════
```

## Confirmation block (COMPRESS)

```
MEMORY COMPRESSED
════════════════════════════════════════
Entries before compress:  52
Entries summarised:       42
Entries kept verbatim:    10
Decisions extracted:      3
Date range compressed:    2026-05-10T09:00:00Z to 2026-06-15T17:42:07Z
File:                     SRIFLOW_MEMORY.md
════════════════════════════════════════

Run /sriflow-memory to read the updated context.
```

## Context recovery output

```
=== SRIFLOW CONTEXT ===
# SRIFLOW_MEMORY — my-project
## Summary
**Goal:** Build JWT auth with refresh token rotation for the user API.
**Stack:** Next.js 14 + Postgres + Vercel
**Current Stage:** build
**Last Updated:** 2026-06-12T16:22:44Z
**Key Decisions:**
- D1: Postgres over SQLite for auth module (2026-06-10)
- D2: Stateless JWT over Redis sessions (2026-06-11)

**Next Priority:** Fix SQL injection in user_lookup.ts from code review.

## Log (newest 10)
### 2026-06-12T16:22:44Z | sriflow-build | done-with-concerns | 1203s
Branch: feat/auth
Session: 45233-1749742964
JWT auth implemented. Refresh token rotation works. SQL injection concern raised by code review.
...
=== END CONTEXT ===

Current goal: Build JWT auth with refresh token rotation for the user API. Last action: sriflow-build — done-with-concerns on 2026-06-12.
Current stage is `build` — suggested next: `/sriflow-code-review`.
```

## Calling pattern from another skill

```
/sriflow-memory write "sriflow-build | done | 847s | JWT auth complete, refresh token rotation working, all 47 tests green"
```

```
/sriflow-memory write "sriflow-plan | blocked | 203s | Blocked on missing stakeholder requirements for payment module — awaiting input"
```

## AskUserQuestion format (D1 compress example)

```
D1 — Compress memory now?
Branch: main
ELI10: Your log has 25 entries, below the auto-trigger threshold of 50. Compressing
now summarises the oldest entries down to a prose paragraph and keeps the newest 10
verbatim. You permanently lose the raw detail of the summarised entries — they become
one paragraph, not individual timestamped lines.
Stakes if wrong: Compression is irreversible. If you later need to know exactly what
sriflow-build did on 2026-06-12, and that entry was compressed, you only have the
prose summary — not the original entry with its branch, session, and note.
Recommendation: B because the log is small enough that auto-compress will handle it
soon without any action needed.
Completeness: A=7/10, B=10/10
A) Compress now
  ✅ Reduces file size and token overhead immediately — helpful if context is tight.
  ✅ Promotes key decisions from old entries into the Summary section now.
  ❌ Irreversible — old entries become prose only, detail is lost permanently.
  ❌ Premature at 25 entries; the log is still small and readable.
B) Wait until threshold (recommended)
  ✅ Preserves full log detail for debugging and retrospective use this sprint.
  ✅ Auto-compress triggers cleanly at 50 with no extra action needed.
  ❌ File keeps growing; you will need to compress eventually.
Net: Trading raw log detail for token budget. With only 25 entries, the budget
impact is minimal — waiting costs nothing and preserves maximum detail.
```
