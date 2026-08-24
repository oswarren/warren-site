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
- Content is a bare real seed: two log lines, `tools.json` is `[]`, no notes, no letter issues. Blanks left on purpose:
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

1. Point one real self-running system at it and let it write its own line (the first one that already runs
   on a schedule is the natural candidate). One line per run, `source` = the tool's name, `href` = its page.
2. Give that tool a page: `content/tools/<name>.md` with frontmatter `log: <name>` (shows only its lines) and an
   entry in `tools.json` (`name`, `what`, `runs`), so /tools stops being empty.
3. Fill the blanks: town, contact email. Custom domain later: set `baseUrl` in `quartz.config.yaml` to the bare
   domain and add a CNAME in the Pages settings.
