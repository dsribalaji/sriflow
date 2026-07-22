# 10 — Test Data Management

## Factory Pattern Templates

```javascript
// Base factory with defaults
const UserFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    ...overrides
  }),
  // Traits for common variations
  admin: () => UserFactory.create({ role: 'admin' }),
  inactive: () => UserFactory.create({ status: 'inactive' }),
};
```

## Idempotent Seed Pattern

```sql
-- Upsert pattern (PostgreSQL)
INSERT INTO users (id, email, name) VALUES (...)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Check before insert
IF NOT EXISTS (SELECT 1 FROM users WHERE email = '...') THEN
  INSERT INTO users (...) VALUES (...);
END IF;
```

## Cleanup Strategy Decision Table

| Strategy | Speed | Isolation | Use when |
|----------|-------|-----------|----------|
| Transaction rollback | Fastest | Per-test | Single DB, no DDL |
| TRUNCATE CASCADE | Fast | Per-suite | Multiple tables, no FK |
| API cleanup | Medium | Per-test | External services |
| Reset to snapshot | Slow | Per-run | Complex state |

## PII Anonymization Rules

- Emails: `test+N@example.com`
- Names: `Test User N`
- Phone numbers: `555-000-N`
- Addresses: `123 Test St, Testville, TS 12345`
- SSN/IDs: `000-00-000N`
- Never use real PII in tests, even in staging

## Integration with sriflow-build

- Step 2 (Existing Code Scan): Check for existing factories/fixtures
- Step 3 (Trim Ladder): Use factory patterns instead of manual data creation
- Mark shortcuts: `// test-data: using factory pattern`

## Integration with sriflow-test

- Step 0 (Context Read): Identify test data requirements
- Step 2 (Test Case Derivation): Specify data needs for each test
- Use factories for test setup, not live data
