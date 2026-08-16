# Council Lens — Security Review

Domain lens applied by the plan reviewer to every plan, mandatory on any plan touching user data, auth, payments, or the public internet. Grounded in OWASP Top 10 and STRIDE. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's security posture** — threat model, authentication, authorization, data protection, and input handling — before the design commits to it. Security designed in is cheap; security bolted on is an emergency.

## What to check

### Threat model
- [ ] STRIDE per component: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege. Each threat assigned to a component.
- [ ] Assets classified: PII, credentials, payment data, business IP — with sensitivity tiers.
- [ ] Attackers named: credential-stuffing botnets, malicious insiders, untrusted tenants, targeted adversaries. What would each realistically take?

### Authentication
- [ ] Auth mechanism chosen with a reason: OAuth2/OIDC, session-based, API keys + scopes. Password storage: a proper KDF (argon2/bcrypt/scrypt), never a plain hash, never plaintext.
- [ ] Token lifecycle: expiry, revocation, rotation. Refresh tokens named and protected.
- [ ] Rate limiting + lockout on auth endpoints (credential stuffing is the default attack, not a corner case).
- [ ] Session security: HttpOnly cookies, SameSite, secure flag.

### Authorization
- [ ] Authz model named: RBAC, ABAC, scopes, or RLS (Supabase). Default deny stated.
- [ ] **Every endpoint/data access maps to an authz check.** An "open by default" internal API that happens to be reachable is a finding.
- [ ] Row-level security where the store supports it; tenant isolation tested as a matrix, not an assumption.

### Input and injection
- [ ] Input validation at every trust boundary: parameterized queries (SQL injection), encoding (XSS), validation of file uploads (magic bytes + size + type), no command injection (shell with user input = blocker).
- [ ] CSRF protection for state-changing requests on cookie-auth apps.
- [ ] Deserialization of untrusted data: strict schemas, no magic deserialization (pickle/yaml.load on untrusted input is a blocker).

### Secrets and data protection
- [ ] Secrets in a secrets manager, not source, not config in git, not client bundles. Rotation cadence stated.
- [ ] Encryption at rest for sensitive tiers (and who holds the keys — KMS, not the app process if avoidable).
- [ ] TLS in transit with minimum version. No plaintext protocols in the design.
- [ ] Logging: sensitive data (tokens, PII, passwords) never logged; log retention and access controls named.

### Dependencies and supply chain
- [ ] Dependency audit tooling in CI (OSV/trivy/npm audit/cargo audit) gating on known CVEs — see the tooling ADR.
- [ ] Lockfiles committed; dependency pinning policy stated.
- [ ] If the plan inherits open-source components with security-sensitive surface, the maintenance posture is named.

### Operational security
- [ ] Security headers set at the edge and tested (CSP, HSTS, X-Content-Type-Options).
- [ ] The plan's incident response: who is called, how access is revoked, how users are told.
- [ ] Compliance obligations named if applicable (GDPR/SOC2/PCI) — and which design decisions they force.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| No threat model | Controls chosen reactively, gaps found by attackers | Burn at breach |
| Password hashing wrong | Plain MD5/SHA — cracked in minutes | Burn at breach |
| Open-by-default API | Tenant data reachable with a guessed ID | Burn at breach |
| Injection via ORM assumption | "We use an ORM so we're safe" — dynamic SQL slips in | Burn at breach |
| Secrets in git | Credentials in history, rotated only at panic | Burn at incident |
| No rate limiting on auth | Account takeover via stuffing | Burn at breach |

## Verdict guidance

- **9-10**: full threat model, authn/authz mapped to every surface, injection/deserialization addressed, secrets + encryption policy, CI security gates.
- **7-8**: solid security plan; one soft spot (e.g. incident response unstated, a sensitive asset unclassified).
- **5-6**: auth handled but threat model, injection, or secrets posture missing.
- **3-4**: security treated as "we'll handle it during implementation" — undefined authz, no input validation plan.
- **0-2**: plan ships known holes (plaintext passwords, open endpoints, secrets in config).

**Block (score < 7) when:**
- Authentication or authorization is undefined for a product storing user data.
- Password hashing or session management is designed unsafely.
- Untrusted input reaches SQL, shell, or deserializers without a validation plan.
- Secrets are planned to live in source/config.

**Findings output format:**
```
security-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```

Security findings never carry a NOTE downgrade on data exposure — a data-exposure risk is at minimum a CONCERN, and a real exposure path is a BLOCKER.