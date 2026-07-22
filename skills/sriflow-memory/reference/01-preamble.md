# Preamble (run first)

```bash
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
_SESSION_ID="$$-$(date +%s)"
_TEL_START=$(date +%s)
echo "BRANCH: $_BRANCH | SESSION_ID: $_SESSION_ID"

_MEMORY_EXISTS=false
_LOG_COUNT=0
if [ -f "SRIFLOW_MEMORY.md" ]; then
  _MEMORY_EXISTS=true
  _LOG_COUNT=$(grep -c "^### " SRIFLOW_MEMORY.md 2>/dev/null || echo "0")
fi
echo "MEMORY_EXISTS: $_MEMORY_EXISTS | LOG_ENTRIES: $_LOG_COUNT"

if $_MEMORY_EXISTS && [ "$_LOG_COUNT" -gt 50 ]; then
  echo "AUTO-COMPRESS TRIGGERED: $_LOG_COUNT entries > 50 threshold"
fi

# Plan-mode detection
if [ -n "${SRIFLOW_PLAN_FILE:-}${SRIFLOW_PLAN_MODE_FORCE:-}" ]; then
  export SRIFLOW_PLAN_MODE="active"
elif [ "${SRIFLOW_PLAN_MODE:-}" = "active" ]; then
  export SRIFLOW_PLAN_MODE="active"
else
  export SRIFLOW_PLAN_MODE="inactive"
fi
echo "SRIFLOW_PLAN_MODE: $SRIFLOW_PLAN_MODE"

_SESSION_KIND="${SRIFLOW_SESSION_KIND:-interactive}"
echo "SESSION_KIND: $_SESSION_KIND"

# Word-count warning for oversized memory files
if [ -f "SRIFLOW_MEMORY.md" ]; then
  _WORD_COUNT=$(wc -w < "SRIFLOW_MEMORY.md" 2>/dev/null | tr -d ' ')
  echo "MEMORY_WORDS: $_WORD_COUNT"
  if [ "$_WORD_COUNT" -gt 10000 ] 2>/dev/null; then
    echo "MEMORY_WARNING: file is large ($_WORD_COUNT words) — run /sriflow-memory compress to reduce token overhead"
  fi
fi
```

## Preamble output keys

| Key | Meaning |
|---|---|
| `MEMORY_EXISTS: true` | `SRIFLOW_MEMORY.md` found in the project root |
| `LOG_ENTRIES: N` | Number of `### ` header lines counted in the file |
| `AUTO-COMPRESS TRIGGERED` | Log exceeded 50 entries — skip to COMPRESS mode, no D1 prompt |
| `MEMORY_WARNING` | File exceeds 10,000 words — surface warning after any operation |
| `SESSION_KIND: interactive` | Normal user session — AskUserQuestion is available |
| `SESSION_KIND: spawned` | Called from another AI session — auto-choose recommended options, no prompts |

## Plan Mode Safe Operations

In plan mode: `Bash` (read-only commands), `Read`, `Grep`, and writes to `SRIFLOW_MEMORY.md` are allowed. No git mutations, no code changes, no file deletions.

If `SRIFLOW_PLAN_MODE` is `"active"`: run READ mode only. Do not append log entries or compress in plan mode unless the user explicitly requests it and confirms via AskUserQuestion.

## Skill Invocation During Plan Mode

If invoked in plan mode, this skill takes precedence over generic plan mode behavior. Follow steps sequentially starting from Step 0. AskUserQuestion satisfies plan mode's end-of-turn requirement. At a STOP point, stop immediately. Call ExitPlanMode only after the skill workflow completes, or if the user cancels.
