# approved/

This folder contains **approved Use Cases only**.

**Promotion rule:** A UC moves from `draft/` to `approved/` only when:
1. Verdict = 🟢 GREEN (all checklist items pass)
2. All exception flows are fully specified (trigger + behavior + error message)
3. All open questions are resolved
4. At least one linked User Story exists (or is planned in the UC Inventory)
5. BRD requirement trace is confirmed

**Governance:** Any UC that is edited after being promoted to `approved/` must be re-reviewed by /usecase.
Change the `status` back to `UNDER_REVIEW` and `verdict` to `RED` in the YAML header before editing.
Re-promote only after re-running the verdict checklist.
