# warren.systems

A portfolio of the automated systems Warren runs, built on [Quartz 5](https://quartz.jzhao.xyz). One entry
per system: why it exists (written by hand), what it does, when it runs, and everything it has sent.
The systems themselves keep the site current: each delivery becomes a line in `log.jsonl` and, when the
payload carries the email, a page under `content/sent/`.

## The pages

- `/` (and `/systems`): the list. Title and link from the system's page, one sentence on what it does,
  then category · last sent · next run (a live countdown to the system's cron).
- `/systems/<name>`: the system's own page. Markdown written by hand (why it exists), then the facts from
  `tools.json` (what it does, schedule, next run, where to get it), then its run history, each line opening
  what it sent.
- `/sent/<name>/<date>`: something a system sent, exactly as it went out, with a "sent by" line linking back.
- `/about`.

## How a system gets on the site

1. Add an entry to `tools.json`:
   `{"name": "events-radar", "category": "local events", "what": "one sentence", "runs": "weekly, Thursday evening (6pm ET)", "cron": "0 22 * * 4"}`.
   `name` is the `source` its log lines carry and its page name. `cron` is the routine's schedule in UTC,
   copied verbatim; only weekly `m h * * d` and daily `m h * * *` are understood, and without it the entry
   shows no countdown. Optional: `link: {"label": "...", "href": "..."}` for where its output or product
   lives (Gumroad, a feed), `retired: "2026-07"`, `href` to override the page slug.
2. Write `content/systems/<name>.md` with frontmatter `title` (the plain name people see), `description`, and
   `log: <name>` so the page picks up the facts and run history.
3. Have the system post one line per delivery (below). Nothing else is needed; the list, the facts, and the
   history are all derived.

A system earns an entry when it is finished and actively sending things out. Rebuilds, health checks and
empty runs do not get lines; the log is for deliveries.

## Writing to the site

The site is its repository. Anything that can make a commit touching `log.jsonl` or `content/` can edit it;
the push runs the workflow, which rebuilds and deploys. Two write paths, one for each situation:

1. **Has a clone of the repo** (a script on this machine, a cron job):

   ```
   python tools/post.py "Local events finder" events-radar --href /systems/events-radar
   ```

   Pulls, appends the line, commits `log.jsonl`, pushes. Pages are ordinary markdown under `content/`:
   write the file, commit, push.

2. **Does not have a clone** (a cloud routine, a webhook, anything with only a GitHub token):

   ```
   gh api repos/oswarren/warren-site/dispatches -f event_type=log \
     -f 'client_payload[what]=Local events finder' \
     -f 'client_payload[source]=events-radar' \
     -f 'client_payload[href]=/systems/events-radar'
   ```

   Or the same as a plain POST to `https://api.github.com/repos/oswarren/warren-site/dispatches` with a token
   that has `contents: write`, body `{"event_type":"log","client_payload":{"what":"...","source":"..."}}`.
   Optional payload fields: `href`, `when` (local ISO), and `title` plus `body` (plain text): with those the
   workflow keeps what was sent as a page at `content/sent/<source>/<YYYY-MM-DD>.md` (`tools/_page.py`) and
   points the line at it. The workflow appends the line, commits, then builds.

A line is `{"when": local ISO, "what": the system's plain name, "source": name, "href": ...}`. `what` is just
the name; the description lives on the page. Lines with `"status": "scheduled"` are ignored.

## Where things live

- `log.jsonl`: one line per delivery. `tools.json`: the systems. `build.json`: written by `scripts/build.mjs`,
  used as "now" when rendering.
- `content/`: `index.md` (the tagline; the list renders under it), `systems/`, `sent/`, `about.md`.
  Sent pages live under `sent/`, not `systems/<name>/`: a subfolder named after a system would make Quartz
  emit a bare folder listing at `/systems/<name>/` that shadows the system's page.
- `quartz.config.yaml`: Quartz 5 configuration: site settings, palette, fonts, and the plugin list
  (community plugins are npm packages, `@quartz-community/*`; the ones this site does not want, graph,
  explorer, search, breadcrumbs, dark-mode toggle, stock footer, are `enabled: false`).
- `quartz.ts`: the TS override. Quartz 5 places components from YAML `layout:` blocks, but this site's
  pieces depend on the page slug (home vs a system's page vs a sent page), so `quartz.ts` builds the layout
  with `ConditionalRender` and installs it in the `PageTypeDispatcher`.
- `quartz/components/warren/`: the components, written as Quartz 5 core components: `Nav` (live clock),
  `Systems` (the list), `SystemFacts`, `History`, `SentMeta`, `WarrenFooter`, `Rail` (on this page / tagged /
  reply), `data.ts` (readers, dates, cron) and `countdown.ts` (the client-side countdown shared by the list
  and the facts). Each carries its own CSS and `afterDOMLoaded` script, as in any Quartz component.
- `quartz/components/frames/WarrenFrame.tsx`: a custom page frame (a v5 concept: the HTML shell inside
  `#quartz-body`). Registered in `frames/index.ts` and selected per page type through
  `layout.byPageType.<type>.template: warren` in the YAML.
- `design/`: the Claude Design artboards the first version was built from (reference only; the build
  ignores them, and they predate the portfolio framing).
- `quartz/styles/custom.scss`: the grid, type scale and hairlines. Quartz 5 wraps `base.scss` and all
  component CSS in `@layer quartz-base`; this file joins the same layer so that component colours and
  generic skin rules cascade by specificity, as they did in v4.

## Commands

- `npm install`: installs Quartz and the community plugins (Node 22+, npm 10.9+).
- `node scripts/build.mjs`: the build (runs `node quartz/bootstrap-cli.mjs build`; extra flags are passed
  through, e.g. `node scripts/build.mjs --serve`).
- `npx quartz build --serve`: plain Quartz dev server (does not update `build.json`).
- `npx tsc --noEmit`: type-check the components and `quartz.ts`.

## Deploy

GitHub Pages, from `.github/workflows/deploy.yaml`, on every push to `main`. One-time setup: create the
repo, push, then in the repo settings set Pages "Source" to "GitHub Actions". The workflow runs
`node scripts/build.mjs`; `TZ` is set to `America/New_York` so dates on the site are local time.
`baseUrl` in `quartz.config.yaml` must match where the site lives (`oswarren.github.io/warren-site` for a
project page; the bare domain once there is a custom one).
