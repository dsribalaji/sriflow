# PLAN_REVIEW.md Template

When all lenses >= 7 (or override confirmed), write PLAN_REVIEW.md:

```markdown
# PLAN_REVIEW.md

Generated: <ISO-8601 timestamp>
Status: <DONE | DONE_WITH_CONCERNS>
Branch: <_BRANCH>
Reviewed: PLAN.md (<N> lines)
Iterations: <count>

---

## Final Scores

| Lens   | Score  | Threshold | Result             |
|--------|--------|-----------|--------------------|
| CEO    | X/10   | 7         | PASS / FAIL        |
| Design | X/10   | 7         | PASS / FAIL        |
| Eng    | X/10   | 7         | PASS / FAIL        |

---

## Iteration History

### Iteration 1 — Initial Review
- CEO: X/10 — <verdict>
- Design: X/10 — <verdict>
- Eng: X/10 — <verdict>
- Changes requested: <what the user asked to change>
- Changes applied: <what was changed in PLAN.md>

### Iteration 2 (if applicable)
- CEO: X/10 — <verdict>
- Design: X/10 — <verdict>
- Eng: X/10 — <verdict>
- Changes requested: <what the user asked to change>
- Changes applied: <what was changed in PLAN.md>

[Continue for each iteration]

---

## Lens 1 — CEO Review (Final)

**Score: X/10**
**Verdict:** <one-line verdict>

### Findings

**BLOCKERs resolved:**
- [BLOCKER]: <finding>. Fix: <action taken>.

**CONCERNs resolved:**
- [CONCERN]: <finding>. Fix: <action taken>.

**CONCERNs remaining (override accepted):**
- [CONCERN]: <finding>. Status: acknowledged, not resolved.

**NOTEs:**
- [NOTE]: <finding>.

### CEO Questions — Final Answers

**Q1 (Right problem?):** <answer>
**Q2 (10-star version?):** <answer>
**Q3 (Narrowest wedge?):** <answer>
**Q4 (Why now?):** <answer>
**Q5 (What does it take to win?):** <answer>
**Q6 (Pivot options?):** <answer>
**Q7 (Moat?):** <answer>

---

## Lens 2 — Design Review (Final)

**Score: X/10**
**Verdict:** <one-line verdict>

### Findings

**BLOCKERs resolved:**
- [BLOCKER]: <finding>. Fix: <action taken>.

**CONCERNs resolved:**
- [CONCERN]: <finding>. Fix: <action taken>.

**CONCERNs remaining (override accepted):**
- [CONCERN]: <finding>. Status: acknowledged, not resolved.

**NOTEs:**
- [NOTE]: <finding>.

### 10/10 Design Criteria — Final Status

| Criterion                              | Status         |
|----------------------------------------|----------------|
| Key flows described end-to-end         | PASS / FAIL    |
| Error states specified                 | PASS / FAIL    |
| Empty states specified                 | PASS / FAIL    |
| Loading/pending states specified       | PASS / FAIL    |
| Mobile-first layout described          | PASS / N/A     |
| Touch targets adequate                 | PASS / N/A     |
| Accessibility baseline specified       | PASS / FAIL    |
| First-time vs returning user          | PASS / FAIL    |
| Edge cases named                       | PASS / FAIL    |
| Visual hierarchy stated                | PASS / FAIL    |
| Navigation model clear                 | PASS / FAIL    |
| Destructive actions confirmed          | PASS / N/A     |
| Success states specified               | PASS / FAIL    |

---

## Lens 3 — Engineering Review (Final)

**Score: X/10**
**Verdict:** <one-line verdict>

### Findings

**BLOCKERs resolved:**
- [BLOCKER]: <finding>. Fix: <action taken>.

**CONCERNs resolved:**
- [CONCERN]: <finding>. Fix: <action taken>.

**CONCERNs remaining (override accepted):**
- [CONCERN]: <finding>. Status: acknowledged, not resolved.

**NOTEs:**
- [NOTE]: <finding>.

### Top 3 Technical Blockers (at final review)

1. <blocker or RESOLVED: <what resolved it>>
2. <blocker or RESOLVED: <what resolved it>>
3. <blocker or RESOLVED: <what resolved it>>

---

## Override Record (only if DONE_WITH_CONCERNS)

| Lens   | Score  | Override? | Unresolved Issues |
|--------|--------|-----------|-------------------|
| CEO    | X/10   | YES / NO  | <issues if any>   |
| Design | X/10   | YES / NO  | <issues if any>   |
| Eng    | X/10   | YES / NO  | <issues if any>   |

User explicitly acknowledged risks and chose to proceed.
Unresolved issues are documented above under "remaining" findings.

---

## Verdict

<If DONE (all lenses >= 7, no override):>
All three lenses passed. PLAN.md is clear for /sriflow-design.

**CLEAR TO /sriflow-design**

<If DONE_WITH_CONCERNS (any override):>
Review complete with override(s). Unresolved issues documented above.
Proceed to /sriflow-design with awareness of flagged gaps.

**CLEAR TO /sriflow-design (WITH CONCERNS — see Override Record)**
```

## Final Signal

After writing PLAN_REVIEW.md, print the appropriate completion signal:

**If all lenses >= 7 and no override:**

```
STATUS: DONE
All three lenses passed.
CEO: X/10 | Design: X/10 | Eng: X/10
PLAN_REVIEW.md written.

CLEAR TO /sriflow-design
```

**If any override:**

```
STATUS: DONE_WITH_CONCERNS
Review complete with override(s).
CEO: X/10 | Design: X/10 | Eng: X/10
Unresolved issues documented in PLAN_REVIEW.md.

CLEAR TO /sriflow-design (WITH CONCERNS)
```
