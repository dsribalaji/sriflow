# ADR Template — API Design

Extends `ADR-template.md`. Use for public interface decisions: endpoints, contracts, versioning, error shapes. Add these blocks between base sections 1 (Context) and 4 (Decision).

## 1. Context — API additions

Add:

- Consumers (external partners, first-party apps, other services) and their constraints.
- Rate and scale expectations.
- Whether the API is public (versioning contract enforced) or internal (can change freely with coordination).
- Existing endpoints being extended or replaced.

## 2. Decision Drivers — API specific

- Backward compatibility requirement
- Client capability (can clients upgrade on release? mobile app stores are slow)
- Developer experience of the consuming team
- Operational concerns (rate limiting, abuse, observability)

## 3. Considered Options — API surface

Evaluate per dimension only when it matters; otherwise state the default.

**Style:** REST (resource-oriented) | RPC (action-oriented) | GraphQL | WebSocket/streaming.
- REST is the default for CRUD over HTTP. RPC for command/action-heavy services. GraphQL when consumers need flexible shaped reads and you accept query-cost complexity. Streaming when the data is inherently event-driven.

**Versioning:**
- URL path (`/v1/users`) — visible, simple, permanent. Default.
- Header (`Accept: application/vnd.x.v1+json`) — keeps URL clean, allows multi-version negotiation.
- Never break a published contract silently. `v1` stays until deprecated per policy.

**Error format:** one envelope for the whole API. See block below.

## 4. Decision — API additions

State the contract precisely enough to build against:

```
Base URL: <scheme://host>/<prefix>/<version>
Auth: <mechanism> — see security ADR
Content type: application/json

Resource model:
| Resource | Path | Methods | Notes |
|----------|------|---------|-------|
| <name>   | <path> | GET/POST/... | <auth scope, pagination> |

Error envelope:
{ "error": { "code": "<machine_code>", "message": "<human message>", "details": {...} } }
HTTP status: 2xx success / 4xx client / 5xx server. Never 200-with-error-body.
```

## 5. Consequences — API additions

- Versioning cost (keeping old versions alive).
- Client breakage risk and the migration plan for existing consumers.
- Rate limit and abuse surface introduced by being public.

## 6. Validation — API additions

- Contract tests pin every published shape (no schema drift).
- Load test against the rate limit target.
- A "first client integration" trial: one real consumer builds against the spec before sign-off — catches spec ambiguity cheapest.

## API rules

1. Idempotency: mutating endpoints accept a client-supplied idempotency key where retries are plausible (payments, creation).
2. Pagination: cursor-based for volatile collections, offset for stable ones. Document page size and max.
3. Filtering/sorting: query params, whitelisted fields only, never raw SQL surface.
4. Timestamps: ISO-8601 UTC, named with an explicit timezone suffix (`Z` or offset). Never epoch for new APIs.
5. Every endpoint documents its auth scope and rate-limit bucket.
6. Deprecation policy: announce → deprecate header → 2-version window → removal. Write the dates in the ADR.