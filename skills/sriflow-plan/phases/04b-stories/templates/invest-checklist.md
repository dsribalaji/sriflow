# INVEST Checklist Template

## INVEST Criteria

| Letter | Question | Failure Signal |
|--------|---------|----------------|
| **I**ndependent | Can it be built and shipped on its own? | Requires another story first |
| **N**egotiable | Does it state the need, not the how? | Over-specifies implementation |
| **V**aluable | Does it deliver value to a user or the business? | Describes a task, not an outcome |
| **E**stimable | Can a developer size it in ~15 seconds? | Vague scope; "it depends" |
| **S**mall | Does it fit in a sprint (≤ 3 days of effort)? | Bundles multiple behaviors |
| **T**estable | Can QA write a test that proves it works? | No measurable outcome defined |

---

## Story Scoring Sheet

| Story ID | I | N | V | E | S | T | Result | Notes |
|----------|---|---|---|---|---|---|--------|-------|
| US-001 | | | | | | | GREEN/RED | |
| US-002 | | | | | | | GREEN/RED | |

---

## Story Splitting Guide

When a story fails S (too large):
- Split by flow type: one story per UC flow (basic, alternate, exception)
- Split by role/actor: one story per role if multiple roles use differently
- Split at "and": every "and" in a story is a split point
- Never split by technical layer: "backend API" + "frontend button" are tasks, not stories

---

## 15-Second Estimate Test

Hand the story to a developer. If they give a rough estimate in 15 seconds — clear enough to build. If they say "it depends on..." — every word after "depends" is a question left unanswered.
