#!/usr/bin/env python3
"""post: append one line to log.jsonl and publish it.

    python tools/post.py "what happened" source
    python tools/post.py "letter no. 32 goes out" letter-assembler --when 2026-08-28T07:00:00 --scheduled
    python tools/post.py "11 screenshots became one note" screenshots-to-notes --href /notes/2026-08-20
    python tools/post.py "..." source --no-push      # append and commit only

Pulls first (other systems write to the same file), appends the line with _log.log,
commits log.jsonl, and pushes. The push triggers .github/workflows/deploy.yaml, which
rebuilds the site. This is the write path for anything running on a machine that has
a clone of the repo. Systems without a clone use the repository_dispatch call in the
README ("Writing to the site"); the workflow appends the line for them.
"""
import argparse
import pathlib
import subprocess
import sys

from _log import log

ROOT = pathlib.Path(__file__).resolve().parent.parent


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=ROOT, check=True, text=True, capture_output=True)


def main() -> int:
    ap = argparse.ArgumentParser(description="append a line to log.jsonl and push it")
    ap.add_argument("what")
    ap.add_argument("source")
    ap.add_argument("--href", help="site path the line links to, e.g. /notes/home-cooked")
    ap.add_argument("--when", help="local ISO time; default now")
    ap.add_argument("--scheduled", action="store_true", help="future line, shown first with a countdown")
    ap.add_argument("--no-push", action="store_true", help="append and commit, do not push")
    a = ap.parse_args()

    if not a.no_push:
        try:
            git("pull", "--rebase", "--quiet")
        except subprocess.CalledProcessError as exc:
            print(exc.stderr.strip() or "git pull failed", file=sys.stderr)
            return 1

    line = log(a.what, a.source, href=a.href, when=a.when, status="scheduled" if a.scheduled else None)
    git("add", "log.jsonl")
    git("commit", "--quiet", "-m", f"log: {a.source}: {a.what}"[:72])
    if not a.no_push:
        git("push", "--quiet")
    print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
