# Scale Detection

Before any analysis, detect project scale. This determines pipeline depth.

**Auto-detect from user's opening message:**

| Tier | Keywords | Timeline |
|------|----------|----------|
| **Small** | "quick", "side project", "hobby", "small", "simple", "weekend", "script", "one-off" | < 1 week |
| **Medium** | "team", "startup", "client", "feature", "module", "need by", "users will", "new endpoint", "new page" | 1-4 weeks |
| **Enterprise** | "enterprise", "compliance", "multi-team", "department", "audit", "regulatory", "migration", "multiple systems", "organization", "hundreds of users" | 1+ months |
| **Mixed/unclear** | Default to Medium | — |

**WARNING: "personal", "for myself", "my own" are NOT Small-tier qualifiers alone.**
Personal projects can be Enterprise-scale (e.g., "a personal LLM inference server with multi-GPU support"). Keywords like "script", "one-off", "quick" indicate Small scope. When the user says "for myself" but describes something complex (multiple components, CLI with subcommands, server, database), default to **Medium** or ask.

**Effort estimation check (required after Q1):**
Before confirming scale, ask:
```
Expected effort to build this?
A) A few hours (recommended for Small)
B) A few days
C) 1-4 weeks (recommended for Medium)
D) A month or more (recommended for Enterprise)
```
Use the answer to cross-validate keyword-based tier detection. If keywords say Small but user says 1-4 weeks, upgrade to Medium. If keywords say Enterprise but user says hours, downgrade to Small. User's effort estimate prevails.

**Keyword priority:** No tier overrides another automatically. Use keyword match as INITIAL HINT only, then validate with effort question above.

If the user can't determine the scale or says "I don't know," default to Medium and proceed.

If THINK_OUTPUT.md already exists: "A previous think session exists. Update it or start fresh?"

**Ask Q1 first (required for all tiers):**

**Q1:** What system or product are we building? (One sentence — concrete noun: API, UI, CLI tool, data pipeline, service)

**Then confirm scale:**

```
Based on your answer above, this looks like a **[S/M/E]** project ([timeline]). Correct?
A) Yes, proceed as [S/M/E] (recommended)
B) Upgrade to [next tier]
C) Downgrade to [lower tier]
D) Skip — run full pipeline regardless
E) I don't know — default to Medium
```

**Branch by tier:**

### If Small → Skip to Output (immediately after Q1)

Show skip summary:
```
Small project — simplified think.
Skipping: Q2-Q4 (project phase, docs, stakeholder discovery), Stakeholder Register, 
Power/Interest Map, Uncertainty Prioritization, Disagreement Diagnostic, Interview Plan.
You can request any on-demand: "give me the stakeholder register", "give me the 
interview plan", "give me the disagreement log"
```

Ask 3 additional clarifying questions:
- **S1:** Who will use this? (1 person? a team? customers?)
- **S1.5:** What are the key features? List 3-5. (e.g., "log expense", "view monthly summary", "export CSV")
- **S2:** What does "done" look like? (observable criterion: "I can upload a file and see it in the list")

Then write THINK_OUTPUT.md (Small template) and finish. **Do NOT proceed to Step 1.**

### If Medium → Condensed Steps 2-7

Show skip summary:
```
Medium project — condensed think.
Condensing: Full stakeholder categories → 3-5 key stakeholders only. 
Formal interview plan → 1-paragraph summary per stakeholder. 
Detailed disagreement diagnostic → skip unless vague phrase flagged.
Full depth available on any step: "expand [step] to full depth"
```

Ask Q2-Q4 from Step 1, then run Steps 2-7 with compression.

**Mid-pipeline expand:** After each step completes, if user says "expand [step]", re-run that step at enterprise depth before proceeding to next step.

### If Enterprise → Full Pipeline (unchanged)

Proceed to Step 1 (Q2-Q4) and run Steps 2-7 exactly as written.
