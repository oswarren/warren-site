# warrenstetler.com

Warren Stetler's site, built on [Quartz 5](https://quartz.jzhao.xyz). A portfolio for a creative systems designer, opening
on one statement, "I build systems that help ideas travel farther", then the selected systems, then the evidence that they
are running, then the two ways in. The systems themselves keep the evidence current: each delivery becomes a line in
`log.jsonl` and, when the payload carries the email, a page under `content/sent/`.

## The pages

- `/`: the hero (the statement and one live clue, a countdown to the next system that will run without him), the selected
  systems (every project page with `featured` in its frontmatter, in that order, each with its one sentence and one real
  artifact), then the evidence: what he is doing (`now.json`), what the systems are doing (`log.jsonl`), what runs
  without him and what still needs his hands (`balance.json`) and how that line has moved (`balance.jsonl`), then the
  close: back to the idea, "Work with me", "Use something I've built", and the countdown still running.
- `/systems` ("Work" in the nav): every project page, featured ones first, each with its sentence and what is true about
  it right now (last sent, next run, paused, or where it lives).
- `/systems/<name>`: a project page. The title, the one sentence (`effect`), the artifact, the way into the real thing,
  then the narrative in the page's own markdown (the curiosity, what it does, the system, cause and effect, what
  changed, experience it), then, for systems that log here, the facts from `tools.json`, photos of what came of it, and
  everything it has sent.
- `/sent/<name>/<date>`: something a system sent, exactly as it went out, with a "sent by" line linking back.
- `/work-with-me`: Make one. Say what you keep meaning to do and see the system he would build around it (the design
  call goes to a small endpoint that holds the API key; without it the page falls back to its own canned lines).
- `/use`: what already exists and can be visited, read, or run, from `use.json`.
- `/about`.

## How a system gets on the site

1. Write `content/systems/<name>.md`. The frontmatter is the contract:
   - `title`, `description`
   - `effect`: the one sentence on what the system makes possible. This is what makes it a project page.
   - `featured: 1`: its place on the home page; leave it out to list it on `/systems` only.
   - one artifact: `artifact: artifacts/<file>.jpg` plus `alt`, or `excerpt: |` (a real piece of its output as text,
     add `mono: true` for a list or an email), with `source` as the one-line caption.
   - `tone: "#f1e8dc"`: the colour the paper tints toward while the project is in view (optional).
   - `url` and `open`: the real thing and the label for the link (optional).
   - `log: <name>`: its entry in `tools.json`, for the facts and the run history (optional).
   Then the body, as headings: The curiosity, What it does, The system, Cause and effect, What changed, Experience it.
2. If it runs on a schedule or sends things, add an entry to `tools.json`:
   `{"name": "events-radar", "category": "local events", "what": "one sentence", "runs": "weekly, Thursday evening (6pm ET)", "cron": "0 22 * * 4"}`.
   `name` is the `source` its log lines carry and its page name. `cron` is the routine's schedule in UTC, copied
   verbatim; only weekly `m h * * d` and daily `m h * * *` are understood, and without it the entry shows no countdown.
   Optional: `link: {"label": "...", "href": "..."}` for where its output or product lives, `paused: "2026-09-01"`
   (off on purpose, may come back; no countdown), `retired: "2026-07"`, `href` to override the page slug.
3. Have the system post one line per delivery (below). The list, the facts, the history and the home page's live clue
   are all derived.
4. Photos of what came of it: drop image files into `content/photos/<name>/`; they appear under the narrative, newest
   first. The caption is the file name (`2026-08-22-wolfswood-faire.jpg` shows "wolfswood faire" and "Aug 22, 2026").
   Keep images web-sized (about 1600px on the long side, under 400 KB); the repo carries them forever. Artifacts for
   project pages live in `content/artifacts/`, same rule.

A system earns a `tools.json` entry when it is finished and actively sending things out. Rebuilds, health checks and
empty runs do not get lines; the log is for deliveries.

## Writing to the site

The site is its repository. Anything that can make a commit touching `log.jsonl` or `content/` can edit it;
the push runs the workflow, which rebuilds and deploys. Two write paths, one for each situation:

1. **Has a clone of the repo** (a script on this machine, a cron job):

   ```
   python tools/post.py "Porch Light" events-radar --href /systems/events-radar
   ```

   Pulls, appends the line, commits `log.jsonl`, pushes. Pages are ordinary markdown under `content/`:
   write the file, commit, push.

2. **Does not have a clone** (a cloud routine, a webhook, anything with only a GitHub token):

   ```
   gh api repos/oswarren/warren-site/dispatches -f event_type=log \
     -f 'client_payload[what]=Porch Light' \
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

- `log.jsonl`: one line per delivery. `tools.json`: the systems. `now.json` and `now.jsonl`: what Warren is doing, in his
  words. `balance.json` and `balance.jsonl`: what runs without him, what still needs his hands, and how that has moved.
  `use.json`: the "Use something I've built" rows. `build.json`: written by `scripts/build.mjs`, used as "now".
- `content/`: `index.md` (the statement; everything on the home page renders around it), `systems/` (project pages),
  `sent/`, `photos/<name>/`, `artifacts/`, `about.md`, `work-with-me.md`, `use.md`.
  Sent pages live under `sent/`, not `systems/<name>/`: a subfolder named after a system would make Quartz
  emit a bare folder listing at `/systems/<name>/` that shadows the system's page.
- `quartz.config.yaml`: Quartz 5 configuration: site settings, the palette (warm paper, ink, one clay accent), the
  fonts (Fraunces for statements, IBM Plex Sans for reading, IBM Plex Mono for what the systems write), and the plugin
  list (community plugins are npm packages, `@quartz-community/*`; the ones this site does not want, graph, explorer,
  search, breadcrumbs, dark-mode toggle, stock footer, are `enabled: false`).
- `quartz.ts`: the TS override. Quartz 5 places components from YAML `layout:` blocks, but this site's pieces depend on
  the page slug (home, the work index, a project page, a sent page), so `quartz.ts` builds the layout with
  `ConditionalRender` and installs it in the `PageTypeDispatcher`.
- `quartz/components/warren/`: the components, written as Quartz 5 core components. Home: `Hero`, `Featured`,
  `EvidenceHead`, `Now`, `Balance`, `Ending`. Project pages: `ProjectHead`, `Gallery`, `SystemFacts`, `History`.
  Elsewhere: `Systems` (the work index), `MakeOne` (with `make-one-script.ts`), `Use`, `SentMeta`, `Nav`,
  `WarrenFooter`. Shared: `data.ts` (readers, dates, cron, project pages), `countdown.ts` (the per-element countdown),
  `motion.ts` (the site's movement: reveals, drift, the tone shift, the live "runs again in" line; all off under
  prefers-reduced-motion except the text countdown). Each carries its own CSS and scripts, as in any Quartz component.
- `quartz/components/frames/WarrenFrame.tsx`: a custom page frame (a v5 concept: the HTML shell inside
  `#quartz-body`). Registered in `frames/index.ts` and selected per page type through
  `layout.byPageType.<type>.template: warren` in the YAML. The rail block is unused.
- `design/`: the Claude Design artboards the first version was built from (reference only; the build
  ignores them, and they predate the portfolio framing).
- `quartz/styles/custom.scss`: the frame, the type scale, the prose, the motion utilities. Quartz 5 wraps `base.scss`
  and all component CSS in `@layer quartz-base`; this file joins the same layer so that component colours and generic
  skin rules cascade by specificity.

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
project page; the bare domain once there is a custom one). Since 2026-08-30 the site lives at
`warrenstetler.com`: DNS is Vercel (ALIAS apex and CNAME www to `oswarren.github.io`, plus a CAA record
for letsencrypt.org), the custom domain is set in the repo's Pages settings, and the old
`oswarren.github.io/warren-site` URLs redirect.
