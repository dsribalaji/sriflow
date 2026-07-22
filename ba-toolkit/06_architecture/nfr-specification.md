---
title: NFR Specification
phase: 06_architecture
status: DRAFT
verdict: RED
agent: /nfr
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
traces:
  brd: "04_requirements/brd/BRD-v1.0_[ProjectName].md"
  stakeholders: "01_discovery/stakeholder-register.md"
---

# NFR Specification — [Project Name]

**Rule:** Every NFR must have a numeric target AND a business reason. "Fast" is not an NFR.
**Tier 1 NFRs drive architecture choices and must be confirmed before any technology decision is made.**

---

## Performance

| ID | NFR Statement | Tier | Target | Business Reason | Measurement Method | Owner | Status |
|----|--------------|------|--------|----------------|-------------------|-------|--------|
| NFR-P01 | API response time | T1 | ≤ 200ms at p95 under 500 concurrent users | SLA with Enterprise tier guarantees 3s page load; frontend adds ~2.8s rendering | Load test via k6 against staging environment | IT Lead | 🔴 UNCONFIRMED |
| NFR-P02 | Page load time (Time to Interactive) | T1 | ≤ 3 seconds on standard 4G connection | User research: >3s = "slow" in exit surveys; impacts adoption rate | Lighthouse / Core Web Vitals in CI | Product Owner | 🔴 UNCONFIRMED |
| NFR-P03 | Batch export generation | T2 | ≤ 30 seconds for exports up to 10,000 rows | Users abandon exports after 30s in current system (observed in usability testing) | E2E export timing test | QA Lead | 🔴 UNCONFIRMED |

---

## Availability & Reliability

| ID | NFR Statement | Tier | Target | Business Reason | Measurement Method | Owner | Status |
|----|--------------|------|--------|----------------|-------------------|-------|--------|
| NFR-A01 | System uptime | T1 | 99.9% monthly (≤ 8.7 hours downtime/year) | Enterprise client SLA; below 99.9% triggers contract penalty | Uptime monitoring dashboard (e.g., Pingdom) | DevOps | 🔴 UNCONFIRMED |
| NFR-A02 | Recovery Time Objective (RTO) | T1 | ≤ 4 hours after total system failure | Ops team can execute manual recovery in 4hrs; beyond that triggers executive escalation | Disaster recovery drill results | IT Lead | 🔴 UNCONFIRMED |
| NFR-A03 | Recovery Point Objective (RPO) | T1 | ≤ 1 hour of data loss acceptable | Business can re-enter up to 1hr of transactions; daily backup is insufficient | Backup frequency verification + restore test | DevOps | 🔴 UNCONFIRMED |

---

## Security

| ID | NFR Statement | Tier | Target | Business Reason | Measurement Method | Owner | Status |
|----|--------------|------|--------|----------------|-------------------|-------|--------|
| NFR-S01 | Data encryption at rest | T1 | AES-256 for all PII fields | GDPR Article 32 requires appropriate technical measures for personal data | Security audit + DB config review | Security Lead | 🔴 UNCONFIRMED |
| NFR-S02 | Data encryption in transit | T1 | TLS 1.3 minimum | Industry standard; prevents MITM attacks on sensitive data | SSL Labs scan (A+ rating) | IT Lead | 🔴 UNCONFIRMED |
| NFR-S03 | Session timeout | T2 | Idle session expires after 30 minutes | Compliance requirement for shared workstations; confirmed by Legal | Automated session timeout test | QA Lead | 🔴 UNCONFIRMED |
| NFR-S04 | Multi-factor authentication | T1 | MFA required for Admin and Manager roles | SOC2 CC6.1 — privileged access must require additional authentication | Auth audit log review | Security Lead | 🔴 UNCONFIRMED |

---

## Scalability

| ID | NFR Statement | Tier | Target | Business Reason | Measurement Method | Owner | Status |
|----|--------------|------|--------|----------------|-------------------|-------|--------|
| NFR-SC01 | Concurrent users | T1 | 500 concurrent users with < 10% latency degradation vs. baseline | Current: 200 active users; projected 400 in 12 months; 25% safety margin added | Load test at 500 concurrent (k6 or Locust) | IT Lead | 🔴 UNCONFIRMED |
| NFR-SC02 | Primary data volume | T1 | 1M records in primary entity table without performance degradation | Current: ~120K records; 3-year projection: 800K; rounding to 1M for margin | DB benchmark test with 1M seed rows | IT Lead | 🔴 UNCONFIRMED |

---

## Compliance & Data Privacy

| ID | NFR Statement | Tier | Target | Business Reason | Measurement Method | Owner | Status |
|----|--------------|------|--------|----------------|-------------------|-------|--------|
| NFR-C01 | Data residency | T1 | All EU personal data stored in EU-region servers | GDPR Chapter V — personal data transfer restrictions | Infrastructure provisioning audit | Legal / IT Lead | 🔴 UNCONFIRMED |
| NFR-C02 | Data retention | T2 | User data retained for 7 years; deletion on request within 30 days | GDPR Article 17 (right to erasure); 7-year financial retention requirement | Automated retention audit + manual spot check | Legal | 🔴 UNCONFIRMED |
| NFR-C03 | Audit log completeness | T1 | All create/update/delete actions logged with: user ID, timestamp, before state, after state | SOC2 CC7.2 — system activity monitoring; logs may be required in legal proceedings | Log completeness audit (random sampling) | IT Lead | 🔴 UNCONFIRMED |

---

## Maintainability & Operability

| ID | NFR Statement | Tier | Target | Business Reason | Measurement Method | Owner | Status |
|----|--------------|------|--------|----------------|-------------------|-------|--------|
| NFR-M01 | Deployment frequency | T3 | Support ≥ 1 no-downtime deployment per week | Product team targets weekly release cycle; current system requires weekend maintenance window | CI/CD pipeline metrics | DevOps | 🔴 UNCONFIRMED |
| NFR-M02 | Incident detection | T2 | Alerts fire within 5 minutes of anomaly | On-call SLA: acknowledge within 15 min; need 5 min detect + 10 min respond time | Alert latency monitoring | DevOps | 🔴 UNCONFIRMED |

---

## Cost & Budget

| ID | NFR Statement | Tier | Target | Business Reason | Measurement Method | Owner | Status |
|----|--------------|------|--------|----------------|-------------------|-------|--------|
| NFR-CO01 | Monthly infrastructure cost | T2 | ≤ $[X,XXX]/month at 500 concurrent users | Finance budget cap for this product line; confirmed by [Finance Owner] on [Date] | Monthly cloud cost report | Finance / IT Lead | 🔴 UNCONFIRMED |

---

## Confirmation Log

After stakeholder review, update each NFR's status:

| ID | Confirmed value | Confirmed by | Date | Notes |
|----|----------------|--------------|------|-------|
| NFR-P01 | [Confirmed target] | [Name] | [Date] | [Any changes from initial estimate] |
