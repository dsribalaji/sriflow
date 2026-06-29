---
title: Architecture Implications
phase: 06_architecture
status: DRAFT
agent: /nfr
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
project: [Project Name]
---

# Architecture Implications — [Project Name]

**Purpose:** Translate each Tier 1 NFR into concrete architecture constraints and technology choices.
**Audience:** Architecture team, Tech Lead, Engineering Lead.
**Rule:** This document must be complete before any infrastructure or technology choices are made.
An architecture decision made before reading this document is an assumption, not a decision.

---

## Implications by NFR

| NFR | Tier | Architecture Implication | Technology Choices Constrained | Options Ruled Out |
|-----|------|-------------------------|-------------------------------|-------------------|
| NFR-P01 (≤ 200ms p95 at 500 users) | T1 | Requires caching layer for read-heavy endpoints. Rules out synchronous third-party API calls in the critical request path. Database queries must be indexed; ORM N+1 queries are a hard failure. | Must use Redis or Memcached for hot-path caching. CDN for static assets (essential, not optional). | No third-party API in critical path without caching. No unindexed queries on tables >100K rows. |
| NFR-A01 (99.9% uptime) | T1 | Requires at minimum primary + replica database with automatic failover. Application tier must support blue-green or rolling deployment. Health checks required on all services. | Managed DB service with automatic failover (e.g., RDS Multi-AZ, Cloud SQL HA). Load balancer with health check routing. | Single-node DB without replica. Deployments that require taking the app offline. |
| NFR-A02 (RTO ≤ 4 hours) | T1 | Requires documented and tested disaster recovery runbook. DB restore must be automatable. Infra must be reproducible (IaC). | Terraform/Pulumi/CDK for infrastructure as code. Automated DB snapshot restore tested in DR drill. | Manual-only recovery processes (too slow for 4hr RTO). |
| NFR-A03 (RPO ≤ 1 hour) | T1 | Requires DB backups or WAL streaming at ≤ 1hr intervals. Point-in-time recovery must be enabled. | Continuous WAL archiving (PostgreSQL) or equivalent. Backup frequency: every 60 minutes minimum. | Daily backups only (RPO = up to 24hrs — violates NFR). |
| NFR-S01 (AES-256 at rest) | T1 | All PII columns must be encrypted at rest. If using cloud DB, enable at-rest encryption in the managed service. Key management must use a KMS, not hardcoded keys. | Cloud KMS (AWS KMS, GCP Cloud KMS, Azure Key Vault) for key management. Managed DB encryption enabled at provisioning. | Plaintext PII in any storage layer. Application-managed encryption keys stored in code or config. |
| NFR-S04 (MFA for Admin + Manager) | T1 | Identity provider must support TOTP, WebAuthn, or FIDO2. Auth service cannot be a simple username/password store. SSO integration may be required if org uses an IdP. | Must integrate a MFA-capable IdP: Auth0, Okta, Cognito, or self-hosted Keycloak. Cannot use simple username/password library (e.g., Devise without MFA plugin). | Username/password-only authentication for privileged roles. |
| NFR-SC01 (500 concurrent users) | T1 | Application tier must be horizontally scalable. Session state must be stored externally (not in-process). Auto-scaling must be configured and tested. | External session store: Redis. Container orchestration: Kubernetes or ECS for horizontal scaling. Load balancer with sticky sessions disabled (stateless). | In-process session storage (breaks horizontal scaling). Vertical-scaling-only approach (single large server). |
| NFR-C01 (EU data residency) | T1 | All PII data stores must be provisioned in EU-region cloud resources. Any SaaS tool that processes EU PII must have EU data residency option and a signed DPA. | Cloud region: EU (eu-west-1, europe-west1, etc.). No US-only SaaS for PII storage/processing without Standard Contractual Clauses. | US-only managed services for databases, file storage, or email if they process EU personal data. |
| NFR-C03 (Audit log completeness) | T1 | All create/update/delete operations must be intercepted at the ORM or middleware layer and written to an immutable audit log table. Log cannot be modified by application users. | Audit log table with append-only access (no UPDATE, no DELETE for application users). ORM-level hooks or database triggers for guaranteed capture. | Audit logging via application code alone (too easy to miss or bypass). |

---

## Technology Decisions Required (Pre-Architecture)

The following decisions must be made by the architecture team, informed by the constraints above:

| Decision | Options | Constraint from NFR | Decision owner | Target date |
|----------|---------|---------------------|----------------|-------------|
| Database (primary) | PostgreSQL / MySQL / Cloud-native | NFR-A01 (multi-AZ), NFR-A03 (WAL streaming), NFR-C01 (EU region) | Tech Lead | [Date] |
| Authentication / IdP | Auth0 / Okta / Cognito / Keycloak | NFR-S04 (MFA required) | Tech Lead + Security Lead | [Date] |
| Session store | Redis / ElastiCache / Upstash | NFR-SC01 (stateless horizontal scaling), NFR-P01 (session lookup speed) | Tech Lead | [Date] |
| Infrastructure as Code | Terraform / Pulumi / CDK | NFR-A02 (reproducible infra for DR) | DevOps Lead | [Date] |
| CDN / edge layer | CloudFront / Fastly / Cloudflare | NFR-P02 (page load ≤ 3s) | Tech Lead | [Date] |
| Container orchestration | Kubernetes / ECS / Cloud Run | NFR-SC01 (horizontal scaling), NFR-A01 (zero-downtime deploy) | DevOps Lead | [Date] |

---

## Open Architecture Items

| Item | Question | NFR link | Owner | Target date |
|------|----------|----------|-------|-------------|
| ARCH-001 | [Open architecture question that needs resolution] | NFR-### | [Name] | [Date] |

---

## Notes

**[YYYY-MM-DD]:** [Notes from architecture review sessions]
