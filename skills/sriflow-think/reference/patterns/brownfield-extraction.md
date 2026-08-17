# Codebase Spec Extraction

Pulls behavioral specs out of an existing codebase. sriflow-think takes up the
extraction mindset for the **context step**: when a project is brownfield,
the existing code is stakeholder evidence, not background noise.

## When to apply

In Step 1 (Q2), when the project phase is **Existing system (enhancement)** or
**Migration**, the codebase is a primary source of truth for "what the system
does today." Mining it before stakeholder interviews hands you the current
behavior contract — and lets you ask sharper questions about what needs to change.

## Core philosophy

A spec is not a document organized by type — it is a flat list of behavioral
assertions. Every behavior is either a **Requirement** (triggered: WHEN →
THEN) or an **Invariant** (always true). For think: the current codebase
*enforces* a set of behaviors stakeholders may not even remember agreeing to.
Each enforced behavior is a candidate uncertainty.

## Extraction process (bounded)

sriflow-think does not run a full extraction at ideation time — that belongs
to sriflow-build on the target system. At think time, run only the **sampling**
pass, enough to feed stakeholder discovery:

1. **Detect structure** (read-only): manifests, framework configs, entry
   points. Ignore `node_modules`, `vendor`, `.git`, `dist`, `build`.
2. **Group into capabilities**: cluster entry points that share a service
   namespace into cohesive groups. Name them in kebab-case.
3. **Sample**: read the entry files — routers, controllers, facades, public
   API. These carry roughly 70% of behavioral assertions.
4. **Extract only two kinds** for stakeholder purposes:
   - Behaviors the code **enforces** that stakeholders never mentioned →
     record as candidate uncertainties for the register.
   - Behaviors the code *lacks* but stakeholders assume exist →
     candidate Tier 1 uncertainties.

**Stop rules:** stop when the call chain hits an external boundary, when three
consecutive files turn up nothing new, or after roughly 15 files per
capability. Defer everything else — list deferred files, do not read them.

## Metadata that matters at think time

Full extraction tracks `id`, `entities`, `enforced`, `test`,
`depends_on`, `triggers`. sriflow-think needs only two:

| Field | Use at think |
|-------|--------------|
| `enforced` | Where is this behavior checked? → names the technical stakeholder to interview |
| `id` (stable, `File.method`) | Anchors later discussion of this behavior in sriflow-plan |

Never guess these fields. If `enforced` cannot be traced, omit it — a
guessed enforcement point is worse than no data at all.

## Recording

Record the outcome in THINK_OUTPUT.md under `## Existing Behavior Contract`:

```markdown
## Existing Behavior Contract
- Capabilities found: [kebab-case list]
- Enforced behaviors worth confirming: [2-5 bullets]
- Assumed-but-absent behaviors: [2-5 bullets → candidate uncertainties]
- Deferred files: [only if you stopped early]
```

sriflow-plan receives this section as the brownfield baseline.

## Guardrails

- Read-only at think time. No edits, no installs, no network calls.
- Sample, never exhaust. Full extraction belongs to build.
- The codebase is evidence, not authority — stakeholders still decide. An
  enforced behavior can still be wrong for the future; treat that as an uncertainty.