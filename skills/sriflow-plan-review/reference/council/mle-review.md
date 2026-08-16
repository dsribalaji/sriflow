# Council Lens — MLE Review (ML Pipeline)

Domain lens applied by the plan reviewer when the plan involves an ML pipeline. Focuses on the system around the model — data, training, serving, monitoring, rollback — not model math. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Most ML project failures are systems failures: data leakage, silent drift, serving bugs. This lens reviews the **plan's ML pipeline** end to end: data → train → evaluate → serve → monitor → rollback.

## What to check

### Data pipeline
- [ ] Data source, extraction, and versioning named. Data is versioned like code (dvc/feature store) — a model is only reproducible with its exact dataset.
- [ ] Split hygiene: train/validation/test split is by **entity/time**, not random rows (random-row splits leak information across the split boundary).
- [ ] Leakage check planned: features computed using future or label information (e.g. using the full window's mean at prediction time) are the #1 silent killer. The plan names where leakage can hide.
- [ ] Ground truth source defined, including how labels are obtained and their latency (label drift).

### Feature engineering
- [ ] Features are computed the **same way** at train and serve time (training-serving skew). The plan names the shared feature computation path or the skew risk.
- [ ] Feature store or feature definitions live in code, versioned with the model.
- [ ] Sensitive features (race, gender) audited for bias — the plan names the fairness check.

### Training and evaluation
- [ ] Baseline first: the plan includes a heuristic/baseline model to beat (random, rule-based, previous model). An ML project without a baseline is a CONCERN.
- [ ] Evaluation metric chosen and tied to the business metric (offline metric ↔ online outcome mapping stated).
- [ ] Offline evaluation on a held-out set, with a clear threshold for "better than current".
- [ ] Reproducibility: seed, hardware, dependency versions, and data version pinned. A model that can't be retrained is a throwaway.
- [ ] Compute budget realistic: training time and cost named; GPU budget for PyTorch work sized.

### Serving
- [ ] Serving mode chosen: batch vs online (HTTP) vs streaming — and the latency budget each implies.
- [ ] Training-serving consistency enforced at the serving boundary (feature computation identical to training).
- [ ] The model artifact lifecycle: versioned artifact, staged deployment, no "model file in git".
- [ ] Fallback behavior: what the system does when the model errors or times out — degrade to a default, not crash.

### Monitoring and rollback
- [ ] Prediction monitoring planned: input distribution drift (feature drift) and output drift (score distribution shifts) with alert thresholds. Drift is silent — no alert means no signal.
- [ ] Ground-truth monitoring loop: predictions logged, labels arrive later, feedback quality measured.
- [ ] Rollback is not retraining — the plan has a "revert to previous model version" path that is as fast as a code rollback.
- [ ] Data quality monitoring on inputs (missing, out-of-range, new categories).

### Governance
- [ ] Model card or equivalent documented: what it does, training data, limitations, known failure modes.
- [ ] Human review / override path for high-stakes predictions.
- [ ] If the model output is user-facing: UX for low-confidence predictions defined.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Random-row split | Great offline metrics, terrible online | Burn at prod |
| Training-serving skew | Train on X, serve on Y, invisible in eval | Burn at prod |
| No baseline | Expensive model beats a cheap heuristic, unnoticed | Burn at cost review |
| Silent drift | Model decays, nobody sees it | Burn at trust |
| No rollback path | Bad model in prod until retrained | Burn at prod |
| Unreproducible runs | Cannot rebuild a "good" model | Burn at every retrain |

## Verdict guidance

- **9-10**: data versioned, split by entity/time, leakage audit planned, baseline + tied metric, serving/eval parity, drift monitoring + rollback path.
- **7-8**: solid pipeline plan; one soft spot (e.g. monitoring planned but thresholds vague).
- **5-6**: ML as "train a model and deploy it" — no data/split/skew/monitoring design.
- **3-4**: model-in-git thinking; leakage and drift unaddressed.
- **0-2**: plan will produce an unreproducible, unmonitorable, unservable model.

**Block (score < 7) when:**
- The data split is by random row for time-series or user-level data.
- Training-serving parity is unaddressed.
- There is no monitoring or rollback plan for a user-facing model.

**Findings output format:**
```
mle-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```