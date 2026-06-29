# Safety Check Reference

## Destructive Operation Patterns

### Triggers that require AskUserQuestion (D0) before proceeding

| Pattern | Risk level | Notes |
|---------|-----------|-------|
| `rm -rf <path>` | CRITICAL | Recursive delete, permanent |
| `DROP TABLE` | CRITICAL | Data loss, permanent |
| `DROP DATABASE` | CRITICAL | Data loss, permanent |
| `TRUNCATE` | CRITICAL | Row wipe, permanent |
| `ALTER TABLE DROP COLUMN` | CRITICAL | Schema mutation, data loss |
| `DELETE FROM` without `WHERE` | CRITICAL | Full table wipe |
| Schema migrations on prod DB | HIGH | Downtime risk, potential data loss |
| `git push --force` / `git push -f` | HIGH | Rewrites remote history |
| `git reset --hard` | HIGH | Permanently discards uncommitted changes |
| `git checkout .` / `git restore .` | HIGH | Wipes uncommitted work |
| Overwriting an existing file without reading it first | HIGH | Silent data loss |
| Deleting branches | MEDIUM | History loss if not merged |
| Dropping indexes on production tables | MEDIUM | Performance impact, may block |

### Safe exceptions — no warning needed

- `rm -rf node_modules`
- `rm -rf .next`
- `rm -rf dist`
- `rm -rf __pycache__`
- `rm -rf .cache`
- `rm -rf build`
- `rm -rf .turbo`
- `rm -rf coverage`
- `rm -rf .pytest_cache`
- `rm -rf target` (Rust)

---

## D0 Format for Destructive Operations

```
D0 — <operation name>: destructive operation detected
Branch: <_BRANCH>
ELI10: About to run <operation>. This is permanent and cannot be undone without a
backup. I need you to confirm before I proceed, because the cost of getting this
wrong is data loss / history loss / production downtime.
Stakes if wrong: <specific consequence — data gone, prod down, history rewritten>
Recommendation: B (backup first) because irreversible operations need a restore path.
A) Proceed without backup (not recommended)
  ✅ Faster if you're certain the target is safe to destroy
  ❌ No recovery path if wrong; any mistake is permanent
B) Back up first, then proceed (recommended)
  ✅ Full recovery path; adds <estimated time> seconds
  ❌ Slightly slower
Net: The backup step costs seconds. The missing backup costs hours or permanent loss.
Backup step: <exact command to back up before proceeding>
```

If SRIFLOW_PLAN_MODE is `active`: skip all destructive operations entirely. Analyze
only. Note the operations that would be run and their risk level.
