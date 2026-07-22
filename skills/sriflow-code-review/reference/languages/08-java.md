# Java Code Review Guide

## Records and Sealed Classes

### Records — LOW

Use records for immutable data carriers. They auto-generate `equals`, `hashCode`, `toString`.

```java
// GOOD — record
public record User(String name, String email, int age) {}

// BAD — verbose class for simple data
public class User {
    private final String name;
    private final String email;
    private final int age;
    // constructor, getters, equals, hashCode, toString
}
```

### Sealed Classes — LOW

Use sealed classes for restricted hierarchies with pattern matching.

```java
// GOOD — sealed + pattern matching
public sealed interface Shape permits Circle, Rectangle, Triangle {
    default double area() {
        return switch (this) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Triangle t -> 0.5 * t.base() * t.height();
        };
    }
}
```

---

## Spring Boot 3

### Constructor Injection — HIGH

Always use constructor injection. Never field injection with `@Autowired`.

```java
// GOOD — constructor injection
@Service
public class UserService {
    private final UserRepository repo;
    private final EmailService email;

    public UserService(UserRepository repo, EmailService email) {
        this.repo = repo;
        this.email = email;
    }
}

// BAD — field injection
@Service
public class UserService {
    @Autowired
    private UserRepository repo;
    @Autowired
    private EmailService email;
}
```

### Record DTOs — LOW

Use records for request/response DTOs.

```java
// GOOD
public record CreateUserRequest(String name, String email) {}
public record UserResponse(Long id, String name, String email) {}
```

---

## Optional

### Optional Usage — MEDIUM

Use Optional to represent absence. Don't use it for fields or collections.

```java
// GOOD — Optional for return values
public Optional<User> findById(Long id) {
    return userRepository.findById(id);
}

// BAD — Optional as field
public class User {
    private Optional<String> nickname; // BAD: serialize poorly
}

// BAD — checking then getting
Optional<User> user = findById(id);
if (user.isPresent()) {
    process(user.get()); // what if null sneaks in?
}

// GOOD — use methods
findById(id).ifPresent(this::process);
User user = findById(id).orElseThrow(() -> new NotFoundException("User"));
```

---

## Stream API

### Proper Stream Usage — MEDIUM

Use streams for data pipelines. Don't use them for simple loops.

```java
// GOOD — clear pipeline
List<String> names = users.stream()
    .filter(u -> u.age() >= 18)
    .map(User::name)
    .sorted()
    .toList();

// BAD — streams for simple iteration
users.stream().forEach(u -> System.out.println(u.name()));

// GOOD — simple loop is clearer
for (User u : users) {
    System.out.println(u.name());
}
```

### Collectors — MEDIUM

Use `Collectors.groupingBy`, `partitioningBy`, `toMap` for complex aggregation.

```java
// GOOD
Map<String, List<User>> byCity = users.stream()
    .collect(Collectors.groupingBy(User::city));

// GOOD — toMap with merge function
Map<Long, User> userMap = users.stream()
    .collect(Collectors.toMap(User::id, Function.identity(), (a, b) -> a));
```

---

## Common Mistakes

### Null Pointer — HIGH

Use Optional, null checks, or `Objects.requireNonNull` to prevent NPE.

```java
// BAD — potential NPE
String name = user.getName().toUpperCase();

// GOOD — null-safe
String name = Optional.ofNullable(user)
    .map(User::getName)
    .map(String::toUpperCase)
    .orElse("UNKNOWN");
```

### equals / hashCode Contract — HIGH

If you override `equals`, you must override `hashCode`. Records handle this automatically.

```java
// CRITICAL — broken contract
public class User {
    String name;
    // overrides equals but not hashCode
    // breaks HashMap, HashSet behavior
}

// GOOD — use record, or implement both
public record User(String name) {} // auto-generates both
```

### Stream Side Effects — MEDIUM

Don't mutate external state inside stream operations.

```java
// BAD — side effect in stream
List<String> result = new ArrayList<>();
users.stream()
    .map(User::name)
    .forEach(result::add); // should use .toList()

// GOOD
List<String> result = users.stream()
    .map(User::name)
    .toList();
```

### String Comparison — MEDIUM

Use `.equals()` not `==` for string comparison.

```java
// BAD
if (name == "admin") { ... }

// GOOD
if ("admin".equals(name)) { ... }
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Field injection with @Autowired | HIGH | Use constructor injection |
| Optional as field | MEDIUM | Use null or dedicated absent type |
| equals without hashCode | HIGH | Override both or use record |
| Stream with side effects | MEDIUM | Use collectors, not forEach |
| String comparison with == | MEDIUM | Use .equals() |
| NPE from unchained calls | HIGH | Use Optional, null checks |
| Raw types (List instead of List<T>) | MEDIUM | Use parameterized types |
| Synchronized on wrong object | HIGH | Use proper lock objects |
