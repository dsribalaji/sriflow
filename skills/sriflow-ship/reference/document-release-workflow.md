# Document Release Workflow (absorbed from gstack/document-release)

Post-ship documentation update. Runs **after code committed** but **before PR merges**.
Ensure every documentation file is accurate, up to date, user-forward voice.

**Mostly automated.** Make obvious factual updates directly. Stop only for risky/subjective decisions.

**Stop for:** Risky doc changes (narrative, philosophy, security, removals, rewrites), VERSION bump decision, new TODOS items, cross-doc narrative contradictions.

**Never stop for:** Factual corrections from diff, adding items to tables/lists, updating paths/counts/versions, fixing stale cross-references, marking TODOS complete, cross-doc factual inconsistencies.

**NEVER:** Overwrite/replace/regenerate CHANGELOG entries, bump VERSION without asking, use Write on CHANGELOG.md (always Edit with exact old_string).

---

## Step 1: Pre-flight & Diff Analysis

1. Check current branch. If on base branch, abort.
2. Gather context:
   ```bash
   git diff <base>...HEAD --stat
   git log <base>..HEAD --oneline
   git diff <base>...HEAD --name-only
   ```
3. Discover all documentation files:
   ```bash
   find . -maxdepth 2 -name "*.md" -not -path "./.git/*" -not -path "./node_modules/*" | sort
   ```
4. Classify changes: new features, changed behavior, removed functionality, infrastructure.
5. Summary: "Analyzing N files changed across M commits. Found K documentation files to review."

---

## Step 1.5: Coverage Map (Diataxis Blast-Radius Analysis)

Before touching any doc, build coverage map of what shipped vs what's documented.

**Extract public surface changes from diff:**
- New exported functions, classes, commands, CLI flags, config options, API endpoints
- New skills, workflows, user-facing capabilities
- Renamed/removed public surface
- New env vars, feature flags, config knobs

**For each item, assess documentation coverage:**

| Entity | Reference? | How-to? | Tutorial? | Explanation? |
|--------|-----------|---------|-----------|-------------|
| /new-skill | ✅ AGENTS.md | ❌ | ❌ | ❌ |
| --new-flag | ✅ README | ✅ README | ❌ | ❌ |

Definitions:
- **Reference** — factual description, API, options (README tables, AGENTS.md skill lists)
- **How-to** — task-oriented: "how to do X with this"
- **Tutorial** — learning-oriented: step-by-step walkthrough for newcomers
- **Explanation** — understanding-oriented: "why this works this way"

Items with zero coverage = critical gaps. Items with reference-only = common gaps.

**Architecture diagram drift:** If ARCHITECTURE.md contains ASCII/Mermaid diagrams, extract entity names, cross-reference against diff. Flag renamed/split/removed/moved entities.

Do NOT auto-generate missing documentation. Flag gaps only. Suggest `/document-generate` to fill.

---

## Steps 2-9: Audit & Apply Updates

For each documentation file:
1. Read full content before modifying
2. Update factual inaccuracies based on diff
3. Add new items to tables/lists
4. Fix stale cross-references
5. Polish CHANGELOG voice (never rewrite entries)
6. Mark completed TODOS
7. Check cross-doc consistency

---

## VERSION Bump

Always use AskUserQuestion for version changes. Even if already bumped, check whether it covers full scope of changes.

---

## Commit

Stage all documentation changes and commit with descriptive message.

---

## Rules

- **Read before editing.** Always read full file before modifying.
- **Never clobber CHANGELOG.** Polish wording only.
- **Never bump VERSION silently.** Always ask.
- **Generic heuristics, not project-specific.** Audit checks work on any repo.
- **Coverage map informs, never generates.** Flag gaps, suggest /document-generate.
- **Voice: friendly, user-forward, not obscure.** Explain to smart person who hasn't seen code.
