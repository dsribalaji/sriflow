# Deploy Log Commands Reference

When a smoke test fails or the user asks to investigate a failed deploy, use these
platform-specific commands to pull live logs:

## Vercel

```bash
vercel logs <deployment-url> --follow
```
Or via CLI after deploy:
```bash
vercel logs --app <project-name> -n 100
```

## Fly.io

```bash
fly logs --app <app-name>
fly logs --app <app-name> --region <region>
```
For more detail on a specific machine:
```bash
fly machines list --app <app-name>
fly logs --machine <machine-id>
```

## Railway

```bash
railway logs
railway logs --service <service-name>
```

## Docker (standalone)

```bash
docker logs <container-name> --tail 100 --follow
docker ps -a  # find container name if unknown
```

## GitHub Actions

```bash
gh run view <run-id> --log
gh run view <run-id> --log-failed  # only failing steps
```
Find the run ID from the poll output URL (last path segment).

## General log strategy when something goes wrong

1. Check deploy command output first (already shown in step output).
2. Pull platform logs for the last 10 minutes.
3. Look for: startup errors, missing env vars, crashed processes, OOM kills.
4. If the app starts but requests fail: check request logs, not just startup logs.
5. If the deploy appears to succeed but the smoke test fails: the app is up but
   something in the request path is broken — look at request-level logs.
