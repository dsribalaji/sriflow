# Protobuf / gRPC Code Review Guide

## .proto Schema Design

### Breaking Field Number Changes — CRITICAL

Field numbers are part of the wire format. Renumbering, reusing, or removing a field without `reserved` corrupts existing data on upgrade.

```protobuf
// CRITICAL — reusing field number breaks old clients
message User {
  string name = 1;
  string email = 2;  // was something else in v1
}

// GOOD — reserve retired numbers
message User {
  reserved 2, 4 to 6;
  reserved "old_email";
  string name = 1;
  string email = 3;
}
```

### Field Type Changes — CRITICAL

Changing types (int32 → string, repeated → singular) changes wire encoding and breaks compatibility. Never mutate an existing field's type.

### Missing Optional Semantics — MEDIUM

Scalar fields with default values (`0`, `""`) are indistinguishable from "not set" in proto3. Use `optional` for fields where "absent" matters.

```protobuf
// GOOD — explicit presence
optional string email = 3;
```

### Oneof vs Many Optionals — MEDIUM

Multiple mutually exclusive fields as separate optionals invite invalid states. Use `oneof`.

### Unbounded / Unvalidated Strings — MEDIUM

No length/pattern constraints on message fields. Validate server-side; consider validating client-side too.

### Missing Timestamps/IDs Conventions — LOW

Standardize `google.protobuf.Timestamp` (not int64 ms) and UUID types across services for consistency.

---

## gRPC Service Design

### Oversized Services — MEDIUM

A service with 50+ RPCs mixes unrelated concerns. Group by domain into multiple services.

### RPC Naming / Verb Confusion — LOW

RPCs named as verbs (`GetUser`, `ListOrders`, `WatchStream`) — avoid overloaded terms like `Do`.

### Unary for Streaming Semantics — MEDIUM

A unary RPC that internally loops over a huge dataset should be a server-streaming RPC to bound memory and latency.

### No Pagination on List RPCs — HIGH

`ListX` without `page_size`/`page_token` returns unbounded data. Add pagination and caps.

### Missing Metadata/Versioning — MEDIUM

No request `trace_id`/`request_id` in metadata makes debugging hard. Enforce a header convention.

### Context Propagation — MEDIUM

Cancellation/timeout/deadline not propagated through nested calls (a client deadline must bound downstream calls).

```go
// GOOD — propagate ctx
resp, err := downstream.Do(ctx, req)   // uses caller's deadline
// BAD — fresh context, ignores deadline
resp, err := downstream.Do(context.Background(), req)
```

---

## Error Handling

### Errors as String Fields — CRITICAL

Returning error info inside the response message (a `success bool` + `error string`) loses standard gRPC error codes. Use gRPC status codes + details.

```protobuf
// BAD — hand-rolled error transport
message CreateOrderResp {
  bool ok = 1;
  string error = 2;
}

// GOOD — rely on gRPC status
// rpc returns CreateOrderResp on success; failures use codes + status details
```

### Mapping HTTP to gRPC Codes — MEDIUM

gRPC codes (`NOT_FOUND`, `PERMISSION_DENIED`) map to specific HTTP codes via the gateway. Consistent mapping needed for REST bridges.

### Swallowing Errors Server-Side — HIGH

Server-side `catch` that logs and returns `OK` with empty data hides failures from callers. Return the correct status code.

### Missing Status Details — LOW

Rich error details (`google.rpc.ErrorInfo`, `BadRequest`, `QuotaFailure`) carry structured context for clients. Use them for actionable failures.

---

## Streaming

### Stream Backpressure — HIGH

A server-stream that produces faster than the client consumes, with no flow control, grows buffers. Respect stream flow control; detect slow consumers.

### Never-Cancelled Streams — MEDIUM

Client streams that ignore `context.Context` cancellation leak server-side work. Use `ctx` for both directions.

### Closing Streams on Error — MEDIUM

A server-stream that returns an error mid-stream must send the error status and close — or the client hangs waiting.

### Reordering in Bidirectional Streams — MEDIUM

Bidirectional streams are ordered per direction; reassembly logic (correlating responses to requests) must use request ids if you parallelize.

### Unbounded Request Volume — MEDIUM

Client streaming an unbounded number of messages floods memory. Cap message size and count.

### Recv Without Graceful Shutdown — LOW

Server drain on shutdown (stop accepting, finish in-flight) prevents dropped requests.

---

## Security & Performance

### No TLS/mTLS — CRITICAL

gRPC in production without TLS (or mTLS between services) sends payloads in the clear. Require TLS; mTLS for service-to-service.

### Missing Auth/Interceptors — CRITICAL

Unary and stream interceptors must enforce authn/authz on every RPC. A single RPC without an interceptor is a hole.

```go
// GOOD — one auth interceptor guards all methods
func authInterceptor(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
    if err := authorize(ctx, info.FullMethod); err != nil { return nil, err }
    return handler(ctx, req)
}
```

### Per-Call Overhead — MEDIUM

Chatty tiny unary calls (one field per call) are wasteful. Batch or stream where latency matters.

### Reflection Exposed in Prod — MEDIUM

gRPC reflection (`grpcurl`) exposes the schema. Disable in production unless needed.

### Large Message Limits — MEDIUM

Default max message size (4 MB) and per-connection settings need explicit review for known payload sizes.

### Deadlines/Timestamps Leaking Into Data — LOW

`Timestamp` with local-time semantics (vs UTC) across services causes drift bugs. Standardize on `Timestamp`.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Field number/type changes | CRITICAL | Add new fields, reserve old |
| No TLS/mTLS | CRITICAL | Enable transport security |
| Missing auth interceptor | CRITICAL | Interceptors on all RPCs |
| Errors as response strings | CRITICAL | gRPC status codes + details |
| Unpaginated List RPC | HIGH | page_size / page_token |
| Server swallows errors → OK | HIGH | Return correct status code |
| No stream flow control | HIGH | Respect backpressure |
| Stream ignoring ctx cancel | MEDIUM | Use context in streams |
| Deadline not propagated | MEDIUM | Thread ctx through calls |
| Oversized messages | MEDIUM | Size limits |
| Reflection in prod | MEDIUM | Disable / gate |
| Chatty unary calls | MEDIUM | Batch / streaming |