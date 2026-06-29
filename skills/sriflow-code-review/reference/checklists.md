# Checklists

## Before Emitting a Finding

For each finding, verify:

- [ ] I can quote the specific diff line(s) that motivate this finding
- [ ] The problem is real in this codebase, not a pattern-match that the actual code handles correctly (e.g., a null check exists two lines earlier)
- [ ] The fix I'm recommending is specific and actionable (not "add error handling" but "add try/catch around `JSON.parse` at line 42 and return 400 on catch")
- [ ] The severity matches the matrix — I am not over-promoting a WARN to CRITICAL or under-promoting a CRITICAL to WARN
- [ ] For dead code findings: I have run Grep to confirm the symbol has no callers

If I cannot check all boxes, suppress the finding or reduce severity.

## Before Writing CODE_REVIEW.md

- [ ] All 6 lenses have been applied
- [ ] All lenses that had no applicable code in the diff are noted
- [ ] Every CRITICAL finding has a specific file:line reference and a specific fix
- [ ] Every WARN finding has a specific file:line reference and a specific fix
- [ ] NITPICKs have been presented to the user via AskUserQuestion (D1) before writing
- [ ] The summary table counts match the actual findings below
- [ ] The Verdict field matches the gate logic (CRITICAL present = BLOCKED, no CRITICAL but WARNs = DONE_WITH_CONCERNS, else DONE)

## After CODE_REVIEW.md Written

- [ ] Memory write has been appended to SRIFLOW_MEMORY.md
- [ ] Timeline log has been written
- [ ] Verdict has been printed inline in the conversation (user should not need to open CODE_REVIEW.md to know the status)
- [ ] If BLOCKED: open CRITICAL findings are listed inline
- [ ] If DONE_WITH_CONCERNS: open WARN findings are listed inline
