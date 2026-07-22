# Risk-Based Testing Reference

Prioritize testing effort by risk. High-risk areas get exhaustive coverage.
Low-risk areas get happy-path checks or deferred manual review.

---

## 1. 5×5 Risk Matrix

### Impact Scale

| Score | Label    | Description                                      |
|-------|----------|--------------------------------------------------|
| 1     | Trivial  | No user impact. Cosmetic only.                   |
| 2     | Minor    | Minor inconvenience. Workaround exists.          |
| 3     | Moderate | Partial feature degradation. Some users affected.|
| 4     | Major    | Feature broken for most users. No easy workaround.|
| 5     | Critical | Data loss, security breach, full outage.         |

### Probability Scale

| Score | Label            | Description                              |
|-------|------------------|------------------------------------------|
| 1     | Rare             | <5% chance. Never seen before.           |
| 2     | Unlikely         | 5-20%. Theoretically possible.           |
| 3     | Possible         | 20-50%. Has happened in similar systems. |
| 4     | Likely           | 50-80%. Expected in normal operation.    |
| 5     | Almost Certain   | >80%. Will happen. Known failure mode.   |

### Risk Score Calculation

```
Risk Score = Impact × Probability
```

### Risk Zones

| Score Range | Zone     | Testing Response                           |
|-------------|----------|--------------------------------------------|
| 1–6         | Low      | Happy path only. Defer edge to manual.     |
| 7–12        | Medium   | Happy path + critical edge cases.          |
| 13–19       | High     | Core paths + key edges + error handling.   |
| 20–25       | Critical | Full coverage. Multiple scenarios. Exhaustive. |

---

## 2. Failure Mode Analysis (High/Critical Risks)

Apply to any feature scoring ≥13 on the risk matrix.
Also apply when a single failure causes cascading effects.

### Analysis Questions

1. **What can fail?** — Identify the specific failure mode.
2. **How likely is it?** — Assign occurrence score (1–5).
3. **What's the impact?** — Assign severity score (1–5).
4. **How detectable is it?** — Assign detection score (1–5).

### Detection Scale

| Score | Detection          | Description                                |
|-------|--------------------|--------------------------------------------|
| 1     | Almost Certain     | Automated test catches it.                 |
| 2     | High               | Manual review catches it.                  |
| 3     | Moderate           | Might catch it in QA.                      |
| 4     | Low                | Unlikely to catch before production.       |
| 5     | Almost Impossible  | Silent failure. No signal until后果.        |

### Risk Priority Number (RPN)

```
RPN = Severity × Occurrence × Detection
```

| RPN Range | Action                                          |
|-----------|-------------------------------------------------|
| 1–25      | Standard testing. Monitor.                      |
| 26–64     | Increase coverage. Add specific test cases.     |
| 65–125    | Exhaustive testing. Add monitoring/alerting.    |
| 126–125   | Redesign before shipping. Mandatory review.     |

---

## 3. Coverage Alignment by Risk Zone

### Critical (Score 20–25)

- Full test coverage for every code path
- Multiple scenarios per feature (happy, edge, error, boundary)
- Negative testing: invalid inputs, permission denied, timeout
- Concurrency testing if shared state involved
- Integration tests against all dependent services
- Performance baseline if latency-sensitive
- Security review for auth/data flows

### High (Score 13–19)

- Core happy paths covered
- Key edge cases identified and tested
- Error handling verified (graceful degradation)
- Integration tests for primary dependencies
- Boundary value analysis on inputs

### Medium (Score 7–12)

- Happy path covered
- Critical edge cases tested (most-likely failures)
- Basic error handling (doesn't crash)
- Smoke test level integration

### Low (Score 1–6)

- Happy path only
- Or: defer to manual testing
- Or: cover via existing regression suite if present
- Document known gaps

---

## 4. Integration with sriflow-test

### Step 1b: Tier Selection

Use the risk matrix to determine testing tier for each feature/area:

| Risk Zone | Testing Tier  | Effort Multiplier |
|-----------|---------------|-------------------|
| Critical  | Exhaustive    | 3–5×              |
| High      | Exhaustive    | 2–3×              |
| Medium    | Standard      | 1×                |
| Low       | Quick         | 0.3–0.5×          |

### Tier Application

```
For each feature in scope:
  1. Score risk (Impact × Probability)
  2. Map to zone
  3. Assign tier
  4. Apply coverage rules from §3
  5. Budget time accordingly
```

### Risk-Adjusted QA Report

In `QA_REPORT.md`, add a risk column to test results:

```
| Test              | Result | Risk Zone | Notes        |
|-------------------|--------|-----------|--------------|
| Auth flow         | PASS   | Critical  | Full coverage|
| Profile update    | PASS   | Medium    | Happy path   |
| Theme toggle      | PASS   | Low       | Manual OK    |
```

---

## 5. Integration with sriflow-plan

### Phase 6: Architecture Decisions

Include risk assessment in architecture review:

1. **Identify high-risk components** — What breaks worst?
2. **Score each component** — Use the 5×5 matrix.
3. **Design mitigations** — Fallbacks, circuit breakers, retries.
4. **Document in PLAN.md** — Risk section in architecture chapter.

### Risky Features → Detailed Design Review

Features scoring ≥13 get:
- Separate design review step
- Explicit failure mode discussion
- Monitoring/alerting requirements in design
- Rollback plan documented

### Plan Output Format

```markdown
## Risk Assessment

| Component       | Impact | Probability | Score | Zone     | Mitigation              |
|-----------------|--------|-------------|-------|----------|-------------------------|
| Payment flow    | 5      | 3           | 15    | High     | Retry + idempotency     |
| User profiles   | 3      | 2           | 6     | Low      | Standard CRUD           |
| Real-time sync  | 5      | 4           | 20    | Critical | Fallback to polling     |
```

---

## 6. Reassessment Triggers

Re-evaluate risk scores when:

| Trigger                            | Action                                      |
|------------------------------------|---------------------------------------------|
| New risk discovered during build   | Re-score. Adjust tier if zone changes.      |
| Dependency deprecated              | Increase probability. Re-score.             |
| Test failure in high-risk area     | Investigate. May increase severity/occurrence|
| Production incident                | Re-score affected component immediately.    |
| New integration point added        | Score the integration. Add to matrix.       |
| User reported issue                | Re-score based on real-world impact.        |

### Reassessment Process

```
1. Identify what changed
2. Re-score Impact and/or Probability
3. Recalculate Risk Score
4. If zone changed:
   a. Update testing tier
   b. Add/remove test cases
   c. Update QA_REPORT.md risk column
5. Log reassessment in timeline
```

---

## Quick Reference Card

```
RISK SCORE = Impact(1-5) × Probability(1-5)
  1-6:   Low     → Happy path
  7-12:  Medium  → Happy + critical edges
  13-19: High    → Core + edges + errors
  20-25: Critical → Exhaustive

RPN = Severity × Occurrence × Detection
  1-25:    Standard
  26-64:   Increase coverage
  65-125:  Exhaustive + monitoring
  126+:    Redesign before ship

TIER MAPPING:
  Critical/High → Exhaustive
  Medium → Standard
  Low → Quick
```
