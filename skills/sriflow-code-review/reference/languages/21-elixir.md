# Elixir Code Review Guide

## Pattern Matching

### `=` on a Match Expectation — MEDIUM

`=` in Elixir is a match, not assignment. `x = 1` inside a function rebinds; `{x, 1} = tuple` raises `MatchError` on mismatch. Review matches that can crash.

```elixir
# CRITICAL — MatchError if not exactly two elements
{:ok, result} = fetch()

# GOOD — handle both shapes
case fetch() do
  {:ok, result} -> result
  {:error, reason} -> log(reason)
end
```

### `=` in Case vs `<-` in `for` — LOW

`<-` in `for` silently skips non-matching items; `=` in `case` raises. Know which semantics you want.

### Head/Tail on Empty List — MEDIUM

`[h | t] = []` raises. Guard with `case`/`if` or use `Enum` functions.

---

## Pipes & Function Design

### Overly Long Pipe Chains — MEDIUM

A 12-step pipe is hard to debug and reorder. Extract named functions with clear names at choke points.

```elixir
# BAD — one giant pipe
data |> step1() |> step2() |> step3() |> step4() |> step5() |> render()

# GOOD — extract meaningful stages
data |> normalize() |> hydrate() |> present()
```

### Piping Into Functions That Don't Take the Value First — LOW

`Enum.map(list, fn)` takes the collection first — piping works. But `Map.get(map, key)` does not, causing `|> Map.get(..., key)` confusion. Check argument order when piping.

### Function Arity Without Intent — LOW

`/1` and `/2` variants (e.g., `fetch/1` defaulting, `fetch/2` explicit) are idiomatic, but /2 variants that just add a flag are a smell.

### Private Function Naming for Pattern Guards — LOW

A private function used only as a guard clause (`defp do_thing(x) when ...`) is fine; make intent clear.

---

## OTP / GenServer

### Unsupervised Processes — HIGH

A GenServer started with `start_link` but not under a supervisor dies without restart or leaks on crash. Review supervision tree coverage.

```elixir
# BAD — not in a supervision tree
{:ok, pid} = GenServer.start_link(MyServer, [])

# GOOD — under a supervisor
children = [MyServer]
Supervisor.start_link(children, strategy: :one_for_one)
```

### Long Blocking Work in GenServer — CRITICAL

The GenServer loop processes messages one at a time. A blocking call in `handle_call`/`handle_cast` freezes the whole server. Delegate to `Task`/`Task.Supervisor`.

```elixir
# BAD — blocks the mailbox
def handle_cast({:work, job}, state) do
  heavy_work(job)      # blocks this server
  {:noreply, state}
end

# GOOD — async
def handle_cast({:work, job}, state) do
  Task.Supervisor.async_nolink(MyTaskSup, fn -> heavy_work(job) end)
  {:noreply, state}
end
```

### Cast/Reply Mismatch — MEDIUM

`handle_cast` returning `{:reply, ...}` (or `handle_call` returning `:noreply`) crashes the server. Keep semantics aligned.

### State Growth Without Cleanup — MEDIUM

GenServer state that accumulates (logs, caches) without eviction grows unboundedly. Add a max size / TTL.

### `handle_info` Missing — MEDIUM

Messages sent with `send(pid, msg)` need a `handle_info` clause; missing it raises a crash. With `:noreply` it's just a message. Review all `send`/`Process.send_after` paths.

### Timeouts on `call` — HIGH

`GenServer.call` without a timeout (default 5s) can stack up callers on a slow server. Set explicit timeouts where latency is expected.

```elixir
# GOOD
GenServer.call(server, {:get, key}, 30_000)
```

---

## Phoenix

### Ecto N+1 via Preload — HIGH

`Repo.all(Post)` then `post.comments` per row is N+1. Use `preload`.

```elixir
# BAD — N+1
posts = Repo.all(Post)
posts |> Enum.each(fn p -> p.comments end)

# GOOD
posts = Repo.all(Post) |> Repo.preload(:comments)
```

### Unscoped Queries — HIGH

`Repo.get!(Post, id)` without a tenant/current-user scope exposes records. Scope by `current_user`.

```elixir
# BAD — any user can read any post
post = Repo.get!(Post, params["id"])

# GOOD
query = from(p in Post, where: p.user_id == ^current_user.id)
post = Repo.one!(query)
```

### Ecto Changeset Validation Bypass — MEDIUM

`Repo.insert!(struct)` without a changeset skips validation. Route all writes through changesets.

```elixir
# BAD — no validation
Repo.insert!(%Post{title: title})

# GOOD
changeset = Post.changeset(%Post{}, attrs)
Repo.insert!(changeset)
```

### Massive Migrations / Unsafe `execute` — MEDIUM

`execute("...")` in migrations that lock big tables needs care. Review for data-loss (drop columns, remove fields).

### Ecto `from` Interpolation — CRITICAL

String interpolation in `from`/`fragment` (`"#{user_id}"`) is injection. Use parameters `^`.

```elixir
# CRITICAL
from(p in Post, where: p.user_id == "#{params["uid"]}")

# GOOD — pinned parameter
from(p in Post, where: p.user_id == ^params["uid"])
```

### LiveView State Leaks — MEDIUM

Assigning user data from `handle_info`/async without checking ownership. Scope assigns per connection/current user.

### LiveView `send_after` Without Cancel — MEDIUM

Timers spawned in `handle_info` that re-schedule themselves never stop. Track and cancel on unmount.

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| Blocking work in GenServer | CRITICAL | Task / Task.Supervisor |
| Unsupervised process | HIGH | Supervision tree |
| Ecto `from` interpolation | CRITICAL | `^` parameters |
| N+1 without `preload` | HIGH | Repo.preload |
| Unscoped `Repo.get!` | HIGH | Scope by current user |
| Unhandled `{:error, _}` shape | HIGH | Case on tagged tuples |
| No `handle_info` for sends | MEDIUM | Add clause |
| Changeset validation bypass | MEDIUM | Route through changesets |
| Long `GenServer.call` default | HIGH | Explicit timeout |
| Unbounded GenServer state | MEDIUM | Max size / TTL |
| Over-long pipes | MEDIUM | Extract named stages |
| LiveView timers never cancelled | MEDIUM | Track and cancel |