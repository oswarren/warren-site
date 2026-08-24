import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { resolveRelative, FullSlug } from "../../util/path"

// Right-rail blocks for notes: "on this page" (toc), "tagged", "reply".
// Each is a hairline-topped block with a dark label and grey links.

export const Tagged: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const tags: string[] = fileData.frontmatter?.tags ?? []
  if (tags.length === 0) return null
  return (
    <div class={classNames(displayClass, "rail-block", "mono")}>
      <span class="label">tagged</span>
      <div class="row">
        {tags.map((t) => (
          <a href={resolveRelative(fileData.slug!, `tags/${t}` as FullSlug)}>#{t}</a>
        ))}
      </div>
    </div>
  )
}

interface ReplyOptions {
  email: string
}
export const Reply = ((opts?: Partial<ReplyOptions>) => {
  const email = opts?.email ?? "hello@example.com"
  const Reply: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <div class={classNames(displayClass, "rail-block", "mono")}>
      <span class="label">reply</span>
      <a href={`mailto:${email}`}>email me</a>
    </div>
  )
  return Reply
}) satisfies QuartzComponentConstructor<Partial<ReplyOptions> | undefined>

// Wraps Quartz's TableOfContents so it reads "on this page" and matches the rail blocks.
export const OnThisPage = ((Toc: QuartzComponent) => {
  const OnThisPage: QuartzComponent = (props: QuartzComponentProps) => {
    if (!props.fileData.toc || props.fileData.toc.length === 0) return null
    return (
      <div class={classNames(props.displayClass, "rail-block", "mono", "on-this-page")}>
        <span class="label">on this page</span>
        <Toc {...props} />
      </div>
    )
  }
  OnThisPage.css = Toc.css
  OnThisPage.afterDOMLoaded = Toc.afterDOMLoaded
  return OnThisPage
}) satisfies QuartzComponentConstructor<QuartzComponent>

Tagged.css = `
.rail-block { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px solid var(--dark); font-size: 12px; color: var(--darkgray); }
.rail-block .label { color: var(--dark); }
.rail-block a { color: var(--darkgray); }
.rail-block a:hover { color: var(--secondary); }
.rail-block .row { display: flex; gap: 12px; flex-wrap: wrap; }
.on-this-page .toc { min-height: 0; }
.on-this-page .toc-header { display: none; }
.on-this-page ul.toc-content.overflow { margin: 0; max-height: none; }
.on-this-page ul.toc-content.overflow > li > a { opacity: 1; color: var(--darkgray); font-size: 12px; }
.on-this-page ul.toc-content.overflow > li > a.in-view { color: var(--dark); }
.on-this-page ul.toc-content.overflow > li > a:hover { color: var(--secondary); }
.on-this-page .toc-content li { margin: 0 0 4px 0; padding: 0; line-height: 1.5; }
.on-this-page .toc-content li:last-of-type { margin-bottom: 0; }
.on-this-page .toc-content .depth-2 { padding-left: 0; }
.on-this-page .toc-content .depth-3 { padding-left: 1rem; }
.on-this-page .toc-content .depth-0 { padding-left: 0; }
.on-this-page .toc-content .depth-1 { padding-left: 1rem; }
.on-this-page ul.overflow.gradient-active { mask-image: none; -webkit-mask-image: none; }
.on-this-page li.overflow-end { height: 0; margin: 0; padding: 0; }
`
