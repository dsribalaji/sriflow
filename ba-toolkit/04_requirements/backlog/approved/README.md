# approved/

This folder contains **sprint-ready User Stories only**.

**Promotion rule:** A story moves from `draft/` to `approved/` only when:
1. Verdict = 🟢 GREEN (all INVEST letters pass)
2. All ACs are in GWT format with measurable thresholds
3. All dependencies declared explicitly
4. DoR checklist is fully checked (including mockup + data dictionary links)
5. No open questions remain unassigned

**The sprint gate:** Stories in this folder are eligible for sprint planning.
Stories in `draft/` are not, regardless of how long they've been there.

**Governance:** If a story is changed after promotion, return it to `draft/`, set verdict to RED,
and re-run /story before re-promoting.
