# Swift Code Review Guide

## Swift 5.9+ / Swift 6

### Strict Concurrency — HIGH

Swift 6 enables complete concurrency checking. Ensure data race safety.

```swift
// GOOD — actor isolates mutable state
actor BankAccount {
    private var balance: Double = 0
    func deposit(_ amount: Double) { balance += amount }
    func getBalance() -> Double { balance }
}

// CRITICAL — data race
var account = BankAccount()
Task {
    await account.deposit(100) // safe
}
// Main thread access may race with task
```

### Macro Usage — LOW

Use macros for repeated patterns. Prefer standard library solutions first.

---

## SwiftUI Patterns

### State Management — MEDIUM

Use `@State` for local state, `@Binding` for child communication, `@Observable` for complex models.

```swift
// GOOD
struct CounterView: View {
    @State private var count = 0

    var body: some View {
        Button("Count: \(count)") { count += 1 }
    }
}

// GOOD — @Observable (iOS 17+)
@Observable
class UserViewModel {
    var user: User?
    var isLoading = false

    func loadUser() async {
        isLoading = true
        user = await api.fetchUser()
        isLoading = false
    }
}
```

### View Composition — MEDIUM

Keep views small. Extract subviews for readability.

```swift
// GOOD — extracted subview
struct UserCard: View {
    let user: User
    var body: some View {
        VStack {
            AvatarView(user: user)
            UserInfoView(user: user)
        }
    }
}

// BAD — massive view
struct UserCard: View {
    var body: some View {
        VStack {
            // 200 lines of nested views
        }
    }
}
```

### Navigation — MEDIUM

Use `NavigationStack` with value-based navigation (iOS 16+).

```swift
// GOOD — value-based
NavigationStack(path: $path) {
    UserList()
        .navigationDestination(for: User.self) { user in
            UserDetailView(user: user)
        }
}

// BAD — deprecated NavigationView
NavigationView {
    UserList()
}
```

---

## Actor Model

### Actor Isolation — MEDIUM

Actors prevent data races. Use them for shared mutable state.

```swift
// GOOD
actor Cache<Key: Hashable, Value> {
    private var storage: [Key: Value] = [:]

    func get(_ key: Key) -> Value? { storage[key] }
    func set(_ key: Key, value: Value) { storage[key] = value }
    func remove(_ key: Key) { storage.removeValue(forKey: key) }
}

// BAD — no isolation, potential race
class Cache<Key: Hashable, Value> {
    private var storage: [Key: Value] = [:]
    // multiple threads can mutate simultaneously
}
```

### Sendable — MEDIUM

Mark types as `Sendable` when they cross concurrency boundaries.

```swift
// GOOD
struct UserMessage: Sendable {
    let id: UUID
    let text: String
}
```

---

## Optional Chaining

### Optional Safety — MEDIUM

Use optional chaining, nil coalescing, and `guard let` appropriately.

```swift
// GOOD — guard let for early return
func processUser(_ user: User?) {
    guard let user else { return }
    // user is non-optional here
}

// GOOD — optional chaining
let city = user?.address?.city ?? "Unknown"

// BAD — force unwrap in production
let city = user!.address!.city! // crashes if any nil
```

---

## Common Mistakes

### Force Unwrap — CRITICAL

Never force unwrap (`!`) in production code. Use `guard let`, `if let`, or `??`.

```swift
// CRITICAL — crashes on nil
let name = user!.name

// GOOD
guard let name = user?.name else { return }
```

### Retain Cycles — HIGH

Use `[weak self]` in closures that capture self.

```swift
// CRITICAL — retain cycle
class ViewModel {
    var onDone: (() -> Void)?
    func setup() {
        onDone = {
            self.updateUI() // strong capture of self
        }
    }
}

// GOOD — weak capture
class ViewModel {
    var onDone: (() -> Void)?
    func setup() {
        onDone = { [weak self] in
            self?.updateUI()
        }
    }
}
```

### Main Thread Blocking — HIGH

Never perform heavy work on the main thread. Use `Task.detached` or actors.

```swift
// BAD — blocks main thread
func load() {
    let data = try! Data(contentsOf: url) // blocks UI
    self.data = data
}

// GOOD — background work
func load() async {
    let data = try? await Task.detached {
        try Data(contentsOf: url)
    }.value
    self.data = data
}
```

### Memory Leaks from Timers — MEDIUM

Timers retain their target. Use `Timer` with block-based API and invalidate.

```swift
// GOOD — block-based timer
let timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
    self?.tick()
}
// invalidate in deinit

// BAD — target-action retains self
let timer = Timer.scheduledTimer(target: self, selector: #selector(tick), userInfo: nil, repeats: true)
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Force unwrap | CRITICAL | Use guard let, if let, ?? |
| Retain cycle in closure | HIGH | Use [weak self] |
| Main thread blocking | HIGH | Use async, Task.detached |
| Data race without actor | HIGH | Use actor for shared state |
| NavigationView (deprecated) | MEDIUM | Use NavigationStack |
| Timer without invalidation | MEDIUM | Invalidate in deinit |
| Missing Sendable conformance | MEDIUM | Mark types Sendable |
| @State in non-view type | LOW | Use @Observable instead |
