# Python Web Scaffold (FastAPI)

FastAPI is the default Python web stack (Django offered only when the user
explicitly needs admin/ORM batteries). Layout:

```
<project>/
├── pyproject.toml
├── src/
│   └── <package>/
│       ├── __init__.py
│       ├── app.py             # FastAPI app factory
│       ├── routers/
│       │   └── health.py      # /health endpoint
│       └── config.py          # settings via pydantic-settings
└── test/
    └── test_health.py
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
dependencies = ["fastapi>=0.115", "uvicorn[standard]>=0.30", "pydantic-settings>=2.0"]

[project.optional-dependencies]
dev = ["pytest", "httpx", "ruff"]

[tool.setuptools.packages.find]
where = ["src"]
```

`httpx` is the dev-time test client for FastAPI — no live server needed.

## src/<package>/app.py

```python
from __future__ import annotations

from fastapi import FastAPI

from .routers import health


def create_app() -> FastAPI:
    app = FastAPI(title="<project>", version="0.1.0")
    app.include_router(health.router)
    return app


app = create_app()
```

## src/<package>/routers/health.py

```python
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

## src/<package>/config.py

```python
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="<PROJECT>_", env_file=".env")

    debug: bool = False


settings = Settings()
```

## Tests

```python
from fastapi.testclient import TestClient

from <package>.app import create_app

client = TestClient(create_app())


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

Run: `pytest`.

## Run locally

```bash
pip install -e ".[dev]"
uvicorn <package>.app:app --reload
```

## Dockerfile (Service projects)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
COPY src ./src
RUN pip install .
EXPOSE 8000
CMD ["uvicorn", "<package>.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## CI

Workflow at `reference/templates/ci-github-actions.md` — Python section.

## Init checklist

- [ ] app factory (`create_app`) — testable without importing a global
- [ ] `/health` router wired
- [ ] `Settings` reads env via prefix
- [ ] one health test passing on commit #1
- [ ] Dockerfile only when type is Service
- [ ] `.gitignore` Python block + `.env`