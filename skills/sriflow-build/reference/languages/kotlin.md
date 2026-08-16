# Kotlin/Gradle Build Error Resolver

## Toolchain commands

```
gradle build                # full build
gradle compileKotlin        # compile main sources only
gradle compileTestKotlin    # compile tests
gradle dependencies         # dependency report
gradle --warning-mode all   # deprecations
./gradlew                   # wrapper — ALWAYS use the wrapper, not system gradle
```

First three moves on any Kotlin error:
1. Use `./gradlew`, never a system Gradle — version skew is the top failure source.
2. Match the Kotlin plugin version to the language feature you use (Compose/KMP have tight coupling).
3. Read the full error — Kotlin diagnostics put the real cause in the "this is not a subtype" / `Deprecation` note, not the headline.

## Common errors + fixes

### `Type mismatch: inferred type is X but Y was expected`

- Nullability: `X?` vs `X`. Kotlin's whole point — fix the type, don't `!!` everywhere.
- Variance: `List<X>` is read-only; `MutableList<X>` where mutation is required.
- Receiver: `fun String.x()` called on a non-`String`.
- Fix the signature, or `!!`/`?.let` only at genuine platform (Java interop) boundaries.

### `Unresolved reference: X`

- Import missing.
- Symbol in another module not added as a dependency (Gradle: `implementation(project(":other"))`).
- Extension function in a file not imported — Kotlin needs explicit `import pkg.extensionFunction` even in the same package dir.
- Generated code not regenerated (Compose compiler, KSP/kapt) — the reference is to a class the annotation processor should produce.
- Case typo.

### `Unresolved reference: compose` / Compose runtime not found

Compose requires the Compose compiler plugin matching the Kotlin version:

```kotlin
// build.gradle.kts
plugins {
    id("org.jetbrains.kotlin.plugin.compose") version "<kotlin-version>"
}
```

- The `compose` plugin version must equal the Kotlin version (Kotlin 2.0+ bundles Compose compiler).
- On older Kotlin (< 2.0) you needed `kotlinCompilerExtensionVersion` aligned with the compiler — a mismatch gives cryptic `Unresolved reference` or `Type mismatch` in `@Composable` functions.
- Missing `implementation(compose.runtime)` etc. from the Compose BOM.

### `Function invocation ... expected` / `No value passed for parameter`

- Named vs positional args mismatch.
- `@Composable` functions cannot be called from non-composable context — you get a type error referencing `Composer`.
- Default parameter present but you passed fewer — check the definition.

### `Cannot access '<init>': it is private` (data class / builder)

- Constructor is private — use the factory/companion.
- Java interop: a Java class with a private constructor.
- `private constructor` on a `data class` used in a library — make the intended path public.

### `@Composable invocations can only happen from the context of a @Composable function`

- Called a composable from a plain function/`onClick` lambda. Wrap the call in a composable scope or use `rememberCoroutineScope`/`LaunchedEffect` for side effects.

### `Unresolved reference: R` (Android)

- Resource files missing/renamed — check `res/`.
- Build failed earlier, so `R` wasn't generated — fix the first error.
- Kapt/KSP didn't run — add the processor dependency and enable the plugin.

### Kapt/KSP errors

- **`Unresolved reference` to generated classes** — KSP/kapt output not on the compile path, or processor not applied to the module.
- **Annotation processor errors** — a processor crashed; check its own output, not the Kotlin wrapper error.
- **Kapt slow / OOM** — Gradle Kotlin daemon memory; raise `org.gradle.jvmargs`.
- Prefer KSP over kapt for modern processors (Room, Hilt, Moshi) — kapt is legacy.

### `Cannot inline bytecode built with JVM target 17 into bytecode being built with JVM target 11`

JVM target mismatch between compilation and dependencies.

```kotlin
kotlin { jvmToolchain(17) }          // or
kotlin { compilerOptions { jvmTarget.set(JvmTarget.JVM_17) } }
java { sourceCompatibility = JavaVersion.VERSION_17 }
```

All three (kotlin `jvmTarget`, java `source/target`, toolchain) must agree.

### `Type inference failed` / generic inference

- Missing type argument on a generic call: `listOf()` needs a type.
- Builder DSL (e.g. `buildList { }`) without a target type.
- Add the explicit type parameter.

## Gradle + Kotlin config gotchas

| Gotcha | Fix |
|--------|-----|
| `Unresolved reference` in KMP (expect/actual) | `expect` declared without a matching `actual` for the active platform — add all `actual` targets or enable the right one |
| Compose Multiplatform | The `compose` plugin is per-platform; `compose.desktop` needs the desktop target enabled in `kotlin { }` |
| `Unresolved reference: main` in KMP tests | Test source set targets need the `androidInstrumentedTest`/`commonTest` setup |
| Kotlin plugin version vs Gradle version | Kotlin `2.x` needs Gradle ≥ 7.6; check the compatibility table when upgrading |
| `e: Module was compiled with an incompatible version of Kotlin` | Metadata version skew — bump Kotlin to match or rebuild all modules |
| New Kotlin DSL syntax failing on old Gradle | Upgrade wrapper: `./gradlew wrapper --gradle-version <v>` |
| `Could not find org.jetbrains.kotlin:kotlin-stdlib` | Repository missing `mavenCentral()`/Google; add repos |

## Resolution ladder

1. `./gradlew clean build` — stale incremental state is common with Kapt/KSP.
2. Fix the FIRST error only; cascades follow.
3. For unresolved references: import → dependency → generated-code order.
4. For JVM target/metadata skew: unify Kotlin version + toolchain across modules.
5. Rebuild. If the error names a processor (KSP/kapt), fix at the processor level, not the Kotlin code.