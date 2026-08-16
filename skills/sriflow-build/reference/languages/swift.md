# Swift/Xcode Build Error Resolver

## Toolchain commands

```
swift build                # SwiftPM build
swift test                 # run tests
swift run                  # run executable
xcodebuild -list           # list targets/schemes
xcodebuild -project App.xcodeproj -scheme App -configuration Debug build
xcodebuild ... -destination 'platform=iOS Simulator,name=iPhone 16'
```

First three moves on any Swift error:
1. Check the exact error file/line — Swift splits errors into a headline plus `note:`s; read the note.
2. Build a single file: `swiftc -typecheck File.swift` to isolate from the module graph.
3. Verify the SDK/destination: simulator vs device, iOS vs macOS deployment target mismatch is the #1 integration failure.

## Common errors + fixes

### `Cannot assign to value: 'x' is a 'let' constant`

- `let` binding mutated. Change to `var`, or restructure.
- Property on a `struct` is immutable (structs are value types — mutating requires `var` and `mutating func`).

### `Cannot use mutating member on immutable value: 'self' is immutable`

- Calling a `mutating func` on a `let` struct instance. Make the instance `var` or the function non-mutating.
- In a closure that captures `self` — structs captured by value are immutable inside the closure; capture into a local `var` first.

### `Value of optional type 'T?' must be unwrapped`

- `nil`-able value used directly. Fix with `guard let`, `if let`, or `?? default` — not bare `!`.
- `!` (force unwrap) on a value that can be nil → crash at runtime. Only force-unwrap when you can prove non-nil (and even then, prefer `guard`).

### `Generic parameter 'T' could not be inferred`

- Generic call without enough type context: `let x = foo()` where `foo<T>()`. Provide the type param `foo<Int>()` or a typed target.

### `'X' is ambiguous for type lookup in this context`

- Two modules export the same name (`UIKit` + `SwiftUI` both have `View`, `Color`...). Qualify: `SwiftUI.Color`, or `typealias`.

### `Consecutive declarations on a line must be separated by ';'`

- Semicolon-join two declarations or put them on separate lines. Common with `let x = ... let y = ...`.

### `Cannot find 'X' in scope`

- Typo.
- Symbol in another module — add `import`.
- Declared in the same file but after use (Swift allows forward refs at type level, but a missing access level like `private` in another file).
- `@testable import App` needed in test targets.
- Type defined in a target not linked/imported — check target membership in Xcode (the file isn't in the target's Compile Sources).

### `Type 'X' does not conform to protocol 'Y'`

- Missing methods/properties required by the protocol. The compiler lists each missing requirement.
- `@objc` protocol conformance on a non-`NSObject` class.
- Associated type not satisfied — implement the `associatedtype` explicitly or let inference resolve it.

### `'self' captured by a closure before all members were initialized`

- Calling a method/escaping closure in `init` before all stored properties are set. Initialize properties first, or use lazy/`!` for truly optional-before-init cases.

### `Overlapping accesses to 'self'` (exclusivity)

- Two `inout` accesses to the same property in one expression. Copy to a local, mutate, write back.

### `Missing argument for parameter 'x' in call`

- Function signature changed (added/removed params), call site stale.
- Keyword names: Swift uses argument labels — `foo(a:)` vs `foo(_:)`. Match labels exactly.

### Concurrency (Swift 5.5+/async)

- **`Call to main actor-isolated instance method 'x' in a synchronous nonisolated context`** — calling a `@MainActor` method off the main actor. Mark the caller `@MainActor` or hop with `await MainActor.run { }`.
- **`'async' call in an autoclosure that does not support concurrency`** — e.g. in `DispatchQueue` or certain `@Sendable` closures.
- **`sending 'self' risks causing data races`** — non-`Sendable` captured across concurrency boundary. Make the type `Sendable` or scope the capture.
- **`Reference to captured var 'x' in concurrently-executing code`** — captured a `var` in a `@Sendable` closure. Copy to a `let` or use an atomics/actor.

## Xcode gotchas

| Gotcha | Fix |
|--------|-----|
| File exists but "cannot find in scope" | File not in the target's Compile Sources — add it in the target membership |
| Build fails only on device | Signing/profile missing — set `CODE_SIGNING_ALLOWED=NO` for CI or configure a team |
| Build fails only on simulator | Deployment target higher than the simulator iOS — lower `IPHONEOS_DEPLOYMENT_TARGET` |
| `framework not found` | Missing from `Link Binary With Libraries`, or a `Podfile`/`Package.swift` dependency not integrated |
| Swift Package resolution failed | Network or version conflict — `xcodebuild -resolvePackageDependencies` or clear `DerivedData` |
| Stale build weirdness | Delete `~/Library/Developer/Xcode/DerivedData/<Project>` — the classic Xcode fix |
| `Command SwiftCompile failed with a nonzero exit code` | Read the errors above it — the real Swift errors are printed before the generic message |
| `Multiple commands produce <file>` | Duplicate target membership or conflicting `Copy Bundle Resources` entries |

## SwiftPM gotchas

- **`missing module 'X'`** — dependency not added to `Package.swift` `dependencies` AND the target's `dependencies`.
- **`target 'X' has unhandled build setting`** — target name mismatch between the manifest and the directory.
- **`'swift-tools-version'` too old** — manifest features (e.g. `platforms`) require a newer tools version; bump `// swift-tools-version:6.0`.
- **`product 'X' not found`** — the product name declared in `products` differs from what you import.
- **Resources not found at runtime** — declare in `target.resources` (`.copy`, `.process`), and use `Bundle.module` to access.

## Resolution ladder

1. Read headline + all `note:`s; the note carries the real cause.
2. Typecheck one file: `swiftc -typecheck File.swift`.
3. Fix type/optional/actor errors at the source — no `!` spraying, no `@preconcurrency` blanket.
4. For integration errors: target membership → deployment target → signing → DerivedData clean.
5. Rebuild. If it fails only under a specific destination, that's the clue: SDK/target mismatch, not your code.