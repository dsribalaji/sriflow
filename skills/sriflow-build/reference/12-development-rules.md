# Development Rules

YAGNI / KISS / DRY principles. File size management. Naming conventions.

## Core Principles

1. **YAGNI** — You Aren't Gonna Need It. Don't build what you don't need today.
2. **KISS** — Keep It Simple, Stupid. Simplest solution that works.
3. **DRY** — Don't Repeat Yourself. Reuse existing code, patterns, helpers.

## File Management

### File Size Cap
- **Target**: <200 lines per file
- **Split when**: File exceeds 200 lines
- **How to split**: Extract utility functions, create service classes, use composition

### Naming Conventions
- **Files**: kebab-case (`user-auth.ts`, not `userAuth.ts`)
- **Names must be descriptive**: LLMs read file names via Grep — make them self-documenting
- **Long names OK**: `user-authentication-middleware.ts` > `auth.ts`

### File Organization
```
src/
├── components/     # UI components
├── services/       # Business logic
├── utils/          # Utility functions
├── types/          # TypeScript types
├── hooks/          # React hooks
└── api/            # API calls
```

## Code Quality

### Syntax Errors
- **Must fix**: No syntax errors, code must compile
- **Lint**: Don't be too harsh, but ensure no errors
- **Formatting**: Prioritize readability over strict style

### Error Handling
- Use try/catch for async operations
- Cover security standards
- Handle edge cases explicitly
- Never swallow errors silently

### Comments
- **No narration**: Code names itself
- **Add comment when**: WHY is non-obvious (hidden constraint, workaround, subtle invariant)
- **Never**: Explain what code does

## Pre-commit Rules

1. Run linting before commit
2. Run tests before push
3. Keep commits focused on actual code changes
4. No confidential info (dotenv, API keys, credentials)
5. Clean commit messages, conventional format

## Implementation Rules

- Don't simulate or mock — implement real code
- Don't create new enhanced files — update existing files directly
- Follow established architectural patterns
- Handle edge cases and error scenarios
- Maintain backward compatibility

## Quality Checklist

Before implementation:
- [ ] Does this need to exist? (YAGNI check)
- [ ] Can I reuse existing code? (DRY check)
- [ ] Is this the simplest solution? (KISS check)
- [ ] Will this file stay under 200 lines?
- [ ] Are file names descriptive for LLMs?
