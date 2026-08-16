# Haskell Code Review Guide

## Monads & Control Flow

### Do-Nothing Bind / Misused Do — MEDIUM

`x <- pure y` and `do { return () }` where sequencing isn't needed signal a misunderstanding of the abstraction. Review `do` blocks that only chain `pure`/`return`.

### Overuse of `>>` and `>>=` For Effects — LOW

`>>=` without need (a pure computation in IO) can be replaced by `pure`/`fmap`. Flag monadic plumbing that ignores structure.

### ExceptT / EitherT Composition — MEDIUM

Nested `ExceptT` transformers (`ExceptT (ExceptT ...)`) make error handling opaque. Flatten with a single error type, or use a row-polymorphic error (e.g., `Polysemy`/`effectful`) if the project uses one.

### Throwing in Pure Code — HIGH

`error`, `undefined`, `head`, `!!`, `fromJust` are partial and crash the program. They belong only in `_` branches that are provably unreachable.

```haskell
-- CRITICAL — crashes at runtime on empty input
firstEl = head list

-- GOOD — total function
firstEl :: [a] -> Maybe a
firstEl (x:_) = Just x
firstEl []    = Nothing
```

### `fail` in MonadFail — MEDIUM

Stringly `fail` (often from `do` pattern-match failures) throws. Prefer explicit error types.

---

## Type Classes

### Orphan Instances — HIGH

An instance for `Foo` defined in a module that neither defines `Foo` nor the class is an orphan. It can silently conflict across packages. Flag them.

### Ambiguous `FlexibleInstances`/Overlapping — MEDIUM

Overlapping instances resolve non-deterministically. Review `{-# LANGUAGE OverlappingInstances #-}` usage.

### Superclass Dependencies — LOW

Instance constraints should reflect semantic dependencies (`instance Eq a => Eq [a]`), not convenience.

### Missing `{-# MINIMAL #-}` — LOW

A class with a `{-# MINIMAL #-}` pragma documents the required methods. Missing it means a default-less class can be instantiated wrong.

---

## Laziness

### Space Leaks via `foldl` — HIGH

`foldl (+) 0 large` builds a thunk chain and overflows the stack. `foldl'`/`Data.List.foldl'` is strict.

```haskell
-- BAD — space leak / stack overflow
sum' = foldl (+) 0 xs

-- GOOD — strict fold
sum' = foldl' (+) 0 xs
```

### Unbounded Thunks in Accumulators — MEDIUM

Accumulators not forced with `!` or `seq` grow. Use strict fields (`data T = T !Int`) and `BangPatterns` deliberately.

### Printing/Forcing Entire Infinite Structure — HIGH

`show` of an infinite list, or `print (fibonacciStream)` hangs. Guard with `take`/`takeWhile`.

### `map` vs `mapM`/`traverse` Confusion — MEDIUM

`map` is pure; `mapM`/`traverse` runs effects. Piping a pure `map` over IO values does nothing (IO actions never run).

---

## IO & Effects

### IO Everywhere / No Effect Isolation — MEDIUM

Business logic mixed with `IO` in one giant `main`/handler is untestable. Separate pure cores from thin IO shells (`pure core + small IO adapter`).

### `unsafePerformIO` — CRITICAL

`unsafePerformIO` in pure code breaks purity and reordering guarantees. It is only justified for memoization/caching at top level with care. Flag any use in business logic.

### Unbounded `forkIO` — HIGH

`forkIO` threads without supervision/bounding leak. Use `async` library, `withAsync`, or an actor model with bounded channels.

```haskell
-- GOOD — scoped async with cleanup
withAsync (worker job) $ \a -> do
  result <- waitCatch a
  ...
```

### STM vs MVar Choice — MEDIUM

`MVar` for simple one-shot sync; `STM` (`TVar`, `TMVar`) for composite transactions. Picking the heavier one or blocking incorrectly is a smell. `readMVar` on an empty `MVar` blocks forever — know the semantics.

### Exception in Pure Section — MEDIUM

`evaluate`/`seq` needed to force exceptions at the right point; an unforced pure computation defers the crash.

---

## Code Smells & Style

### Overly Abstract Code — MEDIUM

A single-use abstraction (`newtype` over `Identity`, custom `Monad` instances for one call site) where a plain function would do — YAGNI. Flag premature parameterization.

### `String` Over `Text`/`ByteString` — MEDIUM

`String` (linked list of chars) for IO-heavy or large data is slow. Prefer `Data.Text`/`ByteString`.

### Giant Single Functions — LOW

`where` blocks with 10 bindings signal a function that should be split.

### Missing Documentation for Non-Trivial Types — LOW

ADTs with unclear invariants need doc comments.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| `head`/`!!`/`fromJust` partials | HIGH | Total functions / `Maybe` |
| `unsafePerformIO` | CRITICAL | Restructure to IO |
| `foldl` space leak | HIGH | `foldl'` |
| Unbounded `forkIO` | HIGH | `async`/`withAsync` |
| Orphan instances | HIGH | Move to defining module |
| `error`/`undefined` in logic | HIGH | Return `Either`/`Maybe` |
| IO mixed into pure cores | MEDIUM | Split pure/IO layers |
| `String` over `Text` | MEDIUM | Use `Text`/`ByteString` |
| Unforced strict accumulators | MEDIUM | Bang patterns / strict fields |
| `map` over IO values | MEDIUM | `mapM`/`traverse` |
| Overlapping instances | MEDIUM | Resolve or remove |
| Over-abstracted one-offs | MEDIUM | YAGNI — plain functions |