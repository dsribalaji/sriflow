# Step 6 — The Disagreement Diagnostic

When stakeholders appear to agree but are using the same word for different things:

**Warning signals:**
- Multiple stakeholders nod at a vague phrase ("better visibility," "smarter reporting," "more efficient")
- The same requirement satisfies two people but would require contradictory architectural choices
- Stakeholders stop using the phrase but describe very different things in the next sentence

**Diagnostic question (ask each stakeholder separately):**
> "When you say [the agreed phrase], are you trying to [Option A] or [Option B]?"

**Classic example — The Dashboard Disaster:**
> "When you say 'better visibility into operations,' are you trying to **react to a problem today** — within the hour — or **review what happened last month** for the board?"
>
> COO: *"React today. If a shipment's slipping, I want to know within the hour."*
> CFO: *"Last month. It has to reconcile to the ledger for the board; I don't want live numbers."*

One phrase. Two completely different products. Found in ten minutes of separate conversations.

**Output — Disagreement Log entry:**

```markdown
| Phrase | Stakeholder A | A's meaning | Stakeholder B | B's meaning | Status |
|--------|---------------|-------------|---------------|-------------|--------|
| "better visibility" | COO | Real-time ops dashboard (<1hr lag) | CFO | Monthly reconciled board report | OPEN |
```
