# Post-Plan Actions

## Suggest Review

After PLAN.md is written, suggest review based on tier:

### Small
```
PLAN.md written — quick plan complete.

Next step: /sriflow-build — start building.
Or run /sriflow-plan-review for a quick sanity check (CEO + Eng only).
```

### Medium
```
PLAN.md written — compressed pipeline complete (6/6 phases).

Next step: Run /sriflow-plan-review for a compressed 3-lens quality check.
The review scores the plan 0-10 per lens, blocks if any lens < 7.

Run review now, or proceed to /sriflow-design?
```

### Enterprise
```
PLAN.md written — full pipeline complete (6/6 phases, all GREEN).

Next step: Run /sriflow-plan-review for a 3-lens quality check (CEO + Design + Eng).
The review scores the plan 0-10 per lens, blocks if any lens < 7, and loops until clear.

Run review now, or proceed to /sriflow-design?
```

Do NOT auto-trigger the review. Let the user decide. If they choose to proceed without review, note it in the memory write.

---

## Expand Handler

After DONE signal, if user requests expansion:
- "expand [phase] to full depth" → re-enter skill at that phase, run at enterprise depth, regenerate PLAN.md and separate files
- "expand to full plan" → re-enter skill from Phase 1 at enterprise depth, overwrite PLAN.md
- "give me the NFR spec" → run Phase 5 at enterprise depth, create separate NFR.md
- "give me the use cases" → run Phase 3 at enterprise depth, create separate UC-*.md files
- "give me the user stories" → run Phase 4 at enterprise depth, create separate US-*.md files

---

## Memory Write (run last)

After workflow completion, append to `SRIFLOW_MEMORY.md`:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat >> SRIFLOW_MEMORY.md << MEMEOF

## Current Stage: plan

### $_TIMESTAMP | sriflow-plan | OUTCOME | ${_TEL_DUR}s
Branch: $_BRANCH
Session: $_SESSION_ID
Scale: $SCALE_TIER
Phases completed: [count]
Stakeholders mapped: [count]
Use Cases written: [count]
Stories written: [count]
NFRs documented: [count]
MEMEOF

sriflow-timeline log '{"skill":"sriflow-plan","event":"completed","branch":"'"$_BRANCH"'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","scale":"'"$SCALE_TIER"'"}' 2>/dev/null
```

Replace `OUTCOME` with the actual outcome (done/blocked/concerns).
