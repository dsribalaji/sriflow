# Pattern — Dependency Graph

Build a dependency graph from the backlog so delivery can be phased by dependency, risk, and value — not by preference. This is the planner's core pattern, used in the plan skill's Phase 4/6 sequencing.

## Purpose

Sequencing stories correctly requires knowing which stories depend on which, which are risky, and which unlock value. The dependency graph answers three questions:

1. **What must ship before what?** (hard ordering)
2. **What is the riskiest thing that should be built earliest?** (fail cheap)
3. **What slice delivers user value first?** (beachhead)

## How to build it

### Step 1 — Enumerate nodes

Every story in the backlog is a node. Split compound stories — a node must be single-deliverable (one behavior a user can observe).

### Step 2 — Draw edges

For each story, list its hard prerequisites:
- **Data edge** — story B reads/writes data that story A creates.
- **Contract edge** — B calls an API/A interface that A defines.
- **Build edge** — B's files are a prerequisite to A's (shared module, schema, config).
- **Concept edge** — B's behavior is meaningless before A exists (feature unlocked).

Draw the edge `A → B` when A must exist before B. If an edge is soft ("it would be nicer"), it is not an edge — note it as a preference, not a dependency.

### Step 3 — Find the critical path

The longest chain of hard edges from any root to any leaf. This is the minimum time to full value. Stories off the critical path can be deferred or parallelized.

### Step 4 — Build the risk matrix

Score each node:

| Story | Complexity (1-5) | Uncertainty (1-5) | Risk = C×U |
|-------|------------------|-------------------|------------|

Risk ≥ 12 is a high-risk node. Rules:
- High-risk nodes move **earliest** in their dependency layer — fail cheap beats fail late.
- High-risk nodes get spikes or proofs before being scheduled as committed scope.
- No high-risk node hides in the last phase — it will fail there at maximum cost.

### Step 5 — Phase by layer

1. **Phase A — Foundations**: roots of the graph (schema, config, contracts, auth).
2. **Phase B — Core value**: the smallest dependency-closed slice that produces user-visible value. This is the beachhead — it must be dependency-complete on its own.
3. **Phase C — Expansion**: everything reachable from Phase B.
4. **Phase D — Polish and non-blocking**: zero-edge-off-critical-path items, nice-to-haves.

Every phase must be **dependency-closed**: no phase references a node from a later phase.

### Step 6 — Emit as plan artifacts

- The graph (or its edge list) goes into PLAN.md sequencing section.
- The risk matrix goes into the plan's risk register.
- Each phase lists its stories and the "definition of done" that makes it dependency-closed.

## Verification

- **Cycles**: any cycle in the hard-edge graph is a design error. Two stories depending on each other's contracts cannot both be built independently — resolve by making one own the shared contract.
- **Orphan check**: every story is reachable from a root. Unreachable stories are either redundant or missing a dependency edge.
- **Value check**: the Phase B slice actually produces the beachhead outcome from the CEO lens, not just the first items alphabetically.

## Common failure modes

| Failure | Symptom | Fix |
|---------|---------|-----|
| Preference edges | Graph too dense, everything depends on everything | Only hard edges count; soft edges become ordering preferences |
| Hidden dependencies | Build hits a missing prerequisite mid-phase | Interview builders during construction; add edges to the register |
| Risky-last ordering | High-risk item scheduled at the end | Move by risk score up the dependency layer |
| Orphaned value | Phase B delivers plumbing, no user value | Re-check Phase B against the beachhead definition |

## Integration

Use this graph in the plan-review Eng lens: the reviewer checks that the plan's stated sequencing matches the graph, that the risk matrix justifies the ordering, and that Phase B is truly dependency-closed and value-producing.