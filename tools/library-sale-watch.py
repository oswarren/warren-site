#!/usr/bin/env python3
"""library-sale-watch: fetch a page, hash it, and log whether it changed.

    python3 tools/library-sale-watch.py [URL]

State lives in .state/library-sale-watch.hash. Every run appends one line to
log.jsonl; the site build turns that into the row you see on the home page.
"""
import hashlib
import pathlib
import sys
import urllib.request

from _log import log

SOURCE = "library-sale-watch"
HREF = "/tools/library-sale-watch"
DEFAULT_URL = "https://example.com/"
STATE = pathlib.Path(__file__).resolve().parent.parent / ".state" / f"{SOURCE}.hash"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": f"{SOURCE}/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def main() -> int:
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    try:
        digest = hashlib.sha256(fetch(url)).hexdigest()
    except Exception as exc:  # network down, page gone: say so, don't crash the cron
        log(f"library sale page could not be fetched ({exc.__class__.__name__})", SOURCE, href=HREF)
        return 1

    STATE.parent.mkdir(exist_ok=True)
    previous = STATE.read_text().strip() if STATE.exists() else None
    STATE.write_text(digest + "\n")

    if previous is None or previous == digest:
        log("library sale page checked, nothing new", SOURCE, href=HREF)
    else:
        log("library-sale-watch found a change", SOURCE, href=HREF)
    return 0


if __name__ == "__main__":
    sys.exit(main())
