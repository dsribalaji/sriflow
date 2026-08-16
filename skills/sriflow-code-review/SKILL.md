---
name: sriflow-code-review
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-build, sriflow-test, sriflow-ship
description: "Comprehensive diff review with 6 severity levels and 24 language-specific guides. Not for: plan review — use sriflow-plan-review. Not for: testing — use sriflow-test."
license: Apache-2.0
compatibility: Claude Code, OpenCode, or compatible AI agent
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - review my code
  - review the diff
  - code review
  - check my changes
  - /sriflow-code-review
next-skill: /sriflow-test
---

# /sriflow-code-review — Multi-Language Diff Review

## When to invoke

After build completes. Reviews current branch diff through 6 lenses with 6 severity levels. Auto-detects language and loads relevant language-specific guide. CRITICAL findings block ship. First-commit projects fall back to full-file review.

## Severity system (6 levels)
- `[blocking]` 🔴 — Must fix before merge (Solo: overridable)
- `[important]` 🟡 — Should fix
- `[nit]` 🟢 — Nice to have
- `[suggestion]` 💡 — Alternative approach
- `[learning]` 📚 — Educational
- `[praise]` 🎉 — Good work

## 6 review lenses
1. CORRECTNESS — runtime bugs, logic errors, off-by-one, null handling
2. SQL SAFETY — injection, parameterization, unbounded queries
3. SECURITY (OWASP) — broken access control, XSS, secrets, SSRF, path traversal
4. LLM TRUST BOUNDARIES — prompt injection, unvalidated LLM output, context poisoning
5. COMPLEXITY — unnecessary abstraction, YAGNI, premature parameterization
6. TRIM AUDIT — dev leftovers, wrapper-only functions, dead code

## Language-specific guides

| File | Language | What it covers |
|------|----------|----------------|
| `reference/languages/01-react.md` | React/TSX | Hooks, state, effects, rendering, performance |
| `reference/languages/02-python.md` | Python | Typing, async, context managers, patterns |
| `reference/languages/03-go.md` | Go | Idioms, error handling, goroutines, interfaces |
| `reference/languages/04-typescript.md` | TypeScript | Types, generics, async, module resolution |
| `reference/languages/05-vue.md` | Vue | Reactivity, composition API, slots |
| `reference/languages/06-angular.md` | Angular | DI, RxJS, modules, signals |
| `reference/languages/07-rust.md` | Rust | Ownership, borrows, lifetimes, unsafe, macros |
| `reference/languages/08-java.md` | Java | Streams, Optionals, DI, transactions, JPA |
| `reference/languages/09-csharp.md` | C# | LINQ, async/await, DI, nullability |
| `reference/languages/10-swift.md` | Swift | Optionals, ARC, async/await, SwiftUI |
| `reference/languages/11-kotlin.md` | Kotlin | Coroutines, null safety, Compose, flows |
| `reference/languages/12-cpp.md` | C++ | RAII, templates, smart pointers, UB patterns |
| `reference/languages/13-fsharp.md` | F# | Computation expressions, discriminated unions |
| `reference/languages/14-django.md` | Django | ORM, migrations, DRF, middleware |
| `reference/languages/18-ruby.md` | Ruby | Blocks, metaprogramming, Rails conventions |
| `reference/languages/19-php.md` | PHP | Type declarations, Laravel, security |
| `reference/languages/20-scala.md` | Scala | Functional patterns, Akka, ZIO, cats |
| `reference/languages/21-elixir.md` | Elixir | Phoenix, OTP, pattern matching, pipes |
| `reference/languages/22-haskell.md` | Haskell | Monads, typeclasses, laziness, IO |
| `reference/languages/23-graphql.md` | GraphQL | Schema design, resolvers, N+1, security |
| `reference/languages/24-protobuf.md` | Protobuf/gRPC | Service design, error handling, streaming |

### Cross-cutting guides

| File | Topic |
|------|-------|
| `reference/cross-cutting/01-sql-injection.md` | SQL injection prevention |
| `reference/cross-cutting/02-xss-prevention.md` | XSS prevention patterns |
| `reference/cross-cutting/03-n-plus-one-queries.md` | N+1 query detection |
| `reference/cross-cutting/04-error-handling.md` | Error handling patterns |
| `reference/cross-cutting/05-async-concurrency.md` | Async/await best practices |
| `reference/cross-cutting/validation.md` | Input validation at boundaries |
| `reference/cross-cutting/llm-safety.md` | LLM trust boundary patterns |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **24 language reviewers** | Language-specific review checklists | 24 language reference files |
| **Security reviewer** | OWASP Top 10 + STRIDE audit | Lens 3 enhanced |
| **Code reviewer** | 4-phase review process (gather → high-level → line-by-line → summary) | Already present in v2 |
| **Review lens** | 6-lens severity system | Already present |
| **CSO audit** | Chief Security Officer audit | `reference/cross-cutting/llm-safety.md` |
| **Security** | CVE remediation, input validation | Lens 3 enhanced |
| **Auto-fix** | Auto-fix gate for nitpicks | Step 4 Auto-Fix gate |

## Workflow
1. **Preamble** — shell init, base branch detection
2. **Step 0** — Base branch detection (gh → git → fallback)
3. **Step 1** — Branch/diff check (first-commit fallback for new projects)
4. **Step 2** — Get full diff, PR complexity score, language detection
5. **Step 3** — Six-lens review (with language-specific guide loaded)
6. **Step 4** — Auto-fix gate (nitpicks)
7. **Step 5** — Write CODE_REVIEW.md
8. **Step 6** — Verdict (BLOCKED / DONE_WITH_CONCERNS / DONE)
9. **Solo override** — Personal projects can override blocking findings

## Voice
Direct, builder-to-builder, compressed. Name files, functions, line numbers.

## Completion Status
- **DONE** — no blocking findings.
- **DONE_WITH_CONCERNS** — important findings exist.
- **BLOCKED** — blocking findings (solo: overridable).
