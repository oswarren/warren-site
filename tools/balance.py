"""Rebuild balance.json from a snapshot of the Todoist project "Balance".

    python tools/balance.py snapshot.json [--today YYYY-MM-DD] [--file balance.json]

The nightly routine writes the snapshot from what it read in Todoist:

    {"sections": [{"id": "...", "name": "Still my hands"}, {"id": "...", "name": "Runs without me"}],
     "tasks": [{"id": "...", "content": "...", "description": "...", "sectionId": "..."}],
     "completed": [{"id": "...", "content": "...", "description": "...", "sectionId": "...",
                    "completedAt": "2026-09-14T15:58:33.091Z"}]}

The project is the source of truth: one row per task. A task in "Runs without me" is an
automatic row, its `when` the first line of the task's description; any other task is a
by-hand row. The two things Todoist does not keep are kept here: `since`, the day a task
first sat in "Runs without me", and `last`, the newest day a by-hand task was ticked.
Rows already on the page keep their place; new rows go to the end of their column.
A row with no id yet is matched to its task by exact text, once, and gets the id.

Prints "changed" or "unchanged". Refuses to write when the snapshot holds no tasks, so a
failed read can never empty the page.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
BALANCE = ROOT / "balance.json"
AUTOMATIC = "runs without me"
NOTE = (
    "Written every night from the Todoist project Balance by tools/balance.py. `automatic` is that "
    "project's 'Runs without me' section, `by_hand` is everything else. Change the project, not this "
    "file: edits here are overwritten."
)


def _sunday(year: int, month: int, n: int) -> datetime:
    first = datetime(year, month, 1, tzinfo=timezone.utc)
    return first + timedelta(days=(6 - first.weekday()) % 7, weeks=n - 1)


def eastern(dt: datetime) -> datetime:
    """US Eastern time by the rule itself (second Sunday of March to first Sunday of November),
    so the script needs no tz database: Windows Python ships without one."""
    dt = dt.astimezone(timezone.utc)
    dst = _sunday(dt.year, 3, 2) + timedelta(hours=7) <= dt < _sunday(dt.year, 11, 1) + timedelta(hours=6)
    return dt.astimezone(timezone(timedelta(hours=-4 if dst else -5)))


def local_day(stamp: str) -> str:
    dt = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return eastern(dt).date().isoformat()


def first_line(text: str | None) -> str:
    lines = [l.strip() for l in (text or "").splitlines() if l.strip()]
    return lines[0] if lines else ""


def build(old: dict, snap: dict, today: str) -> dict:
    tasks = list(snap.get("tasks") or [])
    seen = {t["id"] for t in tasks}
    # a tick the routine failed to reopen still counts as a task, not a deletion
    tasks += [c for c in snap.get("completed") or [] if c["id"] not in seen and c.get("content")]

    auto_sections = {s["id"] for s in snap.get("sections") or [] if s.get("name", "").strip().lower() == AUTOMATIC}
    ticked: dict[str, str] = {}
    for c in snap.get("completed") or []:
        day = local_day(c["completedAt"])
        ticked[c["id"]] = max(day, ticked.get(c["id"], day))

    old_auto, old_hand = old.get("automatic") or [], old.get("by_hand") or []
    claimed: set[int] = set()  # id() of old rows already matched by text

    def find(rows: list[dict], task: dict) -> tuple[int, dict | None]:
        for i, r in enumerate(rows):
            if r.get("id") == task["id"]:
                return i, r
        for i, r in enumerate(rows):
            if not r.get("id") and r.get("what") == task["content"].strip() and id(r) not in claimed:
                claimed.add(id(r))
                return i, r
        return len(rows), None

    automatic, by_hand = [], []
    for n, t in enumerate(tasks):
        what = t["content"].strip()
        if t.get("sectionId") in auto_sections:
            i, prev = find(old_auto, t)
            since = prev.get("since") if prev and prev.get("since") else today
            automatic.append(((i, n), {"id": t["id"], "what": what, "when": first_line(t.get("description")), "since": since}))
        else:
            i, prev = find(old_hand, t)
            row = {"id": t["id"], "what": what}
            last = max([d for d in ((prev or {}).get("last"), ticked.get(t["id"])) if d], default=None)
            if last:
                row["last"] = last
            by_hand.append(((i, n), row))

    return {
        "note": NOTE,
        "automatic": [r for _, r in sorted(automatic, key=lambda x: x[0])],
        "by_hand": [r for _, r in sorted(by_hand, key=lambda x: x[0])],
    }


def dump(b: dict) -> str:
    def rows(items: list[dict]) -> str:
        if not items:
            return "[]"
        return "[\n" + ",\n".join("    " + json.dumps(r, ensure_ascii=False) for r in items) + "\n  ]"

    return (
        "{\n"
        f'  "note": {json.dumps(b["note"], ensure_ascii=False)},\n'
        f'  "automatic": {rows(b["automatic"])},\n'
        f'  "by_hand": {rows(b["by_hand"])}\n'
        "}\n"
    )


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Rebuild balance.json from a Todoist snapshot.")
    p.add_argument("snapshot")
    p.add_argument("--today", default=eastern(datetime.now(timezone.utc)).date().isoformat())
    p.add_argument("--file", default=str(BALANCE))
    a = p.parse_args(argv)

    snap = json.loads(pathlib.Path(a.snapshot).read_text(encoding="utf-8"))
    if not snap.get("tasks") and not snap.get("completed"):
        print("refused: the snapshot holds no tasks", file=sys.stderr)
        return 1

    target = pathlib.Path(a.file)
    before = target.read_text(encoding="utf-8") if target.exists() else ""
    after = dump(build(json.loads(before) if before else {}, snap, a.today))
    if after == before:
        print("unchanged")
        return 0
    target.write_text(after, encoding="utf-8")
    print("changed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
