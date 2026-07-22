# Changelog

## [Unreleased]

### Changed
- **SKILL.md splitting:** All 13 skills refactored into compact entry points (<200 lines) + reference/ files. Prevents OpenCode from treating large skills as user input. Content preserved: 12,621 → 1,976 total lines (84% reduction).
- **Continuous learning:** sriflow-reflect now extracts observations, creates instincts with confidence scores, evolves rules over time.
- **Council adversarial review:** sriflow-plan-review adds Skeptic + Pragmatist + Critic voices after 3-lens review. Enterprise always, Medium if any lens < 8.
- **Quality gates:** sriflow-build now enforces pre-commit, post-build, and final gates (secrets, TODOs, lint, types, smoke test).
- **Token budget:** sriflow-trim now supports depth control (brief/normal/exhaustive) for response length.
- **Production audit:** sriflow-ship runs local evidence checks before deploy (deps, secrets, build, tests, bundle).
- **Code review severity:** 6-level severity system (blocking/important/nit/suggestion/learning/praise) replaces 3-level CRITICAL/WARN/NITPICK.
- **Code review process:** 4-phase structured review (Context → High-level → Line-by-line → Summary) with auto language detection.
- **Cross-cutting review guides:** 5 language-agnostic guides (SQL injection, XSS, N+1, error handling, async) for consistent security/perf reviews.
- **Language review guides:** 10 language-specific guides (React, Python, Go, TypeScript, Vue, Angular, Rust, Java, C#, Swift) loaded on-demand.
- **PR complexity scoring:** Auto-detects large PRs, estimates review time, flags risk factors.
- **Risk-based testing:** sriflow-test uses 5×5 risk matrix to prioritize test cases by impact × likelihood.
- **Test reliability:** sriflow-test classifies flakes (environmental, timing, data, non-deterministic) and quarantines them.
- **Bug reproduction:** sriflow-test has structured repro loop, bisection for large changes, determinism verification.
- **Test data management:** sriflow-build creates factory patterns, idempotent seeding, PII anonymization, cleanup strategies.
- **Shift-left testability:** sriflow-code-review checks Three Amigos, PR testability checklist, TDD guide.
- **Reference integrity:** Test suite now validates orphan references, line caps, file existence, anti-trigger in descriptions.
- **Plan templates:** sriflow-plan now has 3 typed templates (feature/bugfix/refactor) with standardized structure.
- **Phase planning:** sriflow-plan now documents research→implementation→Testing flow with phase gates.
- **Orchestration protocol:** sriflow-build now documents subagent chaining patterns (sequential + parallel).
- **Development rules:** sriflow-build now documents YAGNI/KISS/DRY principles, file size cap (<200 lines), naming conventions.
- **Module scaffolding:** sriflow-build now documents stubs pattern for models, controllers, migrations, pages.
- **Documentation management:** sriflow-ship now documents auto-update triggers for roadmap/changelog/architecture docs.
- **Test safety:** sriflow-test now documents production DB guard pattern for multiple stacks.
- **Context management:** sriflow-trim now documents token budget, cross-references, fresh context triggers.

### Fixed
- **Layout:** removed stale `my-stack/` paths left over from the subfolder→repo-root move. Fixed in `browse/src/cli.ts` (server fallback) and `skills/sriflow-browser/SKILL.md` (binary lookup), plus all docs.
- **Browser install:** `install.sh` now symlinks the `browse/` stack as `<skills>/sriflow-browse` so the binary resolves cross-project; `uninstall.sh` reverses it.
- **Browser build:** `build.ts` now emits the `dist/browse` CLI wrapper alongside `server.js`; added `browse/setup` one-shot build script.
- **Docs:** browser command count corrected 58 → 70; removed phantom commands (`cookie-import`, `domain-skill`, `skill`) and documented `focus`, `state`, `ux-audit`.
- **Tests:** removed `test:e2e` / `test:evals` scripts that pointed at non-existent files.
- **uninstall.sh:** now confirms before deleting `~/.sriflow/` state.
- **Test helper:** `validateSkillStructure` now uses case-insensitive check for completion/status keywords.
- **Browser commands:** fixed snapshot flag regex to stop at shell operators (`&&`).

### Removed
- Historical planning docs (`IMPLEMENTATION_PLAN.md`, `GSTACK_PARITY_PLAN.md`, `PRODUCTION_READINESS.md`, `QUALITY_AUDIT_REPORT.md`) — superseded by this changelog and the live docs.

## [2.0.0] - 2026-06-28

## **Full gstack parity. Browser stack port, 3-tier tests, complete docs.**

sriflow now matches gstack's standards across documentation, browser infrastructure,
testing, and skill quality. The browser stack is a full TypeScript/Bun port with 58
commands, daemon model, and ref-based selection. Three-tier test suite validates skill
structure, runs E2E skill execution, and scores doc quality via LLM-as-judge.

### What changed

#### Added
- **Browser stack:** Full TypeScript/Bun port from gstack — daemon model, ref system, persistent Chromium. (`browse/`)
- **Test suite:** static validation + parser/structure tests. (`test/`)
- **ARCHITECTURE.md:** System design doc — pipeline architecture, memory system, browser daemon, security model, error philosophy.
- **ETHOS.md:** Builder philosophy — lazy senior dev, complete over clever, search before building, voice rules.
- **CONTRIBUTING.md:** Contributor workflow — skill anatomy, adding/modifying skills, testing, multi-host support.
- **DESIGN.md:** Design system — typography, color, spacing, layout, motion, output formats.
- **BROWSER.md:** Complete browser reference — all 58 commands, snapshot system, security, dev/automation modes.
- **CHANGELOG.md:** Release notes with metrics and itemized changes.
- **VERSION:** Semantic versioning (`2.0.0`).
- **package.json:** Bun project config with test scripts.

#### Changed
- **Skills:** All 13 skills audited against gstack patterns. Added missing sections: preamble, AskUserQuestion format, voice rules, completion status protocol, confusion protocol, context recovery.
- **README.md:** Improved quickstart, platform support, pipeline table.

#### Fixed
- (none yet)

---

## [1.0.0] - 2026-06-27

## **Initial release. 13 skills built from gstack/ba-toolkit reference.**

Complete pipeline from ideation to deployment. All skills hand-written, no runtime
dependency on gstack. Always-on trim layer (caveman + ponytail). Per-project memory
system with auto-compression.

### What changed

#### Added
- **Pipeline:** think → plan → plan-review → design → build → code-review → test → ship → reflect
- **13 skills:** sriflow-think, sriflow-plan, sriflow-plan-review, sriflow-design, sriflow-build, sriflow-code-review, sriflow-test, sriflow-browser, sriflow-ship, sriflow-reflect, sriflow-memory, sriflow-trim, sriflow (router)
- **Memory system:** SRIFLOW_MEMORY.md with auto-compression at 50 entries
- **Trim layer:** Always-on speech compression + minimal code
- **Browser:** Python/Playwright wrapper (legacy, replaced in v2.0.0)
