import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { readLog, readTools, monthDay, parseWhen } from "./data"
import LogConstructor from "./Log"

// Home page body: the log, then the three quiet section blocks (letter / tools / notes).
interface Options {
  town: string
  letterReaders: number
}
const defaultOptions: Options = { town: "[your town]", letterReaders: 0 }

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const Log = LogConstructor({ limit: 9 })

  const Home: QuartzComponent = (props: QuartzComponentProps) => {
    const { fileData, allFiles, displayClass } = props
    const slug = fileData.slug!
    const log = readLog()
    const tools = readTools()
    const running = tools.filter((t) => !t.retired).length
    const retired = tools.length - running
    const issues = allFiles.filter(
      (f) => f.slug?.startsWith("letter/") && f.slug !== "letter/index",
    ).length
    const lastNote = log.find((l) => l.source === "warren, by hand")
    const notes = allFiles
      .filter((f) => f.slug?.startsWith("notes/") && f.slug !== "notes/index" && f.dates?.modified)
      .sort((a, b) => b.dates!.modified.getTime() - a.dates!.modified.getTime())
    const lastNoteDate = lastNote ? monthDay(parseWhen(lastNote.when)) : notes[0] ? monthDay(notes[0].dates!.modified) : "none yet"
    const issueCount = Math.max(
      issues,
      ...log
        .filter((l) => l.source === "letter-assembler" && l.status !== "scheduled")
        .map((l) => Number((l.what.match(/no\. (\d+)/i) ?? [])[1] ?? 0)),
    )
    const rel = (s: string) => resolveRelative(slug, s as FullSlug)
    return (
      <div class={classNames(displayClass, "home")}>
        <Log {...props} />
        <div class="home-sections">
          <div class="home-section">
            <a href={rel("letter")} class="title">The letter</a>
            <span class="blurb">
              Interesting things within reach of {opts.town}, once a week.
            </span>
            <span class="mono meta">{issueCount === 0 ? "no issues yet" : `${issueCount} issues · ${opts.letterReaders} readers`}</span>
          </div>
          <div class="home-section">
            <a href={rel("tools")} class="title">Tools</a>
            <span class="blurb">Scripts that each do one thing for one person. The lines above are theirs.</span>
            <span class="mono meta">{running} running · {retired} retired</span>
          </div>
          <div class="home-section">
            <a href={rel("notes")} class="title">Notes</a>
            <span class="blurb">The part written by hand.</span>
            <span class="mono meta">last: {lastNoteDate}</span>
          </div>
        </div>
      </div>
    )
  }

  Home.css = [
    ...(Array.isArray(Log.css) ? Log.css : [Log.css ?? ""]),
    `
.home-sections {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  padding: 56px 0 16px 0;
}
.home-section { display: flex; flex-direction: column; gap: 8px; padding-top: 14px; border-top: 1px solid var(--dark); }
.home-section .title { font-size: 20px; font-weight: 500; color: var(--dark); }
.home-section .title:hover { color: var(--secondary); }
.home-section .blurb { font-size: 15px; line-height: 1.5; color: var(--darkgray); }
.home-section .meta { font-size: 12px; color: var(--darkgray); }
@media all and (max-width: 800px) { .home-sections { grid-template-columns: 1fr; } }
`,
  ]
  Home.afterDOMLoaded = Log.afterDOMLoaded
  return Home
}) satisfies QuartzComponentConstructor<Partial<Options> | undefined>
