# Integration with other sriflow skills

**After /sriflow-ship:** Proactively suggest `/sriflow-reflect` if the ship was for a major milestone. Say: "Ship complete. Want to run /sriflow-reflect to close the cycle and capture lessons?" Do not auto-run — let the user decide.

**After /sriflow-test produces failures:** If QA_REPORT.md shows failures and the user asks "what went wrong," run the retro's Step 5 § 6 (What Broke) section standalone — answer the question directly without running the full retro. Only run the full retro when the user explicitly requests a retrospective.

**Before /sriflow-plan (next cycle):** If SRIFLOW_MEMORY.md shows stage `reflect-complete`, read the carry-forward items from the most recent retro lessons block in memory. Surface them at the start of the plan skill as "Carry-forward from last cycle:" before asking the user what to plan next.

**Relationship to /sriflow-memory:** `/sriflow-memory` is the lightweight skill for reading and writing individual memory entries during a cycle. `/sriflow-reflect` is the heavyweight skill for full cycle analysis. They share the SRIFLOW_MEMORY.md file but serve different purposes:
- `/sriflow-memory WRITE`: appends a single log entry (used by other skills)
- `/sriflow-memory READ`: reads and summarizes current memory state
- `/sriflow-reflect`: reads memory + git + all reports, produces RETRO.md, compresses memory if needed

Do not invoke `/sriflow-memory` from within `/sriflow-reflect` — write directly to SRIFLOW_MEMORY.md using Edit/Bash. Chaining skill invocations adds latency and context overhead.
