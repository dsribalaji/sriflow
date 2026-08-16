# Spec-Miner Patterns

Extracts behavioral specs from existing
codebases. sriflow-think adopts the extraction mindset for the **context
step**: when a project is brownfield, existing code is stakeholder evidence,
not background noise.

## When to apply

In Step 1 (Q2), if the project phase is **Existing system (enhancement)** or
**Migration**, the codebase is a primary source of truth for "what the system
does today." Mining it before stakeholder interviews gives you the current
behavior contract — and lets you ask sharper questions about what must change.

## Core philosophy

A spec is not a document organized by type — it is a flat list of behavioral
assertions. Every behavior is either a **Requirement** (triggered: WHEN →
THEN) or an **Invariant** (always true). Applied to think: the current
codebase *enforces* a set of behaviors that stakeholders may not even
remember agreeing to. Those enforced behaviors are candidate uncertainties.

## Extraction process (bounded)

sriflow-think does not run a full spec-mine at ideation — that is
sriflow-build's job on the target system. At think time, run the **sampling**
pass only, to feed stakeholder discovery:

1. **Detect structure** (read-only): manifests, framework configs, entry
   points. Ignore `node_modules`, `vendor`, `.git`, `dist`, `build`.
2. **Group into capabilities**: cohesive clusters of entry points sharing a
   service namespace. Name them kebab-case.
3. **Sample**: read entry files (routers, controllers, facades, public API).
   These carry ~70% of behavioral assertions.
4. **Extract two kinds only** for stakeholder purposes:
   - Behaviors the code **enforces** that stakeholders never mentioned →
     list as candidate uncertainties for the register.
   - Behaviors the code *doesn't* have but stakeholders assume exist →
     candidate Tier 1 uncertainties.

**Stop rules** (borrowed): stop when the call chain reaches an external
boundary, when three consecutive files yield nothing new, or after ~15 files
per capability. Defer the rest — list deferred files, don't read them.

## Metadata that matters at think time

The full spec-miner tracks `id`, `entities`, `enforced`, `test`,
`depends_on`, `triggers`. sriflow-think needs only two:

| Field | Use at think |
|-------|--------------|
| `enforced` | Where is this behavior checked? → names the technical stakeholder to interview |
| `id` (stable, `File.method`) | Anchors later discussion of this behavior in sriflow-plan |

Never guess these fields. If `enforced` can't be traced, leave it out — a
guessed enforcement point is worse than none.

## Recording

Outcome lands in THINK_OUTPUT.md under `## Existing Behavior Contract`:

```markdown
## Existing Behavior Contract
- Capabilities found: [kebab-case list]
- Enforced behaviors worth confirming: [2-5 bullets]
- Assumed-but-absent behaviors: [2-5 bullets → candidate uncertainties]
- Deferred files: [only if you stopped early]
```

This section is handed to sriflow-plan as the brownfield baseline.

## Guardrails

- Read-only at think time. No edits, no installs, no network calls.
- Sample, don't exhaust. Full extraction belongs to build.
- The codebase is evidence, not authority — stakeholders still decide. An
  enforced behavior can still be wrong for the future; that's an uncertainty.