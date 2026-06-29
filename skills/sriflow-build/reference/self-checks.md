# Self-Check Templates

## Python

```python
# test_<unit>.py — ponytail: minimal check, add pytest suite when project grows
def test_<unit>():
    result = <function>(<input>)
    assert result == <expected>, f"got {result!r}"

if __name__ == "__main__":
    test_<unit>()
    print("ok")
```

Run: `python test_<unit>.py`

## TypeScript (no framework)

```typescript
// <unit>.check.ts — ponytail: assert-only, add jest when project adds test infra
import { <function> } from './<unit>'

const got = <function>(<input>)
console.assert(got === <expected>, `expected <expected>, got ${got}`)
console.log('ok')
```

Run: `npx ts-node <unit>.check.ts` or `bun <unit>.check.ts`

## Go

```go
// <unit>_check_test.go
package main

import "testing"

func TestUnit(t *testing.T) {
    got := <function>(<input>)
    if got != <expected> {
        t.Fatalf("expected %v, got %v", <expected>, got)
    }
}
```

Run: `go test -run TestUnit .`

## Shell

```bash
#!/usr/bin/env bash
# check_<unit>.sh
set -euo pipefail
result=$(<command>)
[ "$result" = "<expected>" ] || { echo "FAIL: got $result"; exit 1; }
echo "ok"
```

Run: `bash check_<unit>.sh`

---

## Rules

- Assert-based or `test_*.py` / `*.test.ts` naming.
- One file, one function. Tests the critical path only.
- No testing frameworks unless the project already uses one.
- Must be runnable with a single command.
- If trivial (a rename, a string format, a config value): skip the check and say so.
- If the check fails: fix the code, not the check.
