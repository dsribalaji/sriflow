# Go Build Error Resolver

## Toolchain commands

```
go mod tidy                 # sync go.mod/go.sum with imports
go mod download             # prefetch modules
go build ./...              # compile all packages
go vet ./...                # static checks
go test ./...               # run tests
go run ./cmd/app            # run main package
go env GOPATH GOMODCACHE    # inspect module cache location
```

First three moves on any Go error:
1. `go mod tidy` — half of build failures are missing/stale module requirements.
2. `go build ./...` from the module root — never from inside a subdirectory with a different module.
3. `go env` sanity: `GOFLAGS`, `GOPROXY`, `GOWORK` can silently change behavior.

## Common errors + fixes

### `no required module provides package ...; to add it: go get ...`

- Imported a package not in `go.mod`. `go mod tidy` or `go get <path>`.
- Version constraint excludes it (lowered a dep, transitive breakage). Inspect `go mod graph`, then `go get <pkg>@<ver>`.
- Typo/case in import path — module paths are case-sensitive, unlike the default Linux filesystem.

### `build constraints exclude all Go files in <dir>`

- File has `//go:build` tags that don't match GOOS/GOARCH (e.g. `//go:build windows` on Linux build).
- Directory contains only `_test.go` files with tags.
- Fix: correct the tag or the build platform. `go build -tags <tag>` to include opt-in files.

### `undefined: X`

- Symbol not defined in this file/package.
- Function exists but in another file with a build tag excluding it.
- Import cycle silently missing — check that the defining package actually compiles: `go build ./<thatpkg>/`.
- Method defined on pointer receiver called on value, or vice versa (mixed receiver types won't compile if both exist).

### `cannot use ... (variable of type X) as Y value in assignment`

Type mismatch:
- `*X` vs `X` — pointer vs value. Check function signatures; most "pass it along" code needs the pointer.
- Interface not satisfied — implement ALL methods of the interface with exact signatures.
- `int` vs `int64`/`int32` — Go does not implicitly convert numeric types.
- `[]byte` vs `string` — must convert explicitly: `string(b)`, `[]byte(s)`.

### `import cycle not allowed`

Package A imports B which imports A (directly or transitively). Fix:
- Move the shared type/function into a third, lower-level package.
- Invert the dependency direction.
- Use an interface in one package satisfied by a concrete type in the other.

### `redeclared in this block` / `X redeclared in this block`

- Two symbols with the same name in the same package scope (e.g. `:=` after a top-level declaration, or two files both declaring `var x` at package level).
- Rename one, or move the shadowing inside a function scope.

### `assignment mismatch: X variables but Y values`

- Wrong number of return values from a multi-value call.
- Blank identifier to discard: `a, _ := f()`.
- Common `:=` shadowing trap: `x, err := ...` when `x` already exists in outer scope creates a NEW `x`. Use `=` if you meant to reuse.

### `mismatched types ... and untyped constant`

- e.g. `var i int32 = 3000000000` (overflow), or assigning an `untyped` float to an int variable.
- Fix the type or the constant.

### `too many return values` / `not enough arguments`

- Signature mismatch at the call site. Read the function definition.

### `undefined: main` / `function main is undeclared in the main package`

- Running a non-`main` package as an app, or a library that lacks `func main`.
- `go run ./x` where `x` is a package without `main`.

## Module / workspace gotchas

| Gotcha | Fix |
|--------|-----|
| `dial tcp ... module lookup disabled by GOPROXY=off` | Set `GOPROXY=https://proxy.golang.org,direct` or use a vendored copy |
| `updates to go.mod needed` | Run `go mod tidy` |
| Stale build cache after dep change | `go clean -modcache` then `go mod download` (rare, heavy — try tidy first) |
| `go.work` active but module not listed | Add `use ./<module>` or remove `go.work` |
| Two modules with same module path in `replace` | `go.work`/`replace` conflict — resolve one |
| `sum.golang.org` network blocked | `GOFLAGS=-mod=mod GONOSUMCHECK=1` or `GOPRIVATE`/`GONOSUMDB` for private repos |
| `build constraints exclude all Go files` in a clean module | Check `GOOS`/`GOARCH` env: `GOOS=linux` vs native |

## Common compiler detail errors

- **`panic: assignment to entry in nil map`** — map not initialized: `m := make(map[K]V)`, never `var m map[K]V` before first write.
- **`invalid memory address or nil pointer dereference`** — nil `*Struct` method call. Check error returns before using the value.
- **`go vet` catches `printf` misuse** — `%v` for structs, missing arg, `%d` for float. Fix format strings.
- **`unused variable`** — Go errors on unused local vars. Use `_ = x` or remove.

## Resolution ladder

1. `go mod tidy && go build ./...`.
2. `go vet ./...` for the class of mistake.
3. Read the error package path — it names the exact file.
4. For type mismatches, check receiver (pointer vs value) and concrete-vs-interface before touching logic.
5. Rebuild. Use `go build -v ./...` to see which package first fails in a chain.