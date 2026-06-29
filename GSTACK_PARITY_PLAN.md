# SriFlow ↔ gstack Parity Plan

Full parity with gstack across documentation, browser stack, testing, and skill quality.
Hand-written skills (no templates). TypeScript/Bun browser. No telemetry. No operational tooling.

---

## Phase 1: Documentation & Foundation

**Goal:** Create all missing documentation files to match gstack's doc set.

### 1.1 — `my-stack/VERSION`

Single-line semver. Start at `2.0.0` (current mystack version).

```
2.0.0
```

### 1.2 — `my-stack/package.json`

Bun project config. Needed for browser stack compilation and test runner.

```json
{
  "name": "sriflow",
  "version": "2.0.0",
  "type": "module",
  "engines": { "bun": ">=1.0.0" },
  "scripts": {
    "build": "bun run browse/build.ts",
    "test": "bun test test/ --ignore 'skill-e2e-*.test.ts' --ignore 'skill-llm-eval.test.ts'",
    "test:e2e": "EVALS=1 bun test test/skill-e2e-*.test.ts",
    "test:evals": "EVALS=1 bun test test/skill-e2e-*.test.ts test/skill-llm-eval.test.ts",
    "gen:skill-docs": "echo 'Hand-written skills — no generation'"
  },
  "dependencies": {
    "playwright": "^1.58.0"
  },
  "devDependencies": {
    "@anthropic-ai/sdk": "^0.78.0"
  }
}
```

### 1.3 — `my-stack/ARCHITECTURE.md`

Explain WHY sriflow is built this way. Sections:

1. **The core idea** — Markdown skills + Python browser daemon. Why this design.
2. **Pipeline architecture** — `think → plan → plan-review → design → build → code-review → test → ship → reflect` with data flow between stages.
3. **Memory system** — SRIFLOW_MEMORY.md structure, auto-compression, per-project isolation.
4. **Trim layer** — Caveman (speech) + Ponytail (code) as always-on optimization.
5. **Browser architecture** — Daemon model, persistent state, ref-based selection. Why TypeScript/Bun over Python.
6. **Multi-host support** — Claude, OpenCode, GitHub Copilot. What changes per host.
7. **Security model** — Localhost-only browser, bearer token auth, no remote access.
8. **Error philosophy** — Errors for AI agents, not humans. Actionable messages.

### 1.4 — `my-stack/ETHOS.md`

Builder philosophy. Sri's principles. Sections:

1. **The lazy senior dev** — YAGNI, deletion over addition, shortest working diff.
2. **Complete over clever** — Do the whole thing. No "follow-up PR" for tests.
3. **Search before building** — Three layers: tried-and-true, new-and-popular, first-principles.
4. **Voice** — Direct, builder-to-builder. No corporate, no hype, no AI vocabulary.
5. **Anti-patterns** — What to avoid (abstraction for one implementation, speculative flexibility, etc.)

### 1.5 — `my-stack/CONTRIBUTING.md`

How to add/modify skills. Sections:

1. **Quick start** — Clone, install, dev mode.
2. **Skill anatomy** — SKILL.md structure: frontmatter, preamble, triggers, allowed-tools, workflow steps.
3. **Adding a skill** — Step-by-step: create dir, write SKILL.md, add triggers, test manually.
4. **Writing style** — Voice rules, AskUserQuestion format, completion status protocol.
5. **Testing** — How to run tests, what each tier validates.
6. **Multi-host** — What changes for Claude vs OpenCode vs Copilot.
7. **File layout** — Directory tree with annotations.

### 1.6 — `my-stack/DESIGN.md`

Design system spec for sriflow's visual output (browser screenshots, HTML mockups). Sections:

1. **Product Context** — What sriflow is, who it's for.
2. **Aesthetic Direction** — Minimal, function-first. Terminal-inspired.
3. **Typography** — Font choices for HTML mockups.
4. **Color** — Dark mode palette, accent colors.
5. **Spacing** — Base unit, scale.
6. **Layout** — Grid system.
7. **Decisions Log** — Date | Decision | Rationale table.

### 1.7 — `my-stack/BROWSER.md`

Complete browser reference. Sections:

1. **Quick start** — Build, set $B, drive a page.
2. **Architecture** — Daemon model diagram, lifecycle.
3. **Command reference** — All 58 commands in tables (READ/WRITE/META).
4. **Snapshot system** — Ref-based selection, @e/@c refs, flags.
5. **Security** — Localhost-only, bearer auth, Unicode sanitization.
6. **Troubleshooting** — Common issues and fixes.

### 1.8 — `my-stack/CHANGELOG.md`

Release notes. Format matching gstack:

```markdown
# Changelog

## [2.0.0] - 2026-06-28

## **Full gstack parity. Browser stack port, 3-tier tests, complete docs.**

[ narrative paragraph ]

### What changed

#### Added
- **Browser stack:** Full TypeScript/Bun port from gstack — 58 commands, daemon model, ref system.
- **Test suite:** 3-tier testing — static validation, E2E, LLM-as-judge.
- **Documentation:** ARCHITECTURE, ETHOS, CONTRIBUTING, DESIGN, BROWSER, CHANGELOG.

#### Changed
- **Skills:** All 13 skills brought to gstack quality parity.

#### Fixed
- (none yet)
```

### 1.9 — Update `my-stack/README.md`

Improve with:
- Better quickstart (3 commands to get running)
- Install instructions for Claude Code, OpenCode, GitHub Copilot
- Pipeline overview table (already exists, enhance)
- Link to ARCHITECTURE.md, CONTRIBUTING.md, BROWSER.md
- Platform support notes

---

## Phase 2: Browser Stack (TypeScript/Bun)

**Goal:** Port gstack's full browser infrastructure to sriflow. Match exactly.

### 2.1 — Directory Structure

```
my-stack/browse/
├── src/                    # TypeScript source (port from gstack/browse/src/)
│   ├── commands.ts         # Command registry (adapt names)
│   ├── server.ts           # Bun.serve HTTP daemon
│   ├── browser-manager.ts  # Playwright browser management
│   ├── snapshot.ts         # Ref system + accessibility tree
│   ├── tab-session.ts      # Per-tab state
│   ├── cli.ts              # CLI entry point
│   ├── read-commands.ts    # READ command handlers
│   ├── write-commands.ts   # WRITE command handlers
│   ├── meta-commands.ts    # META command handlers
│   ├── error-handling.ts   # Error rewriting
│   ├── sanitize.ts         # Unicode sanitization
│   ├── stealth.ts          # Anti-bot headers
│   ├── config.ts           # Configuration
│   ├── content-security.ts # Content security (simplified)
│   └── ... (other modules as needed)
├── test/                   # Browser-specific tests
├── build.ts                # Bun build script
├── package.json            # Browse-specific deps
└── SKILL.md                # Hand-written skill doc
```

### 2.2 — Adaptations from gstack

| Aspect | gstack | sriflow |
|--------|--------|---------|
| State dir | `~/.gstack/` | `~/.sriflow/` |
| State file | `.gstack/browse.json` | `.sriflow/browse.json` |
| Log files | `.gstack/browse-*.log` | `.sriflow/browse-*.log` |
| Binary name | `browse` | `sriflow-browse` |
| CLI prefix | `$B` | `$B` (same — universal) |
| Skill name | `browse` | `sriflow-browser` |
| Config dir | `~/.gstack/` | `~/.sriflow/` |
| Security dir | `~/.gstack/security/` | `~/.sriflow/security/` |

### 2.3 — Command Registry

Port all 58 commands from gstack's `commands.ts`. Categories:

- **READ (19):** text, html, links, forms, accessibility, js, eval, css, attrs, console, network, cookies, storage, perf, dialog, is, inspect, media, data
- **WRITE (22):** goto, back, forward, reload, load-html, click, fill, select, hover, type, press, scroll, wait, viewport, cookie, cookie-import, header, useragent, upload, dialog-accept, dialog-dismiss, style, cleanup, prettyscreenshot, download, scrape, archive
- **META (17):** tabs, tab, tab-each, newtab, closetab, status, stop, restart, screenshot, pdf, responsive, chain, diff, url, snapshot, handoff, resume, connect, disconnect, focus, inbox, watch, state, frame, domain-skill, skill, cdp, memory

Adapt `COMMAND_DESCRIPTIONS` to reference sriflow paths.

### 2.4 — Ref System

Port from gstack's `snapshot.ts` + `tab-session.ts`:

- `@e1`, `@e2`, ... interactive refs via ARIA tree
- `@c1`, `@c2`, ... cursor-interactive refs
- `resolveRef()` with staleness detection
- Two-pass parsing (count then assign)
- Snapshot flags: `-i`, `-c`, `-d`, `-s`, `-D`, `-a`, `-o`, `-C`, `-H`

### 2.5 — Server Architecture

Port from gstack's `server.ts`:

- `Bun.serve()` HTTP on localhost
- Random port 10000-60000
- Bearer token auth (UUID, mode 0o600)
- 30-minute idle timeout
- Auto-shutdown on Chromium crash
- Unicode sanitization at egress

### 2.6 — Security (Simplified)

Port core security, skip prompt injection defense (no sidebar agent in sriflow):

- Localhost-only binding
- Bearer token auth
- Unicode sanitization (lone surrogates → U+FFFD)
- Content security markers for untrusted content
- Skip: ML classifier, canary tokens, sidebar agent defense, ngrok tunnel

### 2.7 — `sriflow-browser/SKILL.md`

Hand-written skill doc. Sections:

1. **When to invoke** — Dev mode (localhost) vs Automation mode (external).
2. **Preamble** — Branch detection, session ID, memory read.
3. **Quick start** — Build binary, set $B, drive a page.
4. **Commands** — All 58 commands grouped by category.
5. **Snapshot system** — Ref-based selection tutorial.
6. **Dev mode** — Auto-detect local port, hot-reload visibility.
7. **Automation mode** — Real sites, forms, scraping, auth.
8. **Security** — What's protected, what's not.

---

## Phase 3: Test Infrastructure

**Goal:** 3-tier test suite matching gstack's testing architecture.

### 3.1 — Directory Structure

```
my-stack/test/
├── helpers/
│   ├── skill-parser.ts         # Extract + validate commands from SKILL.md
│   ├── session-runner.ts       # E2E: spawn claude -p, stream NDJSON
│   ├── eval-store.ts           # Eval persistence + comparison
│   ├── llm-judge.ts            # LLM-as-judge scoring
│   ├── hermetic-env.ts         # Scrub operator context from child env
│   └── touchfiles.ts           # Diff-based test selection
├── skill-parser.test.ts        # Tier 1: command extraction + validation
├── skill-validation.test.ts    # Tier 1: structural SKILL.md validation
├── skill-e2e-think.test.ts     # Tier 2: /sriflow-think E2E
├── skill-e2e-plan.test.ts      # Tier 2: /sriflow-plan E2E
├── skill-e2e-build.test.ts     # Tier 2: /sriflow-build E2E
├── skill-e2e-review.test.ts    # Tier 2: /sriflow-code-review E2E
├── skill-e2e-test.test.ts      # Tier 2: /sriflow-test E2E
├── skill-e2e-ship.test.ts      # Tier 2: /sriflow-ship E2E
├── skill-e2e-browser.test.ts   # Tier 2: /sriflow-browser E2E
├── skill-e2e-router.test.ts    # Tier 2: /sriflow router E2E
├── skill-llm-eval.test.ts      # Tier 3: LLM-as-judge quality scoring
└── fixtures/
    └── (test data as needed)
```

### 3.2 — Tier 1: Static Validation (Free)

**skill-parser.ts:**
- `extractSkillCommands(skillPath)` — Parse SKILL.md, extract bash commands from code blocks.
- `validateSkill(skillPath)` — Validate commands against browser command registry.
- `extractTriggers(skillPath)` — Extract trigger phrases from frontmatter.
- `extractAllowedTools(skillPath)` — Extract allowed-tools list.

**skill-parser.test.ts:**
- Command extraction accuracy (quoted args, line numbers).
- Invalid command detection.
- Snapshot flag validation.

**skill-validation.test.ts:**
- All 13 skills have valid frontmatter (name, description, triggers, allowed-tools).
- All skills have preamble section.
- All skills have AskUserQuestion format section.
- All skills have completion status protocol.
- All skills have voice section.
- No hardcoded branch names in git commands.
- Cross-skill path consistency (SRIFLOW_MEMORY.md references).
- Browser commands in sriflow-browser match command registry.

### 3.3 — Tier 2: E2E Tests (Paid)

**session-runner.ts:**
- Spawn `claude -p` as subprocess.
- Stream NDJSON output.
- Track turns, tool calls, timing.
- Timeout handling (120s default).
- Hermetic child environment.

**Per-skill E2E tests:**
- Each test: invoke skill with a prompt, verify it completes without errors.
- Check output contains expected sections.
- Verify memory write happened.
- Verify no browse errors.

**eval-store.ts:**
- `EvalCollector` class — accumulate results, write to `~/.sriflow/projects/$SLUG/evals/`.
- Incremental saves (`_partial-e2e.json`).
- Auto-compare with previous run.
- Cost estimation (input/output chars → tokens → USD).

### 3.4 — Tier 3: LLM-as-Judge (Paid)

**llm-judge.ts:**
- `judge(section, content)` — Score SKILL.md sections on clarity/completeness/actionability (1-5).
- Uses `claude-sonnet-4-6` for scoring stability.
- Threshold: every dimension must score ≥ 4.

**skill-llm-eval.test.ts:**
- Score each skill's SKILL.md on 3 dimensions.
- Compare against baseline (first run pins baseline).
- Regression detection: new score must be ≥ baseline.

### 3.5 — Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "bun test test/ --ignore 'skill-e2e-*.test.ts' --ignore 'skill-llm-eval.test.ts'",
    "test:e2e": "EVALS=1 bun test test/skill-e2e-*.test.ts",
    "test:evals": "EVALS=1 bun test test/skill-e2e-*.test.ts test/skill-llm-eval.test.ts",
    "test:static": "bun test test/skill-parser.test.ts test/skill-validation.test.ts"
  }
}
```

---

## Phase 4: Skill Quality Parity

**Goal:** Bring all 13 existing skills to gstack quality standards.

### 4.1 — Audit Checklist (per skill)

For each of the 13 skills, verify and add if missing:

| Section | Required? | Source |
|---------|-----------|--------|
| Frontmatter (name, version, description, triggers, allowed-tools) | Yes | gstack pattern |
| `## When to invoke this skill` | Yes | gstack pattern |
| `## Preamble (run first)` bash block | Yes | gstack pattern |
| Plan mode safe operations | If applicable | gstack pattern |
| AskUserQuestion format | Yes | gstack pattern |
| Voice section | Yes | gstack pattern |
| Completeness principle | Yes | gstack pattern |
| Completion status protocol | Yes | gstack pattern |
| Confusion protocol | Yes | gstack pattern |
| Context recovery | Yes | gstack pattern |
| Memory write | Yes | sriflow pattern |

### 4.2 — Skills to Audit

| # | Skill | gstack Equivalent | Key Gaps |
|---|-------|-------------------|----------|
| 1 | sriflow-think | office-hours | Needs full 6-phase BA structure, forcing questions |
| 2 | sriflow-plan | spec + autoplan | Needs 5-phase intent-to-spec, tech stack decisions |
| 3 | sriflow-plan-review | plan-ceo/design/eng-review | Needs 3-lens scoring, iterative loop |
| 4 | sriflow-design | design-shotgun/consultation/html/review | Needs multi-candidate, DESIGN.md output |
| 5 | sriflow-build | guard + careful | Needs pre-build safety, existing code check |
| 6 | sriflow-code-review | review | Needs 6-lens review, auto-fix gate |
| 7 | sriflow-test | qa + qa-only | Needs 4 test categories, gate logic |
| 8 | sriflow-browser | browse | Needs full 58-command reference |
| 9 | sriflow-ship | ship + land-and-deploy | Needs test gate, PR flow, CI wait |
| 10 | sriflow-reflect | retro | Needs commit analysis, work patterns |
| 11 | sriflow-memory | context-save/restore | Needs auto-compress, project isolation |
| 12 | sriflow-trim | (custom) | Already complete |
| 13 | sriflow (router) | gstack (router) | Needs intent detection, routing logic |

### 4.3 — Per-Skill Improvements

For each skill, specific improvements based on gstack patterns:

**sriflow-code-review:** Already has 6-lens review. Add: language-specific appendix (JS/Python/Ruby/Go patterns), LLM attack scenarios appendix, complexity anti-patterns reference. (The existing skill already has most of this — verify completeness.)

**sriflow-test:** Already has 4 categories, gate logic. Add: edge case checklist by input type, error state checklist by dependency type, regression derivation guide. (Already has these — verify completeness.)

**sriflow-browser:** Needs complete rewrite to match gstack's browse/SKILL.md. All 58 commands, snapshot system, dev mode, automation mode.

**sriflow-think:** Verify 6 BA phases are complete. Add office-hours forcing questions.

**sriflow-plan:** Verify 5-phase structure. Add tech stack decision framework.

**sriflow-plan-review:** Verify 3-lens scoring. Add iterative improvement loop.

**sriflow-design:** Verify multi-candidate flow. Add DESIGN.md → HTML pipeline.

**sriflow-build:** Add pre-build safety check. Add reuse-first code ladder.

**sriflow-ship:** Add test gate integration. Add CI wait flow.

**sriflow-reflect:** Add commit history analysis. Add work pattern detection.

**sriflow-memory:** Verify auto-compress at 50 entries. Verify per-project isolation.

---

## Phase 5: Multi-Host Awareness

**Goal:** Skills work on Claude Code, OpenCode, and GitHub Copilot.

### 5.1 — Host Differences

| Aspect | Claude Code | OpenCode | GitHub Copilot |
|--------|-------------|----------|----------------|
| Skills dir | `~/.claude/skills/` | `~/.config/opencode/skills/` | `.github/copilot-skills/` |
| Frontmatter | Full (name, desc, hooks, version) | Full | Minimal (name, desc) |
| Tool names | Bash, Read, Write, etc. | Bash, Read, Write, etc. | Different tool names |
| Preamble | Full bash preamble | Simplified | Simplified |
| Memory file | CLAUDE.md | AGENTS.md | .github/copilot-instructions.md |

### 5.2 — Adaptations

Since skills are hand-written (no template system), multi-host support means:

1. **Document** host-specific paths in CONTRIBUTING.md.
2. **Install script** detects host and installs to correct directory.
3. **SKILL.md frontmatter** uses universal fields (name, description, triggers, allowed-tools).
4. **Preamble** uses conditional logic for host detection (if CLAUDE.md exists, if AGENTS.md exists, etc.).

---

## Execution Order

| Phase | Depends On | Effort | Files Created/Modified |
|-------|-----------|--------|----------------------|
| 1: Documentation | None | Medium | 8 new files, 1 updated |
| 2: Browser Stack | Phase 1 (package.json) | Large | ~70 new files |
| 3: Test Infrastructure | Phase 2 (command registry) | Large | ~20 new files |
| 4: Skill Quality | Phase 1 (docs) | Medium | 13 files updated |
| 5: Multi-Host | Phase 4 (skills) | Small | 3 files updated |

**Recommended order:** 1 → 4 → 2 → 3 → 5

Rationale: Documentation first (establishes conventions). Skill quality second (improves existing work). Browser stack third (heaviest lift, benefits from conventions). Tests fourth (validates browser + skills). Multi-host last (layer on top).

---

## Risks & Decisions

| Risk | Mitigation |
|------|-----------|
| Browser port is massive (~70 files) | Port incrementally: commands.ts + server.ts + snapshot.ts first, then add modules |
| E2E tests need `claude -p` | Gate behind EVALS=1, skip in CI without API key |
| Multi-host tool name differences | Document per-host, don't try to unify |
| Skill quality audit may reveal gaps | Audit first, fix second — don't rewrite skills that are already complete |
| Bun dependency for browser | Bun is already in gstack ecosystem, reasonable requirement |
