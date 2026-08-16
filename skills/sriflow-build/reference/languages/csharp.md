# C#/.NET Build Error Resolver

## Toolchain commands

```
dotnet build                 # build current project/solution
dotnet build -c Release      # release config
dotnet restore               # restore NuGet packages
dotnet test                  # run tests
dotnet run                   # run the app
dotnet format --verify-no-changes   # formatting check
dotnet nuget list source     # check configured feeds
```

First three moves on any .NET error:
1. `dotnet restore` — half of failures are missing/conflicting NuGet packages, not code.
2. Check the target framework in the `.csproj` (`<TargetFramework>`) vs the installed SDK: `dotnet --list-sdks`.
3. Read the WHOLE error — `MSB####` codes and `CS####` codes point to different root causes.

## Common errors + fixes

### `error CS0246: The type or namespace name 'X' could not be found`

- Missing `using` directive.
- Assembly reference missing: NuGet package not installed, or project reference not added (`dotnet add reference ../Other/Other.csproj`).
- Package installed but its framework version is incompatible with your `<TargetFramework>` (e.g. a `net8.0`-only package in a `net6.0` project).
- Typo/case — C# is case-sensitive.

### `error CS0103: The name 'X' does not exist in the current context`

- Local var/param typo, or used before declaration.
- Method defined in a different class — you called `Foo()` where it's `Helper.Foo()`.
- Extension method missing its `using` (extension methods live in a namespace you must import).

### `error CS1061: 'X' does not contain a definition for 'Y'`

- Member doesn't exist on the type (typo, or the type is `object`/`dynamic` so intellisense can't help).
- The object is `Task<T>`/`IQueryable<T>` — you forgot `.Result`/`.ToList()`/`.FirstOrDefault()`.
- Variable typed as an interface that lacks the member — cast to the concrete type if legit.
- `null`-conditional needed: check if `X` could be `null` and you need `?.`.

### `error CS1503: Argument 1: cannot convert from 'X' to 'Y'`

- Wrong param type at call site.
- `int` vs `long`/`double`, or passing a `List<T>` where `IEnumerable<T>` is fine but `T[]` is not.
- Async/`Task` mismatch: forgot `await`, passing a `Task<int>` where `int` is expected.

### `error CS4014: Because this call is not awaited ...`

- Calling an `async` method without `await`. Add `await` (and make the caller `async`), or discard deliberately: `_ = Task.Run(...)`.

### `error CS8618: Non-nullable property 'X' must contain a non-null value`

- Nullable reference types (NRT) on; property never assigned in a path. Initialize it, mark it `null!` only if truly set by DI/framework, or make it `X?`.

### `error CS8602: Dereference of a possibly null reference` / CS8603/CS8604

- NRT warnings-as-errors. Guard with `if (x is not null)`, use `?.`, or use `throw new ArgumentNullException` for invariant inputs. Avoid blanket `!` except at genuine framework boundaries.

### `error CS0433: The type 'X' exists in both ...`

- Two assemblies both define the type (common with duplicate packages, e.g. two `System.*` versions, or both `Newtonsoft.Json` assemblies). Remove the duplicate package/reference, or use `extern alias`.

### `error MSB3026: Could not copy ... to ...` / file lock

- Another process holds the DLL (app running, or a previous build crashed). Kill the process, close the running app, rebuild.
- Antivirus/OneDrive sync locking output — output to a local path.

### `error MSB4062: The "X" task could not be loaded`

- A build task in a NuGet package (e.g. a code generator) failed to load — version mismatch between the task and SDK. Update/restore, or check `Microsoft.NET.Sdk` version in `global.json`.

### `The current .NET SDK does not support targeting .NET X`

- SDK too old for the `TargetFramework`. Update SDK (`global.json` pins it) or lower the target.

### `NETSDK1064: Package X version Y was not found`

- Version doesn't exist on the feed, or the feed is unreachable. `dotnet nuget list source`; for a package you own, push it first.
- Private feed auth — configure `NuGet.Config` with credentials; never commit secrets.

## csproj gotchas

| Gotcha | Fix |
|--------|-----|
| `<TargetFramework>` vs `TargetFrameworks` | Singular = one target; plural = multi-target — SDK macros (`net8.0;netstandard2.0`) need plural |
| Missing `<LangVersion>` | Uses SDK default; pin it if you rely on newer syntax on an old SDK |
| `ImplicitUsings` disabled | `using System;` etc. not auto-injected — enable or add explicit usings |
| `<Nullable>` off | NRT diagnostics off; enable for new code, then fix warnings not suppress them |
| Package from `PackageReference` unused version | Set `<Version>` per package or centralize via `Directory.Packages.props` |
| Copy Local / PrivateAssets wrong | A transitive dependency disappears at runtime — check `<PrivateAssets>all</PrivateAssets>` misuse |

## NuGet restore gotchas

- **`NU1101: Unable to find package X`** — not on any configured feed. Add the feed (`dotnet nuget add source`).
- **`NU1102: Found package X with versions [..]` — none match** — version constraint too tight. Check for prerelease tags and available versions on the feed.
- **`NU1201/NU1202: Project X is not compatible with ...`** — framework mismatch between projects in the solution. Align `TargetFramework` across the dependency chain.
- **`NU1105: No project found` / `Unable to find project`** — project path in the solution/sln file is wrong or moved.
- **`NU1301: Unable to load the service index`** — network/proxy; `dotnet nuget list source`, check `https://api.nuget.org/v3/index.json` reachable.
- **Stale `obj/project.assets.json`** — `dotnet restore` again, or delete `obj/` for a clean restore.

## Build/CI gotchas

- **`MSB4057: The target 'X' does not exist`** — invoked a target not defined; check `<Target Name="X">` in the csproj or a `.targets` import.
- **`error : MSB4184: The expression "..." cannot be evaluated`** — property in csproj malformed; check `$(...)` usage.
- **Incremental builds masking issues** — `dotnet build --no-incremental` to force full rebuild.
- **`global.json` SDK rollforward** — `"rollForward": "latestMajor"` lets an older local SDK go wild; pin a known-good version in CI.
- **Publish vs build** — `dotnet publish` is what deploys; verify it separately from `dotnet build`.

## Resolution ladder

1. `dotnet restore` then `dotnet build`.
2. Classify by code: `CS####` = compile (type/using/framework), `MSB####` = build system (copy/target/SDK), `NU####` = package restore.
3. Fix the root cause per the table above; no `#pragma warning disable` blankets.
4. `dotnet build --no-incremental` to rule out stale artifacts.
5. For runtime-only failures after a clean build, it's an environment/data issue — check appsettings, env vars, and dependencies, not the build.