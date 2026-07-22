# Angular Code Review Guide

## Signals

### Signal Usage — MEDIUM

Use signals for reactive state. Prefer `signal()` over `BehaviorSubject` for simple state.

```typescript
// GOOD — signal
count = signal(0);
this.count.update((c) => c + 1);

// GOOD — computed
doubleCount = computed(() => this.count() * 2);

// GOOD — effect
constructor() {
  effect(() => {
    console.log('count changed:', this.count());
  });
}
```

### Signal vs RxJS — MEDIUM

Use signals for synchronous state. Use RxJS for async streams, complex transformations, and event streams.

```typescript
// GOOD — signals for state
userId = signal<string | null>(null);
user = computed(() => this.userId() ? this.userService.get(this.userId()) : null);

// GOOD — RxJS for async
searchResults$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.http.get(`/api/search?q=${term}`))
);
```

---

## Standalone Components — MEDIUM

Use standalone components by default. Avoid NgModules for new code.

```typescript
// GOOD — standalone
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './user.component.html',
})
export class UserComponent {}

// BAD — module-based (legacy only)
@NgModule({
  declarations: [UserComponent],
  imports: [CommonModule],
})
export class UserModule {}
```

---

## RxJS Patterns

### Subscription Management — HIGH

Always unsubscribe from observables. Use `takeUntil`, `async` pipe, or `DestroyRef`.

```typescript
// GOOD — DestroyRef (Angular 16+)
constructor() {
  const destroyRef = inject(DestroyRef);
  this.data$.pipe(takeUntilDestroyed(destroyRef)).subscribe(data => {
    this.data = data;
  });
}

// GOOD — async pipe (best)
// template: {{ data$ | async }}

// BAD — manual subscription, no unsubscribe
ngOnInit() {
  this.data$.subscribe(data => {
    this.data = data;
  });
}
```

### switchMap vs mergeMap — MEDIUM

Use `switchMap` when you only want the latest value. Use `mergeMap` when you want all results.

```typescript
// GOOD — switchMap for search (cancel previous)
searchTerm$.pipe(
  switchMap(term => this.http.get(`/api/search?q=${term}`))
)

// GOOD — mergeMap for independent requests
ids$.pipe(
  mergeMap(id => this.http.get(`/api/items/${id}`))
)
```

### catchError Placement — MEDIUM

Catch errors at the right level. Don't swallow errors.

```typescript
// GOOD — catches and re-throws or returns default
this.data$.pipe(
  catchError(err => {
    console.error(err);
    return of(defaultValue);
  })
)

// BAD — swallows error silently
this.data$.pipe(
  catchError(() => EMPTY)
)
```

---

## Change Detection

### OnPush Strategy — HIGH

Use `ChangeDetectionStrategy.OnPush` for all components. Avoid default change detection.

```typescript
// GOOD
@Component({
  selector: 'app-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
export class UserComponent {}

// BAD — default change detection (re-renders on any change)
@Component({
  selector: 'app-user',
  ...
})
export class UserComponent {}
```

### Signal-Based Change Detection — LOW

Angular 19+ supports signal-based change detection. Use it when available.

---

## Common Mistakes

### Memory Leaks — HIGH

Missing unsubscribe causes memory leaks. Every subscription must have a cleanup path.

```typescript
// BAD — leaks
ngOnInit() {
  interval(1000).subscribe(n => this.count = n);
}

// GOOD — cleaned up
private destroyRef = inject(DestroyRef);
ngOnInit() {
  interval(1000)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(n => this.count = n);
}
```

### Wrong Change Detection — MEDIUM

Default change detection checks the entire component tree. Use OnPush + signals for performance.

### HTTP Without Error Handling — HIGH

Always handle HTTP errors.

```typescript
// BAD — no error handling
this.http.get<User>('/api/user').subscribe(user => {
  this.user = user;
});

// GOOD
this.http.get<User>('/api/user').subscribe({
  next: user => this.user = user,
  error: err => this.error = err.message,
});
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Missing unsubscribe | HIGH | use DestroyRef + takeUntilDestroyed |
| Default change detection | HIGH | Use OnPush |
| Missing HTTP error handling | HIGH | Handle error in subscribe |
| signal() used where RxJS needed | MEDIUM | Use RxJS for async streams |
| mergeMap where switchMap needed | MEDIUM | Use switchMap for cancellation |
| NgModules in new code | MEDIUM | Use standalone components |
| Effect without cleanup | MEDIUM | Use onCleanup in effect |
