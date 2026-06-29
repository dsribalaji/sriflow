# Anti-Patterns & Code Examples

## What Not to Build

Common over-engineering patterns that sriflow-build explicitly rejects:

### Config abstraction layers

```python
# WRONG — one caller, never changes
class Config:
    def __init__(self):
        self.host = os.environ.get('HOST', 'localhost')
    def get_host(self):
        return self.host

config = Config()
# trim: no config class — just read env directly
HOST = os.environ.get('HOST', 'localhost')
```

### Single-implementation interfaces

```typescript
// WRONG — never has a second implementation
interface UserRepository {
    getById(id: string): Promise<User>
}
class PostgresUserRepository implements UserRepository {
    async getById(id: string) { ... }
}
// CORRECT
async function getUserById(id: string): Promise<User> { ... }
```

### Factory for one product

```python
# WRONG
def create_emailer(type='smtp'):
    if type == 'smtp':
        return SmtpEmailer()
    raise ValueError(f"unknown type: {type}")
# CORRECT — just instantiate directly
emailer = SmtpEmailer()
```

### Abstractions "for testability" with zero tests

If there are no tests: no interface needed. Write the function. If tests come later,
extract then.

### Config files for single values

```yaml
# WRONG — app.config.yaml with one key
max_retries: 3
# CORRECT — just hardcode with a trim comment
MAX_RETRIES = 3  # trim: hardcoded, extract to config if it needs tuning
```

### Premature pagination

If the current dataset has 50 rows and the plan says nothing about pagination:
do not implement it. Note it in SRIFLOW_MEMORY.md under Suggestions.

### Wrapper functions around standard library

```python
# WRONG
def get_current_time_utc():
    return datetime.now(timezone.utc)
# CORRECT — just use datetime directly
from datetime import datetime, timezone
ts = datetime.now(timezone.utc)
```

---

## Full Build Run Example

**Scenario:** PLAN.md says "Add a `/api/health` endpoint that returns `{status: "ok"}`
and the current UTC timestamp."

**Step 0 — Safety scan:**
No destructive operations in scope. Proceed.

**Step 1 — Context load:**
PLAN.md: single endpoint, returns JSON, no auth required, no DB.
DESIGN.md: Express app, TypeScript, src/routes/ directory, existing router in src/routes/index.ts.
SRIFLOW_MEMORY.md: no prior build progress.

**Step 2 — Reuse scan:**
```bash
grep -r "health\|router\|express" --include="*.ts" -l src/ 2>/dev/null
```
Found: `src/routes/index.ts` — existing Express router. Will register the new route here.
Found: `src/app.ts` — mounts the router at `/api`. No change needed.
Not found: any existing health endpoint. Will implement new.

**Step 3 — Trim ladder for the health route:**
- Rung 1: Needs to exist? Yes — monitoring and load balancers need it.
- Rung 2: Already exists? No — grep confirmed.
- Rung 3: Stdlib? `new Date().toISOString()` covers the timestamp. No dep needed.
- Rung 4: Native? N/A for route logic.
- Rung 5: Installed dep? Express already installed for routing.
- Rung 6: One line? No — needs a route handler.
- Rung 7: Minimum code:

```typescript
// src/routes/index.ts (add to existing router)
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})
```

Two lines. No wrapper. No interface. No health-check abstraction. Registers on the
existing router, no new file.

**Step 4 — Self-check:**
Non-trivial? No — it's a route that calls `new Date()`. No branching. No state.
Skip the self-check and note why: trivial handler, no branching logic, no edge cases.

**Step 4f — Memory:**
```
[BUILD PROGRESS]: health-endpoint — done
Done: src/routes/index.ts:42 — GET /api/health returns {status, ts}
Next: smoke check
Surprises: none
```

**Step 5 — Smoke check:**
```bash
npm run dev &
sleep 2
curl -s http://localhost:3000/api/health
```
Output: `{"status":"ok","ts":"2026-06-28T10:00:00.000Z"}`
Exit 0. Done.

**Status: DONE**
Implemented GET /api/health. 2-line addition to existing router. Smoke check passed.
