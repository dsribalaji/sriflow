# Lens 5: COMPLEXITY

Complexity findings do not block ship, but they are real costs: the next person (or you, six months later) will read this code and pay the cognitive debt.

## Unnecessary abstraction
- An interface, abstract class, or base class with exactly one implementation
- A factory function or factory class that creates exactly one product type
- A strategy pattern with one strategy
- A plugin system for functionality that will never be extended

Flag as `NITPICK` with: `Fix: collapse to direct implementation — abstract when the second case arrives.`

## Premature parameterization
- A config option, feature flag, or environment variable for a value that will never change (hard-coded customer ID, fixed domain name, constant timeout that nobody will tune)
- Function parameter that is always called with the same value at every callsite

Flag as `NITPICK`.

## YAGNI violations
- Code added "for future flexibility" with no planned use case
- Commented-out code left in the diff (not a comment, actual commented-out code)
- TODOs that describe speculative features not in the current scope
- Generic solutions (maps, registries, dispatchers) for a problem with exactly one known case

Flag as `NITPICK`.

## Reinventing stdlib / well-tested libraries
- Custom `debounce`, `throttle`, `retry`, `memoize`, `clamp`, `groupBy` implementations when lodash, Underscore, or the stdlib equivalent exists
- Custom UUID/CUID generator when a well-tested library is already in the dependency tree
- Custom date arithmetic when `date-fns`, `dayjs`, or the Temporal API applies
- Custom deep-clone when `structuredClone` (Node 17+, browsers 2022+) works

Flag as `NITPICK` with: `Fix: use <stdlib/library function> — delete N lines.`

## Gratuitous indirection
- A chain of 3+ wrapper functions where each just calls the next with the same arguments unchanged
- A "service" class with a single method that just calls a repository method directly
- A utility function that is just a renamed alias for a function already in scope

Flag as `NITPICK`.

## Dead code
- Functions defined but never called anywhere in the diff or the codebase (use Grep to verify)
- Variables assigned a value that is never read
- `if (false)` or equivalent statically-dead branches
- Module exports that are never imported anywhere

Before flagging dead code, run:
```bash
grep -r "<function_name>" . --include="*.ts" --include="*.js" --include="*.py" -l 2>/dev/null
```
Only flag if the function genuinely has no callers outside the file that defines it.

Flag dead code as `NITPICK`.

## Over-engineering complexity scale
- Flag as `WARN` (not just NITPICK) if the complexity masks a correctness issue or security boundary (e.g., a 5-layer abstraction that obscures whether authentication is actually checked)
- Flag as `WARN` if the complexity creates a maintenance trap likely to cause future bugs (e.g., generic event bus where event payload types are `any`)
