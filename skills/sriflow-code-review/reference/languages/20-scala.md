# Scala Code Review Guide

## Functional Patterns

### Null Over Option — HIGH

Scala has `Option`. Bare `null` handling and `.orNull` escapes the type system and invites NPEs.

```scala
// BAD — null slips through
def getUser(id: Long): User = userRepo.findById(id) // may return null

// GOOD — Option
def getUser(id: Long): Option[User] = userRepo.findById(id)
```

### `get` on Option/Seq — CRITICAL

`.get` on a `None` and `.head` on an empty `Seq` throw at runtime.

```scala
// CRITICAL
val name = maybeName.get

// GOOD
val name = maybeName.getOrElse("unknown")
```

### Pattern Match Not Exhaustive — MEDIUM

`match` without a catch-all (or sealed-type exhaustiveness) throws `MatchError`. Enabling `-Xfatal-warnings` makes the compiler enforce this.

### Throwing for Expected Failures — MEDIUM

Business-expected failure via `throw` vs `Either`/`Try`/`Option`. Prefer typed results; reserve exceptions for programmer errors.

```scala
// GOOD
def parse(id: String): Either[String, Long] =
  id.toLongOption.toRight(s"invalid id: $id")
```

### Overuse of `var` — MEDIUM

Mutable `var` and `ArrayBuffer` where immutable collections would do. Immutable by default.

### Recursion Without Tail Calls — MEDIUM

Non-tail-recursive methods overflow the stack. Use tail recursion (with `@tailrec`) or trampolines (cats `Eval`).

```scala
// GOOD
@tailrec
def sum(xs: List[Int], acc: Int = 0): Int = xs match {
  case Nil     => acc
  case h :: t  => sum(t, acc + h)
}
```

---

## Type Classes & Cats

### Orphan Instances / Ambiguity — MEDIUM

Type class instances in companion objects (good) vs random package objects (bad) — implicit resolution surprises. Review instance placement.

### Deeply Nested for-comprehensions — MEDIUM

A 6-level for-comprehension is unreadable. Flatten with `map`/`flatMap` at the right points or extract functions.

### GADT/Scala 3 Context Functions Overused — LOW

Advanced encodings for what a plain ADT + `match` would express. Prefer simple code.

### Cats Effect Resource Leaks — HIGH

`Resource` and `bracket` must release. A `cats.effect.Resource` not used with `.use` leaks the acquisition.

```scala
// GOOD — acquired and released
for {
  _ <- Resource.make(openConn())(closeConn).use { conn => work(conn) }
} yield ()
```

---

## Akka

### Actor Mutable State Unsynchronized — CRITICAL

Actor state must only be mutated inside the actor's own thread of execution. Mutable state accessed from outside (`var` touched by callers, or shared objects passed by reference) is a race.

```scala
// BAD — shared mutable object passed to actor
val buf = mutable.Buffer[Int]()
actor ! buf   // caller and actor both mutate buf

// GOOD — send immutable data
actor ! buf.toVector
```

### Asking From Inside an Actor — MEDIUM

`ask` (the `?` pattern) from inside an actor creates a nested future; if the ask target is the same actor, it deadlocks. Use `become`/state machines for internal coordination.

### No Supervision Strategy — MEDIUM

An actor without a `supervisorStrategy` lets one child failure take down the parent. Define restart/stop policies.

### Unbounded Mailboxes — HIGH

Actors with `> mailbox` size config can be flooded. Add `mailbox-capacity`/backpressure.

### Timeouts on `ask` — HIGH

An `ask` without a timeout waits forever if the actor never replies, leaking futures.

```scala
// GOOD — timeout
implicit val timeout: Timeout = 3.seconds
val result = (actor ? GetState).mapTo[State]
```

---

## ZIO

### zio-blocking for Blocking Work — MEDIUM

Blocking IO inside `ZIO.succeed` runs on the blocking pool only with `ZIO.blocking`/`blocking`. Without it, the default pool stalls.

### Effect That Never Fails — LOW

`ZIO.succeed` for code that can throw (`ZIO.attempt`), and `ZIO.succeedNow` for pure values — the distinction matters for error handling.

### Fiber Leaks — MEDIUM

`fork` without supervision, or `.fork` results never awaited/joined, leak fibers. Use `Fiber.collectAll`/`ZIO.forkAll` with scope-based interruption.

### Unsafe Run at Boundaries — MEDIUM

`.unsafeRun` inside business logic breaks interruption. The runtime boundary is the main / entry point.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| `.get` on Option | CRITICAL | `getOrElse` / pattern match |
| Actor shared mutable state | CRITICAL | Immutable messages, internal state |
| Null over Option | HIGH | Return `Option` |
| No ask timeout | HIGH | `implicit timeout` |
| Unbounded mailbox | HIGH | Capacity config |
| Resource not `.use` | HIGH | Cats `Resource.use` / `bracket` |
| `throw` for expected failures | MEDIUM | `Either` / `Try` |
| Non-tail recursion | MEDIUM | `@tailrec` |
| `var` over immutable | MEDIUM | Immutable collections |
| Blocking work on default pool | MEDIUM | ZIO `blocking` |
| Non-exhaustive match | MEDIUM | Fatal warnings / catch-all |
| `unsafeRun` in logic | MEDIUM | Runtime at boundary |