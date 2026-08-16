# Council Lens — C++ Review

Domain lens applied by the plan reviewer when the plan's stack is C++. Checks the plan for C++-specific risks: memory management, RAII, templates, build complexity, and UB (undefined behavior). Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's C++ choices**. C++ rewards discipline and punishes shortcuts harder than any other mainstream language — the plan must budget for that discipline.

## What to check

### Memory management posture
- [ ] RAII is the model: resources owned by objects, freed by destructors. Raw `new`/`delete` and bare `new[]` are banned or tightly scoped in the design language.
- [ ] Ownership policy: `std::unique_ptr` (exclusive), `std::shared_ptr` (shared, used deliberately — shared_ptr cycles leak), raw pointers only as non-owning observers. Which policy is stated?
- [ ] No manual `delete` in the happy path. If the plan has "manual memory management" as a section, it is a CONCERN.
- [ ] Containers and views: `std::vector`/`std::string` as default, `std::span`/`std::string_view` for borrowed views — bounds-checked access where data is untrusted.

### UB and safety
- [ ] The plan acknowledges UB as the top C++ hazard: out-of-bounds, signed overflow, use-after-free, data races. Mitigations named: `-Wall -Wextra -Werror`, ASan/UBSan in CI, `-fno-sanitize-recover`.
- [ ] Integer handling for untrusted sizes (overflow in allocation size → overflow). `size_t` discipline.
- [ ] Exception policy: exceptions on or off (`-fno-exceptions`)? If exceptions are enabled, RAII still handles cleanup; if disabled, error handling is explicit — the policy is stated, not incidental.

### Build system
- [ ] Build system chosen (CMake is default) with `FetchContent`/`vcpkg`/`conan` dependency strategy. No "compile everything by a giant Makefile".
- [ ] Build time is a schedule risk: header-heavy design, PCH, `ccache`, `-j` parallelism, and CI split named. A cold C++ build is minutes to hours.
- [ ] Compiler + standard version pinned (C++17/20/23) with a reason. Warnings as errors in CI.
- [ ] Cross-platform (if applicable): Windows/MSVC vs Linux/GCC vs macOS/Clang divergence acknowledged.

### Templates and generics
- [ ] Template usage is for the places it earns its keep (containers, algorithms) — not metaprogramming for its own sake. Template explosion (compile-time and binary bloat) acknowledged.
- [ ] If heavy template metaprogramming is planned, the plan names the maintenance cost and the skill required.
- [ ] Concepts (C++20) used to constrain templates where available — better errors.

### Concurrency
- [ ] Threading model named: `std::thread` + `std::mutex`, `std::async`, or `std::atomic` for lock-free. Data-race awareness with TSan in CI.
- [ ] Shared state: mutex-protected with a clear lock scope; no double-locking. `std::shared_mutex` only where reader-heavy.
- [ ] If the app is hot-path/performance-critical, memory layout (cache locality, `std::vector` of structs vs struct of arrays) considered.

### Legacy and interop
- [ ] If the plan touches existing C/C++ code: the C-compat seam (`extern "C"`, `repr`-style layout) named.
- [ ] FFI to other languages (Python/Node/Go) — ownership transfer rules at the boundary, exceptions never crossing the boundary.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Raw pointer spaghetti | Leaks, double-frees, use-after-free | Burn at test/prod |
| UB in release | Works in debug, corrupts in release | Burn at prod, untraceable |
| No sanitizers | Memory bugs surface only under load | Burn at prod |
| Header-heavy build | 40-minute builds, team skips CI | Burn at every build |
| shared_ptr cycles | Silent leaks in long-running processes | Burn at prod |
| Exceptions undefined | Mixed error-handling styles, cleanup bugs | Burn at build |

## Verdict guidance

- **9-10**: RAII ownership policy explicit, sanitizers in CI, build time budgeted, exception policy + UB posture stated.
- **7-8**: solid C++ plan; one soft spot (e.g. sanitizer config implied, not stated).
- **5-6**: C++ chosen for performance but memory and build hazards unaddressed.
- **3-4**: C-style C++ — raw pointers, manual memory, no sanitizer or build strategy.
- **0-2**: design will leak, crash, or take months to build.

**Block (score < 7) when:**
- Manual memory management is the default with no RAII ownership policy.
- No sanitizer/UB mitigation plan for a systems-level target.
- Build strategy is absent for anything beyond a toy project.

**Findings output format:**
```
cpp-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```