# Python CLI Scaffold (click, pytest, ruff)

Modern packaging with `pyproject.toml`, click for argument parsing, pytest,
ruff for lint/format. Layout:

```
<project>/
├── pyproject.toml
├── src/
│   └── <package>/
│       ├── __init__.py
│       ├── __main__.py        # python -m <package>
│       └── cli.py             # click entrypoint
└── test/
    └── test_cli.py
```

## pyproject.toml

```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "<project>"
version = "0.1.0"
description = "<one-line description>"
requires-python = ">=3.11"

[project.scripts]
<project> = "<package>.cli:main"

[project.optional-dependencies]
dev = ["pytest", "ruff"]

[tool.setuptools.packages.find]
where = ["src"]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.pytest.ini_options]
testpaths = ["test"]
```

The `[project.scripts]` table is what creates the `bin/<project>`
executable on `pip install -e .`.

## cli.py

```python
from __future__ import annotations

import click


@click.command()
@click.argument("name", default="world")
@click.option("-n", "--count", default=1, type=int, help="Number of greetings.")
def main(name: str, count: int) -> None:
    """Greet someone, optionally multiple times."""
    for _ in range(count):
        click.echo(f"Hello, {name}!")


if __name__ == "__main__":
    main()
```

## __main__.py

```python
from .cli import main

main()
```

## Tests

```python
from click.testing import CliRunner

from <package>.cli import main


def test_greet_default() -> None:
    runner = CliRunner()
    result = runner.invoke(main, [])
    assert result.exit_code == 0
    assert "Hello, world!" in result.output


def test_greet_name_and_count() -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["Sri", "--count", "2"])
    assert result.exit_code == 0
    assert result.output.count("Hello, Sri!") == 2
```

Use `CliRunner` for CLI tests — no subprocess plumbing needed. Run:
`pytest` (after `pip install -e ".[dev]"`).

## Lint

```bash
ruff check .
ruff format .
```

## CI

Workflow at `reference/templates/ci-github-actions.md` — Python section.

## Init checklist

- [ ] `pyproject.toml` with `[project.scripts]` entry
- [ ] `src/<package>/` layout (src layout avoids import shadowing)
- [ ] one passing CLI test via `CliRunner`
- [ ] `.gitignore` Python block
- [ ] `ruff check .` clean on commit #1