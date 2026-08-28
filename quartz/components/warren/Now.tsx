import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import fs from "fs"
import path from "path"
import { readLog, readTools, readBuild, formatWhen, slugFor } from "./data"

// Two columns at the top of the home page, both kept current by the systems themselves:
//   left, "What Warren is doing": now.json at the repo root, written by the Night Shift routine each
//     morning ({ when, doing: [...], finished_week }), plain sentences, nothing private;
//   right, "What the systems are doing": the newest lines in log.jsonl across every system.
interface NowFile {
  when?: string
  doing?: string[]
  finished_week?: number
}

function readNow(): NowFile {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "now.json"), "utf8"))
  } catch {
    return {}
  }
}

const LINES = 6

export default (() => {
  const Now: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const now = readBuild().when
    const me = readNow()
    const tools = readTools()
    const titleOf = (source: string): string => {
      const t = tools.find((t) => t.name === source)
      if (!t) return source
      const page = allFiles.find((f) => f.slug === slugFor(t))
      return (page?.frontmatter?.title as string | undefined) ?? t.name
    }
    const lines = readLog()
      .filter((l) => l.status !== "scheduled")
      .slice(0, LINES)
    return (
      <div class={classNames(displayClass, "now")}>
        <div class="now-col">
          <div class="now-head mono">
            <span>what Warren is doing</span>
            {me.when && <span class="when">as of {formatWhen(me.when, now)}</span>}
          </div>
          {(me.doing ?? []).length === 0 && <div class="now-row mono empty">nothing written yet</div>}
          {(me.doing ?? []).map((d) => (
            <div class="now-row">{d}</div>
          ))}
          {typeof me.finished_week === "number" && (
            <div class="now-foot mono">finished in the last seven days: {me.finished_week}</div>
          )}
        </div>
        <div class="now-col">
          <div class="now-head mono">
            <span>what the systems are doing</span>
          </div>
          {lines.length === 0 && <div class="now-row mono empty">nothing sent yet</div>}
          {lines.map((l) => {
            const t = tools.find((t) => t.name === l.source)
            const target = t ? (slugFor(t) as FullSlug) : undefined
            const page = target ? allFiles.find((f) => f.slug === target) : undefined
            return (
              <div class="now-row">
                {page ? (
                  <a href={resolveRelative(slug, target!)} class="sys">
                    {titleOf(l.source)}
                  </a>
                ) : (
                  <span class="sys">{titleOf(l.source)}</span>
                )}
                <span class="what">{l.what}</span>
                <span class="mono when">{formatWhen(l.when, now)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  Now.css = `
.now { display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; margin: 8px 0 36px; }
.now-col { display: flex; flex-direction: column; }
.now-head {
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: 12px; color: var(--darkgray); padding: 10px 0; border-bottom: 1px solid var(--dark);
}
.now-head .when { color: var(--gray); }
.now-row { padding: 10px 0; border-bottom: 1px solid var(--lightgray); font-size: 15px; line-height: 1.5; color: var(--dark); }
.now-row .sys { font-weight: 500; color: var(--dark); }
.now-row a.sys:hover { color: var(--secondary); }
.now-row .what { color: var(--darkgray); }
.now-row .sys + .what::before { content: ":"; padding-right: 6px; }
.now-row .when { display: block; font-size: 12px; color: var(--gray); margin-top: 2px; }
.now-row.empty { font-size: 12px; color: var(--darkgray); }
.now-foot { font-size: 12px; color: var(--darkgray); padding-top: 10px; }
@media all and (max-width: 800px) {
  .now { grid-template-columns: 1fr; gap: 24px 0; }
}
`
  return Now
}) satisfies QuartzComponentConstructor
