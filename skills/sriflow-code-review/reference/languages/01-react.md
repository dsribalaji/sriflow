# React Code Review Guide

## Hooks Rules

### Conditional Hook Calls — CRITICAL

Hooks must be called unconditionally at the top level. Never inside loops, conditions, or nested functions.

```jsx
// BAD — conditional hook call
function UserProfile({ userId }) {
  if (userId) {
    const user = useUser(userId); // CRITICAL: conditional
  }
  return null;
}

// GOOD — hooks always at top level
function UserProfile({ userId }) {
  const user = useUser(userId);
  return user ? <Profile user={user} /> : null;
}
```

### Async Hook Functions — CRITICAL

`useState` does not accept async functions. Use `useEffect` for async work.

```jsx
// BAD — async useState
const [data, setData] = useState(async () => {
  return await fetchData();
});

// GOOD — useEffect for async
useEffect(() => {
  let cancelled = false;
  fetchData().then((d) => {
    if (!cancelled) setData(d);
  });
  return () => { cancelled = true; };
}, []);
```

### Custom Hook Naming — WARNING

Custom hooks must start with `use`. Enforces hook rules by convention.

---

## useEffect Patterns

### Missing Cleanup — HIGH

Every effect that creates subscriptions, timers, or async work must return a cleanup.

```jsx
// BAD — no cleanup, timer leaks
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
}, []);

// GOOD — cleanup
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);
```

### Missing Dependencies — MEDIUM

All variables from component scope used inside the effect must be in the dependency array.

```jsx
// BAD — stale closure, uses old count
useEffect(() => {
  document.title = `Count: ${count}`;
}, []);

// GOOD — complete deps
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

### Derived State in Effects — MEDIUM

Don't compute derived state in useEffect when it can be done during render with `useMemo` or inline.

```jsx
// BAD — unnecessary effect
const [filtered, setFiltered] = useState([]);
useEffect(() => {
  setFiltered(items.filter((i) => i.active));
}, [items]);

// GOOD — compute during render
const filtered = useMemo(() => items.filter((i) => i.active), [items]);
```

---

## useMemo / useCallback

### Memoizing Constants — LOW

Don't wrap static values in useMemo. The memoization cost exceeds the savings.

```jsx
// BAD — memoizing a constant
const config = useMemo(() => ({ maxRetries: 3 }), []);

// GOOD — just define it
const config = { maxRetries: 3 };
```

### When to Use useCallback — MEDIUM

Only use when passing callbacks to memoized child components. Otherwise React may optimize equally well without it.

```jsx
// BAD — memoizing callback with no memoized children
const handleClick = useCallback(() => setCount((c) => c + 1), []);

// GOOD — useCallback when child is memoized
const handleClick = useCallback(() => setCount((c) => c + 1), []);
return <ExpensiveChild onClick={handleClick} />;
```

---

## Component Design

### Single Responsibility — MEDIUM

If a component manages multiple unrelated concerns, split it.

### Composition Over Props Drilling — MEDIUM

Use `children` or render props before adding prop chains.

### Default Props at Destruction — LOW

Prefer default parameters over `defaultProps` (deprecated in function components).

---

## Error Boundaries & Suspense

### Missing Error Boundaries — HIGH

Every route-level component needs an error boundary. Missing one crashes the entire tree.

```jsx
// BAD — no error handling
<Dashboard />

// GOOD — wrapped
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<Loading />}>
    <Dashboard />
  </Suspense>
</ErrorBoundary>
```

---

## React 19

### useActionState / useFormStatus

Use for form submissions with pending states. Prefer over manual loading state management.

### useOptimistic

Use for optimistic updates. Always provide revert logic.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Conditional hook call | CRITICAL | Move to top level, guard inside |
| Missing effect cleanup | HIGH | Return cleanup function |
| Missing useEffect deps | MEDIUM | Add all referenced variables |
| Stale closure in setTimeout | MEDIUM | Use ref for latest value |
| Memoizing static objects | LOW | Remove useMemo/useCallback |
| async useState | CRITICAL | Use useEffect instead |
| No error boundary | HIGH | Add at route level |
| Direct state mutation | HIGH | Return new object from setState |
