import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { readTools, readBuild, parseWhen, parseCron, nextDue, formatCountdown } from "./data"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Live countdown to each tool's next run. The cron (UTC) is on the cell as data-cron; the next
// occurrence is recomputed every tick, so the counter is right however stale the build is.
const dueScript = `
document.addEventListener("nav", () => {
  const cells = document.querySelectorAll("[data-cron]")
  if (cells.length === 0) return
  const pad = (x) => String(x).padStart(2, "0")
  const parse = (cron) => {
    const m = cron.trim().match(/^(\\d{1,2})\\s+(\\d{1,2})\\s+\\*\\s+\\*\\s+(\\*|[0-6])$/)
    return m ? { minute: +m[1], hour: +m[2], dow: m[3] === "*" ? null : +m[3] } : null
  }
  const next = (s, now) => {
    const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), s.hour, s.minute, 0))
    if (s.dow === null) {
      if (t <= now) t.setUTCDate(t.getUTCDate() + 1)
      return t
    }
    let delta = (s.dow - t.getUTCDay() + 7) % 7
    if (delta === 0 && t <= now) delta = 7
    t.setUTCDate(t.getUTCDate() + delta)
    return t
  }
  const tick = () => {
    const now = new Date()
    for (const el of cells) {
      const s = parse(el.getAttribute("data-cron"))
      if (!s) continue
      const target = next(s, now)
      const secs = Math.max(0, Math.floor((target - now) / 1000))
      const d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60)
      el.textContent = "\u25cf in " + d + "d " + pad(h) + ":" + pad(m) + ":" + pad(secs % 60)
      el.title = target.toLocaleString()
    }
  }
  tick()
  const t = setInterval(tick, 1000)
  window.addCleanup(() => clearInterval(t))
})
`

// The shelf: tool / what it does / runs / next run. Rows come from tools.json; "next run" counts
// down to the tool's cron. Tools without a cron show "not scheduled".
export default (() => {
  const ToolsTable: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const now = readBuild().when
    const tools = readTools()
    return (
      <div class={classNames(displayClass, "tools-table")}>
        <div class="tools-head mono">
          <span>tool</span>
          <span>what it does</span>
          <span>runs</span>
          <span>next run</span>
        </div>
        {tools.map((t) => {
          const target = (t.href ?? `tools/${t.name}`) as FullSlug
          const hasPage = allFiles.some((f) => f.slug === target)
          const schedule = t.retired ? null : parseCron(t.cron)
          let nextLabel: string
          if (t.retired) {
            const d = parseWhen(t.retired + "-01")
            nextLabel = `retired · ${MONTHS[d.getMonth()]}`
          } else if (schedule) {
            nextLabel = `● ${formatCountdown(nextDue(schedule, now), now)}`
          } else {
            nextLabel = "not scheduled"
          }
          const name = hasPage ? (
            <a href={resolveRelative(slug, target)} class="mono name">{t.name}</a>
          ) : (
            <span class="mono name">{t.name}</span>
          )
          return (
            <div class={classNames(undefined, "tools-row", t.retired ? "retired" : "")}>
              {name}
              <span class="what">{t.what}</span>
              <span class="mono runs">{t.runs}</span>
              <span
                class={classNames(undefined, "mono", "next", schedule ? "live" : "")}
                data-cron={schedule ? t.cron : undefined}
              >
                {nextLabel}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  ToolsTable.css = `
.tools-table { display: flex; flex-direction: column; padding-top: 8px; }
.tools-head, .tools-row {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: baseline;
}
.tools-head { font-size: 12px; color: var(--darkgray); padding: 10px 0; border-bottom: 1px solid var(--dark); }
.tools-row { padding: 16px 0; border-bottom: 1px solid var(--lightgray); }
.tools-head > :nth-child(1), .tools-row > .name { grid-column: span 3; }
.tools-head > :nth-child(2), .tools-row > .what { grid-column: span 5; }
.tools-head > :nth-child(3), .tools-row > .runs { grid-column: span 2; }
.tools-head > :nth-child(4), .tools-row > .next { grid-column: span 2; }
.tools-row .name { font-size: 14px; font-weight: 500; color: var(--dark); }
.tools-row a.name:hover { color: var(--secondary); }
.tools-row .what { font-size: 15px; line-height: 1.5; color: var(--darkgray); }
.tools-row .runs, .tools-row .next { font-size: 12px; color: var(--darkgray); }
.tools-row .next { font-variant-numeric: tabular-nums; white-space: nowrap; }
.tools-row .next.live { color: var(--ok); }
.tools-row.retired, .tools-row.retired > * { color: var(--gray); }
@media all and (max-width: 800px) {
  .tools-head, .tools-row { grid-template-columns: 1fr 1fr; gap: 6px 16px; }
  .tools-head > *, .tools-row > * { grid-column: span 1 !important; }
  .tools-row > .name, .tools-row > .what { grid-column: span 2 !important; }
  .tools-head > :nth-child(n+3) { display: none; }
}
`
  ToolsTable.afterDOMLoaded = dueScript
  return ToolsTable
}) satisfies QuartzComponentConstructor
