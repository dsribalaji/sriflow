# Deploy Target Detection — Step 1

The preamble already ran target detection. Read the `DEPLOY_TARGET` value from the preamble output.

## Target priority

When multiple targets are detected, use the first match in this order:
1. vercel (vercel.json)
2. fly (fly.toml)
3. railway (railway.json)
4. github-actions (.github/workflows/*deploy* yml)
5. docker (Dockerfile)

If a target includes `+github-actions` (e.g., `vercel+github-actions`): the platform handles
the deploy, and GitHub Actions runs after merge to trigger it. Track both.

## Per-target deploy commands

| Target | Deploy command | Notes |
|--------|---------------|-------|
| vercel | `npx vercel --prod` | Requires Vercel CLI or npx; deploys current branch to production |
| fly | `fly deploy` | Reads fly.toml; builds and deploys atomically |
| railway | `railway up` | Deploys current branch to the linked Railway project |
| github-actions | push triggers workflow | Poll CI via `gh run list`; no manual deploy command needed |
| docker | `docker build -t <project>:<sha> . && docker push <registry>/<project>:<sha>` | Must know registry; ask if unknown |
| custom | user-provided | Collected via D1b below |

## 1a — Confirm detected target

Tell the user: "Detected deploy target: `<TARGET>`. Deploy command will be: `<COMMAND>`."

If target is known and unambiguous: proceed to Step 2. No question needed.

If target is `unknown`: AskUserQuestion D1a.

```
D1a — No deploy target detected. Which platform?
Branch: <_BRANCH>
ELI10: No recognized deploy config file was found in the project root. Without knowing
the deploy target, the wrong deploy command could run and nothing would ship, or the
wrong environment could get updated. Picking the right platform means the right CLI
and config will be used.
Stakes if wrong: Wrong deploy command runs; nothing ships; or the wrong environment
gets the update and you do not know about it.
Recommendation: Pick the one that matches your infrastructure setup.
Note: options differ in kind, not coverage — no completeness score.
A) Vercel
  ✅ Runs `npx vercel --prod`; works well for Next.js, static sites, serverless functions
  ❌ Requires Vercel account linked and project configured; `vercel.json` should exist
B) Fly.io
  ✅ Runs `fly deploy`; handles containerized apps with automatic builds
  ❌ Requires `flyctl` installed, authenticated, and `fly.toml` present
C) Railway
  ✅ Runs `railway up`; deploys current branch to the linked Railway project automatically
  ❌ Requires Railway CLI installed and project linked; `railway.json` should exist
D) Other (provide command in next message)
  ✅ Works for any platform: GitHub Actions trigger, custom scripts, Heroku, Render, etc.
  ❌ Must be entered manually; no auto-detection or validation possible
Net: Pick the platform you have configured. If you have a Dockerfile with no platform CLI,
pick D and provide the docker build + push + run command.
```

If user picks D: ask in the next message "What is the exact deploy command to run?" Save it
as the custom deploy command. Proceed.

If multiple targets detected (e.g., `vercel+github-actions`): AskUserQuestion D1b.

```
D1b — Multiple deploy targets detected. Which one is authoritative?
Branch: <_BRANCH>
ELI10: Both a platform config file and a GitHub Actions deploy workflow were found. Running
both could cause a double-deploy or a race condition. Need to know which one is the real
deploy path so only that one runs.
Stakes if wrong: Double deploy causes race condition; or the wrong environment gets updated
while the correct one does not.
Recommendation: A) Use the platform directly because the GitHub Actions workflow may just
be a CI trigger that calls the platform CLI anyway.
Note: options differ in kind, not coverage — no completeness score.
A) Platform deploy (<detected platform>, recommended)
  ✅ Direct platform deploy is predictable and fast; no dependency on CI timing
  ❌ Does not validate the GitHub Actions workflow path
B) GitHub Actions workflow
  ✅ Tests the full CI/CD pipeline including any workflow-level gates
  ❌ Slower; depends on CI queue; harder to tail logs in real time
Net: If your GitHub Actions workflow calls `vercel --prod` or `fly deploy` internally,
pick A and let /sriflow-ship call it directly. If the workflow does more (migrations,
notifications, multi-region), pick B.
```
