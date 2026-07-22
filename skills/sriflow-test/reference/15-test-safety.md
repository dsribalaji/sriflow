# Test Safety

Production database guard. Prevents tests from running against production data.

## Production DB Guard

Add to test base class:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // SAFETY CHECK: Prevent tests from running against production database
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");

        if ($connection !== 'sqlite' || $database !== ':memory:') {
            throw new RuntimeException(
                "SAFETY STOP: Tests configured against '{$connection}' database '{$database}'. ".
                'Tests MUST use SQLite in-memory database to prevent production data loss. '.
                "Run 'php artisan config:clear' and ensure phpunit.xml has DB_CONNECTION=sqlite and DB_DATABASE=:memory:"
            );
        }
    }
}
```

## Why This Matters

- Tests should NEVER run against production data
- SQLite in-memory is fast and isolated
- Prevents accidental data loss from test migrations/seeds
- Catches config misconfiguration early

## Adaptation for Other Stacks

### Node.js / TypeScript

```typescript
// test/setup.ts
import { config } from 'dotenv';

beforeAll(() => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('test') && !dbUrl.includes(':memory:')) {
    throw new Error(`SAFETY STOP: DATABASE_URL points to production: ${dbUrl}`);
  }
});
```

### Python

```python
# conftest.py
import os
import pytest

@pytest.fixture(autouse=True)
def check_test_database():
    db_url = os.environ.get('DATABASE_URL', '')
    if db_url and 'test' not in db_url and ':memory:' not in db_url:
        raise RuntimeError(f"SAFETY STOP: DATABASE_URL points to production: {db_url}")
```

### Go

```go
// testutil/safety.go
func CheckTestDatabase(t *testing.T) {
    t.Helper()
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL != "" && !strings.Contains(dbURL, "test") && !strings.Contains(dbURL, ":memory:") {
        t.Fatalf("SAFETY STOP: DATABASE_URL points to production: %s", dbURL)
    }
}
```

## Test Environment Checklist

- [ ] Tests use separate database from production
- [ ] Database is reset between test runs
- [ ] No production data in test fixtures
- [ ] Mock external services (APIs, queues, mail)
- [ ] Test environment variables set correctly
