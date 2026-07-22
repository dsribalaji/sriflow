# SQL Injection Prevention Guide

Language-agnostic review checklist. Apply to every PR touching SQL, ORM, or database access.

---

## Attack Types

### 1. Classic (In-Band) Injection

Attacker sends crafted input that modifies the SQL statement structure. Results returned directly in the response.

```
Input:  ' OR '1'='1' --
Result: SELECT * FROM users WHERE name='' OR '1'='1' --'
        (returns all users)
```

Two variants:
- **UNION-based**: injects `UNION SELECT` to extract data from other tables
- **Error-based**: triggers verbose DB errors that leak schema info

### 2. Blind (Boolean / Time-Based) Injection

No direct output. Attacker infers data by observing behavior differences.

```
-- Boolean: true condition returns normal page, false returns different page
' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE id=1)='a' --

-- Time-based: forces delay to extract data character by character
' AND IF(SUBSTRING(password,1,1)='a', SLEEP(5), 0) --
```

### 3. Out-of-Band Injection

Uses DNS or HTTP requests from the database server to exfiltrate data. Common in Oracle (`UTL_HTTP`) and MSSQL (`xp_cmdshell`). Rare but devastating — no input validation detects it.

---

## 5-Layer Defense

### Layer 1: Parameterized Queries (Primary Defense)

Never concatenate user input into SQL. Use placeholders.

**Python (raw DBAPI)**
```python
# VULNERABLE
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# SAFE
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

**Python (SQLAlchemy Core)**
```python
# VULNERABLE — SQLAlchemy raw text
session.execute(text(f"SELECT * FROM users WHERE id = {user_id}"))

# SAFE — bound parameter
session.execute(text("SELECT * FROM users WHERE id = :id"), {"id": user_id})
```

**Python (Django ORM)**
```python
# VULNERABLE — raw SQL with format string
User.objects.raw(f"SELECT * FROM users WHERE id = {user_id}")

# SAFE — parameterized
User.objects.raw("SELECT * FROM users WHERE id = %s", [user_id])
```

**Java (JPA / Hibernate)**
```java
// VULNERABLE
em.createQuery("SELECT u FROM User u WHERE u.id = " + userId);

// SAFE — parameter binding
em.createQuery("SELECT u FROM User u WHERE u.id = :id")
  .setParameter("id", userId)
  .getSingleResult();
```

**Go (database/sql)**
```go
// VULNERABLE
db.Query("SELECT * FROM users WHERE id = " + userID)

// SAFE — placeholder
db.Query("SELECT * FROM users WHERE id = $1", userID)
```

**Node.js (Prisma)**
```javascript
// VULNERABLE
prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${userId}`)

// SAFE
prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`
```

**Node.js (pg)**
```javascript
// VULNERABLE
client.query(`SELECT * FROM users WHERE id = ${userId}`)

// SAFE
client.query("SELECT * FROM users WHERE id = $1", [userId])
```

**PHP (Laravel)**
```php
// VULNERABLE
DB::select("SELECT * FROM users WHERE id = $userId");

// SAFE
DB::select("SELECT * FROM users WHERE id = ?", [$userId]);
```

**C# (EF Core)**
```csharp
// VULNERABLE
context.Users.FromSqlRaw($"SELECT * FROM Users WHERE Id = {userId}");

// SAFE — parameterized
context.Users.FromSqlInterpolated($"SELECT * FROM Users WHERE Id = {userId}");
```

### Layer 2: ORM Safe Usage

ORMs prevent injection by default — when used correctly. Danger is in escape hatches.

**Every ORM has a raw SQL escape hatch. String interpolation there = injection.**

| ORM | Safe Raw | Unsafe Raw |
|-----|----------|------------|
| SQLAlchemy | `text("...").bindparams()` | `text(f"...{var}")` |
| Django | `RawSQL("...", [params])` | `RawSQL(f"...{var}", [])` |
| Hibernate | `createQuery("...:p").setParam()` | String concatenation |
| EF Core | `FromSqlInterpolated` | `FromSqlRaw` + string concat |
| Prisma | `` $queryRaw`...` `` | `$queryRawUnsafe(...)` |

### Layer 3: Input Validation (Whitelist > Blacklist)

Blacklists fail. Whitelists work.

```python
# BAD — blacklist (bypassable with encoding tricks)
if "DROP" in user_input.upper():
    raise ValueError("forbidden")

# GOOD — whitelist (reject everything not expected)
import re
if not re.match(r'^[a-zA-Z0-9_]{1,50}$', username):
    raise ValueError("invalid username")
```

Validate:
- Type (int, UUID, date)
- Length (max)
- Format (regex, enum)
- Range (min/max for numbers)

### Layer 4: Least Privilege

Database user should have minimum permissions needed.

```sql
-- App user: read/write on specific tables only
GRANT SELECT, INSERT, UPDATE ON app.users TO 'app_user'@'%';
GRANT SELECT ON app.products TO 'app_user'@'%';
-- NO: DROP, ALTER, GRANT, or access to other schemas
```

If injection succeeds, damage is bounded by permissions.

### Layer 5: WAF

Web Application Firewall as last line of defense. Catches patterns parameterized queries miss (e.g., dynamic identifiers). Not a substitute for layers 1-4.

---

## Dynamic Identifiers

Placeholders (`?`, `%s`, `$1`) only work for **values**, not identifiers (table names, column names, ORDER BY clauses).

```python
# Placeholders can't parameterize identifiers
# These require whitelisting

# GOOD — whitelist table names
ALLOWED_TABLES = {"users", "products", "orders"}
if table_name not in ALLOWED_TABLES:
    raise ValueError(f"invalid table: {table_name}")
session.execute(text(f"SELECT * FROM {table_name} WHERE id = :id"), {"id": record_id})

# GOOD — whitelist sort columns
ALLOWED_SORT = {"created_at", "name", "id"}
if sort_column not in ALLOWED_SORT:
    sort_column = "created_at"
session.execute(text(f"SELECT * FROM users ORDER BY {sort_column}"))
```

Review check: **grep for string formatting in SQL contexts. If the formatted value isn't whitelisted, it's injectable.**

---

## Detection

### Static Analysis

| Tool | Language | What it catches |
|------|----------|----------------|
| `bandit` | Python | Raw SQL with f-strings |
| `spotbugs` (FindSecBugs) | Java | SQL injection patterns |
| `gosec` | Go | Unparameterized queries |
| `semgrep` | Any | Custom SQL injection rules |

### Grep Patterns (Manual Review)

```bash
# Python — f-strings in SQL
grep -rn "execute.*f\"" --include="*.py"
grep -rn "text.*f\"" --include="*.py"

# Go — string concat in queries
grep -rn 'Query.*+"' --include="*.go"
grep -rn 'Exec.*+"' --include="*.go"

# Node — template literals in queries
grep -rn 'query.*\`' --include="*.ts" --include="*.js"

# Java — concatenation in createQuery
grep -rn 'createQuery.*+"' --include="*.java"
grep -rn 'executeQuery.*+"' --include="*.java"
```

### Dynamic Testing

- **sqlmap**: automated injection scanner
- **Burp Suite**: manual testing with proxy
- **OWASP ZAP**: active scan plugin

---

## Review Checklist

- [ ] All SQL uses parameterized queries or ORM safe methods
- [ ] Raw SQL escape hatches use parameter binding, not string interpolation
- [ ] Dynamic identifiers (table/column names) validated against whitelists
- [ ] Database user has least privilege (no DDL, no cross-schema access)
- [ ] Error messages don't leak SQL structure to users
- [ ] No `SELECT *` in production queries (limits attack surface)
- [ ] Input validation at API boundary (type, length, format, range)
- [ ] ORM `raw()` / `queryRaw` / `FromSqlRaw` calls reviewed line by line
