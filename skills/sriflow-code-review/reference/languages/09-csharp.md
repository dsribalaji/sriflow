# C# Code Review Guide

## .NET 8 Features

### Records — LOW

Use records for immutable data carriers.

```csharp
// GOOD — record
public record User(string Name, string Email, int Age);

// BAD — class for simple data
public class User
{
    public string Name { get; }
    public string Email { get; }
    public int Age { get; }
    public User(string name, string email, int age)
    {
        Name = name; Email = email; Age = age;
    }
}
```

### Pattern Matching — LOW

Use pattern matching for cleaner conditionals.

```csharp
// GOOD
string Describe(object obj) => obj switch
{
    int n when n > 0 => $"positive {n}",
    int n when n < 0 => $"negative {n}",
    0 => "zero",
    string s => $"string: {s}",
    null => "null",
    _ => "unknown"
};

// BAD — verbose if-else chain
if (obj is int n)
{
    if (n > 0) return $"positive {n}";
    else if (n < 0) return $"negative {n}";
    else return "zero";
}
```

---

## async / await

### async void — CRITICAL

Never use `async void` except for event handlers. Use `async Task`.

```csharp
// CRITICAL — async void, unobservable exceptions
public async void Button_Click(object sender, EventArgs e)
{
    await DoWork(); // exception lost if not caught
}

// GOOD — async Task (event handler is exception)
public async Task ProcessDataAsync()
{
    await DoWork();
}

// GOOD — event handler with async void (acceptable)
private async void Button_Click(object sender, EventArgs e)
{
    try
    {
        await ProcessDataAsync();
    }
    catch (Exception ex)
    {
        Logger.LogError(ex, "Click failed");
    }
}
```

### ConfigureAwait — MEDIUM

Use `ConfigureAwait(false)` in library code. Don't use it in UI code that needs to update the UI.

```csharp
// GOOD — library code
public async Task<User> GetUserAsync(int id)
{
    var response = await _http.GetAsync(url).ConfigureAwait(false);
    return await response.Content.ReadFromJsonAsync<User>().ConfigureAwait(false);
}

// BAD — missing ConfigureAwait in library
public async Task<User> GetUserAsync(int id)
{
    var response = await _http.GetAsync(url); // may cause deadlock
    return await response.Content.ReadFromJsonAsync<User>();
}
```

---

## LINQ

### Performance — MEDIUM

Avoid multiple enumeration. Materialize when needed.

```csharp
// BAD — double enumeration (queries DB twice)
var users = GetUsers().Where(u => u.IsActive);
Console.WriteLine(users.Count());
foreach (var u in users) { ... }

// GOOD — materialize once
var users = GetUsers().Where(u => u.IsActive).ToList();
Console.WriteLine(users.Count);
foreach (var u in users) { ... }
```

### Side Effects in LINQ — MEDIUM

Don't use `ForEach` or mutations inside LINQ chains.

```csharp
// BAD — side effect
users.Where(u => u.IsActive)
     .ToList()
     .ForEach(u => u.LastAccessed = DateTime.UtcNow);

// GOOD — separate mutation
var activeUsers = users.Where(u => u.IsActive).ToList();
foreach (var u in activeUsers)
{
    u.LastAccessed = DateTime.UtcNow;
}
```

---

## Nullable Reference Types

### Enable Nullable — HIGH

Enable `<Nullable>enable</Nullable>` in all new projects. Handle nulls explicitly.

```csharp
// GOOD — nullable enabled
#nullable enable
public string GetUserName(int id)
{
    var user = _repo.GetById(id);
    return user?.Name ?? "Unknown"; // explicit null handling
}

// BAD — ignoring nullable warnings
public string GetUserName(int id)
{
    var user = _repo.GetById(id);
    return user.Name; // nullable warning suppressed
}
```

---

## IDisposable

### Missing Dispose — HIGH

Dispose of resources that implement `IDisposable`. Use `using` statements.

```csharp
// BAD — file handle leaks
var stream = new FileStream("data.txt", FileMode.Open);
// ... use stream
// never disposed

// GOOD — using statement
using var stream = new FileStream("data.txt", FileMode.Open);
// ... use stream
// auto-disposed at end of scope

// GOOD — using declaration (C# 8+)
using var stream = new FileStream("data.txt", FileMode.Open);
```

---

## Common Mistakes

### async void — CRITICAL

Already covered above. Never use `async void` except event handlers.

### LINQ Side Effects — MEDIUM

Already covered above. Keep LINQ pure.

### Missing Dispose — HIGH

Already covered above. Use `using` for IDisposable resources.

### String Comparison — MEDIUM

Use `StringComparison` for culture-aware comparison.

```csharp
// BAD — culture-dependent
if (name == "admin") { ... }

// GOOD — ordinal (fast, culture-invariant)
if (string.Equals(name, "admin", StringComparison.Ordinal)) { ... }
```

### Thread Safety — HIGH

Use `ConcurrentDictionary`, `lock`, or `Immutable` collections for shared state.

```csharp
// CRITICAL — not thread-safe
private Dictionary<string, User> _users = new();

// GOOD — thread-safe
private ConcurrentDictionary<string, User> _users = new();
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| async void (non-event) | CRITICAL | Use async Task |
| Missing ConfigureAwait in libraries | MEDIUM | Add .ConfigureAwait(false) |
| Multiple LINQ enumeration | MEDIUM | Materialize with ToList() |
| Missing IDisposable disposal | HIGH | Use using statement |
| LINQ with side effects | MEDIUM | Use foreach separately |
| Nullable warnings suppressed | HIGH | Enable nullable, handle nulls |
| String comparison without ordinal | MEDIUM | Use StringComparison.Ordinal |
| Non-thread-safe shared state | HIGH | Use ConcurrentDictionary or lock |
