# Council Lens — Java Review

Domain lens applied by the plan reviewer when the plan's stack is Java/Spring. Checks the plan for Java-specific risks: build system, Spring idioms, DI, transactions, and the JVM's heavyweight nature. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's Java choices** so classic Java/Spring failure modes are designed out before build.

## What to check

### Build and JDK
- [ ] JDK version pinned (LTS preferred: 17 or 21) with a reason.
- [ ] Build tool chosen (Maven or Gradle) and the dependency hygiene plan: reproducible builds (Gradle wrapper / Maven wrapper committed), dependency locking.
- [ ] Build speed acknowledged — a Java cold build is minutes, not seconds. CI parallelization and incremental build in the plan?
- [ ] One module or multi-module? Multi-module justified by actual boundaries, not ceremony.

### Spring specifics
- [ ] If Spring Boot: version pinned, and the plan names the autoconfiguration risks it will manage (component scan overreach, hidden configuration via annotations).
- [ ] DI style: constructor injection (mandatory deps) vs field injection — constructor injection should be the default; field injection hides dependencies and breaks tests.
- [ ] Configuration externalization: `@ConfigurationProperties` typed config over `@Value` sprinkling. Secrets through environment, not config files.
- [ ] Bean lifecycle hazards named: eager vs lazy init, circular dependencies (usually a design smell), singleton state.

### Transactions and data
- [ ] Transaction boundaries are deliberate — where `@Transactional` goes and what it actually protects (DB transaction scope vs method scope). A `@Transactional` on a method that spans a slow HTTP call is a plan-level hazard.
- [ ] Data access: JPA/Hibernate vs JDBC/Jooq vs MyBatis — named with a reason. JPA's N+1 query hazard is acknowledged with a mitigation (fetch strategies, query batching).
- [ ] Connection pool configured (HikariCP) — pool size vs DB max connections reconciled. The classic "20 services × 10 pool = DB exhausted" math is checked.
- [ ] Migrations: Flyway/Liquibase with forward-only policy, no schema drift.

### Concurrency
- [ ] Threading model: Spring MVC (thread-per-request) vs WebFlux (reactive) — named deliberately. Thread-per-request is the sane default; WebFlux has a learning cliff.
- [ ] Shared mutable state across threads: `SimpleDateFormat`, static `HashMap` — named as hazards.
- [ ] If async is planned: `@Async` with a thread pool executor configured, not the default single-thread executor.

### Null and error handling
- [ ] Null-safety posture: Optional for return values, `@NonNull`/`@Nullable` or Kotlin-style avoidance. No silent null returns in the design.
- [ ] Exceptions: checked vs unchecked policy named; a global `@ControllerAdvice` error mapping with a stable error envelope (aligns with the API-design ADR).
- [ ] No catch-and-ignore in the design language.

### Testing realism
- [ ] Test plan: unit (JUnit 5) + integration (Testcontainers for real DB) + contract tests. MockMvc/TestRestTemplate for the web layer.
- [ ] Spring context loading is slow — test slicing (`@WebMvcTest`, `@DataJpaTest`) to keep the suite fast is in the plan.
- [ ] CI gate on test time (a Java suite that takes 20+ minutes will be skipped by humans).

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Field injection | Hidden deps, untestable classes | Burn at every test |
| `@Transactional` overreach | Long transactions holding DB locks, deadlocks | Burn at load test / prod |
| JPA N+1 | Every list screen fires a query per row | Burn at test / prod |
| Pool exhaustion | App "hangs" under normal load, DB maxed | Burn at prod |
| Slow test suite | Tests skipped, regressions ship | Burn at build |
| Unpinned JDK | CI vs prod runtime mismatch | Burn at ship |

## Verdict guidance

- **9-10**: JDK pinned, DI style explicit, transaction boundaries mapped, pool math done, test slicing planned.
- **7-8**: solid Spring plan; one soft spot (e.g. N+1 acknowledged but mitigation vague).
- **5-6**: framework chosen but classic hazards unaddressed (no transaction plan, no pool sizing).
- **3-4**: Java-as-legacy-CRUD thinking — no DI policy, no test strategy, build ignored.
- **0-2**: plan will fight the platform (WebFlux without a reason, circular design, no migration plan).

**Block (score < 7) when:**
- Transactions span slow external calls or are unplanned entirely.
- JPA is chosen and the N+1/query hazard is not addressed.
- No connection-pool sizing against the DB.

**Findings output format:**
```
java-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```