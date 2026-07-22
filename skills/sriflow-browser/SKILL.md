---
name: sriflow-browser
preamble-tier: 2
version: 3.0.0
category: utility
related: sriflow-test, sriflow-ship
description: "Full headless Chromium daemon. 70+ commands, stealth mode, cookie import, multi-tab. Absorbs: gstack full browser (stealth, sidebar, cookie import, 70 commands). Not for: code review — use sriflow-code-review. Not for: QA planning — use sriflow-test."
license: Apache-2.0
compatibility: Requires Bun runtime and Playwright (headless Chromium daemon)
allowed-tools:
  - Bash
  - Read
  - Write
  - WebFetch
  - AskUserQuestion
triggers:
  - open the browser
  - check the site
  - browse to
  - test in browser
  - scrape
  - navigate to
  - take a screenshot
  - headless browser
  - /sriflow-browser
---

# /sriflow-browser — Full Headless Chromium (70+ Commands)

## When to invoke

Persistent headless Chromium. First call auto-starts (~3s), then ~100ms/cmd. State persists between calls. Navigate, interact, verify, diff, screenshot, test forms/uploads, handle dialogs, assert element states. Stealth mode available for bot-detection evasion.

## Reference files

| # | File | Contents |
|---|------|----------|
| 01 | `reference/01-preamble-plan.md` | Preamble bash, plan mode safe ops |
| 02 | `reference/02-setup-daemon.md` | Setup check, daemon architecture |
| 03 | `reference/03-qa-patterns.md` | 14 QA patterns (verify page, test flow, visual diff) |
| 04 | `reference/04-puppeteer-handoff.md` | Puppeteer → browse migration |
| 05 | `reference/05-snapshot.md` | Snapshot flags, ref numbering (@e, @c) |
| 06 | `reference/06-css-inspector.md` | CSS inspect, style modify, clean screenshots |
| 07 | `reference/07-commands.md` | Full command list (70+ across 10 categories) |
| 08 | `reference/08-error-security.md` | Error handling, untrusted content markers, token efficiency |
| 09 | `reference/09-workflow.md` | Scope questions, self-improvement logging |
| 10 | `reference/10-memory-completion.md` | Memory write, completion status, context recovery |

### Absorbed patterns (gstack browser)

| Feature | Reference | What it adds |
|---------|-----------|-------------|
| **Stealth mode** | `reference/patterns/stealth.md` | Anti-bot-detection evasion (webdriver flags, navigator overrides) |
| **Cookie import** | `reference/patterns/cookie-import.md` | Import from Chrome profile, Firefox, or JSON |
| **Sidebar** | `reference/patterns/sidebar.md` | Visible browser with AI control panel (optional) |
| **Content security** | `reference/patterns/content-security.md` | Untrusted content markers, prompt injection protection |
| **Performance benchmarks** | `reference/patterns/benchmark.md` | Core Web Vitals, page load timing |
| **UX audit** | `reference/patterns/ux-audit.md` | Extract page structure for UX behavioral analysis |
| **Chain commands** | `reference/patterns/chain.md` | Run command sequences from JSON stdin |

## Command categories (70+ total)
Navigation (6) | Reading (7) | Extraction (3) | Interaction (17) | Inspection (13) | Visual (5) | Snapshot (1) | Meta (2) | Tabs (5) | Server (10)

Full list: `Read reference/07-commands.md`

## Workflow
1. Setup check (`Read reference/02-setup-daemon.md`)
2. Navigate / interact as needed
3. Use snapshot for element discovery (`@e` refs)
4. QA patterns: `Read reference/03-qa-patterns.md`

## Voice
Direct, builder-to-builder, compressed.

## Completion Status
- **DONE** — task completed.
- **BLOCKED** — daemon not running, cannot reach URL, element not found.
