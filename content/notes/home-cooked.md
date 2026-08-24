---
title: library-sale-watch, 61 lines
shortTitle: library-sale-watch report
description: What the library watcher looks at, what it did this week, and its last three lines.
modified: 2026-08-22T08:30:00
tags: [tools, report]
---

2026-08-22. Status of [library-sale-watch](../tools/library-sale-watch), 61 lines, Python, runs hourly from cron.

## what it watches

- One page: the library's sale notice at `https://example.com/` (URL is the only argument).
- It fetches the page, takes a SHA-256 of the body, and compares it with `.state/library-sale-watch.hash`.
- Same hash: one "nothing new" line in `log.jsonl`. Different hash: a "found a change" line, and the new text goes into the [letter](../letter) draft.
- Fetch failure: a "could not be fetched" line with the exception name. The cron job does not stop.

## this week

- Aug 16, 14:40 — page changed. One new sale date, added to the draft of letter no. 31.
- Aug 17–21 — 120 runs, no change.
- Aug 21, 07:02 — the date went out in [letter no. 31](../letter/31).
- Aug 22, 04:00 — last run before this note. Nothing new.
- Changes to the script: none.

## last three lines

```
2026-08-22 04:00  library sale page checked, nothing new
2026-08-16 14:40  library-sale-watch found a new date and added it
                  to the letter draft
2026-08-09 04:00  library sale page checked, nothing new
```

Questions to [hello@example.com](mailto:hello@example.com). The rest of the shelf is on the [tools page](../tools).
