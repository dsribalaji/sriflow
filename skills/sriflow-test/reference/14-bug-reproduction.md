# Bug Reproduction Reference

## Reproduce → Minimize → Isolate → Capture Loop

### 1. Reproduce
Get the bug to happen reliably. If intermittent, add loops, sleep, or specific
preconditions until it triggers consistently. No fix without reliable repro.

### 2. Minimize
Strip away everything not needed until smallest repro. Remove:
- Unrelated features and code paths
- Test infrastructure overhead
- Third-party dependencies not involved
- UI boilerplate (if backend bug)
- Backend setup (if frontend bug)

Goal: single file, single function, single call that triggers the bug.

### 3. Isolate
Identify exact component/function causing the bug:
- Binary search the call stack
- Comment out half the code, re-test, narrow down
- Add logging/tracing at each boundary
- Check: is it input? timing? state? external dependency?

### 4. Capture
Write minimal failing test + steps to reproduce:
```
Bug: <one-line description>
Repro steps:
  1. <exact precondition>
  2. <exact action>
  3. <exact observation vs expectation>
Minimal code:
  <smallest snippet that fails>
Expected: <what should happen>
Actual: <what actually happens>
Environment: <OS, runtime version, relevant config>
```

## Git Bisect Wrapper

```bash
# Automated bisect with skip handling
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
git bisect run sh -c "npm test -- --grep 'test name' || (test $? -eq 129 && exit 125)"
```

### Exit code mapping
| Code | Meaning | Action |
|------|---------|--------|
| 0 | good | commit is not the cause |
| 1 | bad | commit is the cause |
| 125 | skip | can't test this commit (build failure, etc.) |

### Recording bisect result
```bash
# After bisect completes, capture the result
git bisect log > bug-repro/bisect-log.txt
git show --stat $(git bisect visualize --oneline) >> bug-repro/bisect-log.txt
```

Append to bug report:
```
Bisect: introduced in commit <hash>
  Subject: <commit message>
  Files changed:
    <list of files>
```

## Determinism Recipes

### Time
```typescript
// Vitest/Jest
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
// ... test code ...
vi.useRealTimers();

// Playwright
await page.clock.freezeTime(new Date('2025-01-15T12:00:00Z'));
```

### Random
```typescript
// Seed RNG for reproducible sequences
import seedrandom from 'seedrandom';
const rng = seedrandom('bug-repro-42');

// With faker
import { faker } from '@faker-js/faker';
faker.seed(123);
```

### Network
```typescript
// Never hit real APIs in bug repro
// Vitest
vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{"mock": true}'));

// Playwright
await page.route('**/api/**', route =>
  route.fulfill({ status: 200, body: JSON.stringify({ mock: true }) })
);
```

### Data
```typescript
// Use fixtures, not live DB
const fixture = {
  user: { id: 1, name: 'Test User' },
  order: { id: 100, userId: 1, total: 99.99 }
};

// Load from file
import fixture from './fixtures/bug-repro.json';
```

### Files
```typescript
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const tmpDir = await mkdtemp(join(tmpdir(), 'bug-repro-'));
// ... test code ...
await rm(tmpDir, { recursive: true, force: true });
```

## Red-Before-Fix Discipline

1. Write failing test FIRST
2. Verify test fails with current code (run it, see it fail)
3. Apply fix
4. Verify test passes (run it again, see it pass)
5. Never fix without a test that proves the bug existed

This is non-negotiable. A fix without a failing test is:
- Untested (might not actually fix the root cause)
- Not regression-proofed (bug can return silently)
- Unverifiable (no proof the bug was real)

### Checklist
- [ ] Test written before fix
- [ ] Test fails on current code (screenshot or output captured)
- [ ] Fix applied
- [ ] Test passes after fix
- [ ] No other tests broken by fix

## Integration with sriflow-test

### Step 9 (Fix or Report)
When fixing inline during QA:
1. Run the Reproduce → Minimize → Isolate → Capture loop
2. Apply determinism recipes to isolate the failure cause
3. Write the failing test
4. Apply the fix
5. Verify test passes
6. Record in QA_REPORT.md under the failed test entry

### QA_REPORT.md failure entry format
```
TC-NNN | <test name> | FAIL
Input:    <input that triggered failure>
Action:   <action that caused failure>
Expected: <expected result>
Actual:   <actual result>
Repro steps:
  1. <step 1>
  2. <step 2>
Root cause: <identified root cause after isolation>
Fix applied: <description of fix>
Fix verified: YES/NO
Bisect (if needed): <commit hash if introduced by recent change>
```

### Determinism in all test cases
Every test case in QA should use determinism recipes:
- Fake timers for any time-dependent logic
- Seeded RNG for any randomness
- Mocked network for any API calls
- Fixtures for any test data
- Temp directories for any file I/O
