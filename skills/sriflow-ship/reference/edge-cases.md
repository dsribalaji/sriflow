# Edge Cases and Known Failure Modes

## Vercel deploy returns a preview URL instead of production URL

Symptom: `vercel --prod` output shows a non-production URL.
Cause: Project is not linked, or `--prod` flag was ignored.
Fix: Run `vercel link` to link the project, then re-run `vercel --prod`.

## Fly deploy hangs at "Waiting for machines to be destroyed"

Symptom: `fly deploy` hangs for >5 minutes.
Cause: Unhealthy machines from a prior deploy not releasing.
Fix: Run `fly machines list` to see stuck machines, then `fly machines destroy <id>`.

## Railway deploy completes but returns the wrong service

Symptom: Deploy completes but the URL points to a different service than expected.
Cause: Multiple Railway services in the project; `railway up` deployed to the wrong one.
Fix: Check `railway status` to see which service was targeted. Use `railway link` to relink.

## GitHub Actions workflow not triggered after push

Symptom: `gh run list` shows no new runs after push.
Cause: Workflow is not triggered by `push` to this branch, or branch is excluded.
Fix: Read the workflow's `on:` block. If the branch is not listed, add it or use workflow_dispatch.

## CI passes but production smoke test shows 5xx

Symptom: CI green, but `GET <URL>` returns 500.
Cause: Runtime error not caught by tests (missing env var, DB migration failure, boot error).
Fix: Check application logs immediately:
- Vercel: `vercel logs`
- Fly: `fly logs`
- Railway: `railway logs`
- Docker: `docker logs <container>`

## Smoke test returns 200 but body contains error overlay

Symptom: HTTP 200, but the page body contains a Next.js / React error boundary or Rails exception.
Cause: The app boots and the server handles the request, but rendering fails with an uncaught exception.
Fix: Check browser console errors and server logs. This is a runtime error in the render path.
