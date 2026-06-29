# AskUserQuestion Format

Every AskUserQuestion is a decision brief. Send it as a tool call, not prose, unless the tool is unavailable.

**If AskUserQuestion is unavailable:** Render the brief as prose, include the mandatory triad (ELI10 of the issue, Completeness scores per option, Recommendation with reason), then STOP and wait for the user's typed reply.

```
D<N> — <one-line question title>
Branch: <_BRANCH>
ELI10: <plain English, 2-4 sentences, name the stakes>
Stakes if wrong: <one sentence on what breaks>
Recommendation: <choice> because <reason>
Completeness: A=X/10, B=Y/10
A) <option> (recommended)
  ✅ <pro — concrete, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of the real tradeoff>
```

**D-numbering:** First question this invocation is D1. Increment each call.

**Completeness scores:** 10 = complete, 7 = happy path, 3 = shortcut. Use when options differ in coverage. When they differ in kind, write: `Note: options differ in kind, not coverage — no completeness score.`

**Self-check before each call:**
- [ ] D<N> header and Branch line present
- [ ] ELI10 and Stakes present
- [ ] Recommendation line with reason
- [ ] Every option has ≥2 ✅ and ≥1 ❌, each ≥40 chars
- [ ] (recommended) label on exactly one option
- [ ] Net line closes the decision
- [ ] Completeness scored or kind-note present
