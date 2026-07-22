---
name: sriflow-ship
preamble-tier: 2
version: 3.0.0
category: pipeline
related: sriflow-test, sriflow-code-review, sriflow-reflect
description: "Deploy pipeline with multi-platform support. Gates on code review and QA. Absorbs: gstack land-and-deploy + canary, all deploy targets (npm/pip/homebrew/vercel/fly/docker)."
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
  - ship this
  - deploy
  - merge and deploy
  - push to production
  - release
  - /sriflow-ship
next-skill: /sriflow-reflect
---

# /sriflow-ship — Multi-Platform Deploy Pipeline

## When to invoke

After test passes. Gates: CRITICAL in CODE_REVIEW.md = hard block, QA_REPORT.md failures require explicit risk acknowledgment. Detects deploy target from config files. Supports: vercel, fly, railway, docker, github-actions, npm, pip, homebrew, go-install, binary-release. CLI projects skip browser smoke test.

## Reference files

| Step | File | Content |
|------|------|---------|
| Preamble | `reference/01-preamble.md` | Shell init, gate file checks, target detection |
| Gate check | `reference/02-gate-check.md` | CODE_REVIEW.md + QA_REPORT.md gate logic |
| Deploy target | `reference/03-deploy-target.md` | 10 target types, detection, CLI-specific smoke |
| Flow detection | `reference/04-flow-detection.md` | PR OPEN → land-and-deploy, else direct deploy |
| Land-and-deploy | `reference/05-land-and-deploy.md` | Merge → CI wait → deploy |
| Direct deploy | `reference/06-direct-deploy.md` | Commit → push → deploy |
| Smoke test | `reference/07-smoke-test.md` | Web: HTTP 200. CLI: --version + --help |
| Deploy record | `reference/08-deploy-record.md` | SHA, target, flow, CI, smoke, duration |
| References | `reference/09-references.md` | Edge cases, rollback, CI polling |
| Production audit | `reference/10-production-audit.md` | Pre-deploy: secrets, deps, build, bundle |

### Absorbed patterns

| Source | Pattern | Integration |
|--------|---------|-------------|
| **gstack land-and-deploy** | Merge → CI → deploy → smoke → rollback | Full workflow adopted |
| **gstack canary** | Post-deploy monitoring loop | `reference/patterns/canary-monitoring.md` |
| **gstack deploy targets** | vercel, fly, railway, docker | Already present |
| **ECC production audit** | Dependency audit, secrets scan, bundle size | `reference/10-production-audit.md` |
| **ECC document-release** | Post-ship doc update workflow | Step 7: post-deploy docs |
| **ruflo CI/CD** | CI polling format, deploy log commands | `reference/patterns/ci-polling.md` |
| **gstack rollback** | Rollback guidance per platform | `reference/patterns/rollback-guide.md` |

## Deploy targets (10)
vercel > fly > railway > github-actions > docker > npm > pip > homebrew > go-install > binary-release

## Workflow
1. **Step 0** — Gate check (CODE_REVIEW.md: CRITICAL → hard block, QA_REPORT.md: failures → ack)
2. **Step 0b** — Production audit (deps, secrets, build, test health)
3. **Step 1** — Deploy target detection
4. **Step 2** — Flow detection (PR OPEN → land-and-deploy, else direct)
5. **Step 3/4** — Deploy
6. **Step 5** — Smoke test (CLI: --version + --help, Web: HTTP 200)
7. **Step 6** — Deploy record
8. **Step 7** — Post-deploy output

## Hard rules
1. CRITICAL review = BLOCKED (solo: overridable)
2. CI is sacred — never deploy without green CI
3. Rollback ready — every deploy must be reversible
4. Never force push, never skip CI, never assume URLs

## Voice
Direct, builder-to-builder, active via trim.

## Completion Status
- **DONE** — deployed with URL/SHA, CI pass.
- **DONE_WITH_CONCERNS** — deployed with issues.
- **BLOCKED** — cannot proceed.
