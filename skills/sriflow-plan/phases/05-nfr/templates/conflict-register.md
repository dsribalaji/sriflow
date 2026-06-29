# NFR Conflict Register Template

## Conflict Tracking

| ID | NFR A | NFR B | Nature of Conflict | Recommended Resolution | Decision | Status |
|----|-------|-------|-------------------|----------------------|----------|--------|
| CF-001 | [NFR-###] | [NFR-###] | [Why both can't be satisfied simultaneously] | [Options A/B] | | Open/Resolved |

---

## Common NFR Conflicts

| Conflict Type | Example | Resolution Approaches |
|--------------|---------|----------------------|
| Performance vs. Security | Encryption adds latency | Tier by risk, optimize hot paths |
| Availability vs. Cost | 99.99% requires redundancy | Business impact analysis |
| Scalability vs. Consistency | Distributed systems trade-offs | CAP theorem decisions |
| Speed vs. Completeness | Fast MVP vs. full features | Phased delivery |

---

## Resolution Process

1. **Identify:** Which NFRs conflict?
2. **Analyze:** What's the business impact of each?
3. **Options:** What are the resolution approaches?
4. **Decide:** Which approach does the business prefer?
5. **Document:** Record the decision and rationale
6. **Track:** Monitor for regressions

---

## Conflict Resolution Template

### CF-[###] — [Conflict Title]

**Conflicting NFRs:**
- NFR-A: [Description]
- NFR-B: [Description]

**Nature of Conflict:**
[Why both can't be satisfied simultaneously]

**Resolution Options:**
- Option A: [Description] — Pros/Cons
- Option B: [Description] — Pros/Cons

**Decision:**
[Which option was chosen and why]

**Decision Maker:** [Name]
**Date:** [Date]
