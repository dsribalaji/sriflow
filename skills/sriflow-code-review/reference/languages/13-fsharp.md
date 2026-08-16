# F# Code Review Guide

## Computation Expressions

### Using the Wrong CE — MEDIUM

`async`, `task`, `seq`, `option`, `result` have different semantics. `async` runs on thread pool with cancellation; `seq` is lazy; `option` short-circuits on None. Mixing them without conversion is a smell.

### Missing Cancellation Handling in async — HIGH

Long-running `async` blocks must honor `CancellationToken`. `Async.FromCancellation`, `let!` propagation, and `Async.CancellationToken` are the levers.

```fsharp
// GOOD — pass the token
async {
    use! _ = Async.OnCancel(fun () -> log "cancelled")
    do! hardWork()
}
```

### Async.Start vs Async.RunSynchronously — HIGH

`Async.Start` fire-and-forget swallows exceptions and isn't awaited. Prefer returning an `Async<'T>` and let the boundary run it, or `Async.StartImmediate` with an error handler.

```fsharp
// BAD — exceptions lost
Async.Start work

// GOOD — let caller drive it
work
```

### Task CE vs async CE — MEDIUM

In .NET 6+, `task { }` CE interops better with `Task`/`ValueTask`. Pick one per project; don't bounce between both in one module.

---

## Discriminated Unions

### Raw Strings Over DU States — HIGH

A domain state modeled as a `string` loses exhaustiveness. The compiler cannot prove you handled every case.

```fsharp
// BAD — stringly-typed state
type OrderState = string   // "pending" | "approved" | ...

// GOOD — exhaustive by construction
type OrderState =
    | Pending
    | Approved
    | Rejected of reason: string
```

### Non-Exhaustive Match — CRITICAL

Pattern matches must be exhaustive. A `match` that silently drops a case (`_ -> ignore`) hides domain logic.

```fsharp
// GOOD — compiler forces you to enumerate
match state with
| Pending   -> ...
| Approved  -> ...
| Rejected r -> ...
```

### Single-Case DU Without Meaning — LOW

A one-case DU that just wraps a value adds ceremony. Use it only when the case name carries meaning (`UserID of int64` vs a bare `int64`).

### Record/DU Field Naming — LOW

DU cases with positional fields are unlabeled. Prefer named fields for >2 parameters.

---

## Immutability & State

### Mutable Everywhere — MEDIUM

`let mutable` and `mutable` record fields are needed occasionally but pervasive mutation defeats the language. Fold/accumulate or use state threads instead.

```fsharp
// BAD — imperative accumulation
let mutable total = 0
for x in items do total <- total + x

// GOOD — fold
let total = List.fold (+) 0 items
```

### Shared Mutable State Across Threads — CRITICAL

`mutable` captured in parallel workflows is a race. Use `MailboxProcessor` (agent), locks, or immutable data.

### Option.get / Exceptions for Flow — MEDIUM

`Option.get` on a possibly-None value crashes. Use `Option.defaultValue`, `Option.bind`, or pattern match.

```fsharp
// BAD
let name = Option.get maybeName

// GOOD
let name = maybeName |> Option.defaultValue "unknown"
```

---

## Functional Patterns

### Partial Application Clarity — LOW

Curried functions that read as a sequence are idiomatic, but a curried function with 4+ params is hard to call. Keep pipelines shallow.

### Point-Free Overkill — LOW

`fun x -> f x` is sometimes clearer than `f`. Point-free only when it doesn't hurt readability.

### Pipelines vs Nested Calls — MEDIUM

`|>` pipelines are idiomatic; deeply nested calls are not. Flag non-obvious nesting.

```fsharp
// GOOD — reads top to bottom
orders
|> List.filter (fun o -> o.total > 100m)
|> List.map orderToSummary
|> List.sortByDescending (fun s -> s.total)
```

### Exceptions vs Result — MEDIUM

Business-expected failures should use `Result`/`Choice`, not exceptions. Reserve exceptions for programmer errors and boundary failures.

---

## .NET Interop & Performance

### Sync-over-Async in F# Code — HIGH

Blocking on `.Result`/`.GetAwaiter().GetResult()` inside async context deadlocks or stalls. Await properly with `let!` / `Async.AwaitTask`.

### Structural vs Reference Equality — MEDIUM

Records and DUs compare structurally by default; classes by reference. Assume equality semantics by type; flag accidental `=` on large graphs (expensive).

### Tail Call Recursion — MEDIUM

Deep recursion that isn't tail-recursive overflows the stack. Use accumulator patterns.

```fsharp
// GOOD — tail-recursive
let rec length acc = function
    | [] -> acc
    | _::rest -> length (acc + 1) rest
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Non-exhaustive match | CRITICAL | Enumerate all DU cases |
| `Option.get` on unknown value | MEDIUM | `Option.defaultValue` / pattern match |
| Mutable state across threads | CRITICAL | Agent / locks / immutable |
| Stringly-typed domain states | HIGH | Discriminated unions |
| `Async.Start` fire-and-forget | HIGH | Return the Async, let caller run |
| Sync-over-async (`.Result`) | HIGH | `let!` / `Async.AwaitTask` |
| Non-tail recursion | MEDIUM | Accumulator pattern |
| Exceptions for expected failures | MEDIUM | `Result` / `Choice` |
| Mixed async/task CEs | MEDIUM | Pick one CE per project |
| Point-free overkill | LOW | Keep pipelines readable |
| Mutable-heavy code | MEDIUM | Fold / immutable accumulation |