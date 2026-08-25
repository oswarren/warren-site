import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { readTools, readBuild, parseCron, nextDue, formatCountdown, parseWhen } from "./data"
import { dueScript } from "./countdown"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// The facts under a system's own text: what it does / schedule / next run / where to get it.
// Rendered on pages whose frontmatter names a system (`log: <name>`); the facts come from tools.json.
export default (() => {
  const SystemFacts: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const name = fileData.frontmatter?.log as string | undefined
    const t = name ? readTools().find((t) => t.name === name) : undefined
    if (!t) return null
    const now = readBuild().when
    const schedule = t.retired ? null : parseCron(t.cron)
    const rows: [string, any][] = [["what it does", t.what]]
    if (t.retired) {
      const d = parseWhen(t.retired + "-01")
      rows.push(["status", `retired ${MONTHS[d.getMonth()]} ${d.getFullYear()}`])
    } else {
      rows.push(["schedule", t.runs])
      if (schedule) {
        rows.push([
          "next run",
          <span class="next" data-cron={t.cron}>
            {formatCountdown(nextDue(schedule, now), now)}
          </span>,
        ])
      }
    }
    if (t.link) rows.push(["get it", <a href={t.link.href}>{t.link.label}</a>])
    return (
      <div class={classNames(displayClass, "facts", "mono")}>
        {rows.map(([k, v]) => (
          <>
            <span class="key">{k}</span>
            <span class="value">{v}</span>
          </>
        ))}
      </div>
    )
  }

  SystemFacts.css = `
.facts {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px 16px;
  font-size: 12px;
  color: var(--darkgray);
  padding-top: 20px;
  margin-top: 28px;
  border-top: 1px solid var(--dark);
}
.facts .key { color: var(--dark); }
.facts .value { line-height: 1.5; }
.facts .next { color: var(--ok); font-variant-numeric: tabular-nums; }
.facts a { color: var(--darkgray); }
.facts a:hover { color: var(--secondary); }
`
  SystemFacts.afterDOMLoaded = dueScript
  return SystemFacts
}) satisfies QuartzComponentConstructor
