import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import fs from "fs"
import path from "path"
import {
  readLog,
  readNowLog,
  readTools,
  readBuild,
  formatWhen,
  sentLabel,
  parseWhen,
  ymd,
  slugFor,
} from "./data"

// Two columns at the top of the home page, both kept current by the systems themselves:
//   left, "What Warren is doing": now.json (the current answer) plus now.jsonl (one line per answered
//     day), both written by the Night Shift routine from Warren's own words; a past day stays visible
//     for as long as the right column still reaches back to that day;
//   right, "What the systems are doing": the newest lines in log.jsonl, but every system's newest
//     line gets a slot before any system's older lines fill the rest, so one system posting daily
//     cannot crowd the others out.
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

// Warren's entries, newest first, one per day. now.jsonl is the record; now.json covers the gap
// if the routine wrote the snapshot but has not appended the line yet.
function warrenEntries() {
  const entries = [...readNowLog()]
  const snap = readNow()
  if (snap.when && snap.doing && !entries.some((e) => e.when === snap.when)) {
    entries.push({ when: snap.when, doing: snap.doing, finished_week: snap.finished_week })
    entries.sort((a, b) => parseWhen(b.when).getTime() - parseWhen(a.when).getTime())
  }
  const days = new Set<string>()
  return entries.filter((e) => {
    const d = ymd(parseWhen(e.when))
    if (days.has(d)) return false
    days.add(d)
    return true
  })
}

// The newest LINES log lines, with every system's newest line guaranteed a slot first.
function systemLines() {
  const all = readLog().filter((l) => l.status !== "scheduled")
  const seen = new Set<string>()
  const picked = all
    .filter((l) => {
      if (seen.has(l.source)) return false
      seen.add(l.source)
      return true
    })
    .slice(0, LINES)
  for (const l of all) {
    if (picked.length >= LINES) break
    if (!picked.includes(l)) picked.push(l)
  }
  return picked.sort((a, b) => parseWhen(b.when).getTime() - parseWhen(a.when).getTime())
}

export default (() => {
  const Now: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const now = readBuild().when
    const tools = readTools()
    const titleOf = (source: string): string => {
      const t = tools.find((t) => t.name === source)
      if (!t) return source
      const page = allFiles.find((f) => f.slug === slugFor(t))
      return (page?.frontmatter?.title as string | undefined) ?? t.name
    }
    const lines = systemLines()
    const entries = warrenEntries()
    const current = entries[0]
    // a Warren line stays up for as long as the systems column still reaches its day
    const oldest = lines.length ? parseWhen(lines[lines.length - 1].when) : null
    const cutoff = oldest ? new Date(oldest.getFullYear(), oldest.getMonth(), oldest.getDate()) : null
    const past = cutoff
      ? entries
          .slice(1)
          .filter((e) => parseWhen(e.when) >= cutoff)
          .slice(0, LINES)
      : []
    return (
      <div class={classNames(displayClass, "now")}>
        <div class="now-col">
          <div class="now-head mono">
            <span>what Warren is doing</span>
            {current && <span class="when">as of {formatWhen(current.when, now)}</span>}
          </div>
          {!current && <div class="now-row mono empty">nothing written yet</div>}
          {(current?.doing ?? []).map((d) => (
            <div class="now-row">{d}</div>
          ))}
          {past.map((e) => (
            <div class="now-row">
              <span class="what">{e.doing.join("; ")}</span>
              <span class="mono when">{sentLabel(e.when, now)}</span>
            </div>
          ))}
          {typeof current?.finished_week === "number" && (
            <div class="now-foot mono">finished in the last seven days: {current.finished_week}</div>
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
