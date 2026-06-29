---
name: nfr
version: 2.0.0
phase: "06 — NFR Discovery"
description: >
  Non-Functional Requirements Discovery — Phase 6 of the BA pipeline. Discovers NFRs across
  performance, availability, security, scalability, compliance, maintainability, cost, and
  observability. Every NFR must be numeric, measurable, and traced to a business reason.
  Surfaces conflicts between NFRs and their architecture implications.
  Run after BRD and stakeholder discovery — NFRs are derived from business requirements, not invented.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - define NFRs
  - non-functional requirements
  - quality attributes
  - how fast should it be
  - what's the uptime target
  - what are the ilities
  - security requirements
  - performance targets
  - /nfr
prerequisite: /audit-brd and /discover — BRD must be approved; stakeholder priorities must be mapped
outputs:
  - 06_architecture/nfr-specification.md
  - 06_architecture/conflict-register.md
  - 06_architecture/architecture-implications.md
  - 06_architecture/open-assumptions.md
gate:
  rule: All Tier 1 NFRs are numeric, business-traced, and conflict-free before architecture begins
  signal: DONE when architecture team can make technology choices informed by every binding constraint
---

# /nfr — Non-Functional Requirements Discovery

## When to invoke this skill

Phase 6 of the BA pipeline — the final BA gate before architecture design begins. Use when defining,
extracting, reviewing, or improving Non-Functional Requirements for any system.

**Prerequisite:** Approved BRD (`/audit-brd` complete) and Stakeholder Register (`/discover` complete).
NFRs are derived from business requirements and stakeholder priorities — they are not invented in isolation.

## Core Principle: Constraints Determine Architecture

> "Most developers skip non-functional requirements and pay for them later during production incidents."

NFRs are not documentation polish. They are the constraints that determine which architectures are possible and which aren't. A system that meets every functional requirement but violates its NFRs — too slow, down during peak hours, breached by an attacker, too expensive to run — has failed.

**The rule:** Every NFR must have a specific numeric target AND a business reason for that target. "Fast" is not an NFR. "API response time ≤ 200ms at p95 under 500 concurrent users, because SLA with Enterprise tier guarantees 3-second page load and the frontend adds ~2.8s rendering time" is an NFR.

---

## Step 1 — Extract From BRD (Implicit NFRs)

Business language hides NFRs constantly. Scan the BRD for these patterns and translate immediately:

| Business Language | NFR Type | Translation Question |
|------------------|----------|--------------------|
| "needs to be fast" | Performance | Fast for whom? Under what load? p50/p95/p99 target? |
| "always available" | Availability | What's acceptable downtime per month? 99.9% = 8.7hrs/year. 99.99% = 52min/year. |
| "handles our growth" | Scalability | Today's volume? 12-month projection? Peak load scenario? |
| "secure" / "compliant" | Security / Compliance | Which regulation? GDPR, SOC2, HIPAA, PCI-DSS? What data is in scope? |
| "easy to maintain" | Maintainability | Deploy frequency? Change lead time? Who deploys — DevOps team or BA team? |
| "won't lose data" | Durability | RPO (Recovery Point Objective)? RTO (Recovery Time Objective)? |
| "support future needs" | Extensibility | What features are anticipated? What must not be locked out? |
| "affordable to run" | Cost | Monthly infrastructure budget cap? Cost per transaction ceiling? |
| "know when it breaks" | Observability | What must be logged, traced, alerted? Time-to-detect SLA? |
| "sensitive data" | Data Privacy | Which regulations apply? Who can access what? Retention limits? |

**Output from Step 1:** List of implicit NFRs from BRD, with source quote and NFR type.

---

## Step 2 — Stakeholder NFR Interview

NFRs must be anchored to the person who will be harmed if they're violated. Run targeted questions by stakeholder type:

### Business Owner / Sponsor
- "What does 'unacceptable downtime' mean to your business? When was the last time a system outage cost you money or customers?"
- "If the system slows down significantly at month-end, does that matter? What does it cost you?"
- "What's your monthly infrastructure budget for this system?"

### End User / Operations
- "How long are you willing to wait for a page to load before you lose patience?"
- "How often do you need to use this system at peak? Are there predictable busy periods (end of month, morning rush)?"
- "What would it mean to you if you lost today's work because the system went down?"

### IT / Security Lead
- "What compliance frameworks does the organisation operate under? (SOC2, ISO27001, GDPR, HIPAA, PCI-DSS)"
- "What is our current RTO/RPO for other production systems? Should this system match or exceed that?"
- "What's our tolerance for security incidents on this system? What data classification does this system hold?"

### Legal / Compliance
- "What data does this system process that falls under data protection regulation?"
- "What is the data retention requirement? What is the right-to-erasure requirement?"
- "Does this system need to produce audit logs that are admissible in a legal or regulatory proceeding?"

---

## Step 3 — The NFR Taxonomy (Tier Classification)

Classify every discovered NFR into a Tier based on its architecture impact:

| Tier | Meaning | Examples |
|------|---------|----------|
| **Tier 1 — Architecture-Constraining** | Drives fundamental technology choices. Impossible to add after architecture is decided. | Max latency, data residency, encryption standard, concurrent user ceiling |
| **Tier 2 — Design-Constraining** | Shapes how components are designed but doesn't force a specific technology. | Logging format, session timeout, cache TTL, API rate limits |
| **Tier 3 — Configuration-Level** | Can be set post-build via config, tuning, or ops procedures. | Alert thresholds, backup schedule, deployment window |

**Critical rule:** Tier 1 NFRs must be confirmed and numeric before any architecture decision is made. Changing a Tier 1 NFR after architecture is locked can require a full redesign.

---

## Step 4 — NFR Specification Template

```markdown
---
id: nfr-specification
title: Non-Functional Requirements Specification — [Project Name]
status: DRAFT | UNDER_REVIEW | APPROVED
agent: /nfr
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
traces:
  brd: BRD-v1.0_[ProjectName]
  stakeholders: 01_discovery/stakeholder-register.md
---

# NFR Specification — [Project Name]

---

## Performance

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method | Owner |
|----|--------------|------|----------------|----------------|-------------------|-------|
| NFR-P01 | API response time | T1 | ≤ 200ms at p95 under 500 concurrent users | SLA with Enterprise tier guarantees 3s page load; frontend adds ~2.8s | Load test via k6 against staging | IT Lead |
| NFR-P02 | Page load time | T1 | ≤ 3 seconds on standard 4G | End user survey: >3s = "slow"; impacts adoption | Lighthouse / Core Web Vitals | Product Owner |
| NFR-P03 | Batch export | T2 | ≤ 30 seconds for exports up to 10,000 rows | Users reported abandoning exports >30s in current system | Export E2E test timing | QA Lead |

---

## Availability & Reliability

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method | Owner |
|----|--------------|------|----------------|----------------|-------------------|-------|
| NFR-A01 | System uptime | T1 | 99.9% monthly (≤ 8.7hrs downtime/year) | Customer contract SLA for Enterprise tier | Uptime monitoring (Pingdom / StatusPage) | DevOps |
| NFR-A02 | Recovery Time Objective (RTO) | T1 | ≤ 4 hours after total failure | Ops team can tolerate 4hr manual recovery; beyond that triggers escalation SLA | DR drill results | IT Lead |
| NFR-A03 | Recovery Point Objective (RPO) | T1 | ≤ 1 hour of data loss acceptable | Business loses ≤ 1hr of transactions at worst; daily backup is insufficient | Backup frequency + restore test | DevOps |

---

## Security

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method | Owner |
|----|--------------|------|----------------|----------------|-------------------|-------|
| NFR-S01 | Data encryption at rest | T1 | AES-256 for all PII fields | GDPR Article 32 requires appropriate technical measures | Security audit + DB config review | Security Lead |
| NFR-S02 | Data encryption in transit | T1 | TLS 1.3 minimum | Industry standard; prevents MITM attacks on sensitive data | SSL Labs scan | IT Lead |
| NFR-S03 | Session timeout | T2 | Idle session expires after 30 minutes | Compliance requirement for shared workstations | Automated session test | QA Lead |
| NFR-S04 | Authentication | T1 | MFA required for Admin and Manager roles | SOC2 CC6.1 — privileged access must be protected | Auth audit log review | Security Lead |
| NFR-S05 | Penetration testing | T3 | Annual pen test; critical findings resolved in 30 days | SOC2 CC7.1 — security monitoring and testing | Pen test report | Security Lead |

---

## Scalability

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method | Owner |
|----|--------------|------|----------------|----------------|-------------------|-------|
| NFR-SC01 | Concurrent users | T1 | Support 500 concurrent users at peak with < 10% latency degradation | Current active users: 200; projected 400 in 12 months; 25% safety margin added | Load test at 500 concurrent | IT Lead |
| NFR-SC02 | Data volume | T1 | Must support 1M records in primary entity table without performance degradation | Current: 120K records; 3-year projection: 800K; rounding to 1M | DB benchmark with 1M seed data | IT Lead |
| NFR-SC03 | File storage | T2 | Must support 500GB of attachment storage in year 1 | Current avg: 2MB/record × 120K records = 240GB; 500GB provides 2-year headroom | Storage utilisation monitoring | DevOps |

---

## Compliance & Data Privacy

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method | Owner |
|----|--------------|------|----------------|----------------|-------------------|-------|
| NFR-C01 | Data residency | T1 | All personal data of EU residents stored in EU-region servers | GDPR Chapter V — personal data transfer restrictions | Infrastructure audit | Legal / IT Lead |
| NFR-C02 | Data retention | T2 | User data retained for 7 years; deleted on request within 30 days | GDPR Article 17 (right to erasure); 7-year financial retention requirement | Automated retention audit | Legal |
| NFR-C03 | Audit log | T1 | All create/update/delete actions logged with user ID, timestamp, and before/after state | SOC2 CC7.2 — system activity monitoring; Legal may require logs in proceedings | Log completeness audit | IT Lead |

---

## Maintainability & Operability

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method | Owner |
|----|--------------|------|----------------|----------------|-------------------|-------|
| NFR-M01 | Deployment frequency | T3 | Support ≥ 1 deployment per week without downtime | Product team targets weekly release cycle | CI/CD pipeline metrics | DevOps |
| NFR-M02 | Change lead time | T3 | Code commit to production ≤ 2 hours via CI/CD pipeline | Enables rapid response to production bugs | Pipeline timing metrics | DevOps |
| NFR-M03 | Observability | T2 | All errors logged with stack trace + user context; alert fires within 5 minutes of anomaly | On-call team SLA: acknowledge alert within 15 min; need 5 min detect + 10 min respond | Alert latency monitoring | DevOps |

---

## Cost & Budget

| ID | NFR Statement | Tier | Numeric Target | Business Reason | Measurement Method | Owner |
|----|--------------|------|----------------|----------------|-------------------|-------|
| NFR-CO01 | Monthly infrastructure cost | T2 | ≤ $2,000/month at 500 concurrent users | Finance budget cap for this product line | Monthly cloud cost report | Finance / IT Lead |
| NFR-CO02 | Cost per transaction | T3 | ≤ $0.001 per API call | SaaS pricing model requires margin above $0.005/call | Cost monitoring dashboard | Finance |
```

---

## Step 5 — Conflict Register

When two NFRs cannot both be satisfied simultaneously, register the conflict and force a decision:

```markdown
# NFR Conflict Register

| ID | NFR A | NFR B | Nature of Conflict | Recommended Resolution | Decided by | Decision |
|----|-------|-------|-------------------|----------------------|------------|----------|
| CF-001 | NFR-P01 (≤ 200ms p95) | NFR-S01 (AES-256 encryption) | Encryption adds ~30ms latency per call; may breach 200ms under peak load | Option A: Relax to 250ms. Option B: Offload encryption to edge/CDN layer. | IT Lead + Product Owner | [PENDING] |
| CF-002 | NFR-A01 (99.9% uptime) | NFR-CO01 (≤ $2,000/month) | 99.9% uptime requires multi-AZ setup; estimated cost: $3,200/month | Option A: Accept single-AZ + monitoring; uptime target becomes 99.5%. Option B: Increase budget. | Finance + Product Owner | [PENDING] |
```

**Rule:** Every conflict must have a human decision recorded before architecture work begins. Unresolved conflicts are architecture ambiguities that will surface as production problems.

---

## Step 6 — Architecture Implications

Document what each Tier 1 NFR requires architecturally:

```markdown
# Architecture Implications

| NFR | Architecture Implication | Technology Choices Constrained |
|-----|-------------------------|-------------------------------|
| NFR-P01 (200ms p95) | Requires caching layer; rules out synchronous third-party API calls in the critical path | Must use Redis or equivalent; cannot call payment API inline |
| NFR-A01 (99.9% uptime) | Requires at minimum primary + replica DB setup with automatic failover | Single-node DB ruled out |
| NFR-S04 (MFA for Admin) | Auth service must support MFA; cannot use simple username/password | Must integrate TOTP or WebAuthn-capable identity provider |
| NFR-C01 (EU data residency) | All PII data stores must be provisioned in EU-region; rules out US-only SaaS | No US-only SaaS for PII processing without SCCs |
| NFR-SC01 (500 concurrent users) | Application tier must be horizontally scalable; stateless session handling required | Cannot use in-process session state; must use Redis or DB-backed sessions |
```

---

## Phase Gate

**DONE signal:** All Tier 1 NFRs are numeric, measurable, business-traced, and conflict-free. All conflicts have recorded decisions. Architecture implications are documented. Architecture team can make technology decisions informed by every binding constraint.

**This is the final BA phase gate before architecture design begins.**
