# Pattern — Rollback Guide

Rollback is a design requirement of every deploy, not an incident. A deploy without a rollback path is a bet. This pattern defines the per-platform rollback commands, the decision rule for when to roll back, and the record that makes a rollback auditable.

## The rollback decision

Roll back when any of these is true:

- The smoke test fails after deploy (Step 5 of the ship skill).
- The canary window (`reference/patterns/canary-monitoring.md`) shows a danger signal with no verified transient cause.
- A user-facing regression is reported that maps to the new deploy.

**Never** roll back for a blip — one 500 from a CDN edge does not warrant a rollback. Verify a real problem first (one log pass), then roll back fast. Rollback speed is the point: the older the deploy, the more user-visible damage it has done.

## Per-platform commands

**Vercel:**
```bash
vercel rollback <previous-deployment-url>
```
Or dashboard: Deployments → previous → Promote to Production.

**Fly.io:**
```bash
fly releases list --app <app-name>
fly releases rollback <version-number>
# or pin a previous image:
fly deploy --image <previous-image-sha>
```

**Railway:** no CLI rollback. Dashboard: Deployments → previous → Redeploy.

**Docker (standalone):**
```bash
docker service update --image <registry>/<project>:<previous-sha> <service-name>
```
**Kubernetes:**
```bash
kubectl rollout undo deployment/<deployment-name>
```

**npm/pip/homebrew:** publish the previous version as a new patch (registries are append-only — you cannot unpublish and stay clean). `npm unpublish` is for broken publishes within 72h, not a rollback strategy.

**GitHub Actions (revert and re-deploy):**
```bash
git revert HEAD --no-edit
git push origin <branch>    # CI runs, deploy workflow fires again
```

## The rollback record

Every rollback is logged, not buried in chat:

```
### ROLLBACK | <timestamp> | from <sha> | target <target>
Reason: <why rollback was needed>
Rolled back to: <previous SHA or version>
```

The retro skill reads this record as a "what broke" signal for the cycle.

## Rules

1. Rollback readiness is checked before every deploy — know the command for the platform before you deploy, not during the incident.
2. Roll back the version, never "hotfix in production" — a code change is a new deploy, not a rollback.
3. Fast decision, fast action: after verification, roll back immediately. A 10-minute rollback debate is a 10-minute user outage.
4. Registries (npm/pip) have no true rollback — the recovery is a new patch release of the previous code, clearly versioned.
5. After a rollback, the smoke test runs against the rolled-back version too — the rollback itself must be verified.
6. Log the rollback record; the cause and prevention belong in the next retro's lessons.
7. If the same change is rolled back twice, stop shipping it — investigate the root cause before a third attempt (do not retry the same rollback repeatedly).

## Common failure modes

| Mode | Symptom | Fix |
|------|---------|-----|
| No rollback known | Discovery of the command mid-incident | Pre-deploy: name the command in the deploy plan |
| Rolling back a blip | Wasted cycle, deploy churn | One verification pass before deciding |
| Hotfix-in-prod | Version drifts from git history | Revert the code; new deploy, not a patch on a live box |
| Rollback unverified | Old version restored broken | Smoke test the rolled-back version |
| Registry unpublish as strategy | Broken installs for existing consumers | Append-only: publish previous as new patch |

## Integration

Referenced by the ship skill's smoke-test failure path and the canary window. The deploy record (`reference/08-deploy-record.md`) documents the rollback decision so the retrospective can learn from it.