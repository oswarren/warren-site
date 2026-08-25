import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { readLog, readBuild, formatWhen } from "./data"

// A system's run history: every delivery it logged, newest first, each opening what it sent.
// Rendered on pages whose frontmatter names the system (`log: <name>`).
export default (() => {
  const History: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const source = fileData.frontmatter?.log as string | undefined
    if (!source) return null
    const now = readBuild().when
    const lines = readLog().filter((l) => l.source === source && l.status !== "scheduled")
    return (
      <div class={classNames(displayClass, "history")}>
        <div class="history-head mono">
          <span>sent</span>
          <span>what</span>
        </div>
        {lines.length === 0 && <div class="history-row mono empty">nothing sent yet</div>}
        {lines.map((l) => {
          // A line that carries what was sent points at its page; show that page's title.
          const target = l.href?.startsWith("/") ? (l.href.slice(1) as FullSlug) : undefined
          const page = target ? allFiles.find((f) => f.slug === target) : undefined
          const label = (page?.frontmatter?.title as string | undefined) ?? l.what
          return (
            <div class="history-row">
              <span class="mono when">{formatWhen(l.when, now)}</span>
              {page ? (
                <a href={resolveRelative(slug, target!)} class="what">
                  {label}
                </a>
              ) : (
                <span class="what">{label}</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  History.css = `
.history { display: flex; flex-direction: column; margin-top: 28px; }
.history-head, .history-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  align-items: baseline;
}
.history-head { font-size: 12px; color: var(--darkgray); padding: 10px 0; border-bottom: 1px solid var(--dark); }
.history-row { padding: 14px 0; border-bottom: 1px solid var(--lightgray); font-size: 15px; }
.history-row .when { font-size: 12px; color: var(--darkgray); }
.history-row .what { color: var(--dark); }
.history-row a.what:hover { color: var(--secondary); }
.history-row.empty { display: block; font-size: 12px; color: var(--darkgray); }
@media all and (max-width: 800px) {
  .history-head, .history-row { grid-template-columns: 1fr; gap: 4px; }
  .history-head > :nth-child(2) { display: none; }
}
`
  return History
}) satisfies QuartzComponentConstructor
