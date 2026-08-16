# Pattern — Orchestration Protocol

The protocol for running work as a graph of subagents instead of one long inline session. Sequential and parallel subagent chaining with explicit handoffs.

## When to orchestrate

Fan out to subagents when:
- Work items are **independent** (parallel fan-out).
- A phase has a **single deliverable with clear input** that a fresh agent can produce without back-and-forth (sequential delegation).
- The full task would blow the main context (each subagent returns a compressed summary).

Stay inline when:
- Work needs user decisions mid-flight.
- Items share subtle state the subagent would misread.
- The task is a few quick file edits.

## Protocol

### 1. Define the graph

Split the task into work items. Each item:

```
ITEM:
  name: <id>
  input: <exact artifact path or prompt it reads>
  output: <exact artifact path it must produce>
  depends_on: <item ids that must finish first>
  agent_type: <builder | investigator | reviewer | general>
```

Items with empty `depends_on` run in parallel. Items with dependencies wait.

### 2. Launch parallel wave

Issue the independent items in one message (multiple Task tool calls in parallel). Give each subagent:

- The exact input path(s).
- The exact output path.
- The conventions to follow (read the sibling files first; match style).
- A compression instruction: return a summary short enough to consume inline.

Do not monitor each subagent — launch, then collect.

### 3. Recombine and gate

When a wave completes:

- Verify each output artifact exists and is well-formed (grep/read spot-check).
- Reject and re-run any item that missed its contract — do not patch subagent output with the main thread.
- Then launch the next wave whose dependencies are satisfied.

### 4. Sequential chain

When items are strictly ordered (phase N produces the input to phase N+1), run one at a time and pass the artifact. Never parallelize a sequential chain — the later item will guess at the earlier output and produce drift.

### 5. Handoff artifact

Every subagent boundary produces a **handoff artifact** — a file (never a chat-only answer) containing: what was done, what the next phase needs, what is known-broken. The next agent reads the artifact, not the conversation.

## Rules

1. One agent per work item. No agent writes another agent's artifact.
2. Subagents read the project's AGENTS.md and the target directory's conventions before writing.
3. All subagent output is verified against the item contract, then compressed into the main context.
4. Never let a subagent run a deploy, merge, or destructive command unless the item explicitly owns it and the gate allows.
5. If an item is rejected twice, stop and re-plan the item — do not retry the same prompt.

## Plan-skill application

In `/sriflow-plan`, orchestration is available for the high-volume phases:

- **Discovery**: parallel stakeholder interviews (each interview a subagent item) recombined into the stakeholder register.
- **Phase 5 UI & Data**: one subagent per screen/CLI surface, recombined into the screen inventory.
- **Phase 6 architecture**: parallel component designs, recombined by the plan orchestrator, then reviewed inline before ADRs are written.

The orchestrator (the main plan session) always owns the final PLAN.md — subagents produce sections, the orchestrator assembles and gates.