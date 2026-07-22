# Phase 1 — Discovery (Stakeholder Mapping) (Medium / Enterprise only)

Small tier already finished in Scale Detection. This phase is for Medium and Enterprise only.

**Goal:** Map every named stakeholder by power, interest, and top uncertainty.

Read: `phases/01-discovery/README.md`
Questions: `phases/01-discovery/questions/phase-questions.md`
Templates: `phases/01-discovery/templates/`
Gate: `phases/01-discovery/gates/gate-checklist.md`

**Phase 1 Gate:**
- **Medium:** Top 3-5 stakeholders named + top uncertainty identified
- **Enterprise:** Every Tier 1 stakeholder named with top uncertainty before proceeding

---

## Scale Branching — After Phase 1 (Medium / Enterprise only)

Small tier already finished in Scale Detection.

### If Medium → Compressed Pipeline (Phases 2-6)

Run Phases 2-6 with these compressions:
- **Phase 2 (Elicitation):** Ask all questions, but output 1-paragraph summary per stakeholder (not formal interview scripts)
- **Phase 3 (Use Cases):** Ask all questions, but output inline summary table (not separate UC-*.md files)
- **Phase 4 (Requirements):** Ask all questions, but output inline FR list + story table (not BRD.md + US-*.md)
- **Phase 5 (UI & Data):** Ask all questions, but output inline screen table + field summary (not separate files)
- **Phase 6 (Architecture):** Ask all questions, but output inline stack table + NFR summary (not separate files)

Write PLAN.md (Medium template) and finish.

**"Expand [phase] to full depth" handler:** If user requests expansion on any phase, re-run that phase at enterprise depth (full questions, full templates, separate files). Regenerate output and update PLAN.md.

### If Enterprise → Full Pipeline (Phases 2-6, unchanged)

Run Phases 2-6 exactly as written below. No compression. All separate files produced.

### If Medium → Compressed Pipeline (all 6 phases)

Show skip summary:
```
Medium project — compressed pipeline.
All 6 phases will run, but output is inline in PLAN.md (no separate files).
Skipping: Separate BRD.md, UC-*.md, US-*.md, NFR.md, Data Dictionary, 
Screen Specs, System Design files.
Full depth available: "expand [phase] to full depth"
```

Run Phases 2-6 with these compressions:
- **Phase 2 (Elicitation):** Ask all questions, but output 1-paragraph summary per stakeholder (not formal interview scripts)
- **Phase 3 (Use Cases):** Ask all questions, but output inline summary table (not separate UC-*.md files)
- **Phase 4 (Requirements):** Ask all questions, but output inline FR list + story table (not BRD.md + US-*.md)
- **Phase 5 (UI & Data):** Ask all questions, but output inline screen table + field summary ( not separate files)
- **Phase 6 (Architecture):** Ask all questions, but output inline stack table + NFR summary ( not separate files)

Write PLAN.md (Medium template) and finish.

### If Enterprise → Full Pipeline (unchanged)

Run Phases 2-6 exactly as written below. No compression. All separate files produced.
