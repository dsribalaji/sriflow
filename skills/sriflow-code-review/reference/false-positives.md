# Appendix F: Common False Positives

These are patterns that look like findings but are not. Suppress them.

## Correctness

- **Intentional null coalescing**: `const name = user?.profile?.name ?? "Anonymous"` — the `??` fallback is intentional, not a missing null check.
- **Intentional short-circuit evaluation**: `isLoading && <Spinner />` in JSX — this is a conditional render pattern, not a boolean-in-arithmetic bug.
- **Idiomatic falsy check**: `if (!items.length)` — equivalent to `items.length === 0`. Do not flag as a type error.
- **Promise returned from async function**: `async function foo() { return bar(); }` — the outer `async` wraps the returned Promise, so the caller gets a resolved value. Not a missing await.

## SQL Safety

- **Parameterized query with dynamic structure via allowlist**: `ORDER BY ${ALLOWED_COLUMNS.includes(col) ? col : 'id'}` — the allowlist check makes this safe. Do not flag as ORDER BY injection.
- **Admin-only query builder**: a query built dynamically in an admin panel where the user is verified to be an admin before the endpoint is reached. Flag as WARN if the admin check is not visible in the diff, not as CRITICAL injection.

## Security

- **`innerHTML` with static string**: `element.innerHTML = '<span>Hello</span>'` — a static string literal with no user input. Not XSS.
- **`eval()` with a static string**: `eval('var x = 5')` — not a real risk if the argument is a literal. Still worth a NITPICK (why use eval at all?) but not CRITICAL.
- **CORS `*` on a public API**: CORS `*` is acceptable for truly public, unauthenticated, read-only endpoints (public CDN, open data API). Only flag as CRITICAL if the endpoint returns authenticated user data.
- **`process.env.SECRET` in a `.env.example`**: if the value is clearly a placeholder (`your_secret_here`, `CHANGE_ME`, `sk-xxxx`), do not flag as a secret in code.

## LLM Trust

- **LLM output used for display only**: if the LLM response is displayed to the user as text in a UI that escapes HTML, there is no injection risk in the display path. Only flag if the output reaches a dangerous sink (eval, SQL, shell, innerHTML without escaping).
- **Static system prompts**: a system prompt that is a string literal with no user input is not a prompt injection vector.

## Complexity

- **Interface with one implementation but multiple test doubles**: if tests mock the interface, the interface serves a real purpose. Check the test files before flagging a single-implementation interface.
- **Async wrapper that adds error handling**: a wrapper that adds try/catch or error transformation is not a pure pass-through. Do not flag it as a wrapper-only function.
