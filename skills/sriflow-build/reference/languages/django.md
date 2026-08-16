# Django Build/Deploy Error Resolver

## Toolchain commands

```
python manage.py check          # config sanity — run FIRST
python manage.py makemigrations # create migrations from model changes
python manage.py migrate        # apply migrations
python manage.py migrate --plan # preview what migrate will do
python manage.py collectstatic  # gather static files
python manage.py test           # run tests
```

First three moves on any Django error:
1. `python manage.py check` — surfaces config errors before anything else runs.
2. Confirm `DJANGO_SETTINGS_MODULE` and that the venv interpreter runs the same Django as installed.
3. `python manage.py migrate --plan` before migrating in prod — never blind-run migrations on a live DB.

## Common errors + fixes

### `ModuleNotFoundError: No module named 'django'`

- Venv not activated / wrong interpreter.
- Installed system-wide, running inside a venv (or vice versa).
- `pip install -r requirements.txt` into the right venv; verify `python -c "import django; print(django.VERSION)"`.

### `ImproperlyConfigured: The SECRET_KEY setting must not be empty`

- Settings template missing the value. Set `SECRET_KEY` via env (`os.environ`) — never commit a real secret.
- `.env` not loaded — need `python-dotenv` or the `--settings` env var.

### `Error: Your models have changes that are not yet reflected in a migration` (makemigrations --check)

- Model changed, no migration written. Run `makemigrations`, review the generated file, then `migrate`.
- Migration merge conflict (two branches both made migrations): `makemigrations --merge`.

### `OperationalError: no such table: ...` / `relation "..." does not exist`

- Migrations not run: `python manage.py migrate`.
- Wrong database configured (`DATABASES` pointing at a dev sqlite while code expects postgres).
- A model was removed but its table reference lingers in a migration you skipped.

### `django.db.utils.ProgrammingError: relation "django_migrations" does not exist`

- `migrate` never ran, or the DB schema is empty. Run `migrate`.
- `python manage.py migrate --fake-initial` only for pre-existing schema you know matches (legacy DBs).

### `django.db.migrations.exceptions.InconsistentMigrationHistory`

- Two migrations applied with conflicting dependencies (e.g. `--fake` was used on one branch). Fix the order in the migration graph or rebuild the DB if it's dev.
- Common: a `dependencies` list references a migration that was later squashed/removed. Align the graph.

### `AssertionError: Migration <X> is applied before its dependency <Y>`

- Migrations applied out of order on the same DB. Check the `Migration` plan, apply the missing dependency, or re-sync dev DB.

### `TemplateDoesNotExist at /...`

- Template not in `TEMPLATES['DIRS']` or an app's `templates/` dir.
- App not in `INSTALLED_APPS` (its templates won't be discovered).
- Case-sensitive path (Linux).

### `django.core.exceptions.ImproperlyConfigured: Application labels aren't unique`

- Two apps share an `app_label` (or same app installed twice in `INSTALLED_APPS`).
- Remove the duplicate; give the second app a distinct `app_label`.

### `middleware` order bugs

- **`MiddlewareNotUsed`** logged — middleware present but `DEBUG`/condition skipped it, or it's placed so `process_request` never fires.
- **`CSRF cookie not set` / `403 Forbidden`** — `CsrfViewMiddleware` must come BEFORE the view runs and the form must carry `{% csrf_token %}`; for AJAX set the `X-CSRFToken` header.
- **Middleware relies on session/auth** — order in `MIDDLEWARE`: `SessionMiddleware` before `AuthenticationMiddleware`; custom auth-dependent middleware after both.
- **`SecurityMiddleware` placement** — should be first for HTTPS redirect; `CommonMiddleware` should be near the top for APPEND_SLASH.

### `static` errors / `collectstatic`

- **`collectstatic` copies nothing** — `STATICFILES_DIRS` empty or wrong; check `python manage.py findstatic <name>`.
- **`ImproperlyConfigured: The STATIC_ROOT setting must be set`** — set `STATIC_ROOT` for production collect; dev uses `STATICFILES_DIRS` + `{% static %}`.
- **`404` for `/static/...` in dev** — `django.contrib.staticfiles` app missing from `INSTALLED_APPS`, or `DEBUG=False` without serving static.
- **Stale static after deploy** — `collectstatic --noinput --clear` (careful: clears the target) or cache-bust filenames via `ManifestStaticFilesStorage`.

### `ALLOWED_HOSTS` / `DisallowedHost` 400

- Request Host header not in `ALLOWED_HOSTS`. In dev add `localhost`, `127.0.0.1`; in prod list the real domains or use `["*"]` only behind a trusted proxy (never in prod without care).

### `django.db.utils.OperationalError: FATAL: password authentication failed for user`

- Wrong `DATABASES` credentials.
- `PGPASSWORD`/`DATABASE_URL` from env not applied in the running process.
- Check the DB user exists and has privileges on the database.

## Test-time errors

- **`Failed to create test database`** — DB user lacks `CREATEDB`. Grant it or use a separate test user.
- **`Database queries to '<alias>' are not allowed in this test`** — test DB alias mismatch with `databases` set in a `TestCase`/`TransactionTestCase`.
- **`You have unapplied migrations` warning at test start** — run `migrate`; or in CI use `--keepdb` on an already-migrated DB.

## Deploy gotchas

| Gotcha | Fix |
|--------|-----|
| `Your models have changes` failing CI | Commit migrations in the same PR as model changes; run `makemigrations --check` in CI |
| `collectstatic` on every deploy | Run it in the build step; never leave it to runtime |
| Whitenoise / static not served in prod | `whitenoise` middleware FIRST in `MIDDLEWARE`; check `STORAGES`/`STATICFILES_STORAGE` for `ManifestStaticFilesStorage` |
| `Migrations applied after app released` | Plan DB migration before/with code rollout; never change schema in one step that needs old and new code |
| `gunicorn: ModuleNotFoundError` | Same venv problem as dev; run via the venv binary, `--chdir` to project |
| `OperationalError: too many connections` | Connection pool/lifetime tuning; `CONN_MAX_AGE`, `max_connections` |
| `CSRF_TRUSTED_ORIGINS` wrong | 403s from the frontend origin — add the origin scheme+host, not just the hostname |

## Resolution ladder

1. `python manage.py check` — config first.
2. `python manage.py migrate --plan` → review → migrate.
3. Isolate by layer: templates (`findstatic`), middleware (order/CSRF), DB (migrate --plan), config (`check`).
4. Fix the config or the migration; rerun `check` + the failing command.
5. For prod: migrate before/with deploy, collectstatic in the build, verify `ALLOWED_HOSTS` and middleware order.