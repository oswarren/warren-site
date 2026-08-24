import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { readLog, readBuild, formatWhen, parseWhen, localIso, LogLine } from "./data"

// The status board: when / what happened / source, read from log.jsonl at build time.
interface Options {
  limit: number // 0 = everything
  source?: string // only lines from this source; "frontmatter" = read `log:` from the page's frontmatter
  next: boolean // show "scheduled" lines first with a live countdown
  rebuildRow: boolean // synthesize a "this page was rebuilt" row from build.json
  older: boolean // trailing "older lines → /log" link
}

const defaultOptions: Options = {
  limit: 9,
  next: true,
  rebuildRow: true,
  older: true,
}

const countdownScript = `
document.addEventListener("nav", () => {
  const rows = document.querySelectorAll("[data-when]")
  if (rows.length === 0) return
  const pad = (x) => String(x).padStart(2, "0")
  const tick = () => {
    const now = Date.now()
    for (const el of rows) {
      const target = new Date(el.getAttribute("data-when")).getTime()
      const s = Math.max(0, Math.floor((target - now) / 1000))
      const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
      el.textContent = s === 0 ? "any moment" : "in " + d + "d " + pad(h) + ":" + pad(m) + ":" + pad(sec)
    }
  }
  tick()
  const t = setInterval(tick, 1000)
  window.addCleanup(() => clearInterval(t))
})
`

function href(slug: FullSlug, target?: string) {
  if (!target) return undefined
  if (target.startsWith("/")) return resolveRelative(slug, target.slice(1) as FullSlug)
  return target
}

export default ((userOpts?: Partial<Options>) => {
  const opts: Options = { ...defaultOptions, ...userOpts }

  const Log: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const build = readBuild()
    const now = build.when
    const all = readLog()
    const source =
      opts.source === "frontmatter" ? (fileData.frontmatter?.log as string | undefined) : opts.source
    const filtered = source ? all.filter((l) => l.source === source) : all
    const scheduled = opts.next
      ? filtered.filter((l) => l.status === "scheduled" && parseWhen(l.when) > now)
      : []
    let past: LogLine[] = filtered.filter((l) => l.status !== "scheduled")
    if (opts.rebuildRow && !source) {
      past = [
        {
          when: localIso(build.when),
          what: `this page was rebuilt${build.seconds != null ? `, ${build.seconds}s` : ""}, because a line below changed`,
          source: "site-rebuild",
        },
        ...past,
      ]
    }
    const total = past.length
    const shown = opts.limit > 0 ? past.slice(0, opts.limit) : past

    return (
      <div class={classNames(displayClass, "log")}>
        <div class="log-head mono">
          <span>when</span>
          <span>what happened</span>
          <span>source</span>
        </div>
        {scheduled.map((l) => (
          <div class="log-row next">
            <span class="mono when" data-when={l.when}>
              soon
            </span>
            <span class="what">
              {l.what}
              <span class="cursor"></span>
            </span>
            <span class="mono source">{l.source}</span>
          </div>
        ))}
        {shown.map((l) => {
          const whenLabel = formatWhen(l.when, now)
          const to = href(slug, l.href)
          return (
            <div class="log-row">
              <span class="mono when">{whenLabel}</span>
              {to ? (
                <a href={to} class="what">
                  {l.what}
                </a>
              ) : (
                <span class="what">{l.what}</span>
              )}
              <span class="mono source">{l.source}</span>
            </div>
          )
        })}
        {opts.older && opts.limit > 0 && (
          <a href={resolveRelative(slug, "log" as FullSlug)} class="mono older">
            older lines → /log ({total.toLocaleString("en-US")} so far)
          </a>
        )}
      </div>
    )
  }

  Log.css = `
.log { display: flex; flex-direction: column; }
.log-head, .log-row {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: baseline;
}
.log-head {
  font-size: 12px;
  color: var(--darkgray);
  padding: 10px 0;
  border-bottom: 1px solid var(--dark);
}
.log-row {
  padding: 14px 0;
  border-bottom: 1px solid var(--lightgray);
  font-size: 15px;
}
.log-head > :nth-child(1), .log-row > .when { grid-column: span 2; }
.log-head > :nth-child(2), .log-row > .what { grid-column: span 7; }
.log-head > :nth-child(3), .log-row > .source { grid-column: span 3; }
.log-row .when, .log-row .source { font-size: 12px; color: var(--darkgray); }
.log-row .what { color: var(--dark); margin: 0; }
.log-row a.what:hover { color: var(--secondary); }
.log-row.next .when { color: var(--secondary); font-variant-numeric: tabular-nums; }
.log-row.next .what { color: var(--darkgray); }
.log .older { font-size: 12px; color: var(--darkgray); padding-top: 14px; }
.log .older:hover { color: var(--secondary); }
@keyframes warren-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.cursor {
  display: inline-block; width: 7px; height: 13px; background: var(--dark);
  vertical-align: -2px; margin-left: 2px; animation: warren-blink 1s steps(1) infinite;
}
@media all and (max-width: 800px) {
  .log-head, .log-row { grid-template-columns: 1fr; gap: 4px; }
  .log-head > *, .log-row > * { grid-column: span 1 !important; }
  .log-head > :nth-child(n+2) { display: none; }
}
`
  Log.afterDOMLoaded = countdownScript
  return Log
}) satisfies QuartzComponentConstructor<Partial<Options> | undefined>
