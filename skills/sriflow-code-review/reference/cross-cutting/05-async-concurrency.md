# Async and Concurrency Patterns Guide

Language-agnostic review checklist. Apply to every PR with async code, parallel execution, or shared state.

---

## 7 Concurrency Models

### 1. Goroutines + CSP (Go)

Communicating sequential processes. Goroutines are lightweight threads. Channels are typed pipes.

```go
func processItems(items []Item) []Result {
    ch := make(chan Result, len(items))
    for _, item := range items {
        go func(i Item) {
            ch <- process(i)  // send result on channel
        }(item)
    }
    results := make([]Result, len(items))
    for i := range items {
        results[i] = <-ch  // receive in order
    }
    return results
}
```

### 2. async/await + Event Loop (Python / TypeScript)

Single-threaded event loop. Non-blocking I/O. CPU-bound work needs multiprocessing.

```typescript
// TypeScript
async function fetchAll(urls: string[]): Promise<Response[]> {
    return Promise.all(urls.map(url => fetch(url)));
}

// Python
import asyncio
async def fetch_all(urls):
    return await asyncio.gather(*[fetch(url) for url in urls])
```

### 3. async/await + Tokio (Rust)

Multi-threaded runtime. Zero-cost async. Pin + Future trait.

```rust
async fn fetch_all(urls: Vec<String>) -> Vec<Response> {
    let futs: Vec<_> = urls.iter()
        .map(|url| reqwest::get(url))
        .collect();
    futures::future::join_all(futs).await
}
```

### 4. Coroutines + Flow (Kotlin)

Structured concurrency with coroutine scopes. Flow for async streams.

```kotlin
suspend fun fetchAll(urls: List<String>): List<Response> = coroutineScope {
    urls.map { url -> async { httpClient.get(url).body() } }
        .awaitAll()
}
```

### 5. async/await + Actors (Swift)

Actors provide mutual exclusion. Isolated state. No data races.

```swift
actor BankAccount {
    private var balance: Decimal

    func withdraw(amount: Decimal) throws {
        guard balance >= amount else { throw InsufficientFunds() }
        balance -= amount
    }
}
```

### 6. async/await + TPL (C#)

Task Parallel Library. Task.WhenAll for parallel. Channels for producer-consumer.

```csharp
var tasks = urls.Select(url => httpClient.GetAsync(url));
var responses = await Task.WhenAll(tasks);
```

### 7. Threads + Mutexes (C++ / Java)

Traditional thread model. Manual synchronization.

```java
ExecutorService pool = Executors.newFixedThreadPool(10);
List<Future<Result>> futures = items.stream()
    .map(item -> pool.submit(() -> process(item)))
    .toList();
List<Result> results = futures.stream()
    .map(f -> f.get())
    .toList();
```

---

## 5 Common Traps

### 1. Race Conditions

Multiple goroutines/threads/tasks accessing shared state without synchronization.

```go
// VULNERABLE - data race
var counter int
for i := 0; i < 1000; i++ {
    go func() {
        counter++  // read-modify-write is not atomic
    }()
}

// SAFE - mutex
var mu sync.Mutex
var counter int
for i := 0; i < 1000; i++ {
    go func() {
        mu.Lock()
        counter++
        mu.Unlock()
    }()
}

// SAFE - atomic
var counter atomic.Int64
for i := 0; i < 1000; i++ {
    go func() {
        counter.Add(1)
    }()
}
```

```typescript
// VULNERABLE - event loop race
let balance = 100;
async function withdraw(amount: number) {
    if (balance >= amount) {        // check
        await delay(10);            // another task runs here
        balance -= amount;          // act
    }
}

// SAFE - serialize with lock/queue
class Account {
    private queue: Promise<void> = Promise.resolve();

    async withdraw(amount: number) {
        this.queue = this.queue.then(async () => {
            if (this.balance >= amount) this.balance -= amount;
        });
        await this.queue;
    }
}
```

### 2. Deadlocks

Two or more tasks waiting for each other's resources forever.

```go
// VULNERABLE - lock ordering violation
func transfer(a, b *Account, amount int) {
    a.mu.Lock()
    b.mu.Lock()      // if another goroutine locks b first then a: deadlock
    defer a.mu.Unlock()
    defer b.mu.Unlock()
    // ...
}

// SAFE - consistent lock ordering (always lock by ID)
func transfer(a, b *Account, amount int) {
    if a.id < b.id {
        a.mu.Lock()
        b.mu.Lock()
    } else {
        b.mu.Lock()
        a.mu.Lock()
    }
    defer a.mu.Unlock()
    defer b.mu.Unlock()
    // ...
}
```

Detection: `go test -race` (Go), ThreadSanitizer (C++/Swift), `pytest --forked` (Python).

### 3. Starvation

Tasks waiting indefinitely while others keep getting served.

```csharp
// VULNERABLE - unfair lock
var semaphore = new SemaphoreSlim(1);
// High-priority tasks keep grabbing the lock

// SAFE - fair semaphore or FIFO queue
var channel = Channel.CreateBounded<Task>(100);
// Tasks processed in order
```

### 4. Goroutine / Task Leaks

Goroutines or tasks spawned but never completed or cleaned up.

```go
// VULNERABLE - goroutine leak
func fetchWithTimeout(url string) ([]byte, error) {
    ch := make(chan []byte, 1)
    go func() {
        data, _ := http.Get(url)
        ch <- data  // blocks forever if nobody reads
    }()
    select {
    case data := <-ch:
        return data, nil
    case <-time.After(5 * time.Second):
        return nil, timeoutError  // goroutine still blocked on ch <- data
    }
}

// SAFE - use context
func fetchWithTimeout(ctx context.Context, url string) ([]byte, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}
```

```typescript
// VULNERABLE - promise leak
async function backgroundWork() {
    while (true) {
        await processNext();  // runs forever, never cleaned up
    }
}
backgroundWork();  // fire and forget - leak

// SAFE - abort controller
const controller = new AbortController();
backgroundWork(controller.signal).catch(() => {});

// On shutdown:
controller.abort();
```

### 5. Blocking in Async Context

Blocking the event loop with synchronous operations.

```typescript
// VULNERABLE - blocks event loop
async function handler() {
    const data = fs.readFileSync("large-file.txt");  // blocks
    return JSON.parse(data);
}

// SAFE - async I/O
async function handler() {
    const data = await fs.promises.readFile("large-file.txt");
    return JSON.parse(data);
}
```

```python
# VULNERABLE - blocks event loop
async def handler():
    result = requests.get("https://api.example.com")  # blocking!
    return result.json()

# SAFE - async HTTP
async def handler():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.example.com") as resp:
            return await resp.json()
```

---

## 4 Best Practices

### 1. Structured Concurrency

Tie spawned tasks to a lifecycle. When parent cancels, children cancel.

```kotlin
// Kotlin - structured concurrency
suspend fun fetchAll(urls: List<String>) = coroutineScope {
    urls.map { url -> async { httpClient.get(url) } }.awaitAll()
    // If any fails, scope cancels all others
}
```

```go
// Go - context propagation
func worker(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            return  // parent cancelled
        case job := <-jobs:
            process(ctx, job)
        }
    }
}
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
go worker(ctx)
```

### 2. Cancellation Propagation

Pass cancellation signals through the call stack.

```python
async def fetch_with_retry(url: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            return await fetch(url)
        except asyncio.CancelledError:
            raise  # re-raise, don't swallow
        except Exception:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)
```

### 3. Backpressure

Don't let fast producers overwhelm slow consumers.

```typescript
// VULNERABLE - unbounded queue
const queue: Task[] = [];
producer.on("data", (task) => queue.push(task));  // grows forever

// SAFE - bounded channel
const queue = new AbortableAsyncIterator<Task>({ maxSize: 100 });
// Producer blocks when full
```

```go
// Go - buffered channel as backpressure
jobs := make(chan Job, 100)  // buffer 100
// Producer blocks when buffer full
// Consumer pulls from channel
```

### 4. Concurrency Limiting

Limit simultaneous operations to prevent resource exhaustion.

```typescript
// VULNERABLE - fires 10000 requests simultaneously
const results = await Promise.all(urls.map(url => fetch(url)));

// SAFE - limit concurrency
import pLimit from "p-limit";
const limit = pLimit(10);  // max 10 concurrent
const results = await Promise.all(
    urls.map(url => limit(() => fetch(url)))
);
```

```go
// Go - semaphore pattern
sem := make(chan struct{}, 10)  // 10 slots
for _, url := range urls {
    sem <- struct{}{}  // acquire
    go func(u string) {
        defer func() { <-sem }()  // release
        fetch(u)
    }(url)
}
```

```rust
// Rust - tokio::sync::Semaphore
let semaphore = Arc::new(Semaphore::new(10));
let mut handles = vec![];
for url in urls {
    let permit = semaphore.clone().acquire_owned().await.unwrap();
    handles.push(tokio::spawn(async move {
        let _permit = permit;  // held until task completes
        fetch(&url).await
    }));
}
```

---

## Review Checklist

- [ ] No shared mutable state without synchronization (race condition check)
- [ ] Lock ordering consistent (deadlock prevention)
- [ ] All spawned goroutines/tasks complete or are cancelled on shutdown
- [ ] No blocking calls in async event loops (fs, sleep, HTTP)
- [ ] Context/cancellation propagated through async call chains
- [ ] Concurrency bounded (no unlimited parallelism)
- [ ] Backpressure implemented for producer-consumer patterns
- [ ] `go test -race` / ThreadSanitizer / pytest-race clean
- [ ] Error handling in async paths (no swallowed rejections)
- [ ] Cleanup on cancellation (defer, finally, AbortController)
