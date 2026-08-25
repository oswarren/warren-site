import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { resolveRelative, FullSlug } from "../../util/path"
import { readLog, readTools, slugFor, parseWhen, longDate } from "./data"

// The line above something a system sent (a page under sent/<source>/):
// "sent by Porch Light · Aug 20, 2026", the name linking back to the system.
export default (() => {
  const SentMeta: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const m = slug.match(/^sent\/([^/]+)\/(.+)$/)
    if (!m) return null
    const [, source, day] = m
    const t = readTools().find((t) => t.name === source)
    const line = readLog().find((l) => l.href === "/" + slug)
    const when = parseWhen(line?.when ?? day)
    const target = t ? (slugFor(t) as FullSlug) : undefined
    const page = target ? allFiles.find((f) => f.slug === target) : undefined
    const name = (page?.frontmatter?.title as string | undefined) ?? source
    return (
      <div class={classNames(displayClass, "sent-meta", "mono")}>
        <span>
          sent by {page ? <a href={resolveRelative(slug, target!)}>{name}</a> : name}
        </span>
        <span>{longDate(when)}</span>
      </div>
    )
  }
  SentMeta.css = `
.sent-meta { display: flex; gap: 20px; font-size: 12px; color: var(--darkgray); margin: 0 0 14px 0; }
.sent-meta a { color: var(--darkgray); }
.sent-meta a:hover { color: var(--secondary); }
`
  return SentMeta
}) satisfies QuartzComponentConstructor
