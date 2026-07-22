# Step 2: Git data collection

Run these in parallel:

```bash
# 1. All commits in window with shortstat (files changed, LOC added/deleted)
git log --since="$_RETRO_SINCE" --no-merges --format="%H|%aN|%ai|%s" --shortstat 2>/dev/null

# 2. Per-commit numstat for test vs prod LOC split
#    Lines matching test/, spec/, __tests__/, .test., .spec. are test LOC
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

**Session detection algorithm:** Sort commit timestamps (`%at`, unix epoch) ascending. A new session starts when the gap between consecutive commits exceeds 2700 seconds (45 minutes). Count total sessions. A session with a single commit of any LOC counts as a session. Report: total sessions, avg session duration (minutes), longest session.

**Test LOC split:** From numstat, files matching any of: path contains `test/`, `spec/`, `__tests__/`, filename contains `.test.`, `.spec.`, `_test.`, `_spec.` are test files. Sum their insertions as test LOC; sum all other insertions as prod LOC. Test LOC ratio = test LOC / (test LOC + prod LOC).

**Backlog health (if TODOS.md found):** Count total open TODOs (lines starting with `- [ ]` or similar, excluding `## Completed` section). Count P0/P1 items (look for `[P0]`, `[P1]`, `priority: high`, `URGENT`, or similar markers). Count items closed this cycle (items in `## Completed` with dates within the window, or `- [x]` items).
