# PR Complexity Scoring

## Complexity Formula (0-1)

```python
complexity = 0.4 * min(total_changes / 1000, 1.0)    # size weight
          + 0.2 * min(num_files / 20, 1.0)           # file count weight
          + 0.2 * (non_test_code / total)             # non-test ratio weight
          + 0.2 * min(languages / 5, 1.0)            # language diversity weight
```

## Size Categories

| Category | Lines | Review Time | Recommendation |
|----------|-------|-------------|----------------|
| XS | <50 | 5-10 min | Quick review |
| S | <200 | 10-20 min | Standard review |
| M | <400 | 20-40 min | Thorough review |
| L | <800 | 40-80 min | Consider splitting |
| XL | >800 | 80-120 min | Strongly recommend splitting |

## Review Time Estimation

```python
review_minutes = total_changes / 20 * (1 + complexity)
# clamped to 5-120 minutes
```

## Risk Factors

- **Large PR (>400 lines)** — suggest splitting
- **No test changes when >50 lines changed** — flag as risk
- **Low test ratio (<20% non-test code)** — flag
- **Security-sensitive files** (.env, auth, password, token, secret) — extra scrutiny
- **Database migration/SQL files** — check for safety
- **Config file changes** — verify no secrets

## Language-Specific Suggestions

| Language | Watch For |
|----------|-----------|
| TypeScript | `any` types, missing null checks |
| Rust | `unwrap()`, unsafe blocks |
| C/C++ | Memory safety, buffer overflows |
| SQL | Injection, performance |
| Python | Mutable defaults, type hints |
| Go | Error handling, goroutine leaks |

## Output Format

```
PR COMPLEXITY:
Size: <XS|S|M|L|XL> (<N> lines across <M> files)
Complexity: <0.0-1.0>
Estimated review time: <N> minutes
Risk factors: <list or none>
Recommendation: <quick review|standard|thorough|split first>
```

## Integration

Run complexity scoring in Step 1 (after diff check), before the 4-phase review.
If XL, ask user whether to proceed or split first.
