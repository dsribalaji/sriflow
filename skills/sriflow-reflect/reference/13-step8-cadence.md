# Step 8: Commit time distribution and cadence analysis

After computing sessions, produce a commit time histogram and cadence interpretation. This section outputs directly to the conversation — it does NOT go into RETRO.md (it's signal for the builder, not a record).

**Hourly histogram.** From commit timestamps (local time), bucket commits by hour:

```
Commit distribution by hour (local time):
00:   2  ██
01:   0
02:   0
...
09:   5  █████
10:   8  ████████
11:   6  ██████
12:   3  ███
...
22:   4  ████
23:   1  █
```

Each █ = 1 commit. Max bar width is proportional to the busiest hour. Show all 24 hours, even empty ones (show 0 and blank bar). Identify:
- **Peak hour(s)**: the top 1-2 hours by commit count
- **Dead zone**: hours 00:00-06:00 with 0 commits (healthy) vs commits (late-night pattern)
- **Bimodal pattern**: morning cluster + evening cluster with a trough in between (indicates context-switching between work and personal time)

**Session cadence.** From session detection (45-minute gap threshold), compute:
- Total sessions: N
- Average session length: Xmin
- Longest session: Xmin (when)
- Shortest session: Xmin (single commit)
- Sessions by depth:
  - Deep: sessions > 90 minutes (rare, focused work)
  - Medium: 30-90 minutes (standard feature work)
  - Micro: < 30 minutes (quick fix, review, hotpatch)

**Cadence interpretation.** Based on the histogram and session data, write 2-3 sentences:
- Is the work pattern sustainable? (Late-night bursts are a warning sign for solo builders.)
- Are sessions getting longer or shorter over the window? (If window is 14d+, compare first half vs second half.)
- Is there a "ship day" pattern? (Many commits concentrated on one or two days per week suggests batch shipping, which increases risk per ship.)

**AI-assisted percentage.** From command 10 (Co-Authored-By count), compute:
- N% of commits had AI co-author trailers (Co-Authored-By: Claude, Co-Authored-By: GitHub Copilot, etc.)
- If > 80%: note "Heavily AI-assisted cycle — code review signal from CODE_REVIEW.md is especially important."
- If 0%: note "No AI co-author trailers found. If AI tools were used, adding Co-Authored-By trailers improves cycle tracking."
