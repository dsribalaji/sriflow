# NFR — Non-Functional Requirements

## Project: Personal Finance Tracker Web App
## Date: 2026-06-28
## Version: 1.0

---

## 1. Performance

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-01.1 | Page load time | Time to interactive | < 2 seconds | User retention — slow pages cause abandonment |
| NFR-01.2 | API response time | Time to first byte | < 200 milliseconds | User productivity — fast entry increases adoption |
| NFR-01.3 | Database query time | Query execution | < 50 milliseconds | Reporting — fast summaries improve UX |
| NFR-01.4 | File upload time | Upload completion | < 5 seconds | Receipt attachment — slow uploads frustrate users |

---

## 2. Availability

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-02.1 | Uptime | Monthly availability | 99.9% (8.76 hours downtime/year) | Team productivity — app must be available during work hours |
| NFR-02.2 | Recovery time | Mean time to recovery | < 5 minutes | Data safety — quick recovery prevents data loss |
| NFR-02.3 | Backup frequency | Backup interval | Daily | Data safety — daily backups prevent data loss |

---

## 3. Security

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-03.1 | Authentication | Login method | Role-based access control | Data privacy — only authorized users access data |
| NFR-03.2 | Data encryption | Encryption standard | AES-256 at rest, TLS 1.3 in transit | Data privacy — protect sensitive financial data |
| NFR-03.3 | Session timeout | Inactive session | 30 minutes | Security — prevent unauthorized access |
| NFR-03.4 | Password policy | Password strength | Min 8 chars, 1 uppercase, 1 number, 1 special | Security — prevent weak passwords |
| NFR-03.5 | Audit logging | Audit trail | All CRUD operations logged | Compliance — track who did what |

---

## 4. Scalability

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-04.1 | Concurrent users | Simultaneous sessions | 10 users | Team size — 4-5 team members plus auditors |
| NFR-04.2 | Data volume | Total expenses | 10,000 records | Growth — 3 years of monthly data at 300 expenses/month |
| NFR-04.3 | Storage capacity | File storage | 1 GB | Receipts — 10,000 receipts at 100KB each |
| NFR-04.4 | Database size | Total DB size | 100 MB | Growth — 10,000 expenses plus metadata |

---

## 5. Cost

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-05.1 | Infrastructure | Hosting cost | $0 (self-hosted) | Budget — no external services |
| NFR-05.2 | Development | Development time | 2 weeks | Timeline — MVP in 2 weeks |
| NFR-05.3 | Maintenance | Ongoing maintenance | 1 hour/week | Sustainability — minimal maintenance overhead |

---

## 6. Usability

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-06.1 | Learning curve | Time to first expense | < 5 minutes | Adoption — quick onboarding increases usage |
| NFR-06.2 | Entry time | Time per expense | < 30 seconds | Productivity — fast entry increases consistency |
| NFR-06.3 | Mobile responsiveness | Screen support | All screen sizes | Accessibility — use on any device |
| NFR-06.4 | Accessibility | WCAG compliance | Level AA | Inclusivity — usable by all team members |

---

## 7. Maintainability

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-07.1 | Code coverage | Test coverage | > 80% | Quality — catch bugs early |
| NFR-07.2 | Documentation | API docs | Complete and current | Maintainability — easy to understand and modify |
| NFR-07.3 | Modularity | Coupling | Low cohesion, high cohesion | Extensibility — easy to add features |

---

## 8. Portability

| ID | Requirement | Metric | Target | Business Trace |
|----|-------------|--------|--------|----------------|
| NFR-08.1 | Browser support | Browser compatibility | Chrome, Firefox, Safari, Edge | Accessibility — use any browser |
| NFR-08.2 | Operating system | OS support | Windows, macOS, Linux | Flexibility — run on any OS |
| NFR-08.3 | Deployment | Deployment method | Docker container | Portability — run anywhere |

---

## Conflicts Resolved

| Conflict | Resolution |
|----------|------------|
| Performance vs Cost | Self-hosted meets both — no external services needed |
| Security vs Usability | Role-based access balances both — simple for users, secure for data |
| Scalability vs Cost | SQLite scales to 10,000 records — meets both targets |

---

## Status

- [x] All NFRs defined with numeric targets
- [x] All NFRs business-traced
- [x] Conflicts resolved
- [x] NFR document complete
