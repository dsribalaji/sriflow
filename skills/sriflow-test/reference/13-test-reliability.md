# Step 6+8 Supplement — Test Reliability & Flake Management

## 1. Flake Classification (7 categories)

| Category | Trigger | Example |
|----------|---------|---------|
| **Timing-dependent** | Race conditions, async timing, slow CI | `setTimeout` in tests, animation waits, debounce timers |
| **Environment-dependent** | Network, services, time zones, locale | API mock expires, DNS flake, TZ=UTC vs TZ=America/New_York |
| **Data-dependent** | Shared state, test order, DB state | Previous test leaves dirty data, auto-increment IDs, cached fixtures |
| **Locator-dependent** | Selector fragility, DOM changes | XPath positional, class names renamed, dynamic IDs |
| **Resource-dependent** | Memory, disk, ports, file handles | Port 3000 busy, EACCES, ENOMEM on parallel runs |
| **Concurrency-dependent** | Parallel test interference | Shared DB writes, global singletons, file locks |
| **Platform-dependent** | OS, browser version, hardware | macOS vs Linux fonts, Chrome vs Firefox rendering, ARM vs x86 |

## 2. Flake Decision Tree

```
Test fails intermittently
├── Fails on retry (same run)?
│   └── YES → Timing-dependent
│       └── Fix: add explicit wait/retry, poll for condition, mock timer
│
├── Fails on specific environment?
│   └── YES → Environment-dependent
│       └── Fix: stub external services, freeze time, normalize locale
│
├── Fails when run with other tests?
│   └── YES → Concurrency-dependent
│       └── Fix: isolate DB state, use unique fixtures, disable parallelism
│
├── Fails after code/deploy change?
│   └── YES → Locator-dependent
│       └── Fix: update selectors, prefer data-testid, use getByRole
│
├── Fails on specific OS/browser?
│   └── YES → Platform-dependent
│       └── Fix: skip with platform guard, snapshot per-platform
│
├── Fails with specific data state?
│   └── YES → Data-dependent
│       └── Fix: seed fixtures, reset DB per test, use transactions
│
└── Fails with low memory / port conflict?
    └── YES → Resource-dependent
        └── Fix: dynamic port allocation, cleanup hooks, limit parallelism
```

## 3. Quarantine Lifecycle

```
Tag → Isolate → Diagnose → Fix → Verify → Release
```

| Phase | Action | Exit criteria |
|-------|--------|---------------|
| **Tag** | Mark test as flaky with category from §1 | Category assigned |
| **Isolate** | Move to quarantine suite (run separately, not in main) | Suite exists, excluded from gate |
| **Diagnose** | Root cause analysis. Max 3 attempts. | Root cause identified or attempts exhausted |
| **Fix** | Apply fix based on category from §1 | Fix committed |
| **Verify** | Run test 20× without failure | 0 failures in 20 runs |
| **Release** | Remove quarantine tag, return to main suite | Test passes gate consistently |

**Quarantine limits:**
- Max quarantine: **14 days**
- After 14 days: **delete test or fix it** — no indefinite quarantine
- Quarantine count tracked in QA_REPORT.md under `## Flake Report`

## 4. Selector Stability Scoring (0–5)

| Score | Selector Type | Stability | Example |
|-------|---------------|-----------|---------|
| **0** | Brittle (XPath positional, CSS position) | Fragile | `//div[3]/button[2]`, `.container > :nth-child(4)` |
| **1** | Text/content selectors | Low | `getByText("Submit")`, `getByPlaceholder("Search")` |
| **2** | Class selectors | Medium | `.btn-primary`, `getByClassName("card")` |
| **3** | data-testid | High | `getByTestId("checkout-btn")` |
| **4** | ARIA roles/labels | High | `getByRole("button", { name: "Submit" })`, `getByLabel("Email")` |
| **5** | Playwright auto-healing | Very High | `getByRole` + `getByLabel` combo, semantic-first |

**Minimum for new tests: 3** (data-testid or above).
**Recommended: 4–5** (ARIA + Playwright auto-healing).

Score each test in QA_REPORT.md:
```
| TC-001 | Login form    | 4 | getByRole("button") + getByLabel("Email") |
| TC-002 | Checkout flow | 2 | .checkout-submit — should migrate to data-testid |
```

## 5. Integration with sriflow-test

### Step 6 (Regression) — Flake Check

When comparing against previous QA_REPORT.md:

1. **Cross-reference** any `FLAKY` tags from prior runs
2. If a test was FLAKY before and is now FAIL → **not a regression**, it's still flaky
3. If a test was FLAKY before and is now PASS → note improvement, remove flaky tag
4. If a test was PASS before and is now FLAKY → **new flake**, add to quarantine

### Step 8 (Tally) — Flag Flakies

```
Category        | Total | PASS | FAIL | SKIP | FLAKY
----------------|-------|------|------|------|------
Golden Path     |   N   |  N   |  N   |  N   |  N
Edge Cases      |   N   |  N   |  N   |  N   |  N
Error States    |   N   |  N   |  N   |  N   |  N
Regression      |   N   |  N   |  N   |  N   |  N
TOTAL           |   N   |  N   |  N   |  N   |  N
```

### Gate Logic — Flakies Don't Block

- **Flaky ≠ real failure.** FLAKY tests are excluded from gate calculation.
- Gate decision uses only PASS / FAIL / SKIP counts.
- FLAKY tests documented in `## Flake Report` section of QA_REPORT.md.
- Flaky count in gate summary:
  ```
  Gate: SHIP-READY (3 FLAKY — quarantined, not blocking)
  ```

### Flake Report Format (append to QA_REPORT.md)

```markdown
## Flake Report

| Test | Category | Quarantined | Age (days) | Last Failure |
|------|----------|-------------|------------|--------------|
| TC-045 | timing | yes | 3 | 2026-06-28 |
| TC-072 | locator | no (new) | 0 | 2026-07-01 |

Total flaky: 2
Quarantined: 1
Action needed: 1 (TC-072 — diagnose within 14 days)
```
