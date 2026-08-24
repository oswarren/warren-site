"""Shared helper: append one line to log.jsonl at the repo root.

    from _log import log
    log("library sale page checked, nothing new", "library-sale-watch", href="/tools/library-sale-watch")

Each line is a JSON object: when (local ISO, seconds), what, source, optional href,
optional status ("scheduled" for future lines the site shows with a countdown).
"""
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOG = ROOT / "log.jsonl"


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def log(what: str, source: str, href: str | None = None, when: str | None = None, status: str | None = None) -> dict:
    line = {"when": when or now_iso(), "what": what, "source": source}
    if href:
        line["href"] = href
    if status:
        line["status"] = status
    with LOG.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(line, ensure_ascii=False) + "\n")
    return line


def read_lines() -> list[dict]:
    if not LOG.exists():
        return []
    return [json.loads(l) for l in LOG.read_text(encoding="utf-8").splitlines() if l.strip()]


def write_lines(lines: list[dict]) -> None:
    LOG.write_text("".join(json.dumps(l, ensure_ascii=False) + "\n" for l in lines), encoding="utf-8")
