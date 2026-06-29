# SriFlow — AGENTS.md

## What this project is

**sriflow** is a fully custom Claude Code skill stack built for Sri.
It is a personal AI-powered product development pipeline — from raw idea to deployed product —
with every stage implemented as a `/sriflow-*` slash command.

The pipeline:
```
think → plan → plan-review → design → build → code-review → test → ship → reflect
```

All skills live in `my-stack/skills/`. No runtime dependency on gstack.
gstack and ba-toolkit are reference sources only — read-only, never modified.

---

## Your job when you read this file

**Step 1 — Activate operating mode**

Always activate sriflow-trim first (combined speech compression + minimal code mode).
It is always-on for this project. Read `my-stack/skills/sriflow-trim/SKILL.md` and apply it.

**Step 2 — Load project context**

```bash
# Read SRIFLOW_MEMORY.md for project state
cat SRIFLOW_MEMORY.md 2>/dev/null || echo "No memory file yet"
```

**Step 3 — Detect current state**

All 13 skills are built:

| # | Skill | Status | Description |
|---|---|---|---|
| 1 | `/sriflow-memory` | ✅ | Per-project memory system |
| 2 | `/sriflow-trim` | ✅ | Always-on: speech + code optimization |
| 3 | `/sriflow-think` | ✅ | 6 BA phases + office-hours forcing questions |
| 4 | `/sriflow-plan` | ✅ | Structured implementation plan (6 BA phases) |
| 5 | `/sriflow-plan-review` | ✅ | CEO, Design, Eng lenses. Iterative improvement loop |
| 6 | `/sriflow-design` | ✅ | Candidates → pick → DESIGN.md → HTML → review |
| 7 | `/sriflow-build` | ✅ | Implements approved design |
| 8 | `/sriflow-code-review` | ✅ | Diff review. Blocks on CRITICAL |
| 9 | `/sriflow-test` | ✅ | QA: golden path, edges, errors, regression |
| 10 | `/sriflow-browser` | ✅ | Headless Chromium (Playwright) |
| 11 | `/sriflow-ship` | ✅ | Merge, deploy, CI wait, smoke test |
| 12 | `/sriflow-reflect` | ✅ | End-of-cycle retrospective |
| 13 | `/sriflow` (router) | ✅ | Routes to the right skill |

**Step 4 — Report status**

Tell Sri:
- All skills are built
- Current pipeline stage from SRIFLOW_MEMORY.md
- Any recent learnings or decisions
- Suggested next action

---

## Project-Aware State

All project state is isolated by project slug:
```
~/.sriflow/
├── config.yaml                    # global config
└── projects/
    ├── sriflow/                   # this project
    │   ├── context.json           # saved context
    │   ├── learnings.jsonl        # learnings log
    │   ├── decisions.jsonl        # decisions log
    │   ├── timeline.jsonl         # event timeline
    │   ├── questions.jsonl        # question log
    │   ├── preferences.jsonl      # preferences
    │   ├── analytics.jsonl        # skill usage
    │   ├── eureka.jsonl           # eureka moments
    │   └── reviews.jsonl          # code reviews
    └── other-project/             # isolated per-project
```

---

## Config Keys

| Key | Default | Purpose |
|-----|---------|---------|
| `proactive` | `true` | Auto-suggest actions |
| `telemetry` | `off` | Analytics collection |
| `checkpoint_mode` | `explicit` | Checkpoint creation |
| `explain_level` | `default` | Explanation depth |
| `skill_prefix` | `false` | Skill output prefix |
| `routing_declined` | `false` | Routing preference |
| `auto_upgrade` | `false` | Auto-upgrade skills |
| `update_check` | `true` | Check for updates |
| `checkpoint_push` | `false` | Auto-push checkpoints |
| `question_tuning` | `false` | Tune question patterns |
| `workspace_root` | `.` | Workspace root |

---

## Rules for writing skills

1. **Personalization Q&A before every skill** — ask the questions listed in IMPLEMENTATION_PLAN.md for that skill. One skill at a time.
2. **Reference sources first** — before writing, read the listed gstack/ba-toolkit source SKILL.md files. They are in `gstack/<skill>/SKILL.md` and `ba-toolkit/.claude/skills/<skill>/SKILL.md`.
3. **Strip all gstack runtime dependencies** — no `gstack-update-check`, no `gstack-config`, no `~/.gstack/` paths, no gbrain queries, no Conductor/headless checks.
4. **sriflow-trim always active** — every skill applies speech compression and minimal code. Never narrate what code does.
5. **Every skill writes to SRIFLOW_MEMORY.md** — on completion, append a log entry.
6. **Every skill logs to timeline** — start and completion events via `sriflow-timeline`.
7. **Output location** — all skills go into `my-stack/skills/<skill-name>/SKILL.md`. Never write globally.
8. **No skill without Sri's approval** — finish personalization Q&A, show what you plan to build, wait for confirmation.
9. **Ask every question** — questions bypass caveman/ponytail compression. Ask precisely and accurately. Never skip questions from skill specs.

---

## Project file structure

```
sriflow/
├── gstack/                          # reference clone — READ ONLY
├── ba-toolkit/                      # reference — READ ONLY
├── my-stack/
│   ├── README.md                    # project overview
│   ├── ARCHITECTURE.md              # system design
│   ├── ETHOS.md                     # builder philosophy
│   ├── CONTRIBUTING.md              # contributor guide
│   ├── DESIGN.md                    # design system
│   ├── BROWSER.md                   # browser skill docs
│   ├── CHANGELOG.md                 # version history
│   ├── package.json                 # project config
│   ├── VERSION                      # current version (2.0.0)
│   ├── install.sh                   # skills installer
│   ├── lib/                         # shared libraries
│   │   ├── sriflow-browse.py        # Playwright browser wrapper
│   │   └── sriflow-browse-daemon.py # persistent browser daemon
│   └── skills/
│       ├── sriflow/                 # ✅ router
│       ├── sriflow-think/           # ✅ ideation (6 BA phases)
│       ├── sriflow-plan/            # ✅ planning (6 BA phases)
│       ├── sriflow-plan-review/     # ✅ plan review (iterative loop)
│       ├── sriflow-design/          # ✅ design
│       ├── sriflow-build/           # ✅ build
│       ├── sriflow-code-review/     # ✅ code review
│       ├── sriflow-test/            # ✅ QA
│       ├── sriflow-browser/         # ✅ headless Chromium (Playwright)
│       ├── sriflow-ship/            # ✅ deploy
│       ├── sriflow-reflect/         # ✅ retrospective
│       ├── sriflow-memory/          # ✅ memory system
│       └── sriflow-trim/            # ✅ speech + code optimization
├── AGENTS.md                        # this file
├── IMPLEMENTATION_PLAN.md           # full skill specs + build order
├── SKILLS_INVENTORY.md              # all available source skills
└── SRIFLOW_MEMORY.md                # auto-created on first session, per-project memory
```

---

## Hard constraints

- Never edit anything inside `gstack/` or `ba-toolkit/`
- Never batch-write multiple skills — one at a time, personalization first
- Never skip the personalization Q&A even if the skill seems obvious
- If unsure whether to proceed — stop and ask Sri
