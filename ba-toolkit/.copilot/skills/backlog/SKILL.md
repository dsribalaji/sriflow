---
name: backlog
version: 2.0.0
phase: "Optional — Backlog Sync (Jira / Confluence)"
description: >
  Backlog Sync — Optional integration skill. Syncs approved User Stories from
  04_requirements/backlog/approved/ to Jira, and approved BRD / UC documentation to Confluence.
  Requires Jira and Confluence MCP connections. Only syncs artifacts with verdict = GREEN.
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
triggers:
  - sync to jira
  - create jira stories
  - push to confluence
  - file the backlog
  - /backlog
prerequisite: /story — All stories to be synced must have verdict = GREEN in backlog/approved/
outputs:
  - Updated Jira project with filed stories
  - Confluence space with BRD / UC documentation
---

# /backlog — Backlog Sync (Jira / Confluence)

## When to invoke this skill

Optional — after `/story` is complete and stories have verdict = GREEN in `04_requirements/backlog/approved/`.
Use to sync the approved backlog to Jira and/or post BRD/UC documentation to Confluence.

**Hard rule:** Only artifacts with `verdict: GREEN` are synced. Do NOT file DRAFT or RED stories
into Jira's sprint backlog — that is the governance drift the BA Toolkit is designed to prevent.

---

## Step 1 — Pre-Sync Checklist

Before syncing, verify:

- [ ] All stories in `backlog/approved/` have `verdict: GREEN` in their YAML header
- [ ] All stories have a `traces.uc` link pointing to an approved UC
- [ ] All stories have a `priority: P0 / P1 / P2` set
- [ ] DoR checklist is complete in each story file
- [ ] No stories have `[TBD]` or `[PENDING]` in their acceptance criteria

If any check fails — return the story to `backlog/draft/` and re-run `/story`.

---

## Step 2 — Jira Story Mapping

Map each story file field to a Jira issue field:

| Story Field | Jira Field | Notes |
|------------|-----------|-------|
| `id` (US-###) | Issue key label or custom field | Store the BA Toolkit ID for traceability |
| `title` | Summary | Use the story title as-is |
| Story statement (As a / I want / so that) | Description — top section | Format as the full story statement |
| Acceptance Criteria (GWT) | Description — Acceptance Criteria section | Use GWT format directly |
| `priority` (P0/P1/P2) | Priority (Critical/High/Medium) | P0 → Critical, P1 → High, P2 → Medium |
| `traces.uc` | Label or custom field `UC-Link` | Preserves traceability |
| Open Questions | Description — Open Items section | Any remaining Q-# items |
| SME Confirmations | Description — Confirmations section | Who confirmed what and when |

**Jira issue type:** Story (not Task or Bug)

---

## Step 3 — Jira Sync Script (Claude Code / GitHub Copilot)

When Jira MCP is connected, execute this sequence for each approved story:

```
1. Read the story file from 04_requirements/backlog/approved/US-[###]_[Name].md
2. Extract: title, story statement, acceptance criteria, priority, UC trace, open questions
3. Confirm: verdict = GREEN (skip if not)
4. Create Jira issue in the target project with all mapped fields
5. Record the Jira issue key back into the story file's YAML header: jira_key: [PROJECT-###]
6. Log the sync in _admin/decisions-log.md
```

---

## Step 4 — Confluence Documentation Sync

After syncing stories to Jira, post supporting documentation to Confluence:

| Artifact | Confluence location |
|----------|-------------------|
| BRD (`04_requirements/brd/BRD-v1.0_[Project].md`) | [Project Space] / Requirements / BRD |
| UC Inventory (`03_use-cases/uc-inventory.md`) | [Project Space] / Requirements / Use Cases |
| Stakeholder Register (`01_discovery/stakeholder-register.md`) | [Project Space] / Discovery |
| NFR Specification (`06_architecture/nfr-specification.md`) | [Project Space] / Architecture |

---

## Step 5 — Post-Sync Verification

After sync completes:

- [ ] Every filed story in Jira has a story statement, AC, and priority
- [ ] Every story's Jira key is recorded back in the local story file's YAML (`jira_key: PROJECT-###`)
- [ ] The UC Inventory is updated with Jira keys for reference
- [ ] Sync logged in `_admin/decisions-log.md` with date, story count, and project key

---

## Governance Note

Filing stories into Jira does NOT change their status in the local BA Toolkit files. The local
`backlog/approved/` files remain the source of truth. Jira is a visibility and sprint-planning tool.
If a story changes in Jira, update the local file and re-run `/story` to re-verify the GREEN verdict.

**Never treat Jira filing as equivalent to BA approval.** The promotion criteria are:
1. Verdict = GREEN (all INVEST + GWT checks pass)
2. DoR checklist fully checked (including mockup + data dictionary links)
3. All open questions resolved

A story that skips any of these three steps is RED, regardless of what Jira says.
