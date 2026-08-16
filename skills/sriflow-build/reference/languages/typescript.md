# TypeScript/TSX Build Error Resolver

## Toolchain commands

```
npm install                # install deps
npm run build              # project build script
npx tsc --noEmit           # typecheck only, no emit
npx tsc --noEmit -p tsconfig.json   # explicit project
npx tsc --noEmit --watch    # incremental watch
node_modules/.bin/tsc -v    # verify compiler version
```

First three moves on any TS error:
1. `npx tsc --noEmit` to isolate type errors from bundler/runtime errors.
2. Check `tsconfig.json` `strict`, `target`, `moduleResolution`, `paths`, `jsx`.
3. `rm -rf node_modules dist && npm install` if the error smells like stale state.

## Common errors + fixes

### `Cannot find module './x' or its corresponding type declarations`

Module resolution failed. Check in order:
- Case-sensitive path. `./utils` ≠ `./Utils` on Linux CI even when macOS builds.
- Missing file extension with `moduleResolution: node16/nodenext` — ESM requires explicit `.js` (not `.ts`) in relative imports.
- `baseUrl`/`paths` alias not registered for the runner (tsc vs bundler vs jest).
- Module is ESM-only, project is CJS, or vice versa.

Fix: make the import resolve for BOTH `tsc` and the runtime bundler. Prefer real relative paths over `paths` aliases when the alias leaks into runtime code.

### `TS2307 Cannot find module 'foo'` for an installed package

- Package not installed: run install.
- Package has no types and no bundled `types` field: add a `declare module 'foo';` in a `.d.ts`, or install `@types/foo`.
- `skipLibCheck: false` surfacing a broken dep types — set `"skipLibCheck": true` (safe, common).
- Package export map (`exports`) hides a subpath. Import the exported entry, not an internal path.

### `TS2345 Argument of type 'X' is not assignable to parameter of type 'Y'`

Literal-vs-type mismatch. Common causes:
- Object literal excess property check. Add the property or cast.
- `readonly` array passed where mutable array expected — copy with `[...arr]`.
- Union narrowing failed because of a control-flow gap.
- `null`/`undefined` not handled. Enable strict and handle the value.

Fix the type, don't spray `as any`. If a legitimately dynamic boundary exists, narrow the cast to the boundary, never `any` outward.

### `TS2769 No overload matches this call`

- Wrong arg count/type for a generic function. `Array.map((x) => x.id)` on `T[]` where `T` lacks `id`.
- Generic inference failing. Supply the type param: `fetch<User>(url)`.
- Optional param passed where required expected. Read the signature.

### `TS2322 Type 'string' is not assignable to type 'number'`

- `env` vars arrive as strings: parse with `Number()` / `parseInt` / `Intl`.
- `event.target.value` from inputs is `string` even for `<input type="number">`.

### `TS7016 Could not find a declaration file for module 'x'`

Implicit `any` from an untyped JS dep. Options in order of preference:
1. Install `@types/x` if it exists.
2. Check if the package ships its own types (`types`/`typings` field, or `index.d.ts`).
3. Local `declare module 'x';` stub in `src/types/globals.d.ts`.
4. `noImplicitAny: false` — last resort, disables safety repo-wide.

### `TS6133 'x' is declared but its value is never read`

`noUnusedLocals`/`noUnusedParameters`. Remove the symbol or prefix unused params with `_`.

### `TS1259` / `TS1261` JSX element type errors

`jsx` field wrong for the environment. For React 17+ use `"jsx": "react-jsx"` and drop explicit `import React`. For classic JSX with a different pragma, set `jsxFactory`. The bundler and tsc must agree on the JSX runtime.

### `TS2304 Cannot find name 'React'`

- React 17+ with `react-jsx` runtime: no import needed — ensure tsconfig matches.
- Otherwise add `import React from 'react'` or `import * as React from 'react'` (check `esModuleInterop`).

### `Module has no exported member 'X'` (TS2305)

- Typo or case mismatch in the named export.
- Package default-export-only (CommonJS interop). Check `esModuleInterop: true` and `allowSyntheticDefaultImports`.
- Export exists at a different path (barrel file re-export missing).

## tsconfig gotchas

| Key | Gotcha |
|-----|--------|
| `esModuleInterop` | Off → `import React from 'react'` fails. On for most modern stacks. |
| `moduleResolution` | `bundler` ≠ `node` ≠ `node16`. Pick to match the bundler (`bundler` for Vite/webpack, `node16` for Node ESM). |
| `strict` | Off hides real bugs. Keep on; fix root causes not the flag. |
| `target` | Too low → modern syntax (`?.`, `??=`) fails to compile on old lib. Match `lib` to `target`. |
| `paths`/`baseUrl` | Aliases must also be configured in jest/vitest/vite/next config or resolution diverges. |
| `outDir`/`rootDir` | Mismatch → `TS6059 File is not under rootDir`. |
| `skipLibCheck` | Off → dep `.d.ts` errors break builds. On by default in most scaffolds. |
| `noEmitOnError` | True → typecheck failure blocks emit. Useful in CI, surprising locally. |

## Runtime-after-compile gotchas

- **`tsc` emits but bundler throws** — check for ESM/CJS interop: `import { x } from 'cjs-lib'` often needs `import x from 'cjs-lib'` or the named-export interop shim.
- **`__dirname`/`__filename` undefined** — you're in ESM. Use `import.meta.dirname` (Node 20.11+) or `fileURLToPath(import.meta.url)`.
- **Top-level `await`** fails if `module` is CJS. Requires `module: esnext`/`nodenext` and a loader that supports it.
- **`process`/`global` undefined in browser bundles** — polyfill or guard, don't assume Node globals.
- **Tree-shaking broke because of side-effect imports** — import named exports, not `import 'pkg'`.

## Resolution ladder

1. Typecheck: `npx tsc --noEmit`.
2. Read the failing file at the reported line/column — 60% of errors are path/name typos.
3. Fix the type, not the error: no `as any`, no `@ts-ignore` (except genuinely external lib boundaries, one line, with reason).
4. Rebuild. If a stale-`dist` error persists, clean-build.