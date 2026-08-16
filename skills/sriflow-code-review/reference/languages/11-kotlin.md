# Kotlin Code Review Guide

## Null Safety

### Unnecessary Nullable — MEDIUM

Prefer non-null types. Nullable everywhere invites `!!` and `?.` chains.

```kotlin
// BAD — everything nullable
val name: String? = user?.name?.trim()

// GOOD — non-null default at the boundary
val name: String = user?.name?.trim() ?: ""
```

### Force Unwrap `!!` — CRITICAL

`!!` turns a NPE into a runtime crash. Flag every occurrence in production code.

```kotlin
// CRITICAL — crashes if null
val email = user!!.email

// GOOD — explicit handling
val email = user?.email ?: throw IllegalStateException("user has no email")
```

### `let` / `run` Over Nested Checks — LOW

Use `let` to scope null-checks. Avoid long nested `if (x != null)` chains.

```kotlin
// GOOD
user?.let { it.notify(); save(it) }

// OK for multi-statement, but keep it readable
```

### Safe Calls on Mutable State — MEDIUM

A value checked for null can become null before use in a concurrent context. Copy to a local val first.

---

## Coroutines & Concurrency

### GlobalScope — CRITICAL

Never use `GlobalScope` for app work. It outlives its caller, leaks work, and ignores structured concurrency.

```kotlin
// CRITICAL — fire-and-forget that can't be cancelled
GlobalScope.launch { longRunningWork() }

// GOOD — tied to a lifecycle scope
viewModelScope.launch { longRunningWork() }
// or: lifecycleScope, or coroutineScope { }
```

### Suspending Calls Outside Dispatchers — MEDIUM

Don't call blocking IO on `Dispatchers.Main`. Confine blocking work to `Dispatchers.IO` / `Default` or annotate with `@Suspending`-style discipline.

```kotlin
// BAD — blocks main thread
viewModelScope.launch {
    val data = readFileBlocking()   // blocking call on Main
}

// GOOD — move blocking work off main
viewModelScope.launch(Dispatchers.IO) {
    val data = readFileBlocking()
    withContext(Dispatchers.Main) { state.value = data }
}
```

### Missing Cancellation Handling — HIGH

Long-running loops must check `isActive`. Cancelled coroutines must not swallow `CancellationException`.

```kotlin
// GOOD — cooperative cancellation
while (isActive) { doStep() }

// BAD — swallows cancellation
try { awaitResult() } catch (e: Exception) { /* hides CancellationException */ }
// CancellationException must be rethrown
```

### Unbounded `launch` in a Loop — HIGH

Launching a coroutine per item with no concurrency bound exhausts resources. Use a semaphore or chunking.

```kotlin
// GOOD — bounded
val semaphore = Semaphore(10)
items.map { item -> async { semaphore.withPermit { process(item) } } }.awaitAll()
```

---

## Flow & State

### Collecting on Wrong Dispatcher — MEDIUM

`collect` on a hot `StateFlow` with heavy work blocks the collector thread. Use `collectLatest`, `flatMapLatest`, or move work off the collector.

### No `StateFlow` for UI State — MEDIUM

Expose immutable `StateFlow` to the UI, not mutable `MutableStateFlow`. Keep the mutable reference private.

```kotlin
// GOOD
private val _state = MutableStateFlow<UiState>(UiState.Loading)
val state: StateFlow<UiState> = _state.asStateFlow()
```

### Using `flow {}` for Emitter-Only Work — LOW

Prefer `flowOf`, `asFlow`, and `callbackFlow` for their intent. A hand-written `flow { emit(x) }` where `flowOf` fits adds noise.

---

## Compose

### Modifier Order — MEDIUM

Order matters. `clickable` after `padding` and before `size` changes the hit area and layout behavior. Review modifier chains left-to-right.

### Recomposing Heavy Trees — MEDIUM

Expensive computation inside composables runs on every recomposition. Hoist to `remember` / `remember(state)`.

```kotlin
// BAD — recomputes every recomposition
val filtered = items.filter { it.active }  // inside composable body

// GOOD
val filtered = remember(items) { items.filter { it.active } }
```

### Missing `key()` in Lazy Lists — HIGH

`LazyColumn` items with unstable identity reuse wrong state. Add `key` for stateful items.

```kotlin
// GOOD
items(items, key = { it.id }) { item -> ItemRow(item) }
```

### Remembering Unstable Types — LOW

Objects without `equals`/`hashCode` break `remember` invalidation. Use `rememberSaveable` for the right data or stable types.

---

## Idioms & Style

### Destructuring to Nullable Members — MEDIUM

`val (a, b) = pair` on nullable components needs care — `component1()` on a null throws.

### Using `apply` for Side Effects — LOW

`apply` should configure the receiver. Side-effect-only blocks belong in `also` or explicit statements.

### Redundant `?.let` — LOW

`x?.let { y } ?: z` is often clearer as `x?.let { y } ?: z` vs an explicit `if/else`. Prefer the clearest form, don't over-chain.

### Not Using Data Classes — LOW

Hand-written `equals`/`hashCode`/`toString` where a `data class` fits is a smell.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| `!!` force unwrap | CRITICAL | Use `?.` / `?:` / explicit throw |
| `GlobalScope` | CRITICAL | Use scoped coroutines |
| Swallowing `CancellationException` | HIGH | Rethrow it, catch specific types |
| Blocking call on Main dispatcher | HIGH | `withContext(Dispatchers.IO)` |
| Unbounded concurrency in loops | HIGH | Semaphore / chunking |
| Exposing `MutableStateFlow` | MEDIUM | Private mutable, public `asStateFlow()` |
| Unstable `remember` keys | MEDIUM | Use stable types or `key()` |
| Missing `key()` in LazyColumn | HIGH | Add stable item key |
| Modifier ordering bugs | MEDIUM | Review chain order (padding/clickable/size) |
| Everything nullable | MEDIUM | Non-null defaults at boundaries |
| `async` without `awaitAll` | MEDIUM | Await or scope the children |