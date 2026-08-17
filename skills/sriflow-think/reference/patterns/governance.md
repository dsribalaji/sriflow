# Governance Patterns

A "compile, enforce, prove, evolve" control plane for governing agent
rules. sriflow-think applies the four-stage model to **stakeholder governance**:
converting raw stakeholder claims into rules that get compiled, enforced,
proven, and evolved.

## The four-stage framework

### 1. Compile

The framework compiles `CLAUDE.md` into a **constitution** — invariant top
rules — plus **rule shards** (tagged, machine-readable rules). sriflow-think
compiles the output of Steps 1-7 into the uncertainty register: every
stakeholder claim becomes a concrete, testable statement rather than prose.

```markdown
# Compiled claim: "Users need real-time sync"
# Constitution-level invariant: "Sync must not lose data"
# Testable statement: "Two devices syncing the same record converge in <5s"
```

Rule: any claim that cannot be compiled into a testable statement stays RED in
the register until an interview resolves it.

### 2. Enforce

The enforcement gates (destructive-ops, allowlist, diff-size, secrets)
map onto sriflow gates:

| Gate | sriflow-think equivalent |
|------------|--------------------------|
| Destructive-ops gate | No scope commitment while a Tier 1 uncertainty is open |
| Allowlist gate | Only named stakeholders may decide Tier 1 questions |
| Diff-size gate | No "we'll figure it out later" — deferred items need an owner + date |
| Secrets gate | Group labels are banned from the register — name the individual |

### 3. Prove

The framework pins a proof to every rule — a SHA-256 witness, test anchors.
sriflow-think pins evidence to every stakeholder answer: which named
individual said it and from what source (interview, document, code
enforcement). An unattributed claim is an unproven claim.

### 4. Evolve

The framework promotes winning rules and A/B tests governance configurations. sriflow-think
evolves the register on every re-run (update mode): resolved uncertainties
turn into decisions (ADR entries), and fresh evidence demotes or promotes tiers.

## ADR entry on resolution

When a Tier 1 uncertainty resolves, log it as a lightweight ADR entry in the
project decision log (sriflow-memory `decisions.jsonl`):

```json
{"id":"D-012","decision":"adopt real-time sync via CRDT","rationale":"...",
 "evidence":"interview: [name], 2026-08-16","status":"resolved","date":"2026-08-16"}
```

This is the "decision documentation template" integration wired into the
SKILL.md pattern table.

## Where each stage lands

| Stage | File |
|-------|------|
| Compile | THINK_OUTPUT.md — uncertainty register |
| Enforce | 11-gates-anti-patterns.md — phase gates |
| Prove | Register rows — evidence column per claim |
| Evolve | Re-run/update mode — decisions.jsonl + tier promotion |

## Rules

1. Every stakeholder claim is compiled or flagged RED. No middle ground.
2. Every resolved uncertainty produces a decision record backed by evidence.
3. Unattributed claims never gate the pipeline.