# GraphQL Code Review Guide

## Schema Design

### No Depth/Aliasing Limits — HIGH

A query with deeply nested fields and thousands of aliases can amplify resource use. Cap query depth, breadth (aliases), and complexity.

```graphql
# Attacker: thousands of aliases × deep nesting
query {
  a1: posts { comments { author { posts { comments { ... } } } } }
  a2: posts { comments { author { posts { comments { ... } } } } }
  # ...aliased 10,000 times
}
```

### Missing N+1 Controls — HIGH

A field resolver that runs a DB query per parent row is N+1. Use DataLoader (batching) or a single annotated query.

```js
// BAD — per-parent DB hit
comments: (parent) => Comment.where({ postId: parent.id })  // runs N times

// GOOD — batched via DataLoader
comments: (parent) => commentLoader.load(parent.id)
```

### Exposing Internal Fields — MEDIUM

Resolver leaking `password_hash`, `internal_id`, or raw SQL columns into the schema. Whitelist fields explicitly.

### Int IDs vs Global IDs — LOW

`id: ID` vs `id: Int` — `ID` is opaque and relay-friendly. Inconsistent IDs confuse clients and caching.

### Union/Interface Overreach — LOW

Interfaces/unions where a concrete type would do — extra indirection for one variant.

---

## Resolvers

### Resolver Logic Duplication — MEDIUM

Each resolver re-implementing the same authorization/data-fetch logic. Centralize in a service layer.

### Sync Blocking in Async Resolvers — MEDIUM

Blocking IO (DB/HTTP sync calls) inside an async resolver holds the event loop. Use async I/O.

### Unbounded Parallelism in Resolvers — MEDIUM

Field resolvers resolving many children concurrently without a limit. Bound concurrency.

### Caching Without Invalidation — LOW

Resolver caches that never invalidate serve stale data. Tie to a cache key + TTL.

### Resolver Throwing vs Returning Errors — MEDIUM

Errors as thrown exceptions become generic "internal error" — clients lose structured error info. Return a typed error union or set appropriate `extensions`/`locations`.

### Re-Fetching Already-Fetched Data — LOW

Parent resolver loads a user, child resolver loads the user again. Pass through context or parent args.

---

## N+1 Patterns

### DataLoader in Context — HIGH

One DataLoader per type, attached to the request context (fresh per request), batched with `dataloader`.

```js
// GOOD — loader in context, fresh per request
context: { commentLoader: new DataLoader(ids => Comment.batchFor(ids)) }
```

### Avoid Loading in `map` — HIGH

`parents.map(p => p.comments)` triggers a query per element even with a loader unless batched correctly.

### Null vs Error Semantics — LOW

A child failing should not necessarily null the whole parent. Design for partial error propagation (`errors` + partial `data`) deliberately.

---

## Security

### Unauthorized Field Access — CRITICAL

Field-level resolvers must enforce object-level authorization. A query reaching a field it shouldn't leaks data.

```js
// GOOD — object-level auth in the field resolver
order: async (_, args, ctx) => {
  const order = await orderService.get(args.id);
  if (order.userId !== ctx.user.id) throw new ForbiddenError();
  return order;
}
```

### Introspection Exposed in Production — MEDIUM

Public introspection leaks the full schema (queries, types, mutations). Disable or gate in production unless it's a public API.

### Batching Attack via Aliases — HIGH

Request cost explosion via aliases; enforce query cost/limits (e.g., Apollo gateway or graphql-query-complexity).

### Inline Argument Injection — CRITICAL

Resolver arguments used in raw query strings. Parameterize / let the ORM bind.

```js
// CRITICAL — interpolation in query
WHERE id = ${args.id}

// GOOD — bound
WHERE id = $1  // args.id bound
```

### Mutation Authorization — CRITICAL

Mutations must re-check authorization; don't assume a read query's auth covers the write path.

### SSRF via URL Fields — HIGH

Args like `url`, `image`, `webhook` fetched server-side. Validate scheme/host, block private ranges.

---

## Subscriptions & Performance

### Unbounded Subscriptions — MEDIUM

Subscription clients without heartbeats/idle-timeout accumulate. Implement keepalive + disconnect handling.

### Resolver Complexity in Subscriptions — LOW

Re-resolving the entire tree per event is wasteful; precompute the result or limit re-resolution.

### Persisted Queries — LOW

Persisted query allowlists prevent arbitrary query execution and help caching. Optional but strong defense for public APIs.

### No Monitoring of Query Latency — LOW

No metrics per operation type means N+1 and slow resolvers go unnoticed.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Raw arg interpolation in queries | CRITICAL | Parameterized bindings |
| Missing field-level auth | CRITICAL | Object-level checks in resolvers |
| N+1 per parent | HIGH | DataLoader batching |
| No query depth/complexity limits | HIGH | Enforce limits |
| SSRF via URL args | HIGH | Validate scheme/host |
| Exposed internal fields | MEDIUM | Explicit field allowlists |
| Introspection in prod | MEDIUM | Disable/gate |
| Mutation auth gaps | CRITICAL | Re-check auth on writes |
| Blocking sync in resolvers | MEDIUM | Async I/O |
| Unbounded aliases | HIGH | Alias count limits |
| Unbounded subscriptions | MEDIUM | Heartbeats / idle timeout |
| Error as generic internal error | MEDIUM | Typed error unions |