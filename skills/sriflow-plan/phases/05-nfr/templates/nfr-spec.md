# NFR Specification Template

## Performance

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method |
|----|--------------|------|----------------|----------------|-------------------|
| NFR-P01 | API response time | T1 | ≤ 200ms at p95 under [N] concurrent users | [Business reason] | [How measured] |

---

## Availability & Reliability

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method |
|----|--------------|------|----------------|----------------|-------------------|
| NFR-A01 | System uptime | T1 | [X]% monthly | [Business reason] | [Monitoring method] |
| NFR-A02 | RTO | T1 | ≤ [N] hours after total failure | [Business reason] | DR drill results |
| NFR-A03 | RPO | T1 | ≤ [N] hours of data loss acceptable | [Business reason] | Backup frequency |

---

## Security

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method |
|----|--------------|------|----------------|----------------|-------------------|
| NFR-S01 | Data encryption at rest | T1 | [Standard] for all PII fields | [Regulation] | Security audit |
| NFR-S02 | Data encryption in transit | T1 | TLS [version] minimum | [Reason] | SSL scan |

---

## Scalability

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method |
|----|--------------|------|----------------|----------------|-------------------|
| NFR-SC01 | Concurrent users | T1 | Support [N] concurrent users at peak | [Projection] | Load test |

---

## NFR Tiers

| Tier | Meaning |
|------|---------|
| T1 — Architecture-Constraining | Drives fundamental technology choices. Impossible to add after architecture is decided. |
| T2 — Design-Constraining | Shapes component design but doesn't force a specific technology. |
| T3 — Configuration-Level | Can be set post-build via config, tuning, or ops procedures. |
