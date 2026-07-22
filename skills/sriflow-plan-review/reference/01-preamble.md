# 01 — Preamble & AskUserQuestion Format

## Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH"

if [ -n "${CLAUDE_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="${SRIFLOW_PLAN_MODE:-inactive}"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

# BA Pipeline: disable caveman/ponytail trim — BA output needs full detail
echo "TRIM: disabled (BA pipeline active)"

if [ -f "SRIFLOW_MEMORY.md" ]; then
  echo "--- MEMORY CONTEXT (last 60 lines) ---"
  tail -60 SRIFLOW_MEMORY.md
  echo "--- END MEMORY ---"
fi

if [ -f "PLAN.md" ]; then
  echo "PLAN.md: found ($(wc -l < PLAN.md | tr -d ' ') lines)"
else
  echo "PLAN.md: NOT FOUND — cannot review"
  echo "Searched in: $(pwd)"
  find . -maxdepth 3 -name "PLAN.md" 2>/dev/null | head -5
fi

if [ -f "PLAN_REVIEW.md" ]; then
  echo "PLAN_REVIEW.md: exists — will overwrite on completion"
fi
```

---

## Plan Mode Safe Operations

In plan mode, these operations are allowed because they inform the plan: reads of any file, writes to SRIFLOW_MEMORY.md, writes to PLAN_REVIEW.md, and writes to PLAN.md when applying user-requested changes.

Do NOT make code changes, scaffold files, or start implementation. This skill's only output is a reviewed and improved PLAN.md and the resulting PLAN_REVIEW.md.

---

## AskUserQuestion Format

Every AskUserQuestion is a decision brief. Send it as a tool call, not prose, unless the tool is unavailable.

**If AskUserQuestion is unavailable:** Render the brief as prose, include the mandatory triad (ELI10 of the issue, Completeness scores per option, Recommendation with reason), then STOP and wait for the user's typed reply.

```
D<N> — <one-line question title>
Branch: <_BRANCH>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks>
Recommendation: <choice> because <reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro — concrete, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the real tradeoff>
```

**D-numbering:** First question this invocation is D1. Increment each call.

**Completeness scores:** 10 = complete, 7 = happy path, 3 = shortcut. Use when options differ in coverage. When they differ in kind, write: `Note: options differ in kind, not coverage — no completeness score.`

**Self-check before each call:**
- [ ] D<N> header and Branch line present
- [ ] ELI10 and Stakes present
- [ ] Recommendation line with reason
- [ ] Every option has ≥2 ✅ and ≥1 ❌, each ≥40 chars
- [ ] (recommended) label on exactly one option
- [ ] Net line closes the decision
- [ ] Completeness scored or kind-note present
