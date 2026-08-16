# Pattern — Test Infrastructure

The reproducible harness the QA skill's tests run in: framework choice, fixtures, mock data, and CI wiring. Test infrastructure is the part of testing that is decided once and trusted forever — it must be boring, fast, and deterministic.

## Framework selection

- **Node/TS:** Vitest (default — fast, ESM-native, matches Vite projects) or Jest for legacy setups. Playwright for E2E.
- **Python:** pytest (default) + pytest-cov. tox/nox only if multi-version is a real requirement.
- **Go:** stdlib `testing` + table-driven tests (see the Go council lens).
- **Rust:** `#[test]` + `proptest` for property-based data tests.
- **Java/Kotlin:** JUnit 5 + Testcontainers for real-DB integration tests.

One framework per language, pinned, with a committed lockfile. A second framework needs a written reason (E2E frameworks are the legitimate second).

## Fixtures and mock data

### Fixture rules
- Fixtures live next to the tests they serve (or in a shared `fixtures/`), versioned like code.
- Realistic content: real-looking names, real-shaped data — mock data that is obviously fake (`user1`, `test123`) hides bugs that real data shape would expose (length, encoding, casing).
- Fixtures are immutable — a test that edits a shared fixture corrupts it for every other test. Copy before mutating, or use factories.

### Factories over canned fixtures
For anything with a shape that varies, a factory (Faker/FakerJS/factory_boy) builds valid data per test instead of one canned object:

```python
def make_user(role="viewer", **overrides):   # factory
    return User(id=gen_id(), role=role, email=f"{gen_id()}@example.com", **overrides)
```

The test declares only what differs; the factory guarantees the rest is valid. Canned fixtures stay for the specific cases that must be byte-identical (regression baselines).

### Mock data isolation
- Each test gets fresh state: truncate/reset between tests, never rely on run order.
- Test database is disposable and recreated — never tests against shared/dev data.
- Time is mocked where behavior depends on it (`freezegun`, Vitest `vi.useFakeTimers`) — clock-dependent tests are flake factories.

## CI wiring

- Tests run in CI on every PR and every push, with the same commands a developer runs locally (`npm test`, `pytest`).
- Coverage gate: fail below the 80% target (the standard) on the code being changed, not the whole repo baseline.
- Test run time is a product decision: a suite over ~10 minutes will be skipped by humans. Split by category, cache dependencies, parallelize by file.
- Flaky tests are quarantined (see `reference/13-test-reliability.md`) — a flake in CI is fixed, not retried.

## Determinism checklist

- [ ] Fixed seed for any randomness (property tests, factories with RNG)
- [ ] Mocked time, network, and filesystem at the seams where tests touch them
- [ ] Fresh DB state per test
- [ ] Same commands locally and in CI
- [ ] Pinned toolchain + lockfile (a version drift between dev and CI is a heisenbug generator)
- [ ] No test depends on run order or parallelization

## Rules

1. One framework per language, pinned, lockfile committed.
2. Fixtures realistic, immutable, and co-located with their tests.
3. Factories for varying shapes; canned fixtures only for byte-identical baselines.
4. Fresh state per test — never order-dependent.
5. CI runs the exact local commands, gated on the 80% coverage target.
6. A suite that takes too long to run gets split, not skipped.
7. Determinism is a checklist item, not a hope — mock time, seed RNG, isolate state.