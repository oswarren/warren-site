# warren.systems

A status board built on [Quartz 5](https://quartz.jzhao.xyz). The home page is a log that the
tools write themselves; the notes are the only part typed by hand.

## The loop

1. A tool runs (cron, a webhook, by hand) and appends one JSON line to `log.jsonl` at the repo root:
   `{"when":"2026-08-21T07:02:00","what":"the letter, a weekly email of things within reach: no. 31 sent to 84 people","source":"letter-assembler","href":"/letter/31"}`.
   `what` names the system, says briefly what it is, then what it delivered this time. The site shows it under
   "what it is"; the third column, "category", comes from the tool's `category` in `tools.json` (falls back to
   `source` for lines that are not from a tool). The home page and `/log` show one row per system, its newest
   line, so the date updates in place each run; a tool's own page shows every line it wrote.
   A line can carry what the tool actually sent: add `title` and `body` (plain text) to the payload and the
   site keeps it as a page at `content/sent/<source>/<YYYY-MM-DD>.md` and points the line's `href` at it
   (`tools/_page.py`). That is how "open one to read it" works on a tool's page. On the home page and `/log`
   a row links to the system's page instead (`/tools/<source>`), so the why comes before the what.
   Python tools use `tools/_log.py` (`log(what, source, href=None)`); anything that can write a line works.
   A line with `"status":"scheduled"` and a future `when` is shown first, in blue, with a live countdown.
2. `node scripts/build.mjs` records the start time, runs `npx quartz build`, and writes `build.json`
   (`{when, seconds}`). The footer ("built today 06:14 · build.mjs → quartz · 2.8s") and each note's
   "rendered" line read that file. Because the page is rendered during the build, the duration shown is
   the previous build's. The build itself never writes a log line: the log is for systems that deliver
   something, not for plumbing.
3. The site is static HTML in `public/`. Push it, or let a runner do step 2 whenever `log.jsonl` changes.

Try it: `python3 tools/library-sale-watch.py https://example.com/ && node scripts/build.mjs`, then
open `public/index.html`. `python3 tools/letter-assembler.py` (re)schedules the next Friday 07:00 line.

## Where things live

- `log.jsonl` — the log. `tools.json` — the shelf on /tools (name, what, runs, lines, retired). `build.json` — last build.
- `content/` — markdown. `index.md` is the home page; `tools/index.md` the shelf; `log.md` the full log;
  `notes/`, `letter/`, `about.md`. Frontmatter `log: <source>` on a page shows only that source's lines;
  `source:` marks a machine-written page in the provenance grid.
- `quartz.config.yaml` — Quartz 5 configuration: site settings, palette, fonts, and the plugin list
  (community plugins are npm packages, `@quartz-community/*`; the ones this site does not want —
  graph, explorer, search, breadcrumbs, dark-mode toggle, stock footer — are `enabled: false`).
- `quartz.ts` — the TS override. Quartz 5 places components from YAML `layout:` blocks, but this site's
  pieces depend on the page slug (home vs tools vs note), so `quartz.ts` builds the layout with
  `ConditionalRender` and installs it in the `PageTypeDispatcher`.
- `quartz/components/warren/` — the custom components, written as Quartz 5 core components:
  `Nav` (live clock), `Log`, `Home`, `ToolsTable`, `ToolsStats`, `Meta`, `WarrenFooter`,
  `ProvenanceFooter`, `Rail` (on this page / tagged / reply) and `data.ts` (readers + date formatting).
  Each carries its own CSS and `afterDOMLoaded` script, as in any Quartz component.
- `quartz/components/frames/WarrenFrame.tsx` — a custom page frame (a v5 concept: the HTML shell
  inside `#quartz-body`). Registered in `frames/index.ts` and selected per page type through
  `layout.byPageType.<type>.template: warren` in the YAML.
- `design/`: the Claude Design artboards the site was built from (reference only; the build ignores them).
- `quartz/styles/custom.scss` — the grid, type scale and hairlines. Note that Quartz 5 wraps `base.scss`
  and all component CSS in `@layer quartz-base`; this file joins the same layer so that component colours
  and generic skin rules cascade by specificity, as they did in v4.

## Commands

- `npm install` — installs Quartz and the community plugins (Node 22+, npm 10.9+).
- `node scripts/build.mjs` — the build (runs `node quartz/bootstrap-cli.mjs build`; extra flags are passed through,
  e.g. `node scripts/build.mjs --serve`).
- `npx quartz build --serve` — plain Quartz dev server (does not update `build.json`).
- `npx tsc --noEmit` — type-check the components and `quartz.ts`.

## Writing to the site

The site is its repository. Anything that can make a commit touching `log.jsonl` or `content/` can edit it;
the push runs the workflow, which rebuilds and deploys. Two write paths, one for each situation:

1. **Has a clone of the repo** (a script on this machine, a cron job):

   ```
   python tools/post.py "library sale page checked, nothing new" library-sale-watch --href /tools/library-sale-watch
   ```

   Pulls, appends the line, commits `log.jsonl`, pushes. Notes and tool pages are ordinary markdown
   under `content/`: write the file, commit, push.

2. **Does not have a clone** (a cloud routine, a webhook, anything with only a GitHub token):

   ```
   gh api repos/oswarren/warren-site/dispatches -f event_type=log \
     -f 'client_payload[what]=Letter no. 31 sent to 84 people' \
     -f 'client_payload[source]=letter-assembler' \
     -f 'client_payload[href]=/letter/31'
   ```

   Or the same as a plain POST to `https://api.github.com/repos/oswarren/warren-site/dispatches` with a token
   that has `contents: write`, body `{"event_type":"log","client_payload":{"what":"...","source":"..."}}`.
   Optional payload fields: `href`, `when` (local ISO), `status` (`scheduled`). The workflow appends the line,
   commits it, then builds.

The rule for a new tool is the same in both cases: one line per run, `source` is the tool's name, `href`
points at the page that explains it.

## Deploy

GitHub Pages, from `.github/workflows/deploy.yaml`, on every push to `main`. One-time setup:
create the repo, push, then in the repo settings set Pages "Source" to "GitHub Actions". The workflow
runs `node scripts/build.mjs` (not the stock `npx quartz build`) so `build.json` is written and the footer
shows the real build time; `TZ` is set to `America/New_York` so "today 06:14" means local time.
`baseUrl` in `quartz.config.yaml` must match where the site lives (`oswarren.github.io/warren-site` for a
project page; the bare domain once there is a custom one).
