# Council Lens — TypeScript Review

Domain lens applied by the plan reviewer when the plan's stack is TypeScript/JavaScript. Checks the plan for TS-specific risks: type safety, async patterns, module boundaries, and the Node/browser runtime split. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's TypeScript choices**. The dominant risks are `any`-creep, unhandled async, and the sharp divide between Node and browser runtimes.

## What to check

### Type safety posture
- [ ] `strict: true` is the floor (strictNullChecks non-negotiable). The plan names the compiler config baseline.
- [ ] `any` policy: banned in committed code by default; `unknown` + narrowing for genuinely unknown data (parsed JSON, API responses). `ts-ignore` requires a stated reason.
- [ ] Discriminated unions for state and result types — the design language models "success | loading | error" as a union, not booleans.
- [ ] Public boundaries (API clients, config, event payloads) have typed contracts: `zod`/`io-ts` runtime validation where data crosses a trust boundary, not just compile-time types.
- [ ] If the codebase will exceed a few thousand lines: `noUncheckedIndexedAccess` on.

### Async and error handling
- [ ] Unhandled rejection policy: every promise path has an error handler or a stated reason not to (fire-and-forget events).
- [ ] Async boundaries named: `.then` chains vs `async/await`; `Promise.all` vs sequential — the plan picks `Promise.allSettled` where partial failure is tolerable.
- [ ] Timeout strategy: external calls get timeouts (AbortSignal), else they hang forever.
- [ ] Error taxonomy: application errors vs programmer bugs distinguished; error boundaries in the UI (React error boundaries) planned for render errors.

### Module and runtime boundaries
- [ ] ESM vs CJS decided (Node ≥ 20: ESM is the default); `"type": "module"` or transpile strategy stated.
- [ ] The Node/browser split is explicit: code that touches `process`, `fs`, or the network runs server-side only; browser bundles never import node builtins (a classic build-time surprise).
- [ ] Monorepo/turborepo/nx or single package — chosen for real boundaries; workspace protocol (`workspace:*`) for internal deps.
- [ ] Package manager locked (npm/pnpm/yarn + lockfile); `engines` field pins Node.

### Framework layer (if any)
- [ ] React/Next/Vue/Svelte choice has a reason. If Next.js: App Router vs Pages Router, server vs client component strategy — the split is deliberate.
- [ ] State management chosen for scale (no "context for everything"); the plan names what goes in global state vs server state (React Query/SWR).
- [ ] Styling approach (Tailwind/CSS modules/styled) picked and consistent with the design skill's tokens.

### Testing realism
- [ ] Test framework named (Vitest preferred for Vite projects, Jest otherwise) with the test skill's `test-infrastructure` pattern.
- [ ] Typed tests: assertions against typed fixtures; `as any` in tests is a test-quality smell.
- [ ] Mocking the boundary, not the internals: fetch/HTTP client mocked at the network seam.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| `any` creep | Types become decoration; refactors get scary | Burn at every build |
| Silent promise rejection | Errors vanish, features half-work | Burn at prod, hard to trace |
| Node builtins in browser | Build breaks at bundle time | Burn at build |
| No runtime validation | Trusted-shape API data corrupts the app | Burn at prod |
| Context-everything state | Rerender storms as the app grows | Burn at test |
| Unpinned Node | `fetch`/top-level await differences across versions | Burn at ship |

## Verdict guidance

- **9-10**: strict + any policy + discriminated unions, runtime validation at trust boundaries, async/timeout strategy, runtime split explicit.
- **7-8**: solid TS plan; one soft spot (e.g. `any` policy implied, unhandled-rejection policy missing).
- **5-6**: TS used as "JS with types" — no strict posture, async hazards unaddressed, no boundary validation.
- **3-4**: `any`-heavy design, no error handling story, runtime split ignored.
- **0-2**: plan's type model will collapse under the first refactor.

**Block (score < 7) when:**
- The plan does not commit to `strict` mode or a null-handling policy.
- External data crosses trust boundaries without runtime validation.
- The Node/browser runtime split is unresolved for a full-stack app.

**Findings output format:**
```
typescript-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```