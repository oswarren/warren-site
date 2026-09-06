import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import {
  readProjects,
  readTools,
  readBuild,
  latestRunFor,
  sentLabel,
  parseCron,
  nextDue,
  formatCountdown,
  parseWhen,
} from "./data"
import { dueScript } from "./countdown"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const pad = (n: number) => String(n).padStart(2, "0")

// The work index: every project page, featured ones first. Each row is the title, the one sentence on
// what it makes possible, and a quiet line of what is true about it right now: last sent, next run
// (a live countdown), paused, retired, or where it lives.
export default (() => {
  const Systems: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const now = readBuild().when
    const tools = readTools()
    const projects = readProjects(allFiles)
    return (
      <div class={classNames(displayClass, "work")}>
        {projects.map((p, i) => {
          const t = p.log ? tools.find((t) => t.name === p.log) : undefined
          const detail: any[] = []
          if (t?.retired) {
            const d = parseWhen(t.retired + "-01")
            detail.push(
              <span>
                retired {MONTHS[d.getMonth()]} {d.getFullYear()}
              </span>,
            )
          } else if (t?.paused) {
            const d = parseWhen(t.paused)
            detail.push(
              <span>
                paused since {MONTHS[d.getMonth()]} {d.getDate()}
              </span>,
            )
          } else if (t) {
            const last = latestRunFor(t.name)
            if (last) detail.push(<span>last sent {sentLabel(last.when, now)}</span>)
            const schedule = parseCron(t.cron)
            if (schedule) {
              detail.push(
                <span class="next" data-cron={t.cron} data-prefix="next ">
                  next {formatCountdown(nextDue(schedule, now), now)}
                </span>,
              )
            } else if (t.runs) {
              detail.push(<span>{t.runs}</span>)
            }
          }
          if (p.url) {
            try {
              detail.push(<span>{new URL(p.url).hostname.replace(/^www\./, "")}</span>)
            } catch {}
          }
          return (
            <a class="work-row reveal" href={resolveRelative(slug, p.slug as FullSlug)}>
              <span class="num mono">{pad(i + 1)}</span>
              <span class="title serif">{p.title}</span>
              <span class="effect">{p.effect}</span>
              <span class="detail mono">{detail}</span>
            </a>
          )
        })}
      </div>
    )
  }

  Systems.css = `
.work { display: flex; flex-direction: column; margin-top: 8px; }
.work-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 5fr) minmax(0, 6fr);
  grid-template-areas: "num title effect" ". detail detail";
  column-gap: 24px;
  row-gap: 10px;
  align-items: baseline;
  padding: 30px 0;
  border-top: 1px solid var(--rule);
  color: var(--dark);
}
.work-row:first-child { border-top-color: var(--dark); }
.work-row .num { grid-area: num; font-size: 12px; color: var(--gray); }
.work-row .title { grid-area: title; font-weight: 300; font-size: clamp(24px, 2.6vw, 34px); line-height: 1.1; letter-spacing: -0.015em; }
.work-row:hover .title { color: var(--secondary); }
.work-row .effect { grid-area: effect; font-size: 16px; line-height: 1.5; color: var(--darkgray); }
.work-row .detail { grid-area: detail; display: flex; flex-wrap: wrap; gap: 6px 0; font-size: 12px; color: var(--gray); }
.work-row .detail > span + span::before { content: "\\00b7"; padding: 0 10px; color: var(--lightgray); }
.work-row .detail .next { color: var(--ok); font-variant-numeric: tabular-nums; }
@media all and (max-width: 720px) {
  .work-row { grid-template-columns: 1fr; grid-template-areas: "num" "title" "effect" "detail"; row-gap: 8px; padding: 26px 0; }
}
`
  Systems.afterDOMLoaded = dueScript
  return Systems
}) satisfies QuartzComponentConstructor
