#!/usr/bin/env python3
"""letter-assembler (stub): schedule the next letter.

Replaces any previous scheduled line for this source with one for next
Friday 07:00 local. The real assembler would also collect the week's finds
and send the mail; here we only keep the countdown on the home page honest.

    python3 tools/letter-assembler.py [issue-number]
"""
import re
import sys
from datetime import datetime, timedelta

from _log import log, read_lines, write_lines

SOURCE = "letter-assembler"


def next_friday_0700(now: datetime) -> datetime:
    target = now.replace(hour=7, minute=0, second=0, microsecond=0)
    days = (4 - now.weekday()) % 7  # Monday=0 ... Friday=4
    if days == 0 and target <= now:
        days = 7
    return target + timedelta(days=days)


def main() -> int:
    lines = read_lines()
    sent = [l for l in lines if l.get("source") == SOURCE and l.get("status") != "scheduled"]
    numbers = [int(m.group(1)) for l in sent for m in [re.search(r"no\. (\d+)", l["what"], re.I)] if m]
    issue = int(sys.argv[1]) if len(sys.argv) > 1 else (max(numbers) + 1 if numbers else 1)

    # drop the previous scheduled line for this source, then append the new one
    lines = [l for l in lines if not (l.get("source") == SOURCE and l.get("status") == "scheduled")]
    write_lines(lines)
    when = next_friday_0700(datetime.now()).isoformat()
    log(f"letter no. {issue} goes out", SOURCE, when=when, status="scheduled")
    print(f"scheduled letter no. {issue} for {when}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
