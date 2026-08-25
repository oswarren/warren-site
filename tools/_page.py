"""Shared helper: turn something a tool sent (an email, plain text) into a page the log line links to.

    from _page import write_sent_page
    href = write_sent_page("events-radar", "2026-08-20T18:14:35", "Events Radar: Aug 20 to Aug 30", body)
    # -> "/tools/events-radar/2026-08-20", file content/tools/events-radar/2026-08-20.md

Formatting is deliberately plain so any tool's output reads the same way: a line in capitals becomes a
heading, a line with a link becomes a list item, everything else is left as a paragraph.
"""
from __future__ import annotations

import pathlib
import re
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = re.compile(r"https?://[^\s]+")
_TRAIL = ",.;)"


def _link(m: re.Match) -> str:
    url = m.group(0)
    trail = ""
    while url and url[-1] in _TRAIL:
        trail = url[-1] + trail
        url = url[:-1]
    return f"[link]({url}){trail}"


def to_markdown(body: str) -> str:
    out: list[str] = []
    for raw in body.splitlines():
        line = raw.strip()
        if not line:
            out.append("")
        elif line == line.upper() and any(c.isalpha() for c in line) and not URL.search(line):
            out.append(f"**{line}**")
        elif URL.search(line):
            out.append("- " + URL.sub(_link, line))
        else:
            out.append(line)
    return "\n".join(out).strip() + "\n"


def write_sent_page(source: str, when: str, title: str, body: str) -> str:
    day = when[:10]
    sent = datetime.fromisoformat(when).strftime("%b %d, %Y").replace(" 0", " ")
    path = ROOT / "content" / "tools" / source / f"{day}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    safe_title = title.replace('"', "'")
    front = f'---\ntitle: "{safe_title}"\ndescription: "Sent {sent}, exactly as it went out."\n---\n\n'
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(front + to_markdown(body))
    return f"/tools/{source}/{day}"
