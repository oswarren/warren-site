# NOTES (resume point)

## What this is

warren.systems: a Quartz 5 status board. Tools append lines to `log.jsonl`; the build turns the file into
the home page. Design origin: `design/` (Claude Design canvas), screenshots in `../home.png`, `../note.png`,
`../tools.png`.

## State, 2026-08-24

- LIVE at https://oswarren.github.io/warren-site/ from the public repo https://github.com/oswarren/warren-site
  (GitHub Pages, built by `.github/workflows/deploy.yaml` on every push to `main`; about 40s from push to live).
- Both write paths tested and working:
  - `python tools/post.py "what" source [--href /x]` from a clone (pull, append, commit, push).
  - `gh api repos/oswarren/warren-site/dispatches -f event_type=log -f 'client_payload[what]=...' -f 'client_payload[source]=...'`
    from anywhere with a GitHub token; the workflow appends the line and commits as `site-log`.
- Content is a bare real seed: one hand line ("site went live") plus the first tool line (events-radar, from the
  Aug 20 run), `tools.json` has events-radar, no notes, no letter issues. The synthesized "this page was
  rebuilt" row was removed 2026-08-25: the build never writes a log line. Blanks left on purpose:
  `[your town]` (content/about.md, content/letter/index.md, Home.tsx default `town`) and `hello@example.com`
  (quartz.ts `EMAIL`). Home.tsx `letterReaders` is 0; the letter section shows "no issues yet" until a
  `letter-assembler` line with "no. N" in it or a page under `content/letter/` exists.
- Local build: `npm install` once, then `node scripts/build.mjs` (2 to 3s). `TZ` on the runner is America/New_York.
- Git identity is local to this repo (Warren, opensourcewarren@gmail.com); the global identity is a different account.

## Decided

- The repo is the edit interface. A commit touching `log.jsonl` or `content/` publishes the site. No CMS, no database.
- Exactly two write paths (post.py with a clone, dispatch without). Do not add a third.
- Fictional mockup content was stripped before going public; the site fills in only with real lines.

## Next

1. DONE 2026-08-25: events-radar is the first connected system. Page at `content/tools/events-radar.md`
   (frontmatter `log: events-radar`), entry in `tools.json`. Both radar routines (personal VA+PA and the
   ceramics residency one, ids in `../events-radar/`) post one line per run via the dispatch write path,
   `source` = `events-radar`, `href` = `/tools/events-radar`. The Claude cloud environment carries a
   GH_TOKEN, so the routines dispatch with curl; if the token is ever missing the routine skips the line
   silently and the digest still sends.
   DONE 2026-08-25, first line and the shape every tool copies: `PA events digest sent: 11 events, Aug 20 to
   Aug 30`, source `events-radar`, href `/tools/events-radar`, `when` in local ET. Pattern: "<what was
   delivered> sent: <count> <unit>, <scope>"; one number, one scope, under about 60 characters, no em dashes.
   The site is framed as Pennsylvania (Warren personally); the routine still covers VA but logs the PA count
   only. Next check: after the Thu Aug 27 run, the second events-radar line should appear on its own.
2. Fill the blanks: town, contact email. Custom domain later: set `baseUrl` in `quartz.config.yaml` to the bare
   domain and add a CNAME in the Pages settings.
