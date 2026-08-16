# C++ Build Error Resolver (CMake / Make)

## Toolchain commands

```
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j$(nproc)
ctest --test-dir build          # run tests
make -C build -j$(nproc)        # if Make generator
cmake --build build --target clean
```

First three moves on any C++ error:
1. Configure a fresh build dir (`rm -rf build && cmake -S . -B build`) — stale cache is the #1 phantom.
2. Compile a single translation unit with `-fsyntax-only` to isolate the error from linking.
3. Read the first error and the line it points at; C++ errors cascade — ignore everything after the first.

## Common errors + fixes

### `undefined reference to 'X'`

- **Declaration but no definition** — you declared `foo()` in a header but never defined it.
- **Header-only in `.h` but defined in `.cpp` without `inline`** — multiple definition or ODR violation.
- **Linker can't find a library** — the function is in a lib not on the link line. CMake: `target_link_libraries(app PRIVATE <lib>)`.
- **Static lib built without PIC** — `CMAKE_POSITION_INDEPENDENT_CODE ON` when linking into a shared lib.
- **C vs C++ name mangling** — a C function compiled by a C compiler needs `extern "C"` in the C++ TU.

### `multiple definition of 'X'`

- Function/global defined in a header included by multiple TUs. Fix: `inline` (C++17), or declare in header + define in one `.cpp`.
- Same symbol in two libraries both linked.

### `cannot convert ... to ...` / `no matching function for call to 'X'`

- Wrong argument type (implicit conversion missing). Use the exact type or a cast.
- Overload resolution failed: right name, wrong signature. Check `const`/reference qualifiers — `void f(std::string)` vs `void f(const std::string&)` behave differently with temporaries.
- Method called on a `const` object but isn't `const`.

### `'std::string' has no member 'X'` / `'X' was not declared in this scope`

- Missing `#include <string>`, `<vector>`, `<memory>` etc. Headers are not transitive-guaranteed.
- Missing `std::` prefix.
- `using namespace` collides — two namespaces define the same name.
- Compile with the wrong standard: modern APIs need `-std=c++17`/`c++20`. Set `CMAKE_CXX_STANDARD 17` and `CMAKE_CXX_STANDARD_REQUIRED ON`.

### `expected ';'` / syntax errors that make no sense

- Missing semicolon in a header before the reported line — the true error is often several lines above.
- `>` `>>` nesting issues in old C++ (pre-C++11) with templates.
- A macro eating a statement.
- Read the caret carefully; check the line ABOVE.

### Template errors (`no matching function for call`, `static assertion failed`)

- Template instantiation failures read backward — the real problem is a missing member or bad type at the `static_assert` site. Read the `note:` lines.
- Missing `typename` keyword before dependent types.
- SFINAE over-constraint removing your overload — relax the `requires`/`enable_if`.

### `unused parameter` / `-Werror` turning warnings fatal

- Warnings treated as errors. Fix the warning, or scope `-Werror` to specific flags, don't turn it off globally.
- `-Werror=unused-parameter` — name unused params `/*unused*/` or omit the name.

### CMake configuration errors

| Error | Fix |
|-------|-----|
| `The CXX compiler identification is unknown` | Missing compiler or `CC`/`CXX` pointing at a non-existent binary |
| `Could NOT find <Pkg>` | Install the dev package (`lib<name>-dev`), or set `<Pkg>_DIR` to the installed config |
| `CMake Error: The source directory does not contain a CMakeLists.txt` | `-S` points at the wrong dir |
| `Policy CMPxxxx is not set` | Read the policy warning; usually add the explicit `cmake_policy` or the suggested `set(...)` |
| `No rule to make target` | A source/header was removed without re-running cmake — reconfigure |
| `Could not find a package configuration file provided by <X>` | Missing `find_package` config; install the package or provide the config path |

### Linker: `relocation R_X86_64_PC32 against symbol` / `undefined reference`

- Often missing `-fPIC` on objects going into a `.so`.
- ABI mismatch: compiled with different flags/stdlib (libstdc++ vs libc++), or different `-fvisibility`.
- Clean rebuild across ALL objects; mixing old/new objects from different flag sets breaks the ABI.

## Build system gotchas

- **`make` with stale object files** — headers changed but deps not tracked (generated headers). Clean build, or enable `-MD` dependency generation (CMake does by default).
- **Ninja vs Make generator** — build dirs are not interchangeable; reconfigure per generator.
- **`CMAKE_BUILD_TYPE` empty** in single-config generators → no optimization flags and no debug info. Always set `Debug`/`Release`.
- **`-j` too high → OOM** — cap `-j$(nproc-2)` or use Ninja which oversubscribes less.
- **Caching** — `ccache` can serve stale objects if dep tracking is off; `ccache -C` clears it.
- **`-march=native` in shared artifacts** — don't ship; use a baseline arch or `-mtune`.

## Common compiler diagnostic patterns

- **`invalid operands to binary expression`** — `std::string + int`, mismatched iterator arithmetic, etc.
- **`segmentation fault` at runtime after clean compile** — not a build error; look at uninitialized memory, out-of-bounds, dangling `std::string_view`. Run under ASan: `-fsanitize=address,undefined -g`.
- **`pure virtual method called`** — calling a virtual from a constructor/destructor.
- **`double free or corruption`** — ownership bug, not a compile problem.

## Resolution ladder

1. Reconfigure fresh: `rm -rf build && cmake -S . -B build`.
2. `cmake --build build` → read the FIRST error and the line above it.
3. Distinguish compile vs link error: `-fsyntax-only` on the failing TU (compile) vs inspecting `target_link_libraries` (link).
4. Fix includes/std-flags/config before rewriting logic.
5. Rebuild. For runtime crashes after a clean build, switch to ASan+debug, don't guess.