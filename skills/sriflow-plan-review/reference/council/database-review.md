# Council Lens — Database Review

Domain lens applied by the plan reviewer to the plan's data layer. Default assumption: PostgreSQL/Supabase. Checks schema design, query shapes, indexing, and data lifecycle before a line is written. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's database design** — schema, queries, indexes, migrations, and the operational reality of the store. The most expensive fix is a schema change after data exists.

## What to check

### Schema design
- [ ] Entities and relationships are modeled, not implied: primary keys, foreign keys (enforced in-DB), and the cardinality of every relationship named.
- [ ] Data types match reality: `timestamptz` for timestamps (not `timestamp`/`varchar`), `uuid` vs `bigint` chosen with a reason, `numeric` for money (never `float`), `jsonb` for genuinely flexible payloads.
- [ ] NULL semantics per column are decided (nullable ≠ default). Soft delete only with a stated reason.
- [ ] Multi-tenancy approach (if any) named: `tenant_id` column vs schema-per-tenant — and the indexing consequence.

### Query shapes
- [ ] The plan's data flows translate to concrete queries. For each hot query: is it index-served or a scan?
- [ ] N+1 hazard: ORM/application-level query-per-row patterns acknowledged with a mitigation (joins, batch loading). A list screen that fires one query per row is the classic miss.
- [ ] Aggregations over large tables planned for OLAP time (partition, precompute, or a separate analytics store) — not run live over the OLTP table.
- [ ] No full-table scans in the hot path; `WHERE` clauses match index shapes (function-wrapped columns kill index use).

### Indexing
- [ ] Indexes exist for the queries, not the columns — each index has the query it serves written next to it.
- [ ] Composite index column order matches query patterns (equality first, then range).
- [ ] Write-path cost acknowledged: each index slows writes; over-indexing a write-heavy table is a CONCERN.
- [ ] Partial/expression indexes used where the query targets a subset (e.g. `WHERE status = 'pending'`).

### Migrations
- [ ] Migration tool chosen (Flyway/Liquibase/Prisma Migrate/raw SQL + versioning) with a forward-only policy. Schema-as-code committed.
- [ ] Destructive migrations (drop, rename, type change) have a backfill and a rollout plan — renaming a column in prod is a two-phase operation.
- [ ] Migration vs application version drift handled: old app version must tolerate new schema (expand-contract / dual-write).

### Operations
- [ ] Connection pooling sized against the app's pool size (see Java/Go lens) — pool × instances ≤ DB max connections.
- [ ] Backup + restore tested; the RPO/RTO numbers are in the plan.
- [ ] Retention/archive policy for growing tables set at design time.
- [ ] If Supabase: RLS (Row Level Security) policy is part of the design for any user-data table — RLS is the authz boundary, not the app code.

### Performance realism
- [ ] Volume estimate (rows, writes/sec, read ratio) stated as numbers.
- [ ] A load-test or `EXPLAIN ANALYZE` checkpoint planned before GA — the plan should not wait for prod to find the bad query.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Schema after data | ALTER TABLE on live tables with backfills | Burn at ship |
| N+1 via ORM | List screens crawl | Burn at test/prod |
| Missing index | Full scans on the hot table | Burn at load test |
| float for money | Rounding corruption | Burn at prod, trust-destroying |
| Pool exhaustion | Latency cliff under normal load | Burn at prod |
| No RLS | Row leak across tenants/users | Burn at security audit |

## Verdict guidance

- **9-10**: schema fully modeled, queries + indexes paired, migration/backfill strategy, pool sizing, RLS where applicable, backup numbers stated.
- **7-8**: solid data plan; one soft spot (e.g. index strategy implied, retention unstated).
- **5-6**: schema sketched but queries/indexes/hazards unaddressed.
- **3-4**: "just a DB" thinking — no schema model, no migration plan, no operational numbers.
- **0-2**: plan will fight the data layer (unindexed hot path, no migration, wrong types for money/time).

**Block (score < 7) when:**
- The schema is undefined for a data-driven product.
- Money/time/identity are typed wrongly (`float`, `varchar` timestamps).
- No migration strategy exists for anything that will outgrow a prototype.

**Findings output format:**
```
database-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```