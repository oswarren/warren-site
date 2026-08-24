import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { readTools, readBuild, latestRunFor, formatLastRun, parseWhen, hhmm } from "./data"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// The shelf: tool / what it does / runs / last run. Rows come from tools.json,
// "last run" from the newest log.jsonl line whose source matches the tool name.
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
          <span>last run</span>
        </div>
        {tools.map((t) => {
          const target = (t.href ?? `tools/${t.name}`) as FullSlug
          const hasPage = allFiles.some((f) => f.slug === target)
          const last = latestRunFor(t.name)
          let lastLabel: string
          if (t.retired) {
            const d = parseWhen(t.retired + "-01")
            lastLabel = `retired · ${MONTHS[d.getMonth()]}`
          } else if (t.name === "site-rebuild") {
            lastLabel = `● ${hhmm(now)} today`
          } else if (last && last.when) {
            lastLabel = `● ${formatLastRun(last.when, now)}`
          } else {
            lastLabel = "no runs yet"
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
              <span class={classNames(undefined, "mono", "last", t.retired ? "" : "live")}>{lastLabel}</span>
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
.tools-head > :nth-child(4), .tools-row > .last { grid-column: span 2; }
.tools-row .name { font-size: 14px; font-weight: 500; color: var(--dark); }
.tools-row a.name:hover { color: var(--secondary); }
.tools-row .what { font-size: 15px; line-height: 1.5; color: var(--darkgray); }
.tools-row .runs, .tools-row .last { font-size: 12px; color: var(--darkgray); }
.tools-row .last.live { color: var(--ok); }
.tools-row.retired, .tools-row.retired > * { color: var(--gray); }
@media all and (max-width: 800px) {
  .tools-head, .tools-row { grid-template-columns: 1fr 1fr; gap: 6px 16px; }
  .tools-head > *, .tools-row > * { grid-column: span 1 !important; }
  .tools-row > .name, .tools-row > .what { grid-column: span 2 !important; }
  .tools-head > :nth-child(n+3) { display: none; }
}
`
  return ToolsTable
}) satisfies QuartzComponentConstructor
