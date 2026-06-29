# Lens 2: SQL SAFETY

If the diff contains no database queries, skip this lens and note: `SQL SAFETY: no database queries in diff.`

## SQL Injection vectors (always CRITICAL)
- String interpolation or concatenation of user input into a query string:
  - Python: `f"SELECT * FROM users WHERE id = {user_id}"`
  - JavaScript: `` `SELECT * FROM users WHERE id = ${userId}` ``
  - Ruby: `"SELECT * FROM users WHERE id = #{params[:id]}"`
  - PHP: `"SELECT * FROM users WHERE id = " . $_GET['id']`
- ORM `.raw()`, `.query()`, or `.execute()` calls that interpolate user input
- Named placeholders bypassed by building the query string first then executing

## Parameterization gaps
- Query parameters passed positionally or by name but missing for some user-controlled values
- Dynamic table or column names derived from user input without an allowlist check
- `IN (?)` placeholders built dynamically from user-supplied lists without proper binding

## LIKE and wildcard injection
- `WHERE name LIKE '%<user_input>%'` without escaping `%` and `_` in the input
- This allows users to craft queries like `%` that match all rows, causing performance issues or data leakage

## ORDER BY injection
- Dynamic `ORDER BY <user_input>` where user_input is not validated against an allowlist of column names
- Even parameterized drivers typically cannot bind ORDER BY values — the column name must be validated, not escaped

## Unbounded queries
- `SELECT *` with no `LIMIT` clause on a table that could grow large
- `SELECT <columns>` with a user-controlled filter that could match the entire table
- Missing pagination on list endpoints that read from large tables

## Missing transactions
- Multi-step operations (insert then update, create then link) with no transaction wrapping — partial failure leaves data in an inconsistent state
- Debit-credit operations without a transaction

## Schema migration risks
- `ALTER TABLE` that adds a `NOT NULL` column without a default to an existing table with rows (will fail on non-empty tables)
- `DROP TABLE` or `DROP COLUMN` without confirming the data is no longer needed
- Index-free foreign keys on tables that will be queried by that column
- Migration that does not handle rollback (no `down` migration)

## Severity

Flag all SQL injection findings as `CRITICAL`. Flag unbounded queries and missing transactions as `WARN`. Flag schema risks as `WARN` or `CRITICAL` depending on reversibility.
