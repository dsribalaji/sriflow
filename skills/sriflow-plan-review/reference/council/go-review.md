# Council Lens — Go Review

Domain lens applied by the plan reviewer when the plan's stack is Go. Checks the plan for Go-specific risks: error handling, concurrency, interface design, and deployment shape. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

No code exists yet — this lens reviews the **plan's Go choices** so idiomatic Go failure modes are designed out before build.

## What to check

### Error handling posture
- [ ] The plan names how errors flow: wrapped errors (`fmt.Errorf("...: %w", err)`) with `errors.Is`/`errors.As` for unwrapping — not string-matching error messages.
- [ ] Sentinels vs custom error types vs typed error trees — which pattern, and where the boundary of "expected error" vs "bug" is.
- [ ] Panic policy: panics reserved for programmer errors; recover only at the goroutine boundary if at all. Does the plan respect this?
- [ ] Error handling is explicit — Go has no exceptions; the plan should not assume a global handler will catch things.

### Concurrency
- [ ] If goroutines are planned, the plan names the wait strategy: `errgroup` (fail-fast group), `WaitGroup` (fan-out/fan-in), or explicit channel ownership.
- [ ] Who owns a channel is stated (Go idiom: only the owner closes). Closed-channel double-close is a panic.
- [ ] Context propagation planned (`context.Context` through the call chain) for cancellation and deadlines — this is the Go way to cancel work.
- [ ] If the app is long-running (server, daemon), graceful shutdown is in the plan: signal handling, draining, `http.Server.Shutdown`.

### Interface design
- [ ] Interfaces are consumer-defined and small (one method), not "interface for everything".
- [ ] The plan avoids premature abstraction — interfaces added when a second implementation is needed, not before.
- [ ] No error swallowing in the design language (a method returning `(T, error)` that callers ignore).

### Structuring and layout
- [ ] Package layout by domain/feature, not by layer (`internal/` for private code).
- [ ] `internal/` used to enforce boundaries; exported surface kept deliberately small.
- [ ] The plan names the HTTP router/framework choice (stdlib net/http vs chi/gin/echo) with a reason — stdlib is now capable for most routes.

### Data and serialization
- [ ] JSON handling: struct tags, `json.Unmarshal` error handling — not `map[string]interface{}` everywhere.
- [ ] If database access planned: `database/sql` vs an ORM (sqlx, GORM, ent) — each has a different migration and type-safety story.
- [ ] Time handling: `time.Time`, UTC, no `time.Now()` sprinkled without a clock abstraction if the code is tested for time.

### Testing realism
- [ ] Table-driven tests are the Go norm — is the test plan written that way?
- [ ] `go vet` and (if possible) `staticcheck` in CI with a gate.
- [ ] Race detector (`go test -race`) in CI — the single highest-value Go check. If it is missing, that's a CONCERN at minimum.
- [ ] Benchmark plan if the app has a hot path (Go benchmarks are cheap and idiomatic).

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Error string matching | Refactor of a message silently breaks a caller | Burn at build |
| Unmanaged goroutines | Leaked goroutines, no cancellation path | Burn at load test / prod |
| Double-close / shared channel writes | Panics in prod under load | Burn at prod |
| Panic-as-exception | `recover()` everywhere replaces the error model | Burn at debugging |
| No race detector | Data races surface only in production | Burn at prod |
| Interface for everything | One-method interfaces replaced by god-object interfaces | Burn at maintain |

## Verdict guidance

- **9-10**: error handling posture explicit, concurrency ownership named, graceful shutdown planned, race detector + vet in CI.
- **7-8**: solid idiomatic plan; one soft spot (e.g. context propagation implied, not stated).
- **5-6**: Go mechanics chosen but structural risks (unbounded goroutines, string-matched errors, no shutdown) present.
- **3-4**: plan treats Go as "fast C with garbage collection" — error handling and concurrency unaddressed.
- **0-2**: design fights Go (exceptions-style control flow, shared-mutable state everywhere, no error paths).

**Block (score < 7) when:**
- The plan's concurrency design has no ownership or cancellation model.
- Errors are designed to be swallowed or string-matched.
- The plan has no story for graceful shutdown in a long-running service.

**Findings output format:**
```
go-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```