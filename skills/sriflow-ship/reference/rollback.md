# Rollback Guidance

When the smoke test fails or a post-deploy issue is discovered, the user may need to roll back.
This skill does not execute rollbacks automatically, but it provides the correct commands.

Tell the user: "Smoke test failed. If you need to roll back, use:"

## Vercel

```bash
vercel rollback <previous-deployment-url>
```
Or via the Vercel dashboard: Deployments → previous deployment → Promote to Production.

## Fly.io

```bash
fly releases list --app <app-name>
fly deploy --image <previous-image-sha>
```
Or:
```bash
fly releases rollback <version-number>
```

## Railway

Railway does not have a CLI rollback command. Use the Railway dashboard:
Dashboard → Deployments → click a previous deployment → Redeploy.

## Docker

```bash
docker service update --image <registry>/<project>:<previous-sha> <service-name>
```
Or for Kubernetes:
```bash
kubectl rollout undo deployment/<deployment-name>
```

## GitHub Actions (revert and re-deploy)

```bash
git revert HEAD --no-edit
git push origin <branch>
```
Then wait for CI and the deploy workflow to run again.

## Record the rollback

Record the rollback decision in SRIFLOW_MEMORY.md:
```
### ROLLBACK | <timestamp> | from <sha> | target <target>
Reason: <why rollback was needed>
Rolled back to: <previous SHA or version>
```
