# Output Summary, UX Principles & Phase Resumption

## Output Summary

After Phase 4 completes, print the output summary:

```
/sriflow-design complete.

DESIGN.md: <absolute path>

HTML mockups:
- design/<slug>.html — <Screen Name>
- design/<slug>.html — <Screen Name>
- design/<slug>.html — <Screen Name>
(list all files)

Total review findings fixed: <N>
Review result: CLEAN (or: DONE_WITH_CONCERNS — <list exceptions>)

CLEAR TO /sriflow-build
```

---

## UX Principles — Applied Throughout

These are not preferences. They are observed behavior patterns. Apply them in every phase.

**Users scan, they don't read.** Design for scanning: visual hierarchy (prominence = importance), clearly defined areas, headings and lists. Billboard design: if a user going 60mph can't identify what page they're on and what they can do, the layout has failed.

**Users satisfice.** They pick the first reasonable option, not the best. Make the right choice the most visible choice. If everything shouts, nothing is heard.

**Clicks don't matter, thinking does.** Three unambiguous clicks beat one click that requires thought. Navigation must answer: What site is this? What page am I on? What can I do here?

**Mobile: same rules, higher stakes.** No hover-to-discover affordances on mobile — hover doesn't exist. Touch targets: 44px minimum. Flat design that strips visual cues for interactivity fails on mobile.

**Goodwill reservoir.** Users start with goodwill. Every friction point drains it. Hiding information, punishing formatting, unnecessary fields, forced tours — all drain it. Obvious paths, upfront disclosure, easy error recovery — replenish it.

**Clarity over consistency.** If making something significantly clearer requires making it slightly inconsistent, choose clarity.

---

## Notes for Phase Resumption

If the user resumes a session mid-pipeline (e.g., after a break or context compaction), check `SRIFLOW_MEMORY.md` and `design/` to determine what phase was last completed:

```bash
# Check what exists
ls design/ 2>/dev/null && echo "design/ dir exists"
[ -f "DESIGN.md" ] && echo "DESIGN.md exists" || echo "DESIGN.md missing"
ls design/*.html 2>/dev/null | head -10

# Check memory
grep "Phase completed:" SRIFLOW_MEMORY.md 2>/dev/null | tail -3
```

Determine the correct resume point:
- No `DESIGN.md`, no `design/`: resume from Phase 1.
- `DESIGN.md` exists, no `design/`: resume from Phase 3 (wireframe was approved).
- `design/` has HTML files, last memory entry says "Phase 3": resume from Phase 4.
- Last memory entry says "Phase 4": ask the user if they want to re-run the review or proceed to build.

Announce the resume point: "Resuming at Phase <N>: <reason>." Then continue.
