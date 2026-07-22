# TypeScript Code Review Guide

## Strict Mode

### No `any` — HIGH

Avoid `any`. It disables type checking. Use `unknown` and narrow with type guards.

```typescript
// BAD
function process(data: any) {
  return data.name; // no type safety
}

// GOOD
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "name" in data) {
    return (data as { name: string }).name;
  }
  throw new Error("invalid data");
}
```

### No Implicit Any — HIGH

All parameters and return types must be explicit in function declarations.

### strictNullChecks — HIGH

Never bypass null checks with `!` or `as`. Handle `null` and `undefined` explicitly.

```typescript
// BAD
const name = user!.name;

// GOOD
if (user) {
  const name = user.name;
} else {
  throw new Error("user not found");
}
```

---

## Generics

### Proper Constraints — MEDIUM

Constrain generics to specific shapes rather than leaving them unconstrained.

```typescript
// BAD
function getProperty<T>(obj: T, key: string) {
  return obj[key]; // T could be anything
}

// GOOD
function getProperty<T extends Record<string, unknown>>(
  obj: T,
  key: keyof T
) {
  return obj[key];
}
```

### Avoid Excessive Complexity — MEDIUM

If a generic type is harder to read than the code it replaces, simplify. Deeply nested generics are a code smell.

---

## Runtime Validation

### Zod Schemas — MEDIUM

Validate external data (API responses, user input) with Zod schemas. Don't trust `as` casts.

```typescript
// BAD — type assertion without validation
const user = response as User;

// GOOD — runtime validation
import { z } from "zod";
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});
const user = UserSchema.parse(response);
```

### Branded Types — LOW

Use branded types for primitive types that should not be mixed.

```typescript
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

function getUser(id: UserId) { ... }

// Compile-time error: can't pass OrderId where UserId expected
getUser(orderId as UserId); // works but explicit
```

---

## Discriminated Unions

### State Management — MEDIUM

Use discriminated unions for component state and API responses.

```typescript
// GOOD
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function render(state: RequestState<User>) {
  switch (state.status) {
    case "idle":
      return null;
    case "loading":
      return <Spinner />;
    case "success":
      return <UserCard user={state.data} />;
    case "error":
      return <ErrorMessage error={state.error} />;
  }
}
```

---

## Common Mistakes

### Type Assertions — MEDIUM

`as` casts bypass type checking. Prefer type guards.

```typescript
// BAD
const user = data as User;

// GOOD
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data
  );
}
```

### Missing Null Checks — HIGH

Always check for `null`/`undefined` before accessing properties.

```typescript
// BAD
const name = user.name;

// GOOD
const name = user?.name ?? "Unknown";
```

### Callback `this` Binding — MEDIUM

Arrow functions capture `this` lexically. Use them in class methods passed as callbacks.

```typescript
// BAD — this lost
class Timer {
  seconds = 0;
  start() {
    setInterval(function () {
      this.seconds++; // this is undefined
    }, 1000);
  }
}

// GOOD
class Timer {
  seconds = 0;
  start() {
    setInterval(() => {
      this.seconds++; // this captured
    }, 1000);
  }
}
```

### `enum` vs Union — LOW

Prefer `as const` objects or union types over `enum` for better tree-shaking and type inference.

```typescript
// GOOD
const Status = {
  Idle: "idle",
  Loading: "loading",
  Done: "done",
} as const;
type Status = (typeof Status)[keyof typeof Status];
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Using `any` | HIGH | Use `unknown`, narrow with guards |
| Type assertion without validation | MEDIUM | Use Zod or type guards |
| Missing null check | HIGH | Optional chaining, nullish coalescing |
| `as` to bypass type errors | HIGH | Fix the actual type issue |
| Excessive generic complexity | MEDIUM | Simplify or inline |
| Deeply nested optional chaining | MEDIUM | Early return, flatten |
| Missing `readonly` on immutables | LOW | Add `readonly` modifier |
