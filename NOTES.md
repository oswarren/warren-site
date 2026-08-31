# NOTES (resume point)

## What this is

warren.systems: a portfolio of the automated systems Warren runs (decided 2026-08-25, replacing the
"status board the tools write themselves" framing). One entry per system: why it exists (his words), what it
does, when it runs, and everything it has sent. The systems keep it current by posting a line per delivery.
Design origin: `design/` (Claude Design canvas; predates the portfolio framing).

## State, 2026-08-31 (Q43: matched display windows, fuller systems column)

- Warren: his side of the home page should stay visible as long as the systems lines do, and the systems
  side should show more than Night Shift's counts. Changes:
  - `now.jsonl` at the root keeps one line per answered day ({when, doing, finished_week}); `now.json`
    still holds the current answer. Seeded from git history (the three real answers; the Aug 28 11:50
    task-list seed was skipped). Night Shift step 7c now appends to it on every answer.
  - Left column (`Now.tsx`): current answer as before, then past days (lines joined with ";"), each kept
    on the page for as long as the right column still reaches back to that day, capped at 6.
  - Right column: every system's newest line gets a slot before any system's older lines fill the rest,
    so Night Shift's daily line cannot crowd out the other three.
  - `log.jsonl` by hand: Porch Light's Aug 20 line got its substance back ("11 events, Aug 20 to Aug 30";
    it had been cut to the bare name when the old board had a separate what-it-is column), and the four
    kits that shipped Aug 28 (Vault Night Shift, Claude Code Starter Kit, Gumroad Product Skill,
    All-Access Pass) got their lines, which nobody had added.
  - Night Shift step 7b now names what finished in its public line when something did
    ("finished: <up to two short phrases>; M next steps set"); a day with nothing closed keeps the
    counts line. Same public rules as 7c.
- Still posting a bare line: the Porch Light cloud routine's step 7 sends `what=Local events finder`.
  Next time that routine is edited (not before Q15's Sep 3 verification), make it send the delivery
  itself, "N events, <range>", like the Aug 20 line.

## State, 2026-08-30 (custom domain)

- Q29 done: the site lives at **https://warrenstetler.com** (old github.io URLs 301 there, so every existing
  link and the routine's dispatches keep working). DNS is in Warren's Vercel account (domain registered there):
  ALIAS apex and CNAME www to `oswarren.github.io`, plus a CAA record for letsencrypt.org because Vercel's
  locked CAA only allowed Google's CA. Domain detached from the old warren-stetler-studio Vercel project
  (warrenstetler.studio still points at it). Pages: custom domain set, cert approved for apex and www,
  HTTPS enforced. `baseUrl` is the bare domain; README's Deploy section has the full picture.

## State, 2026-08-28 (three more systems, running log)

- Warren: "add what I do to warren.systems, readable by curious people, a running log that shows how powerful
  my systems are." Added three systems beside Porch Light, each a page under `content/systems/` in his voice
  (drafts for him to edit) plus a `tools.json` entry: **Night Shift** (`night-shift`, the completion system,
  cron `30 9,16,22 * * *`), **Small Notes, Big Changes** (`small-notes`, the Substack, no cron, link to it;
  posts are pages under `content/sent/small-notes/` with a summary and the Substack link), **Kits**
  (`kits`, the Gumroad products, link to the shop). Porch Light's entry got its "get it" link (the $9 routine).
- Running log: the Night Shift routine's step 7b appends one line per full sweep from its warren-site
  checkout, `"<n> finished, <m> next steps set"`, source `night-shift`, counts only (public). Seeded Aug 27
  and Aug 28 by hand from the reports. Kits and Small Notes lines are added by hand when something ships.
- Home now opens with two columns (`Now.tsx`, placed by `quartz.ts` on home only): "what Warren is doing" reads
  `now.json` at the root ({when, doing: [public one-line versions of the day's five], finished_week}), which the
  Night Shift routine writes every morning and on any midday or evening pass that changed the set (its step 7c,
  public-only rules: no amounts, names, accounts; a step that cannot be said becomes "one private step");
  "what the systems are doing" is the newest six `log.jsonl` lines across every system, each linking to its page.
  Until the first `now.json` lands the left column says "nothing written yet".
- `parseCron` and the client countdown now accept an hour list (`m h1,h2,h3 * * d`) and count down to the
  nearest; still nothing else (no ranges, no steps).
- Left out on purpose: the property tracker (private finances), the residency radar (a client's), MirrorCoach.
- Still blank: `[your town]` and `hello@example.com` (queue Q12).

## State, 2026-08-25 (restructure)

Answers Warren gave, which the site now follows:
- Home = the systems themselves (no intro paragraph, no log board). Tagline stays.
- Sections: systems / about only. Letter, notes, /log and /tools pages are gone (notes can come back if he
  writes some). `content/tools/` moved to `content/systems/`; old `/tools/events-radar` is an alias.
- A system's page: his text, then facts from `tools.json` (what it does / schedule / next run / get it),
  then run history (each line opens what was sent). `link: {label, href}` on the tools.json entry is the
  optional "get it" row, for output or product (Gumroad) later.
- Entry detail line on home: category · last sent <date> · next in <live countdown>. Flat list until four
  or more systems, then group by category.
- Plumbing hidden: footer is source / rss / email; no build times, line counts, provenance grid, or copy
  about JSON lines. `build.json` is still written and used only as "now" at render time.
- About page: a first-person draft from his profile, for him to edit; `[your town]` and
  `hello@example.com` still blank on purpose.
- Push live as you go.
- 2026-08-25: the events radar is named **Porch Light** on the site (page title; file and source key stay
  `events-radar`). The existing log line was renamed by hand. The cloud routine's step 7 still posts
  `what=Local events finder`; that text is never shown (the page title is), but change it to `Porch Light`
  next time the routine is edited.
- 2026-08-25: photo grid on a system's page (`Gallery.tsx`): images dropped into `content/photos/<source>/`
  show under the text as "what came of it", newest first, captions from file names
  (`YYYY-MM-DD-words.jpg` gives words plus a date). Folder exists for events-radar, empty (`.gitkeep`).
  Warren adds photos by committing files; no resize step, so keep them web-sized.
Components now: `Systems`, `SystemFacts`, `History`, `Gallery`, `SentMeta`, `Nav`, `WarrenFooter`, `Rail`, plus
`data.ts` and `countdown.ts`. Removed: `Home`, `Log`, `ToolsTable`, `ToolsStats`, `Meta`, `ProvenanceFooter`.
The routine still dispatches `href=/tools/events-radar`; that works through the alias, and the board never
used it anyway (lines with a body get a `/sent/...` href). Change it to `/systems/events-radar` when next
editing the routine.

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
   (frontmatter `log: events-radar`), entry in `tools.json` with `category: local events`. The personal
   routine (id in `../events-radar/`) posts one line per run via the dispatch write path,
   `source` = `events-radar`, `href` = `/tools/events-radar`. The ceramics residency radar was taken off
   this page 2026-08-25; it does not write here. The Claude cloud environment carries a
   GH_TOKEN, so the routines dispatch with curl; if the token is ever missing the routine skips the line
   silently and the digest still sends.
   DONE 2026-08-25, first line and the shape every tool copies: `PA events radar, a weekly email of real
   events across Pennsylvania: 11 events, Aug 20 to Aug 30`, source `events-radar`, href
   `/tools/events-radar`, `when` in local ET. Pattern: "<system>, <what it is>: <this delivery>"; the
   description stays under about ten words, one number, one scope, no em dashes. Columns on the site are
   when / what it is / category; category comes from `tools.json`, so lines never carry it themselves.
   The site is framed as Pennsylvania (Warren personally); the routine still covers VA but logs the PA count
   only. Later the same day Warren cut the line to the system's plain name, `Local events finder`, and
   the board became one row per system (newest line per source; `Log.tsx`), so a run updates the date in
   place. Then: on a tool's page each line links to the email itself. A dispatch payload with `title` and
   `body` becomes a page under `content/sent/<source>/<date>.md` via `tools/_page.py` (the workflow does
   this; the routine sends the exact subject and body it emailed). The Aug 20 email was replayed through the
   same converter by hand. On the board (home, /log) a row links to the tool's page, not the email, so the
   description of why it exists comes first. Page heading is "Local events finder"; the file stays
   `events-radar.md` (the `source` key). Sent pages live under `sent/`, not `tools/<name>/`, because a
   subfolder named after the tool makes Quartz emit a bare folder listing at `/tools/<name>/` that
   shadows the tool's page (this happened once; do not move them back).
   2026-08-25: /tools last column is now "next run": a live countdown ("in 2d 03:21:43") to the tool's
   `cron` in `tools.json` (UTC, copied verbatim from the routine; weekly `m h * * d` or daily `m h * * *`).
   The browser recomputes the next occurrence every second (`ToolsTable.tsx`, helpers in `data.ts`), so it
   stays right however stale the build is. No cron: "not scheduled". Last-run info lives on the board rows.
   Next check: after the Thu Aug 27 run, the row's date should move to Aug 27 and
   `content/sent/events-radar/2026-08-27.md` should exist.
2. Fill the blanks: town, contact email. Custom domain later: set `baseUrl` in `quartz.config.yaml` to the bare
   domain and add a CNAME in the Pages settings.
