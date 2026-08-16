# Java/Maven/Gradle Build Error Resolver

## Toolchain commands

```
mvn clean compile           # Maven: clean + compile
mvn test                    # run tests
mvn -q package              # quiet package (jar/war)
mvn dependency:tree         # show dependency graph
mvn help:effective-pom      # merged pom for debugging

gradle build                # Gradle: full build
gradle --warning-mode all   # surface deprecation warnings
gradle dependencies         # dependency report
gradle clean build          # fresh build
```

First three moves on any Java build error:
1. Confirm the JDK version the build uses vs the one on PATH — `mvn -version` / `gradle -version` show the JDK. Java version mismatch is the #1 cause.
2. Run a clean build; stale `target/`/`build/` artifacts mask fixes.
3. Check `dependency:tree`/`dependencies` before touching code — most errors are version/scope problems, not code.

## Common errors + fixes

### `cannot find symbol`

- Symbol referenced but not in the same package/imports. Add the import or fix the package path.
- Class compiled with a different JDK (lombok, `records`, newer APIs) — mismatch between compile source/target and runtime.
- Dependency scope `provided`/`test` where you need `compile`.
- Two classes with the same FQN; the import resolves to the wrong one.

### `package <x> does not exist`

- Dependency missing from pom/build.gradle. Add it.
- Dependency present but the version is broken/excludes the package.
- Multi-module project: the sibling module wasn't built/installed — `mvn install` (not just `compile`) when cross-module.
- Case-sensitivity in package path (Linux).

### `incompatible types: X cannot be converted to Y`

- Return type mismatch, wrong generic, or `Object` where a typed value is expected.
- Autoboxing gotcha: `Integer` vs `int` in generics or null returns.
- Fix the type at the boundary; don't brute-force with casts.

### `unmappable character for encoding` / `invalid source release`

- Source file encoding ≠ compiler encoding. Set `-encoding UTF-8` (Maven: `project.build.sourceEncoding`; Gradle: `options.encoding`).
- `invalid source release: 17` — you're compiling with an older JDK than `source`/`release` demands. Switch the JDK or lower the target.

### `cannot find main class` / `Main class not found`

- `main` method missing or not `public static void main(String[])`.
- Fat/shaded jar didn't include the manifest main class: `maven-shade-plugin` needs a `Main-Class` transformer.
- Running the jar with the wrong name.

### `error: <identifier> expected` (syntax)

- Missing `{`/`}`/`;`, wrong nesting, `class` inside a method.
- Type on wrong line — read the caret; usually a stray brace or a semicolon.

### `duplicate class` / `Duplicate classes` on rebuild

- Class exists in two jars both on the classpath (same FQN). Exclude one: `exclusions` in Maven, `exclude` in Gradle.
- Source + generated class collide — check build dirs (`target/generated-sources`).
- Two deps pulling `guava`/`slf4j` etc. at different versions — align versions.

### Lombok not working (`cannot find symbol` on getters/builders)

- `lombok` dependency present but annotation processing disabled.
- JDK 23+ needs `-Djps.track.ap.dependencies=false` (IntelliJ) or explicit `annotationProcessor` paths in Gradle; older Gradle needs `--add-opens` flags for JDK 16+.
- Add the `annotationProcessor 'org.projectlombok:lombok'` line in Gradle; Maven needs `<annotationProcessorPaths>`.

### Test failures that are really build errors

- `No tests found` — surefire/failsafe not picking up test classes (wrong naming: must end `Test`, `Tests`, `TestCase`).
- `Class not found` for the test — test class in `src/test/java` but JUnit version mismatch (JUnit 5 needs `junit-jupiter` engine).

## Maven gotchas

| Gotcha | Fix |
|--------|-----|
| `Failed to read artifact descriptor` | Corrupt local repo: delete `~/.m2/repository/<g/a/v>` and re-resolve |
| `Could not resolve dependencies` offline | `-o` needs populated cache; use `--offline` only after a full resolve |
| Private repo auth | `settings.xml` `<servers>`; never put credentials in the pom |
| `target/classes` stale | `mvn clean` |
| Surefire fork crash (OOM) | `-DforkCount`/`-XX:MaxMetaspaceSize`, or `argLine` |
| `Project build error: Non-resolvable parent POM` | Parent POM version wrong or not in repo — check the `<parent>` block |

## Gradle gotchas

| Gotcha | Fix |
|--------|-----|
| `Could not resolve all dependencies` | Network/registry problem; check `repositories {}` order and credentials |
| `Unsupported class file major version` | Gradle too old for the JDK — upgrade Gradle or run with a supported JDK |
| `Task 'build' not found` | Wrong project dir; run from the subproject root or use `:<sub>:build` |
| `Could not find method implementation()` | Old Gradle vs new DSL — upgrade or use `compile` for legacy builds |
| Config cache invalidation | `--no-configuration-cache` for one-off, or fix the uncacheable task |
| Version catalog (`libs.versions.toml`) refs failing | Typos in alias, or catalog not loaded in the project's `plugins`/`dependencies` |

## JDK gotchas

- `Source option 8 is no longer supported` — raise `maven.compiler.source/target` or the Gradle `JavaVersion`; modern libs require 11/17/21.
- `cannot access X: class file has wrong version` — a dependency jar was built for a newer JDK than yours. Either upgrade the JDK or use a compatible dependency version.
- `module not found` / `package is not visible` — JPMS: add `requires` in `module-info.java` or add `--add-opens`/`--add-exports` on the command line.
- Multiple JDKs on PATH — always set `JAVA_HOME` explicitly per project; never assume.

## Resolution ladder

1. `mvn -version`/`gradle -version` → confirm JDK.
2. `mvn clean compile` (or `gradle clean build`) to discard stale state.
3. If symbol/package error: `dependency:tree` → add/align version → rebuild.
4. If encoding/source errors: fix pom/Gradle config, not code.
5. Rebuild. On failure of a multi-module chain, `mvn install -pl <module> -am` to build dependencies first.