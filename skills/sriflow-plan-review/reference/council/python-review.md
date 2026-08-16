# Council Lens — Python Review

Domain lens applied by the plan reviewer when the plan's stack is Python. Checks the plan for Python-specific risks before the build commits to them. Scores 0-10 and reports findings in the `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.` format.

## Role

This lens does not review code (no code exists yet). It reviews the **plan's Python choices**: versions, dependencies, typing strategy, packaging, async model, and the places Python famously fails — so those failures are designed out before build.

## What to check

### Versions and runtime
- [ ] Python version pinned (3.x.minor) with an end-of-life date named. "Latest" is not a version.
- [ ] If the plan targets multiple environments, version differences (3.10 vs 3.12 syntax) are accounted for.
- [ ] A reason exists for the chosen version — library support, perf, security patches.

### Typing strategy
- [ ] The plan declares a typing posture: strict mypy/pyright or pragmatic gradual typing. Which one?
- [ ] If the codebase will exceed ~10k lines or ~5 contributors, strict typing is planned, not optional.
- [ ] Type-checking is in CI with a gate, or the plan names why not.
- [ ] Public API surfaces (function signatures, data shapes) are typed even if internals are not.

### Dependency management
- [ ] Lockfile strategy named (uv/pip-tools/poetry) and committed.
- [ ] Runtime deps vs dev deps separated.
- [ ] The plan names the risky deps: anything compiled (numpy/pandas/lxml/pydantic) has a version pinned, because a wheel rebuild is a CI and deployment risk.
- [ ] Python version constraint is compatible with the top dependencies (numpy ≥1.26, etc.).

### Async and concurrency
- [ ] If async (asyncio) is planned, the plan names the event-loop-boundary risk: blocking calls (requests, file IO) inside async code are a plan-level hazard.
- [ ] If threads are planned for CPU-bound work, the GIL consequence is named (threads ≠ parallelism for CPU work; use multiprocessing or a process pool).
- [ ] Database calls: sync vs async driver chosen deliberately, not by convenience.

### Packaging and execution
- [ ] The plan names how the app is packaged: wheel, container, or source checkout — each has different deployment risk.
- [ ] Entry points and module layout make sense (no `main.py` at repo root doing 500 lines of side effects).
- [ ] Python 2-era patterns (print debugging, mutable default args, wildcard imports) are not in the design language.

### Testing realism
- [ ] The test plan accounts for Python's test-ability hazards: mocking the wrong layer (patching `requests.get` vs the HTTP client), fixture isolation, and slow imports in test suites.
- [ ] Coverage tooling named (pytest-cov) with the 80% target from the test skill.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Unpinned Python | CI and prod drift a minor version; one syntax change breaks deploy | Burn at build/ship |
| `requirements.txt` without lock | Transitive dep drift breaks prod | Burn at ship |
| Async mixing | Blocking call stalls the whole event loop | Burn at test, hard to reproduce |
| Gradual typing forever | Typing debt accrues; refactors get scary | Burn at every build |
| GIL assumption | Threads promised for CPU work that don't parallelize | Burn at load test |
| Compiled-deps lock | `pip install` on a fresh box rebuilds numpy; 20-min CI | Burn at every build |

## Verdict guidance

Score 0-10 on this lens. Calibration:

- **9-10**: versions pinned, typing posture explicit and strict where it matters, lockfile + dependency risk named, async/threading hazards designed out.
- **7-8**: solid choices with one or two soft spots (e.g. typing posture implied, not stated; a risky dep named but not pinned).
- **5-6**: Python basics right but a structural risk present (unpinned runtime, no lock strategy, async mixing unaddressed).
- **3-4**: plan treats Python as "just scripting" — no typing plan, no dependency strategy, no async story.
- **0-2**: choices will actively fight the team (wrong runtime, impossible deps, no packaging plan).

**Block (score < 7) when:**
- The runtime version is unpinned and the dependency set includes compiled packages.
- The plan requires CPU-bound parallelism but names threads.
- Async is planned but the blocking-call boundary is unaddressed.

**Findings output format:**
```
python-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```

The finding must name the exact PLAN.md section to change, not a vague "reconsider dependencies".