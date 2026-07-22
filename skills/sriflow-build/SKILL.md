---
name: sriflow-build
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-design, sriflow-code-review, sriflow-test
description: "Implements approved design. 5-step build with language-specific error resolution. Absorbs: ECC build-error-resolver (12 languages), gstack investigate (root cause debugging), ruflo orchestration. Not for: planning — use sriflow-plan. Not for: testing — use sriflow-test."
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
  - build this
  - implement this
  - start coding
  - write the code
  - /sriflow-build
next-skill: /sriflow-code-review
---

# /sriflow-build — Build Stage with Language-Specific Error Resolution

## When to invoke

After design is locked. Implements from PLAN.md + DESIGN.md. Runs pre-build safety check, loads context, scans for reusable code, implements using trim ladder, and runs smoke check by project type.

## Reference files

| Step | File | Content |
|------|------|---------|
| Step 0 | `reference/01-safety-check.md` | Pre-build destructive operation check |
| Step 1 | `reference/02-context-load.md` | Load PLAN.md → DESIGN.md → memory |
| Step 2 | `reference/03-code-scan.md` | Reusable code scan before writing |
| Step 3 | `reference/04-trim-ladder.md` | 7-rung YAGNI ladder |
| Step 4 | `reference/05-build-loop.md` | Per-unit build loop with self-check |
| Step 5 | `reference/06-smoke-check.md` | Project-type-aware smoke check |
| Quality | `reference/09-quality-gates.md` | Pre-commit, post-build, final gate |
| Dev rules | `reference/12-development-rules.md` | YAGNI/KISS/DRY, file size cap |
| Scaffold | `reference/13-module-scaffolding.md` | Stubs pattern |

### Language-specific error resolvers (absorbed from ECC)

| File | Language |
|------|----------|
| `reference/languages/typescript.md` | TypeScript/TSX build errors, tsconfig, module resolution |
| `reference/languages/python.md` | Python import errors, pip, venv, typing |
| `reference/languages/go.md` | Go build errors, module, workspace |
| `reference/languages/rust.md` | Rust borrow checker, cargo, macros |
| `reference/languages/java.md` | Java/Maven/Gradle build errors |
| `reference/languages/kotlin.md` | Kotlin/Gradle, Compose, KMP |
| `reference/languages/cpp.md` | C++ CMake, Make, compiler errors |
| `reference/languages/django.md` | Django migrations, collectstatic, middleware |
| `reference/languages/pytorch.md` | PyTorch CUDA, training errors |
| `reference/languages/swift.md` | Swift/Xcode build errors |
| `reference/languages/csharp.md` | C#/.NET build errors |
| `reference/languages/angular.md` | Angular CLI, zone.js, module resolution |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **ECC build-error-resolver** | Language-specific error resolution | 12 language reference files |
| **ECC refactor-cleaner** | Dead code cleanup patterns | `reference/patterns/ecc-refactor-cleaner.md` |
| **gstack investigate** | Root-cause debugging workflow | `reference/patterns/investigate-workflow.md` |
| **ruflo orchestration** | Sequential + parallel subagent chaining | `reference/patterns/orchestration-protocol.md` |
| **shadcn-lar stubs** | Module scaffolding (stubs pattern) | `reference/13-module-scaffolding.md` |

## Workflow
1. **Step 0** — Pre-build safety check (destructive op scan)
2. **Step 1** — Context load (PLAN.md → DESIGN.md → memory)
3. **Step 2** — Existing code scan (mandatory before writing)
4. **Step 3** — sriflow-trim code ladder (7 rungs)
5. **Step 4** — Build loop (per logical unit: state → ladder → reuse → write → self-check)
6. **Step 5** — Smoke check (CLI: version+help, Web: HTTP 200, Library: test suite, Service: health)
7. **On error** → detect language → load error resolver → fix → re-verify

## Voice
Direct, builder-to-builder, active via sriflow-trim.

## Completion Status
- **DONE** — implemented, smoke check passes.
- **DONE_WITH_CONCERNS** — implemented with non-critical gaps.
- **BLOCKED** — cannot proceed.
