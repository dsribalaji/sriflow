# Metrics Collection Reference

Detailed git commands, session detection, test LOC split, backlog health, and commit histogram for `/sriflow-reflect`.

---

## Git Data Collection Commands

Run these in parallel (Step 2):

```bash
# 1. All commits in window with shortstat
git log --since="$_RETRO_SINCE" --no-merges --format="%H|%aN|%ai|%s" --shortstat 2>/dev/null

# 2. Per-commit numstat for test vs prod LOC split
git log --since="$_RETRO_SINCE" --no-merges --format="COMMIT:%H|%ai|%s" --numstat 2>/dev/null

# 3. Commit timestamps ascending (for session detection)
git log --since="$_RETRO_SINCE" --no-merges --format="%at|%ai|%s" 2>/dev/null | sort -n

# 4. File hotspots — most frequently changed files
git log --since="$_RETRO_SINCE" --no-merges --format="" --name-only 2>/dev/null \
  | grep -v '^$' | sort | uniq -c | sort -rn | head -20

# 5. Total commit count (no merges)
git log --since="$_RETRO_SINCE" --no-merges --oneline 2>/dev/null | wc -l | tr -d ' '

# 6. Active days (distinct calendar dates with commits)
git log --since="$_RETRO_SINCE" --no-merges --format="%ai" 2>/dev/null \
  | awk '{print $1}' | sort -u

# 7. Unique files touched
git log --since="$_RETRO_SINCE" --no-merges --format="" --name-only 2>/dev/null \
  | grep -v '^$' | sort -u | wc -l | tr -d ' '

# 8. Commit type breakdown (conventional commits)
git log --since="$_RETRO_SINCE" --no-merges --format="%s" 2>/dev/null \
  | grep -oE '^(feat|fix|refactor|test|chore|docs|style|perf|ci|build)\b' | sort | uniq -c | sort -rn

# 9. Test file count (current state)
find . -name '*.test.*' -o -name '*.spec.*' -o -name '*_test.*' -o -name '*_spec.*' \
  2>/dev/null | grep -v node_modules | wc -l | tr -d ' '

# 10. Co-authored commits (AI-assisted)
git log --since="$_RETRO_SINCE" --no-merges --format="%b" 2>/dev/null \
  | grep -c "Co-Authored-By:" || echo 0
```

---

## Session Detection Algorithm

Sort commit timestamps (`%at`, unix epoch) ascending. A new session starts when the gap between consecutive commits exceeds **2700 seconds (45 minutes)**. Count total sessions. A session with a single commit of any LOC counts as a session.

Report: total sessions, avg session duration (minutes), longest session.

---

## Test LOC Split

From numstat, files matching any of these patterns are test files:
- Path contains: `test/`, `spec/`, `__tests__/`
- Filename contains: `.test.`, `.spec.`, `_test.`, `_spec.`

Sum their insertions as test LOC; sum all other insertions as prod LOC.

**Test LOC ratio** = test LOC / (test LOC + prod LOC)

---

## Backlog Health (if TODOS.md found)

- Count total open TODOs (lines starting with `- [ ]` or similar, excluding `## Completed` section)
- Count P0/P1 items (look for `[P0]`, `[P1]`, `priority: high`, `URGENT`, or similar markers)
- Count items closed this cycle (items in `## Completed` with dates within the window, or `- [x]` items)

---

## Cycle Metrics Block (Step 3)

Emit directly to conversation before writing RETRO.md:

```
CYCLE METRICS (<window>: <since> to <today>):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commits:       N (no merges)
LOC:           +X added / -Y deleted / Z net
Test LOC:      N added (X% of total)
Files:         N unique files touched
Active days:   N of <window-days> days
Sessions:      N detected (avg Xmin, longest Xmin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline ran:  [plan] [design] [build] [qa] [review] [ship]
Code review:   N critical, N warn, N nitpick
QA:            N/N checks passing (N categories with failures)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backlog:       N open (X P0/P1) · N closed this cycle
AI-assisted:   N commits with Co-Authored-By trailers
```

If CODE_REVIEW.md not found: `Code review: not run this cycle`.
If QA_REPORT.md not found: `QA: not run this cycle`.
If TODOS.md not found: `Backlog: no TODOS.md found`.

---

## Commit Time Histogram (Step 8)

From commit timestamps (local time), bucket commits by hour:

```
Commit distribution by hour (local time):
00:   2  ██
01:   0
...
09:   5  █████
10:   8  ████████
...
```

Each █ = 1 commit. Show all 24 hours, even empty ones. Identify:
- **Peak hour(s)**: top 1-2 hours by commit count
- **Dead zone**: hours 00:00-06:00 with 0 commits (healthy) vs commits (late-night pattern)
- **Bimodal pattern**: morning cluster + evening cluster with trough in between

**Session cadence** from session detection (45-min gap threshold):
- Total sessions: N
- Average session length: Xmin
- Longest session: Xmin (when)
- Shortest session: Xmin (single commit)
- Sessions by depth: Deep (>90min), Medium (30-90min), Micro (<30min)

**Cadence interpretation** (2-3 sentences):
- Sustainable work pattern? (Late-night bursts = warning for solo builders)
- Sessions getting longer or shorter? (If 14d+ window, compare first vs second half)
- Ship day pattern? (Many commits on 1-2 days/week = batch shipping, higher risk per ship)

**AI-assisted percentage** from command 10 (Co-Authored-By count):
- N% of commits had AI co-author trailers
- If > 80%: note "Heavily AI-assisted cycle — code review signal from CODE_REVIEW.md is especially important."
- If 0%: note "No AI co-author trailers found. If AI tools were used, adding Co-Authored-By trailers improves cycle tracking."

---

## File Hotspot Binary Filtering

Filter out common binary and generated file extensions before presenting the hotspot table:
- Filter: `package-lock.json`, `yarn.lock`, `*.lock`, `dist/`, `build/`, `*.png`, `*.jpg`, `*.svg`, `*.ico`, `*.wasm`, `*.map`
- Note: "Lock files, dist/, and binary assets excluded."
