# ADR Template — Tooling / Infrastructure

Extends `ADR-template.md`. Use for tooling, framework, and infra decisions: languages, libraries, CI, deployment, observability. Add these blocks between base sections 1 (Context) and 4 (Decision).

## 1. Context — tooling additions

Add:

- What this tool must do (build, test, deploy, monitor, package).
- Ecosystem already in use — tooling should minimize new ecosystems, not multiply them.
- Team skill with the candidates.
- Constraints: licenses, self-hosting requirement, budget, lock-in tolerance.

## 2. Decision Drivers — tooling specific

- Maintenance burden (who maintains it, how often it breaks)
- Ecosystem maturity (bus factor, release cadence, community)
- Integration with existing CI/CD and cloud
- License compatibility
- Learning cost vs velocity gain

## 3. Considered Options — tooling

```
### <Tool + version>
What it solves: <the problem it removes>
Cost: <license, infra, migration effort>
Maintenance: <how it breaks and who fixes it>
Lock-in: <how hard to leave>
```

Default rule: **boring is a feature.** Prefer the tool that has been stable for years over the one that is newest. A new tool must win on at least two concrete axes (not "modern", not "popular").

## 4. Decision — tooling additions

State exactly what will be used:

```
Stack additions: <tool + version + role>
Dependency policy: <when adding a dependency is allowed — peer review, license check>
CI: <pipeline stages, gate thresholds>
Deploy: <platform, per the ship skill>
Observability: <logs, metrics, traces; retention>
Dev environment: <setup command that is reproducible from a clean machine>
```

## 5. Consequences — tooling additions

- New maintenance surface (each tool is a dependency to upgrade and debug).
- Migration cost for anything replaced.
- Training cost for the team.
- Version-pinning policy: lock versions in CI; upgrade deliberately, not incidentally.

## 6. Validation — tooling additions

- "Clean machine build" test: a fresh checkout builds on a fresh machine from documented commands.
- CI run-time budget: full pipeline under a stated time, or parallelize.
- After 2 weeks, the team can name one thing the tool removed and one thing it cost — if neither is true, revisit.

## Tooling rules

1. No new dependency without a stated purpose, a license check, and a maintenance owner.
2. Pin everything that builds. Lockfiles committed.
3. Toolchain as code (mise/asdf/nix) — the version that builds locally is the version CI builds.
4. Two tools doing one job is a smell. Consolidate.
5. Deprecated tools get a migration ADR before the upgrade starts, not after it breaks.
6. Dev tooling is for the whole team — it must work on the least-powerful machine the team ships on.