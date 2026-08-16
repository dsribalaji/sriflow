# Python Build Error Resolver

## Toolchain commands

```
python3 -m venv .venv            # create venv
source .venv/bin/activate        # activate
python -m pip install -r requirements.txt
python -m pip install -e .       # editable install
python -m build                  # build sdist/wheel
python -m compileall .           # byte-compile check
python -m pip check              # verify installed deps consistent
```

First three moves on any Python error:
1. `python -m compileall .` to catch syntax errors fast.
2. Verify the interpreter: `which python` — venv not activated is the #1 cause of `ModuleNotFoundError` and version surprises.
3. `python -m pip check` to catch broken/conflicting installed deps.

## Common errors + fixes

### `ModuleNotFoundError: No module named 'x'`

Check in order:
- Wrong interpreter (venv not activated, or system python vs venv python).
- Package not installed: `python -m pip install x`.
- Installed but not importable: package name ≠ import name (`pip install pillow` → `import PIL`).
- Installed into a different venv than the one running.
- `__init__.py` missing (Python 3 namespace packages partially mask this; explicit packages still need it for relative imports).
- Source on `sys.path` vs installed: running from repo root usually resolves `src/` layout only if installed with `-e .` or `PYTHONPATH=src`.

### `ImportError: attempted relative import with no known parent package`

Running a file as a script (`python app.py`) breaks relative imports. Fix: run as a module `python -m app` from the package root, or make the file top-level absolute-imported.

### `ImportError: cannot import name 'X' from 'y'`

- Name typo.
- Circular import — module A imports B while B is still importing A. Move the shared symbol to a third module, or import inside the function.
- Version mismatch — a newer/older package renamed the symbol. `pip show y` to check version, read its changelog.
- Cached stale bytecode: delete `__pycache__`/`.pyc`.

### `ModuleNotFoundError` on `cryptography`, `bcrypt`, `psycopg2` (compiled deps)

Missing system libs or build tools. Install wheel first (`pip install --only-binary :all:`); if it forces a source build you need `python3-dev`, `libssl-dev`, `libpq-dev`, `gcc`. Modern `psycopg[binary]` and `bcrypt` ship wheels for CPython on the big platforms.

### `SyntaxError` / `IndentationError`

- Tabs mixed with spaces. Fix the file, don't disable the check.
- Wrong Python version syntax: walrus `:=`, f-string `=` spec, `match` need 3.8/3.10+. Check `python --version` and the `requires-python`/tox matrix.

### `AttributeError: 'X' object has no attribute 'Y'`

- Typo in attribute name.
- Object is actually `None` (failed factory). Print/type the value before assuming shape.
- Cached version shadows the class — stale `.pyc` or a renamed module both installed.
- Generic alias used at runtime (e.g. `list[str]` on Python < 3.9).

### `TypeError: 'NoneType' object is not iterable` / `'NoneType' has no len()`

Function returned `None` on some path and the caller forgot to branch. Add explicit `None` handling at the caller; don't paper over with truthiness that also skips legitimately-empty values.

### `NameError: name 'x' is not defined`

- Typo.
- Imported in a sibling module but not re-exported.
- `__all__` missing a name for `from pkg import *`.

## venv / pip gotchas

| Gotcha | Fix |
|--------|-----|
| `pip install` writes to system site | Activate venv; verify `which pip` points into it |
| `requirements.txt` pins incompatible versions | `pip check`; resolve to a known-good lock (pip-tools, uv) |
| `--user` install in a venv | Remove it; venv isolates |
| Permissions error on install | Don't `sudo pip` — use a venv |
| Package upgraded globally, venv stale | Recreate venv: `rm -rf .venv && python3 -m venv .venv` |
| Two pythons on PATH | Use `python3 -m pip` (not `pip`) to bind to the active interpreter |

## Typing errors (mypy/pyright)

| Error | Fix |
|-------|-----|
| `Argument 1 has incompatible type` | Fix the type or the signature; narrow with `isinstance` |
| `Returning Any from function declared to return X` | Annotate the body; don't return raw dynamic values |
| `Cannot assign to a type` / `"X" has no attribute "Y"` | Object is `Optional` — guard, or use a protocol/typevar |
| `Module has no attribute "x"` | Package ships no stubs; add a `.pyi` or `# type: ignore[attr-defined]` with reason |
| `No overload variant` | Param types differ per overload; align your call with a documented one |

Rules: keep `strict` on for new code. `# type: ignore` allowed only with the error code and a reason comment. Prefer `list[X] | None` over `Optional[list[X]]` on 3.10+.

## Build/packaging gotchas

- **`setuptools` missing** — modern pip needs `setuptools`/`wheel` for legacy `setup.py` builds. `pip install setuptools wheel`.
- **`src/` layout imports fail after install** — you installed the wrong top-level package. `pyproject.toml` `[tool.setuptools]`/`[project]` `name` and package discovery (`find = {where = ["src"]}`) must match.
- **Data files missing from the wheel** — not declared in `package-data`/`MANIFEST.in`.
- **`egg-info`/`.egg-link` stale** — delete and reinstall `-e .`.
- **Console script `command not found`** — `[project.scripts]` entry point not declared, or the venv `bin/` isn't on PATH.

## Resolution ladder

1. `python -m compileall .` — syntax first.
2. Reproduce with the venv interpreter, `python -X dev` for extra warnings.
3. Read the traceback bottom-up: the last frame before the stdlib frames is your bug.
4. Check interpreter, path, installed version before editing code.
5. Fix root cause, re-run, delete `__pycache__` if behavior is suspicious.