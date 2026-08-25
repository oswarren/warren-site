import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import {
  readTools,
  readBuild,
  latestRunFor,
  sentLabel,
  slugFor,
  parseCron,
  nextDue,
  formatCountdown,
  parseWhen,
} from "./data"
import { dueScript } from "./countdown"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// The portfolio: one entry per system in tools.json. Title from the system's page, one sentence on
// what it does, then a quiet detail line: category · last sent · next run (live countdown).
// A flat list for now; group by category once there are four or more.
export default (() => {
  const Systems: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const now = readBuild().when
    const tools = [...readTools()].sort((a, b) => Number(!!a.retired) - Number(!!b.retired))
    return (
      <div class={classNames(displayClass, "systems")}>
        {tools.map((t) => {
          const target = slugFor(t) as FullSlug
          const page = allFiles.find((f) => f.slug === target)
          const title = (page?.frontmatter?.title as string | undefined) ?? t.name
          const last = latestRunFor(t.name)
          const schedule = t.retired ? null : parseCron(t.cron)
          const detail: any[] = []
          if (t.category) detail.push(<span class="category">{t.category}</span>)
          if (t.retired) {
            const d = parseWhen(t.retired + "-01")
            detail.push(<span>retired {MONTHS[d.getMonth()]} {d.getFullYear()}</span>)
          } else {
            detail.push(<span>{last ? `last sent ${sentLabel(last.when, now)}` : "nothing sent yet"}</span>)
            if (schedule) {
              detail.push(
                <span class="next" data-cron={t.cron} data-prefix="next ">
                  next {formatCountdown(nextDue(schedule, now), now)}
                </span>,
              )
            }
          }
          return (
            <div class={classNames(undefined, "system", t.retired ? "retired" : "")}>
              {page ? (
                <a href={resolveRelative(slug, target)} class="title">
                  {title}
                </a>
              ) : (
                <span class="title">{title}</span>
              )}
              <p class="what">{t.what}</p>
              <div class="detail mono">{detail}</div>
            </div>
          )
        })}
      </div>
    )
  }

  Systems.css = `
.systems { display: flex; flex-direction: column; padding-top: 8px; }
.system { display: flex; flex-direction: column; gap: 8px; padding: 22px 0; border-top: 1px solid var(--dark); }
.system .title { font-size: 20px; font-weight: 500; color: var(--dark); }
.system a.title:hover { color: var(--secondary); }
.system .what { font-size: 15px; line-height: 1.5; color: var(--darkgray); margin: 0; max-width: 60ch; }
.system .detail { display: flex; flex-wrap: wrap; gap: 6px 0; font-size: 12px; color: var(--darkgray); }
.system .detail > span + span::before { content: "·"; padding: 0 10px; color: var(--gray); }
.system .detail .next { color: var(--ok); font-variant-numeric: tabular-nums; }
.system.retired, .system.retired > * { color: var(--gray); }
/* /systems is a folder page; this list replaces Quartz's own "n items under this folder" listing */
body[data-slug="systems/index"] .page-listing { display: none; }
`
  Systems.afterDOMLoaded = dueScript
  return Systems
}) satisfies QuartzComponentConstructor
