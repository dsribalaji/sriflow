# Multi-Target Projects

Some projects deploy to multiple environments in sequence (staging → production). This skill
handles the production deploy. For staging deploys before production:

If a staging environment is detected (staging workflow file, `STAGING_URL` in SRIFLOW_MEMORY.md,
or a `staging` branch convention): after Step 4 deploy succeeds, AskUserQuestion D_staging.

```
D_staging — Staging deploy available. Deploy to staging first?
Branch: <_BRANCH>
ELI10: A staging environment was detected for this project. Deploying to staging first
lets you verify the deploy works in a production-like environment before it reaches
real users. One extra minute of staging verification can prevent a bad production deploy.
Stakes if wrong: Deploying directly to production without staging means users are the
first to find any environment-specific issue.
Recommendation: A) Deploy to staging first because environment-specific issues (missing
env vars, DB connectivity, CDN config) are common and cheap to find in staging.
Completeness: A=10/10, B=7/10
A) Deploy to staging first, then production (recommended)
  ✅ Catches environment-specific issues before users see them
  ❌ Adds 2-5 minutes to the total deploy time
B) Deploy directly to production
  ✅ Fastest path to production; skips staging overhead
  ❌ Users are the first to find any staging-only configuration issue
Net: The extra time is almost always worth it. Skip staging only for trivial non-functional
changes (copy updates, config tweaks with no logic changes).
```

If user picks A: deploy to staging first using the staging-specific command, run the smoke
test against the staging URL, then proceed to production deploy. Record both in the deploy record.
