# Angular Build Error Resolver (CLI / zone.js / modules)

## Toolchain commands

```
ng build                  # production build (AOT)
ng serve                  # dev server (JIT + HMR)
ng build --configuration development
ng lint                   # eslint
ng test                   # Karma unit tests
node --max-old-space-size=4096 node_modules/@angular/cli/bin/ng build   # OOM workaround
```

First three moves on any Angular error:
1. Match the Angular version family: CLI, `@angular/*` core packages, and `zone.js` must be the same major. Mismatched majors produce cryptic errors.
2. `ng build` in production config — dev (`ng serve`) hides some AOT-only errors.
3. Read the full error stack — Angular wraps root causes in `Error: NG####` or `Error: ...` followed by the real compiler message.

## Common errors + fixes

### `Error: NG0203: inject() must be called from an injection context`

- Called `inject()` from a non-DI context (e.g. in a constructor field initializer, a plain function, or a `static` method).
- Move the `inject()` into the constructor or a DI-safe function. Don't grab `Injector` and call `inject` lazily unless you hold an `Injector` reference.

### `Error: NG0200: Circular dependency in DI detected`

- Provider A injects B which injects A (directly or via a chain).
- Fix: use `forwardRef(() => B)` on one side, or restructure the injection (a service should not depend on a component that depends on it).

### `NG6001: The symbol 'X' is declared in more than one 'NgModule'`

- A component/directive/pipe declared in two modules.
- Component in the declarations of a lazy module AND the root module, or both listed and imported. Declare once, export if needed.

### `NG6002: Appears in the NgModule.imports array but itself is an NgModule` vs `declarations`

- Class is in the wrong array. A declared component goes in `declarations`; a module goes in `imports`; a standalone component is imported directly.
- Standalone mixing: standalone components imported into a module's `imports` is fine, but a module placed in `declarations` is not.

### `NG8001: 'app-x' is not a known element`

- Component selector used in a template but not available in that scope:
  - Not declared/imported in the owning NgModule (or not exported by an imported module).
  - Standalone component not imported where the template lives.
  - Typos in selector name or case (`app-my-comp` ≠ `app-myComp`).
- Lazy-loaded routes: the module must be imported by the routed module, or the standalone component referenced in the route's `loadComponent`.

### `NG8002: Can't bind to 'x' since it isn't a known property of 'app-y'`

- Input not declared with `@Input()` on the child.
- The child isn't in scope (same root cause as NG8001).
- Property exists but on a `@Component` with a different selector — mismatch.

### `NG8003: No directive found with exportAs 'ngModel'`

- `FormsModule` not imported where `ngModel` is used.
- Template-only fix: add `FormsModule` to the module's `imports`, or the standalone component's imports.

### `NG6999 / 'No provider found for HttpClient'`

- `HttpClient` used without `provideHttpClient()` (or the older `HttpClientModule` import).
- Standalone apps: call `provideHttpClient()` in the app config `providers`.
- Lazy modules: ensure the HTTP client is provided at root, not just in the lazy module.

### `Cannot read properties of undefined` at runtime (zone.js related)

- `zone.js` missing/loading twice → the app boots but async events misbehave.
- Check `polyfills`/`zones` config in `angular.json`; `zone.js` must load once, before Angular.
- Property chain `a.b.c` where `a.b` is undefined — the template or component reads data before it loads. Use `@if (x)`/`*ngIf`, `?.` optional chaining, or initialize the field.

### `ERROR TypeError: X is not a function` on `subscribe`

- Using RxJS 8+ breaking change? No — more common: `map(...).subscribe` where `map` returns a different observable type, or you imported a non-function.
- A service method returns `Promise` but you `.subscribe`d — `promise.then`, or wrap with `from()`.

### AOT-only errors

- **`Function calls are not supported in decorators`** — AOT evaluates decorators statically. No `getConfig()` calls in `@NgModule` metadata; inline values.
- **`Lambda not supported in expression`** in an exported constant used in a template.
- **`Could not resolve 'X'` during AOT** — an expression in metadata can't be statically evaluated. Move it to a provider factory (`{ provide: X, useFactory: () => ... }`).
- Builds under `ng serve` but fails `ng build` → always check the AOT angle first.

## angular.json / CLI gotchas

| Gotcha | Fix |
|--------|-----|
| `Unknown option` from CLI | CLI major older than the project — `ng update @angular/cli` or `npx @angular/cli@<ver> build` |
| `Project 'X' does not exist` | Wrong `--project` name; `ng config projects` to list them |
| `Cannot find module '@angular/build'` or builder | Builder package not installed for this Angular major (`@angular-devkit/build-angular`) |
| Budget exceeded (`ng build` fails on bundle size) | `budgets` in `angular.json`; bump `maximumError` or reduce bundle (lazy routes, `defaults`) |
| OOM in `ng build` | Raise Node heap (`NODE_OPTIONS=--max-old-space-size`) — the CLI is Node-bound |
| `Configuration 'production' could not be found` | `ng build --configuration` name mismatch; `ng build` alone uses default |
| PostCSS/`ngx-tailwind` version skew | Tailwind config version vs PostCSS in the Angular builder — pin to the documented pair |

## Module resolution / TS errors

- **`TS2307 Cannot find module './x'`** — path typo; extensionless imports fine with default resolution, but check `baseUrl`/`paths` in `tsconfig.json` if aliases like `@app/...` are used. The CLI, the editor, and tests must share the aliases (`tsconfig.app.json` vs `tsconfig.spec.json`).
- **`TS6059 File is not under 'rootDir'`** — file added outside the `src`-rooted include. Move it or adjust `include`.
- **`TS1005: ',' expected`** in template strings or decorators — a stray char; check the file around the reported line.
- **Strict template type-check (`strictTemplates`)** — template expressions now checked: wrong input/output types, missing members on the model surface as template errors. Fix the component contract, or narrow the model type.
- **`Type 'X' is missing the following properties`** on a form/interface — strict mode requires the full shape; build partials with `Partial<X>` or initializers.

## Resolution ladder

1. Confirm Angular/zone.js/CLI major alignment (`ng version`).
2. `ng build` (production) to expose AOT-only failures.
3. Classify: `NG####` = framework/DI/template (fix module scope, providers, standalone imports); `TS####` = type/module resolution; CLI errors = version/build-options.
4. For runtime-only errors, check `zone.js` loading and null-safety in templates/components.
5. Rebuild. Incremental weirdness → `rm -rf .angular/cache node_modules/.cache` and rebuild.