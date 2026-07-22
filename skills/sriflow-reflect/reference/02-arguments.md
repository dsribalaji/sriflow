# Arguments

- `/sriflow-reflect` — default: last 7 days
- `/sriflow-reflect 7d` — explicit 7-day window
- `/sriflow-reflect 14d` — last 14 days
- `/sriflow-reflect 30d` — last 30 days
- `/sriflow-reflect 24h` — last 24 hours
- `/sriflow-reflect cycle` — full project cycle from memory start date

Parse the argument first. Default to `7d` if no argument given. All times in system local timezone (do NOT set `TZ`).

**Midnight-aligned windows:** For `d` units, compute the absolute start date at local midnight. If today is 2026-06-28 and window is `7d`, start is `2026-06-21T00:00:00`. Use `--since="<date>T00:00:00"` in all git log queries — without the explicit time suffix, git interprets it as current wall time, not midnight. For `h` units, use `--since="N hours ago"`. For `cycle`: read the project start date from SRIFLOW_MEMORY.md `## Goal`, `## Started`, or the earliest log entry timestamp; use that as the since date.

**Argument validation:** If the argument doesn't match `Nd`, `Nh`, or `cycle`, show usage and stop:

```
Usage: /sriflow-reflect [window | cycle]
  /sriflow-reflect        — last 7 days (default)
  /sriflow-reflect 7d     — explicit 7-day window
  /sriflow-reflect 14d    — last 14 days
  /sriflow-reflect 30d    — last 30 days
  /sriflow-reflect 24h    — last 24 hours
  /sriflow-reflect cycle  — full project cycle from memory start date
```
