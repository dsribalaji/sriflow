# Step 6 — The Disagreement Diagnostic

Run this when stakeholders seem to agree but are actually loading the same word with different meanings:

**Warning signals:**
- Multiple stakeholders nod at a vague phrase ("better visibility," "smarter reporting," "more efficient")
- The same requirement satisfies two people but would require contradictory architectural choices
- Stakeholders stop using the phrase but describe very different things in the next sentence

**Diagnostic question (ask each stakeholder separately):**
> "When you say [the agreed phrase], are you trying to [Option A] or [Option B]?"

**Classic example — The Dashboard Disaster:**
> "When you say 'better visibility into operations,' do you mean **reacting to a problem today** — within the hour — or **reviewing last month** for the board?"
>
> COO: *"React today. If a shipment slips, I need to know within the hour."*
> CFO: *"Last month. It must reconcile with the ledger for the board; I don't want live numbers."*

A single phrase. Two entirely different products. Uncovered in ten minutes of one-on-one conversations.

**Output — Disagreement Log entry:**

```markdown
| Phrase | Stakeholder A | A's meaning | Stakeholder B | B's meaning | Status |
|--------|---------------|-------------|---------------|-------------|--------|
| "better visibility" | COO | Real-time ops dashboard (<1hr lag) | CFO | Monthly reconciled board report | OPEN |
```