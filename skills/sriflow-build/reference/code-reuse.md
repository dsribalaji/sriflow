# Code Reuse Scan Reference

## Scan Sequence

Run each search below. Record every finding before proceeding.

### 1. Find existing utilities and helpers

```bash
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" -o -name "*.rb" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/__pycache__/*" \
  | head -60
```

### 2. Grep for functions, classes, or exports related to the build target

```bash
# Replace <keyword> with the relevant domain term from PLAN.md / DESIGN.md
grep -r "<keyword>" --include="*.ts" --include="*.js" --include="*.py" --include="*.go" --include="*.rb" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
  -l 2>/dev/null | head -20
```

Run this for each major domain term in the plan (e.g., "auth", "user", "payment",
"webhook", "cache", "queue").

### 3. Check installed dependencies before adding new ones

```bash
# Node / Bun
cat package.json 2>/dev/null | grep -A 999 '"dependencies"'
# Python
cat requirements.txt 2>/dev/null || cat pyproject.toml 2>/dev/null
# Go
cat go.mod 2>/dev/null
# Ruby
cat Gemfile 2>/dev/null
```

### 4. Check for existing patterns in similar files

```bash
ls -la src/ 2>/dev/null || ls -la lib/ 2>/dev/null || ls -la app/ 2>/dev/null
```

---

## Recording Findings

After each grep, record findings in this format:

```
Found: <path>:<line> — <what it does> — reuse this instead of writing new
```

If nothing found: `Not found: <keyword> — will implement new`

---

## Reuse Rule

If a reusable utility or function is found:
- Use it. Import it. Do not re-implement it.
- Note the file and function name in the next build step.
- If the existing code almost works but needs a small change, edit the existing
  file (shortest diff). Do not create a new file for a small variation.

If a dependency already covers the need:
- Use the installed dependency. Do not add a new one.
- Name the package and the function to use.
