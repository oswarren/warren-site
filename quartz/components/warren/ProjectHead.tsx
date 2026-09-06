import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, slugifyFilePath, FilePath, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"

// The top of a project page, under its title: the one sentence on what the system makes possible,
// the real artifact, and the way into the real thing. The narrative (the curiosity, what it does, the
// system itself, cause and effect, what changed) is the page's own markdown, which follows this.
// Rendered on any page whose frontmatter carries `effect`.
export default (() => {
  const ProjectHead: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const fm = (fileData.frontmatter ?? {}) as Record<string, any>
    if (typeof fm.effect !== "string") return null
    const slug = fileData.slug!
    const art = fm.artifact
      ? resolveRelative(slug, slugifyFilePath(String(fm.artifact) as FilePath) as FullSlug)
      : undefined
    return (
      <div class={classNames(displayClass, "project-head")}>
        <p class="effect serif">{fm.effect}</p>
        {fm.url && (
          <a class="open" href={String(fm.url)}>
            {String(fm.open ?? "Open the real thing")}
          </a>
        )}
        {art ? (
          <figure class="art reveal" data-drift>
            <img src={art} alt={String(fm.alt ?? "")} loading="eager" decoding="async" />
            {fm.source && <figcaption class="mono">{String(fm.source)}</figcaption>}
          </figure>
        ) : fm.excerpt ? (
          <figure class="art reveal">
            <blockquote class={fm.mono === true ? "excerpt mono" : "excerpt serif"}>
              {String(fm.excerpt)}
            </blockquote>
            {fm.source && <figcaption class="mono">{String(fm.source)}</figcaption>}
          </figure>
        ) : null}
      </div>
    )
  }

  ProjectHead.css = `
.project-head { display: flex; flex-direction: column; gap: 22px; margin-top: 22px; }
.project-head .effect { margin: 0; font-weight: 300; font-size: clamp(22px, 2.6vw, 34px); line-height: 1.25; letter-spacing: -0.015em; max-width: 30ch; text-wrap: pretty; color: var(--darkgray); }
.project-head .open { align-self: flex-start; font-size: 14px; color: var(--dark); border-bottom: 1px solid var(--gray); padding-bottom: 2px; }
.project-head .open:hover { color: var(--secondary); border-color: var(--secondary); }
.project-head .open::after { content: "\\2192"; margin-left: 8px; color: var(--gray); }
.project-head .art { margin: 40px 0 8px; display: flex; flex-direction: column; gap: 10px; }
/* align-self matters: .art is a column flex container, so without it the image stretches to the full
   column width, and max-height then squashes a tall photo flat instead of scaling it down. */
.project-head .art img { max-width: 100%; width: auto; height: auto; align-self: flex-start; display: block; max-height: 82vh; }
.project-head figcaption { font-size: 12px; color: var(--gray); }
.project-head .excerpt.mono { font-size: 13px; line-height: 1.7; color: var(--darkgray); border-left-color: var(--lightgray); }
.project-head .excerpt { margin: 0; padding: 0 0 0 22px; border-left: 1px solid var(--dark); font-weight: 300; font-size: clamp(18px, 1.6vw, 22px); line-height: 1.5; color: var(--dark); white-space: pre-line; max-width: 64ch; }
`
  return ProjectHead
}) satisfies QuartzComponentConstructor
