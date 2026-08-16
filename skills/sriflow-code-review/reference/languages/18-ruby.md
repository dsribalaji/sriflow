# Ruby Code Review Guide

## Blocks, Procs & Lambdas

### Block Argument Confusion — MEDIUM

Blocks capture variables from the enclosing scope. Mutating a captured variable inside a block is a latent bug when the block runs later or multiple times.

```ruby
# BAD — captures and mutates loop var
handlers = []
items.each do |item|
  handlers << -> { process(item) }   # all handlers see last item
end

# GOOD — copy to local
items.each do |item|
  i = item
  handlers << -> { process(i) }
end
```

### lambda vs proc Semantics — MEDIUM

`lambda` checks arity and `return` returns from the lambda; `proc` doesn't check arity and `return` returns from the enclosing method. Using the wrong one changes behavior.

```ruby
# BAD — proc return returns from the METHOD
def caller
  p = proc { return 1 }
  p.call
  2
end
caller # => 1, not 2
```

### Yield vs Block Call — LOW

Prefer `yield` for simple blocks; pass `&block` only when you forward or inspect the block. Both are fine, but be consistent.

### Block-Local Variables — LOW

Ruby 1.9+ makes block parameters block-local. Mutating an outer variable to "accumulate" works but is a smell — prefer `each_with_object` / `inject`.

```ruby
# GOOD
sum = items.sum
# or
total = items.inject(0) { |acc, x| acc + x }
```

---

## Metaprogramming

### eval / instance_eval on User Input — CRITICAL

`eval` of any string derived from user input is code injection. Even `instance_eval` with interpolated values is dangerous.

```ruby
# CRITICAL — code injection
eval("puts #{params[:name]}")

# GOOD — no eval
puts params[:name]
```

### define_method in Loops — MEDIUM

Generating methods in a loop captures the loop variable by reference. Copy to a local.

```ruby
# BAD — all methods return last value
[:a, :b, :c].each do |name|
  define_method(name) { name }
end

# GOOD — copy to local
[:a, :b, :c].each do |name|
  n = name
  define_method(n) { n }
end
```

### method_missing Overuse — MEDIUM

`method_missing` makes errors silent and debugging hard. Prefer explicit methods, `delegate`, or `define_method` generation. If `method_missing` is used, `respond_to_missing?` must be defined.

```ruby
# GOOD — match respond_to_missing?
def respond_to_missing?(name, include_private = false)
  known?(name) || super
end
```

### Unneeded class_eval / instance_variable_set — LOW

`instance_variable_set("@x", v)` bypasses accessors and breaks encapsulation. Use a real writer when possible.

### Timeouts / infinite loops in metaprogramming — LOW

Generated code that calls itself recursively without a base case hangs. Review generated-method recursion.

---

## Rails Conventions

### Fat Models, No Callbacks — HIGH

`after_save` / `before_validation` callbacks that reach into other objects create hidden ordering bugs and make tests fragile. Prefer service objects / explicit orchestration.

```ruby
# BAD — side effect in callback, runs on every save
class Order < ApplicationRecord
  after_create :charge_card
end

# GOOD — explicit service
OrderCreator.new(order).create   # charges explicitly
```

### Unscoped find_by — HIGH

`Model.find_by(...)` without a user/tenant scope exposes other users' records. Scope every find by the current resource.

```ruby
# BAD — any user can find any order
Order.find_by(id: params[:id])

# GOOD — scoped to current user
current_user.orders.find_by(id: params[:id])
```

### Strong Parameters Permit Errors — MEDIUM

`permit!` or permissive `permit(:all)` disables mass-assignment protection. List fields explicitly.

### N+1 in Views — HIGH

Collection rendering triggers per-row queries. Use `includes` / `preload` / `eager_load`.

```ruby
# BAD — N+1
@orders = Order.all
@orders.each { |o| o.user.name }  # query per order

# GOOD
@orders = Order.includes(:user).all
```

### Mass Assignment in Seeds/Scripts — LOW

Bypassing strong params in seeds is fine; bypassing it in app code paths is a smell.

### Callbacks Before Associations Set — MEDIUM

Callbacks run before `belongs_to` autosave in some cases, reading stale associations. Prefer explicit flows.

### Migration Without Rollback — MEDIUM

Every migration should be reversible (`down` or `change` with reversible methods). Irreversible migrations need a documented plan.

### Security: Open Redirects, Mass Assignment — CRITICAL

`redirect_to params[:next]` open redirect; `update_attributes(params)` mass assignment on permitted fields. Always use `redirect_to` with allowlist, and strong params.

### Secrets in Code/Logs — CRITICAL

Hardcoded API keys and `Rails.logger` output of tokens/passwords.

---

## Idioms

### Symbol vs String Keys — MEDIUM

Hash access mixes `:key` and `"key"`. Normalize to one (Ruby 3+ `**` and keyword args default to symbols; JSON sources default to strings).

### Use of `&&`/`||` for Flow — LOW

`x && y` for control flow is terse but hard to read. Prefer `if x; y; end`.

### Redundant Object Allocation — LOW

String concatenation in loops; use `String#<<` or `Array#join`.

```ruby
# BAD — many allocations
s = ""
items.each { |i| s += i }

# GOOD
s = items.join
```

---

## Common Mistakes Checklist

| Mistake | Severity | Fix |
|---------|----------|-----|
| `eval` on user input | CRITICAL | Never eval untrusted strings |
| Unscoped `find_by` | HIGH | Scope by current user/tenant |
| Mass assignment (`permit!`) | CRITICAL | Explicit strong params |
| N+1 in views | HIGH | `includes` / `preload` |
| Captured loop var in blocks/methods | MEDIUM | Copy to local |
| `method_missing` without `respond_to_missing?` | MEDIUM | Add it or avoid it |
| Callback side effects | HIGH | Service objects |
| Open redirects | CRITICAL | Allowlist redirect targets |
| Secrets in code/logs | CRITICAL | Env / secret manager, scrub logs |
| `proc` vs `lambda` misuse | MEDIUM | Know arity/return semantics |
| Irreversible migration | MEDIUM | Reversible `change`/`down` |
| Symbol/string key mixing | LOW | Normalize hash keys |