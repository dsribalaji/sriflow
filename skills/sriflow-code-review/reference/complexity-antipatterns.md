# Appendix C: Complexity Anti-Patterns Reference

These are the specific patterns to look for in Lens 5. Named anti-patterns make findings cleaner.

## The Single-Implementation Interface

```typescript
// Anti-pattern
interface UserRepository {
  findById(id: string): Promise<User>;
}

class PostgresUserRepository implements UserRepository {
  async findById(id: string) { /* ... */ }
}

// Then everywhere:
class UserService {
  constructor(private repo: UserRepository) {}  // Always injected as PostgresUserRepository
}
```

The interface adds a layer of indirection with zero current benefit. There is no test double, no second implementation, no mock. The interface exists "for future flexibility" that has not arrived.

**NITPICK:** Collapse to `PostgresUserRepository` directly. Extract the interface when a second implementation or test mock actually exists.

## The One-Param Config Object

```javascript
// Anti-pattern
function sendEmail(options) {
  return mailer.send({
    to: options.to,
    subject: options.subject,
    body: options.body,
  });
}

// Called as:
sendEmail({ to: "user@example.com", subject: "Hello", body: "World" });
```

If `sendEmail` is always called with these three fields and does nothing but pass them to `mailer.send`, it is a wrapper with no value.

**NITPICK:** Delete `sendEmail`. Call `mailer.send` directly.

## The Registry for One Thing

```javascript
// Anti-pattern
const handlerRegistry = {
  "payment.created": handlePaymentCreated,
};

function dispatch(event) {
  const handler = handlerRegistry[event.type];
  if (handler) handler(event);
}
```

If there is exactly one handler and the registry is only ever extended with one entry, `dispatch` is just `handlePaymentCreated` in a trench coat.

**NITPICK:** Call `handlePaymentCreated` directly. Add the registry when the second event type arrives.

## The Async Wrapper

```typescript
// Anti-pattern
async function fetchUser(id: string) {
  return await userService.getUser(id);
}
```

`return await` in a function with no try/catch is redundant. The async wrapper adds a Promise tick and a stack frame for nothing.

**NITPICK:** Delete the wrapper. Call `userService.getUser` directly, or if the wrapper is needed for typing reasons, use `return userService.getUser(id)` (no await).

## The Config for a Constant

```javascript
// Anti-pattern
const config = {
  maxRetries: process.env.MAX_RETRIES || 3,
  timeoutMs: process.env.TIMEOUT_MS || 5000,
  batchSize: process.env.BATCH_SIZE || 100,
};
```

If `MAX_RETRIES`, `TIMEOUT_MS`, and `BATCH_SIZE` are never set in any environment (check the `.env.example`, Dockerfile, CI config, and deployment scripts), these are constants wearing a config disguise. The `|| 3` default always wins.

**NITPICK:** Use `const MAX_RETRIES = 3`. Add the env var when someone actually needs to tune it.

## The Three-Layer Sandwich

```typescript
// Anti-pattern
// controller.ts
function getUser(req, res) {
  return userService.getUser(req.params.id).then(user => res.json(user));
}

// userService.ts
function getUser(id: string) {
  return userRepository.getUser(id);
}

// userRepository.ts
function getUser(id: string) {
  return db.query("SELECT * FROM users WHERE id = $1", [id]);
}
```

Service and repository both do nothing but delegate. The three-layer architecture exists as ceremony, not because any layer adds behavior.

**NITPICK when the service adds no logic:** collapse service into controller, or repository into service, depending on where you want the query to live.
**WARN (not just NITPICK) when the service layer obscures whether auth happens:** if the controller calls `userService.getUser` without knowing whether the service checks ownership, this is an authorization blind spot.
