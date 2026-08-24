# NOTES (resume point)

## What this is

warren.systems: a Quartz 5 status board. Tools append lines to `log.jsonl`; the build turns the
file into the home page. Design origin: `design/` (Claude Design canvas), screenshots in `../home.png`,
`../note.png`, `../tools.png`.

## State, 2026-08-24

- Builds locally: `npm install` then `node scripts/build.mjs` (about 30s, output in `public/`).
- Git repo initialised with a local identity (Warren, opensourcewarren@gmail.com). Not yet on GitHub.
- `.github/workflows/deploy.yaml`: push to `main` builds and deploys to GitHub Pages;
  a `repository_dispatch` event of type `log` appends a line to `log.jsonl` first. Untested until the repo exists.
- `tools/post.py`: local write path (pull, append, commit, push).
- `quartz.config.yaml` `baseUrl` is set to `oswarren.github.io/warren-site` on the assumption the repo
  will be `oswarren/warren-site`. Change it if the name or a custom domain changes.
- ALL CONTENT IS STILL FICTIONAL: every line in `log.jsonl`, every tool in `tools.json`, the notes, letter
  no. 31, `[your town]`, `hello@example.com`. Nothing real has been written to it yet.

## Decided

- Host on GitHub Pages from a public repo, built by GitHub Actions. The edit interface is the repo itself:
  a commit that touches `log.jsonl` or `content/` publishes the site.
- Two write paths only: `tools/post.py` (has a clone) and the dispatch call (does not). No third.

## Next

1. Replace the fictional data with a real seed before the repo goes public (Warren decides what is real).
2. `gh repo create oswarren/warren-site --public --source . --push`, then in repo settings set Pages
   source to "GitHub Actions". First push runs the workflow.
3. Wire one real system to it (the first one that runs on its own) and watch a line appear.
