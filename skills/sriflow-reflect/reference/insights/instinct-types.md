# Insight System — Instinct Types

Classify every insight by type so the memory system can route it to the right skill and the right trigger. A misclassified instinct (a tooling lesson tagged as a process lesson) gets applied in the wrong place or not at all.

## The four types

### 1. Process

How the pipeline itself runs. Lessons about planning, gating, sequencing, and estimation.

**Triggers:** phases that overran or underran, gates that failed, dependencies discovered late, estimates that were off.

**Examples:**
- "When a plan's Phase 5 includes data screens, the data dictionary must be written before the screens — screens derived from an undefined dictionary get rewritten."
- "Estimates for DB-migration-bearing stories run 1.5x; the migration is the hidden half of the story."

**Routed to:** plan skill, plan-review skill, the pipeline's sequencing.

### 2. Tech

The codebase and its stack. Language, framework, and architecture lessons specific to what is being built.

**Triggers:** QA failures, code-review findings, refactor pain, bugs that recurred.

**Examples:**
- "In this codebase, `useEffect` without a dependency array in the chart component causes re-fetch loops — always specify deps for fetch effects."
- "The Go service silently drops the timeout on requests without a `context.WithTimeout` at the handler boundary."

**Routed to:** build skill, code-review skill, the council lenses.

### 3. Communication

How the human and the AI interact. Instruction quality, question clarity, expectation mismatch.

**Triggers:** user corrections, repeated misunderstandings, decisions reversed, a question asked twice.

**Examples:**
- "Sri's 'quick check' means 'verify, don't refactor' — confirm scope before touching unrelated code."
- "A plan that says 'handle errors' needs the error cases enumerated, or 'handled' means 'caught and ignored'."

**Routed to:** every skill's question-asking, the personalization rules in AGENTS.md.

### 4. Tooling

The tools themselves. CLI behavior, environment quirks, config gotchas, skill-stack mechanics.

**Triggers:** tool failures, CLI surprises, environment drift, daemon hiccups.

**Examples:**
- "The browser daemon's `--scale` recreates the context — re-import cookies after any scale change."
- "`gh run list` includes pre-merge runs; filter by `createdAt` or the deploy polls stale runs."

**Routed to:** the specific tool's skill (browser, ship, test), the reference docs it governs.

## Classification rules

1. Every insight gets exactly one primary type. If it genuinely spans two, the primary is where the **action** happens (a tooling workaround that fixes a process problem is tooling — the action is in the tooling).
2. Classification is decided at extraction time, written with the insight, and used for routing — never left implicit.
3. Reclassify only if the evidence shows it was misrouted (a "tech" lesson that keeps firing in planning is really process). Reclassification is a conscious act, not a drift.
4. Each type has its own triggers in the memory system so the right skill picks it up — a process instinct is offered when the next plan starts, a tooling instinct when the tool is next invoked.

## Format

```
INSIGHT: <one-line lesson>
TYPE: <process | tech | communication | tooling>
TRIGGER: <the situation where it applies — the skill/stage/event>
CONFIDENCE: <0-100>
EVIDENCE: <occurrences, contexts, actionability>
ROUTED TO: <the skill(s) that should apply it>
```

## Rules

1. One primary type per insight; type routes the application.
2. Type is written at extraction, with the trigger that fires it.
3. A misrouted insight is reclassified deliberately, with a note, not silently moved.
4. Triggers are concrete (a skill, a stage, an event) so the memory system can actually fire them.