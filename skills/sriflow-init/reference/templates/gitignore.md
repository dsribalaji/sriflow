# Per-Stack .gitignore Templates

Language-aware, real `.gitignore` content. Pick the section matching the
scaffolded stack, concatenate with the base block, and write to
`<project>/.gitignore`. Keep the base block in every project.

## Base (every project)

```
# OS / editor
.DS_Store
Thumbs.db
*.swp
*.swo
.idea/
.vscode/
*.code-workspace

# Env / secrets
.env
.env.*
!.env.example
*.pem
*.key

# Logs / temp
*.log
logs/
tmp/
```

## Python

```
__pycache__/
*.py[cod]
*.egg-info/
.eggs/
build/
dist/
.venv/
venv/
.pytest_cache/
.ruff_cache/
.mypy_cache/
.coverage
htmlcov/
.coverage.*
```

## Node / TypeScript

```
node_modules/
dist/
build/
out/
coverage/
*.tsbuildinfo
*.tgz
.npm/
.eslintcache
.next/
.turbo/
```

## Go

```
/bin/
dist/
vendor/
*.test
*.out
coverage.html
coverage.out
```

## Rust

```
/target
**/*.rs.bk
Cargo.lock.bak
```

Note: keep `Cargo.lock` committed for binaries (reproducible builds); ignore
it only for libraries. The base `.gitignore` ships the `Cargo.lock` line as
commented out — uncomment it for library crates.

## Java / Kotlin (used when Mobile → Kotlin stack)

```
build/
.gradle/
*.class
*.jar
*.war
!gradle-wrapper.jar
```

## Composing

| Stack | Blocks |
|-------|--------|
| TypeScript CLI/web | base + Node/TS |
| Python CLI/web | base + Python |
| Go CLI | base + Go |
| Rust CLI | base + Rust |
| Mobile (Kotlin) | base + Java/Kotlin |

## Rules

1. Never ignore source files under `src/` — only build artifacts and deps.
2. Commit `*.lock` files for applications, not for libraries (Rust and npm
   both follow this rule).
3. `.env.example` is committed as the safe template; `.env` itself is ignored
   by the base block.