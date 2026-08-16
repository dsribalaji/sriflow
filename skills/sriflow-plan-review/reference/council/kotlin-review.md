# Council Lens — Kotlin Review

Domain lens applied by the plan reviewer when the plan's stack is Kotlin (JVM backend or Android/Compose). Checks the plan for Kotlin-specific risks: null safety, coroutines, sealed hierarchies, and the JVM/Android ecosystem. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's Kotlin choices** so the language's sharp edges are designed out before build. Kotlin is expressive — the risk is over-expressive code nobody can read.

## What to check

### Null safety posture
- [ ] The plan commits to non-null-by-default. Where null is a real state, it's modeled explicitly: `T?` with handling, or a sealed result — never silent null returns.
- [ ] The `!!` operator is banned or heavily restricted in the design language (an `!!` on user input or DB data is a crash design).
- [ ] Java-interop boundaries named: Java APIs return platform types (`String!`) that bypass null checks — the plan acknowledges the seam.
- [ ] Collections: nullability of collection elements is deliberate (`List<String?>` vs `List<String>`), not accidental.

### Coroutines and concurrency
- [ ] If coroutines are planned: structured concurrency is the rule — `coroutineScope`, `supervisorScope`, no global `GlobalScope`. Job lifecycle matches the component lifecycle.
- [ ] Dispatchers named by role: `Dispatchers.Default` for CPU, `IO` for blocking, `Main` for UI. No blanket `Dispatchers.IO` on everything.
- [ ] Cancellation handling: blocking calls inside coroutines (JDBC, file IO) don't respect cancellation — the plan names the seam (use `withContext(IO)`, run blocking in a pool, or use a non-blocking driver).
- [ ] Flow/Channels used for streams only when streaming semantics are actually needed; hot `StateFlow` vs cold `Flow` chosen deliberately.

### Domain modeling
- [ ] Sealed classes/sealed interfaces used to model closed hierarchies (states, events, results) — the compiler then exhaustively checks `when`. Is that in the design language?
- [ ] `data class` used for value objects, not for domain entities with identity. (Data classes + `==` on entities = identity bugs.)
- [ ] Over-extension: no extension functions sprinkled globally; extension functions are co-located with the types they extend.
- [ ] Operator overloading and DSLs kept to the surfaces that genuinely read better as DSLs.

### Android/Compose specifics (if applicable)
- [ ] Compose state: `remember`, `mutableStateOf` scoping understood; no state hoisted so high that every recomposition invalidates everything.
- [ ] Compose previews and accessibility (contentDescription, touch targets, dynamic type) in the design phase — not retrofitted.
- [ ] If Android: minSdk target named, and the plan accounts for Android's backpressure (lifecycle, `LifecycleScope`, `repeatOnLifecycle`).
- [ ] If KMP (Kotlin Multiplatform): the platform-expect/actual surface is kept minimal — every `expect` doubles the test surface.

### JVM ecosystem inheritance
- [ ] Build: Gradle + Kotlin DSL, version catalog (`libs.versions.toml`). JDK version pinned (LTS).
- [ ] Coroutines library version pinned with the Kotlin version (they must match — a mismatch breaks coroutine dispatch).
- [ ] Java interop tax acknowledged: Kotlin adds a layer over JVM tooling; plan for reflection/annotation processing costs (e.g. Jackson, Spring).

### Testing realism
- [ ] Coroutine testing: `kotlinx-coroutines-test` (`runTest`, `StandardTestDispatcher`) in the test plan — real-time delays in unit tests are a flake factory.
- [ ] `MockK`/`mockito` choice named; mocking final classes requires the mock-maker-inline config — acknowledged.
- [ ] Compose UI tests (`createComposeRule`) if Android.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| `!!` on external data | Crash on unexpected null from DB/API | Burn at prod |
| `GlobalScope`/unmanaged jobs | Coroutines outliving their component | Burn at memory/leak |
| Blocking calls in coroutines | Cancellation ignored, thread pool blocked | Burn at load test |
| Data class entities | `==` comparison bugs, accidental copies | Burn at build |
| Coroutines/ktx version mismatch | Weird dispatch failures at runtime | Burn at ship |
| Platform types | Null sneaks past the compiler at the Java seam | Burn at prod |

## Verdict guidance

- **9-10**: null posture explicit with `!!` restricted, structured concurrency + dispatcher policy, sealed hierarchies for state, coroutine test strategy.
- **7-8**: solid Kotlin plan; one soft spot (e.g. Java interop seam unmentioned).
- **5-6**: Kotlin chosen for ergonomics but concurrency and null hazards unaddressed.
- **3-4**: Java code translated to Kotlin syntax — no coroutine, null, or domain-modeling design.
- **0-2**: design will actively mislead (global coroutines, platform types everywhere, entities as data classes).

**Block (score < 7) when:**
- Coroutines are planned with no structured-concurrency or dispatcher policy.
- The null-safety model is absent and external data flows through unguarded types.
- Kotlin/Android lifecycle interaction is unplanned.

**Findings output format:**
```
kotlin-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```