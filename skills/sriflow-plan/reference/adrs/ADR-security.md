# ADR Template — Security

Extends `ADR-template.md`. Use for security decisions: auth, data protection, threat handling. Add these blocks between base sections 1 (Context) and 4 (Decision). Security ADRs are reviewed by the security council lens before acceptance.

## 1. Context — security additions

Add:

- Assets in scope (PII, credentials, payment data, IP) and their sensitivity tier.
- Threat model: use STRIDE per component. Name the realistic attackers (script kiddie, malicious insider, credential-stuffing botnet, targeted adversary) and what they would target.
- Compliance obligations (GDPR, SOC2, HIPAA, PCI-DSS) and what they force.
- Current state: what already exists, what is exposed.

## 2. Decision Drivers — security specific

- Data sensitivity and the cost of a breach (regulatory, reputational, recovery).
- Threat surface (public internet vs internal network).
- Operational burden of the control (a control nobody can operate is worse than none).
- Regulatory deadlines.

## 3. Considered Options — security

Evaluate honestly — "no control" is not an option for a named risk:

```
### <Control name — e.g. OAuth2/OIDC, API keys + scopes, mTLS>
Protects against: <threat name>
Implementation cost: <effort>
Operational cost: <rotating, monitoring, supporting>
Residual risk after control: <what remains>
```

## 4. Decision — security additions

State the control set precisely:

```
Authentication: <mechanism, token lifetime, rotation policy>
Authorization: <model — RBAC/ABAC/scopes; where enforced (app, gateway, both)>
Secrets: <store, who can read, rotation cadence, leak response>
Data at rest: <encryption scope + key management>
Data in transit: <TLS version, minimum cipher>
Audit: <what is logged, retention, who has access to logs>
```

## 5. Consequences — security additions

- Operational cost of the controls (key rotation, token lifecycle, on-call for auth incidents).
- User friction introduced (MFA, session timeouts) — name the tradeoff.
- Compliance burden satisfied or deferred — with dates.

## 6. Validation — security additions

- OWASP Top 10 pass: run the relevant checks (zap/trivy/dependency audit) in CI and gate on CRITICAL.
- Auth test matrix: unauthenticated, wrong-scope, expired-token, revoked-token — all must fail closed.
- Pen test or threat-model review of the highest-tier asset before GA.
- Secret scan: CI fails on committed secrets. Test the alert path once.

## Security rules

1. **Fail closed.** On any auth/authorization error, deny. No "log and continue".
2. Secrets never in source, never in logs, never in client bundles. Env/secrets manager only.
3. Rate limit and lockout on all authentication endpoints (credential stuffing defense).
4. Principle of least privilege for both people and services. Default deny.
5. Validate all input at the boundary (injection is an input-validation bug).
6. Security headers set at the edge, tested in CI.
7. Every data-touching feature names its data classification in the story. "No special category data" is a real classification.
8. A breach response is a plan, not a hope: who to call, how to revoke, how to communicate. Write it in the ADR.