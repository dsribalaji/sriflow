# 02 — Pipeline Position Detection

## Step 0 — Detect pipeline position from artifacts

```bash
# Probe each stage artifact
_PLAN_DONE=0; _PLAN_REVIEW_DONE=0; _DESIGN_DONE=0
_BUILD_DONE=0; _CODE_REVIEW_DONE=0; _TEST_DONE=0
_SHIP_DONE=0; _REFLECT_DONE=0

[ -f "PLAN.md" ] && _PLAN_DONE=1 && echo "STAGE: plan=done"
[ -f "PLAN_REVIEW.md" ] && _PLAN_REVIEW_DONE=1 && echo "STAGE: plan-review=done"
[ -f "DESIGN.md" ] || [ -d "design" ] && _DESIGN_DONE=1 && echo "STAGE: design=done"
[ -f "CODE_REVIEW.md" ] && _CODE_REVIEW_DONE=1 && echo "STAGE: code-review=done"
[ -f "QA_REPORT.md" ] && _TEST_DONE=1 && echo "STAGE: test=done"
[ -f "RETRO.md" ] && _REFLECT_DONE=1 && echo "STAGE: reflect=done"

# Pull file dates for display
[ -f "PLAN.md" ] && stat -c "%y" PLAN.md 2>/dev/null | cut -d' ' -f1
[ -f "PLAN_REVIEW.md" ] && stat -c "%y" PLAN_REVIEW.md 2>/dev/null | cut -d' ' -f1
[ -f "DESIGN.md" ] && stat -c "%y" DESIGN.md 2>/dev/null | cut -d' ' -f1
[ -f "CODE_REVIEW.md" ] && stat -c "%y" CODE_REVIEW.md 2>/dev/null | cut -d' ' -f1
[ -f "QA_REPORT.md" ] && stat -c "%y" QA_REPORT.md 2>/dev/null | cut -d' ' -f1
[ -f "RETRO.md" ] && stat -c "%y" RETRO.md 2>/dev/null | cut -d' ' -f1
```

When `SRIFLOW_MEMORY.md` exists and holds a `Current Stage:` line, that line takes precedence over artifact inference for the ⏳ marker.