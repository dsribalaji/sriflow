# Scale Detection

Before any analysis, detect project scale. This determines pipeline depth.

**Auto-detect from user's opening message:**

| Tier | Keywords | Timeline |
|------|----------|----------|
| **Small** | Keywords: "quick", "side project", "hobby", "small", "simple", "weekend", "script", "one-off" | < 1 week |
| **Medium** | Keywords: "team", "startup", "client", "feature", "module", "need by", "users will", "new endpoint", "new page" | 1-4 weeks |
| **Enterprise** | Keywords: "enterprise", "compliance", "multi-team", "department", "audit", "regulatory", "migration", "multiple systems", "organization", "hundreds of users" | 1+ months |

**WARNING: "personal", "for myself", "my own" are NOT Small-tier qualifiers alone.**
Personal projects can be Enterprise-scale. Use effort-estimation question to cross-validate.

**Effort estimation check (required after Q1):**
Before confirming scale, ask effort estimate. User's estimate prevails over keyword hints.

**Keyword priority:** No tier overrides another automatically. Use keyword match as INITIAL HINT only.
| **Mixed/unclear** | Default to Medium | — |

**Keyword priority:** Small keywords override Medium keywords (personal/quick/script are more specific than team/feature). Enterprise keywords override all (compliance/regulatory are more specific). Example: "personal quick script for my team" → Small. "Quick compliance tool" → Enterprise.

If the user can't determine the scale or says "I don't know," default to Medium and proceed.

If THINK_OUTPUT.md exists, read the tier from it. Merge into one confirmation:

```
Think detected **[tier]**. Proceed as [tier], or change?
A) Yes, proceed as [tier] (recommended)
B) Upgrade to [next tier]
C) Downgrade to [lower tier]
D) Skip — run full pipeline regardless
E) I don't know — default to Medium
```

If no THINK_OUTPUT.md exists, auto-detect from opening message and confirm:

```
Based on your answer above, this looks like a **[S/M/E]** project ([timeline]). Correct?
A) Yes, proceed as [S/M/E] (recommended)
B) Upgrade to [next tier]
C) Downgrade to [lower tier]
D) Skip — run full pipeline regardless
E) I don't know — default to Medium
```

**Branch by tier:**

### If Small → Quick Plan (skip Phase 1)

Show skip summary:
```
Small project — quick plan mode.
Skipping: Phase 1 (Discovery), Phase 2 (Elicitation), Phase 3 (Use Cases), 
Phase 4 (BRD/Stories), Phase 5 (UI & Data), Phase 6 (Architecture).
All content will be inline in a single PLAN.md.
You can request any on-demand: "give me the NFR spec", "give me the use cases", 
"give me the user stories"
```

Read from THINK_OUTPUT.md if it exists. Reuse what's available:
- If `## Done =` exists → skip S3 (done criterion already answered)
- If `## Features` exists → skip S1 (features already listed)
- Only ask what's missing from: S1 (features), S2 (tech stack), S3 (done criterion)

Write PLAN.md (Small template) and finish. **Do NOT proceed to Phase 1.**

**Deriving template sections from answers:**
- `## Goal` ← from Q1 (what are we building) + S3 (done criterion)
- `## Features` ← from S1 (feature list)
- `## Tech Stack` ← from S2 (tech stack)
- `## User Stories` ← derive 3-5 from S1 (features) and S3 (done criterion). Format: "As a [user], I want [feature] so that [benefit]. **Done:** [criteria]"
- `## Risks` ← infer top 2 from features and tech stack (e.g., "SQLite may not scale", "No auth = security risk")
- `## Open Questions` ← list any unresolved items from S1/S2/S3

### If Medium → Compressed Pipeline (all 6 phases)

Show skip summary:
```
Medium project — compressed pipeline.
All 6 phases will run, but output is inline in PLAN.md (no separate files).
Condensing: Separate BRD.md → inline FR list. UC-*.md → inline summary table. 
US-*.md → inline story table. NFR.md → inline summary. Data Dictionary → inline.
Full depth available on any phase: "expand [phase] to full depth"
```

Run all 6 phases with all 56 questions, but output inline in PLAN.md (no separate files).

**Mid-pipeline expand:** After each phase completes, if user says "expand [phase]", re-run that phase at enterprise depth (full questions, full templates, separate files) before proceeding to next phase.

### If Enterprise → Full Pipeline (unchanged)

Run all 6 phases. All separate files produced. No compression.
