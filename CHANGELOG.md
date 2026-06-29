# Changelog

## [2.0.0] - 2026-06-28

## **Full gstack parity. Browser stack port, 3-tier tests, complete docs.**

sriflow now matches gstack's standards across documentation, browser infrastructure,
testing, and skill quality. The browser stack is a full TypeScript/Bun port with 58
commands, daemon model, and ref-based selection. Three-tier test suite validates skill
structure, runs E2E skill execution, and scores doc quality via LLM-as-judge.

### What changed

#### Added
- **Browser stack:** Full TypeScript/Bun port from gstack — 58 commands, daemon model, ref system, persistent Chromium. (`my-stack/browse/`)
- **Test suite:** 3-tier testing — static validation, E2E via `claude -p`, LLM-as-judge quality scoring. (`my-stack/test/`)
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
