# Scale Branching

After scale detection, branch into tier-specific pipeline depth.

## If Small → Quick Plan (skip all phases)

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
- `## Risks` ← infer top 2 from features and tech stack
- `## Open Questions` ← list any unresolved items from S1/S2/S3

## If Medium → Compressed Pipeline (all 6 phases)

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

### Medium Phase Compressions

- **Phase 2 (Elicitation):** Ask all questions, but output 1-paragraph summary per stakeholder (not formal interview scripts)
- **Phase 3 (Use Cases):** Ask all questions, but output inline summary table (not separate UC-*.md files)
- **Phase 4 (Requirements):** Ask all questions, but output inline FR list + story table (not BRD.md + US-*.md)
- **Phase 5 (UI & Data):** Ask all questions, but output inline screen table + field summary (not separate files)
- **Phase 6 (Architecture):** Ask all questions, but output inline stack table + NFR summary (not separate files)

### "Expand [phase] to full depth" handler

If user requests expansion on any phase, re-run that phase at enterprise depth (full questions, full templates, separate files). Regenerate output and update PLAN.md.

## If Enterprise → Full Pipeline (unchanged)

Run all 6 phases exactly as written. No compression. All separate files produced.
