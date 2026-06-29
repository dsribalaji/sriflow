# Upgrade Handler

Triggered by: "upgrade", "update sriflow", "check for updates"

## Check

```bash
_SRIFLOW_VERSION=$(cat VERSION 2>/dev/null || echo "0.0.0")
_REMOTE_VERSION=$(timeout 2 git ls-remote --tags origin 2>/dev/null | grep -oP 'refs/tags/v\K[0-9.]+$' | tail -1 || echo "")
```

Compare `_SRIFLOW_VERSION` (installed) against `_REMOTE_VERSION` (latest tag on origin).

## Display

```
SRIFLOW VERSION CHECK

Installed: v<_SRIFLOW_VERSION>
Latest:    v<_REMOTE_VERSION>

<If same:>
✓ Up to date.

<If remote is newer:>
Update available: v<_SRIFLOW_VERSION> → v<_REMOTE_VERSION>
To upgrade: cd <project-root> && git pull origin main

<If remote check failed (offline/private repo):>
Could not reach remote. Installed v<_SRIFLOW_VERSION>. Run 'git fetch --tags' when online.
```

## Rules

- Version check runs in preamble (non-blocking, 2s timeout). If it succeeds,
  show result. If it fails silently, skip upgrade section.
- Do not auto-upgrade. Always show the command for the user to run.
- If VERSION file is missing: show "VERSION: unknown" and skip check.
