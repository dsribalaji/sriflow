# Lens 1: CORRECTNESS

Look for bugs that will manifest at runtime, not style issues.

## Logic errors
- Inverted boolean guards: `if (!isAuthenticated)` that grants access instead of denying it
- Wrong operator precedence: `a || b && c` evaluated differently than intended
- Incorrect conditional structure: `if (a) { return } else if (a) { ... }` — dead branch
- Assignment in conditional: `if (x = getValue())` when `==` was intended (language-dependent)

## Off-by-one errors
- Loop bounds using `<` vs `<=` where the fence matters (e.g., pagination, slice, window)
- Slice/substring indices off by one: `str.slice(0, n)` vs `str.slice(0, n+1)`
- Pagination offset math: `(page - 1) * pageSize` vs `page * pageSize` depending on 0- vs 1-indexed pages
- Array access at `.length` instead of `.length - 1`

## Null / undefined handling
- Property access on a value that could be null or undefined without a null check
- Optional chaining missing where the chain can realistically be null (not just TypeScript types)
- Calling a method on a value that could be null: `user.profile.name` when `user.profile` could be null
- Return value of a function used directly when that function can return null/undefined/0/false

## Type safety
- Implicit numeric-to-string coercions: `"5" + 3 === "53"` in JavaScript
- Equality checks using `==` instead of `===` where type coercion would matter
- `parseInt` / `parseFloat` without base argument or without NaN check on the result
- JSON.parse used without try/catch on input that could be malformed

## Async / concurrency correctness
- Missing `await` on a Promise that must complete before the next operation
- `.then()` chain where the handler returns a Promise but the outer caller expects it resolved
- `Promise.all` used where `Promise.allSettled` is needed (one failure kills all)
- Race condition: two concurrent requests both read-then-write the same record without a lock or transaction
- `setTimeout` / `setInterval` callback referencing a closed-over variable that mutates between tick and fire

## State mutation
- Mutating a parameter directly instead of returning a new value
- Shared mutable state modified in an async handler without synchronization
- Object spread that only does a shallow copy when a deep copy is needed
- Sorting or filtering an array in place when the caller still needs the original

## Error propagation
- `catch` block that swallows an error silently without logging or re-throwing
- `try/catch` that catches but doesn't re-throw, making the caller think the operation succeeded
- Missing error check on a return value that encodes failure as a special value (`-1`, `null`, `false`)
- Async function where a rejected promise is never caught (unhandled rejection)

## Boundary conditions
- Empty input: does the code handle an empty string, empty array, or zero correctly?
- Single-element input: does a loop or recursive function terminate correctly for N=1?
- Large input: does the code have a bound on input size, or will it OOM/timeout?
- Negative numbers: does numeric math assume non-negative input without validating?

## Severity

Flag as `CRITICAL` if the bug breaks a core function or could cause data loss. Flag as `WARN` if it affects an edge case or non-critical path. Flag as `NITPICK` only if the code works correctly but reads ambiguously.
