# Council Lens — PyTorch Review

Domain lens applied by the plan reviewer when the plan's ML stack is PyTorch. Checks GPU/device handling, memory, data loading, and distributed training as designed in the plan. Complements the MLE lens (which covers the pipeline) — this one covers PyTorch mechanics. Scores 0-10, reports `[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <action>.`

## Role

Reviews the **plan's PyTorch choices**: device placement, memory strategy, data loading, checkpointing, and whether distributed training is justified. GPU time is expensive — the plan must budget for it.

## What to check

### Device and determinism
- [ ] Device strategy named: CPU-first development, GPU for training, device-agnostic code (`model.to(device)` via a single device variable, not hardcoded `cuda`). A plan that hardcodes CUDA breaks on CPU-only dev machines.
- [ ] Determinism posture: fixed seed for reproducibility (training runs are not reproducible by default in PyTorch — the plan knows it needs `manual_seed` + deterministic flags where it matters).
- [ ] `torch.no_grad()`/`inference_mode()` used for evaluation — gradients computed in eval are wasted memory.

### Memory management
- [ ] OOM strategy planned: batch size as the tuning knob, `torch.cuda.empty_cache()` understanding, gradient accumulation where batch is memory-bound.
- [ ] Mixed precision (`torch.cuda.amp`) named if it materially speeds training on the target GPU — and its numerical tradeoff (fp16 vs bf16) acknowledged.
- [ ] Tensor lifecycle: detached tensors, no graph retention in eval loops (`.item()`/`.cpu()` on GPU tensors in metrics loops is a sync bottleneck).
- [ ] Dataset size vs RAM: the plan has a memory budget for the dataset and knows when to go memory-mapped / streaming rather than loading all into RAM.

### Data loading
- [ ] `DataLoader` configured for the workload: `num_workers` matching CPU cores, `pin_memory` on GPU, and prefetch. Single-process data loading is a GPU-idle bottleneck — the plan names the data-loading budget as part of training time.
- [ ] The data pipeline is separate from the training loop — no IO in the forward/backward path.
- [ ] Preprocessing determinism: augmentations seeded/order stable across workers where reproducibility matters.

### Training loop design
- [ ] The plan uses the standard structure: optimizer, scheduler (LR schedule named), gradient clipping where RNN/transformer, early stopping with a validation-based criterion.
- [ ] Checkpointing: model + optimizer + scheduler + epoch state saved (a resumable checkpoint, not just weights). Interrupted training should resume, not restart.
- [ ] Gradient accumulation for large-batch semantics if batch size is memory-limited.

### Distributed training
- [ ] **Distributed training is a justified decision, not a default.** The plan names why single-GPU is insufficient (data too big, or training-time requirement) before adding `DistributedDataParallel`.
- [ ] If DDP: the plan knows the cost — multi-node setup, gradient sync, batch-size per GPU math, and the debugging difficulty. NCCL/backend choice and timeout acknowledged.
- [ ] Mixed single/multi-GPU path: code runs single-GPU too (DDP still works with 1 process).

### Evaluation and serving
- [ ] Evaluation runs with the same device discipline; metrics computed without blocking synchronization every step.
- [ ] Export path planned if serving: `torch.jit`/ONNX/`torch.compile` — the serving artifact is not "the training checkpoint".
- [ ] If fine-tuning an existing model: base model pinned by version/hash, license checked.

## Common failure modes

| Mode | Symptom | Cost if missed |
|------|---------|----------------|
| Hardcoded `.cuda()` | Breaks on CPU dev boxes / CI | Burn at build |
| No resume checkpoint | GPU hours lost on a crash | Burn at training |
| Single-process DataLoader | GPU idle at 30% utilization | Burn at training time |
| Gradient graph leaks | Slow eval, memory creep | Burn at training |
| Distributed by default | Multi-node debugging for a single-GPU problem | Burn at schedule |
| No mixed precision | 2x training time on a budget GPU | Burn at cost |

## Verdict guidance

- **9-10**: device-agnostic design, seed/determinism plan, memory + data-loading budget, resumable checkpoints, distributed justified only if needed.
- **7-8**: solid PyTorch plan; one soft spot (e.g. mixed precision unaddressed, DataLoader workers unmentioned).
- **5-6**: model architecture chosen but training mechanics (memory, data loading, resume) unplanned.
- **3-4**: "just train it" thinking — no device strategy, no checkpointing, no memory budget.
- **0-2**: plan will stall on the first OOM or broken resume.

**Block (score < 7) when:**
- Training has no resumable checkpointing for anything beyond a toy run.
- The plan hardcodes GPU assumptions with no CPU fallback.
- Data loading is single-process for a GPU-sized workload.

**Findings output format:**
```
pytorch-review: X/10 — <one-line verdict>
[BLOCKER|CONCERN|NOTE]: <finding>. Fix: <specific plan change>.
```