import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { resolveRelative, simplifySlug } from "../../util/path"
import { readBuild, ymd, hhmm } from "./data"

// linked from / last edited / rendered — the provenance grid under a note.
interface Options {
  builder: string
}
const defaultOptions: Options = { builder: "build.mjs → quartz" }

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const ProvenanceFooter: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const simple = simplifySlug(slug)
    const backlinks = allFiles.filter((f) => f.slug !== slug && f.links?.includes(simple))
    const edited = fileData.dates?.modified ?? fileData.dates?.created
    const by = (fileData.frontmatter?.source as string | undefined) ?? "by hand"
    const b = readBuild()
    return (
      <div class={classNames(displayClass, "provenance", "mono")}>
        <div class="grid">
          <span>linked from</span>
          <div class="from">
            {backlinks.length > 0 ? (
              backlinks.map((f) => (
                <a href={resolveRelative(slug, f.slug!)}>
                  {(f.frontmatter?.shortTitle as string | undefined) ?? f.frontmatter?.title ?? f.slug}
                </a>
              ))
            ) : (
              <span>nothing yet</span>
            )}
          </div>
          <span>last edited</span>
          <span>{edited ? `${ymd(edited)} ${hhmm(edited)}` : "unknown"} · {by}</span>
          <span>rendered</span>
          <span>{ymd(b.when)} {hhmm(b.when)} · {opts.builder}</span>
        </div>
      </div>
    )
  }
  ProvenanceFooter.css = `
.provenance { font-size: 12px; color: var(--darkgray); padding-top: 20px; border-top: 1px solid var(--dark); margin-top: 28px; }
.provenance .grid { display: grid; grid-template-columns: 120px 1fr; gap: 6px 16px; }
.provenance .from { display: flex; flex-direction: column; gap: 4px; }
.provenance a { color: var(--darkgray); }
.provenance a:hover { color: var(--secondary); }
`
  return ProvenanceFooter
}) satisfies QuartzComponentConstructor<Partial<Options> | undefined>
