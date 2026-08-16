# Insight System — Retro Patterns (what to detect)

The recurring failure shapes a retro should actively look for. A retro that waits for the data to reveal patterns misses the ones that hide in plain sight — these are the patterns that show up in almost every cycle and are worth detecting deliberately.

## The pattern set

### 1. Scope creep (the universal)

**Signal:** Planned-vs-shipped shows more shipped than planned, but the time overran anyway.

**Look for:** unplanned features absorbed mid-cycle ("while I was in there"), scope added at build without a plan revision, acceptance criteria quietly expanded.

**Detect via:** the plan's stories vs what actually landed; the code-review diff touching files the plan never named.

**Response lesson type:** process. Fix: unplanned scope becomes a plan revision or a deferred story — never a silent addition.

### 2. The estimate half-life

**Signal:** Estimates are consistently off in one direction (usually under), and the error correlates with a stage.

**Look for:** which stage eats the overrun — discovery? migration? QA? If the same stage overruns every cycle, it is an estimate-category problem, not an execution problem.

**Detect via:** the time-where-it-went table across cycles (not one cycle). One cycle of overrun is noise; three cycles overrunning the same stage is the pattern.

**Response lesson type:** process. Fix: adjust the estimate multiplier for that stage, or break the stage into measurable pieces.

### 3. The golden-path gamble

**Signal:** QA passed, prod broke, and the break was in the golden path.

**Look for:** a golden-path test that "passed" but didn't actually exercise the real flow (mocked the wrong seam, tested a stub, asserted the wrong outcome). The QA report's own categories: did GP-1 really run end to end?

**Detect via:** QA_REPORT.md GP rows vs the actual journey; the e2e-test-patterns rules (user outcomes, not DOM mechanics).

**Response lesson type:** tech. Fix: the specific test that lied gets rewritten; the lie is the lesson.

### 4. The churn hotspot

**Signal:** A file is changed in almost every cycle and still has bugs.

**Look for:** files with high change counts (git numstat) whose bugs recur — these are either too big, under-designed, or in the critical path and growing. The retro should name the file and its fix (split it, or deliberately stabilize it).

**Detect via:** Step 2's git numstat; the CODE_REVIEW.md categories if the same file collects findings.

**Response lesson type:** tech. Fix: name the file and the structural fix; leave it in carry-forward until resolved.

### 5. The silent NFR

**Signal:** The plan promised NFRs (latency, scale, availability); nothing measured them; nobody noticed until prod.

**Look for:** eval-framework results absent for a claimed NFR. A claimed-but-unmeasured NFR is the retro's job to surface — it is a plan-integrity gap, not a QA miss.

**Detect via:** whether the eval framework's benchmark layer has entries matching the plan's NFRs.

**Response lesson type:** process. Fix: the plan-review lens gates NFRs to have numbers and tests (prove).

### 6. The decision echo

**Signal:** The same decision keeps being re-made, or a reversed decision returns.

**Look for:** decisions logged then undone, "we should reconsider X" appearing in multiple cycles, a decision from cycle N being re-litigated in cycle N+2 without new evidence.

**Detect via:** the decisions log and this retro's Decision Quality section.

**Response lesson type:** communication or process. Fix: a reversed decision without new evidence is either a bad original decision (re-score it, learn the evaluation lesson) or a preference conflict (surface it to the user, don't relitigate silently).

### 7. The hero pattern

**Signal:** A disproportionate amount of the cycle's output came from one mode or one hero-push (a single huge commit, an all-nighter cycle, "I'll just fix it quickly").

**Look for:** commit density spikes in one session, a single commit covering what should be several, QA findings clustering in the last-pushed code.

**Detect via:** Step 2's session/cadence data; CODE_REVIEW.md finding density per commit.

**Response lesson type:** process. Fix: slice the work so no cycle needs a hero push; the hero push is the symptom, not the solution.

## Detection rules

1. Detect against **evidence the retro already gathered** (git data, metrics, QA/code-review reports) — never from memory alone.
2. One occurrence is a candidate, not a pattern; look for recurrence across the cycle's data and the prior retro.
3. Each detected pattern names its fix at the stage it belongs (a process fix belongs in the plan, a tech fix in the build), and lands in carry-forward.
4. The pattern's lesson is logged through the observation template with type, confidence, and routing — a detected pattern is the highest-quality raw material the insight system gets.
5. Not every cycle has every pattern — force-fitting all seven produces noise. Detect what the data supports; let the rest stay undetected.