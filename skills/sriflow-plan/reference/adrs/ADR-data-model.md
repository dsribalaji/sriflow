# ADR Template — Data Model

Extends `ADR-template.md`. Use for data decisions: store choice, schema shape, consistency, lifecycle. Add these blocks between base sections 1 (Context) and 4 (Decision).

## 1. Context — data additions

Add:

- Data entities and their relationships (the domain being modeled).
- Volume, write/read ratio, access patterns (who reads what, how).
- Durability and availability requirements.
- Existing stores and what must migrate.

## 2. Decision Drivers — data specific

- Consistency requirements (strict vs eventual — name which operations tolerate stale reads)
- Query patterns (ad-hoc analytics vs fixed access paths)
- Growth envelope (rows/objects per month, retention)
- Operational constraint (managed vs self-hosted, multi-region)

## 3. Considered Options — data

**Store type:** relational (Postgres default) | document (JSON-native) | key-value | columnar/OLAP | search engine | queue/stream.

Choose relational unless a concrete requirement fails it:
- Document when access is by primary key and shape varies freely (never for money or joins).
- Columnar/OLAP when analytics dominate and OLTP volume is low.
- Queue/stream only for the event pipeline — not as the source of truth.

**Modeling:** normalized (default) vs denormalized (only for hot read paths with a documented sync mechanism).

## 4. Decision — data additions

Write the contract a builder follows:

```
Primary store: <store + version>
Entity inventory:
| Entity | PK | FKs | Constraints | Ownership |
|--------|----|-----|-------------|-----------|

Consistency rules:
- <operation> requires <strong | eventual> consistency because <reason>

Migration strategy: <schema migration tool + versioning scheme, forward-only policy>
```

## 5. Consequences — data additions

- Migration burden (schema changes are permanent — no "undo" in most stores).
- Cost of storage + backups + retention.
- Read-path complexity if denormalized (dual-write risk, reconciliation job).

## 6. Validation — data additions

- Volume test: write at projected peak, confirm latency budget.
- Migration dry-run on a copy before production.
- Backup restore test (the only backup that matters is one you've restored).

## Data rules

1. **Never store secrets in plaintext** — reference the security ADR.
2. Every table gets: `id` (or natural PK), `created_at`, `updated_at` unless there's a reason not to.
3. Soft delete only when audit or FK integrity requires it; soft delete everywhere is a query-bug farm.
4. One writer per store — dual-write is a two-phase-commit smell.
5. Foreign keys enforced in the DB, not in application code.
6. Indexes exist for query patterns, not for columns. Write the query first, then the index.
7. Nullable columns are a modeling decision, not a default — document what NULL means per column.
8. Retention and archive policy set at design time, not when storage runs out.