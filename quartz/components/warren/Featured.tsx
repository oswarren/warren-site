import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, slugifyFilePath, FilePath, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { readProjects } from "./data"

// The selected systems on the home page. One per project page that carries `featured` in its
// frontmatter, in that order. Each gets a whole section: a number, the title, the one sentence on
// what the system makes possible, and one real artifact (a photograph, a screenshot of the system in
// use, or a piece of what it produced, as text). Compositions alternate so the page does not read as
// a grid, and each section tints the paper toward its own colour while it is in view.
const pad = (n: number) => String(n).padStart(2, "0")

export default (() => {
  const Featured: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const projects = readProjects(allFiles).filter((p) => typeof p.featured === "number")
    if (projects.length === 0) return null
    return (
      <div class={classNames(displayClass, "featured")}>
        {projects.map((p, i) => {
          const href = resolveRelative(slug, p.slug as FullSlug)
          const art = p.artifact
            ? resolveRelative(slug, slugifyFilePath(p.artifact as FilePath) as FullSlug)
            : undefined
          const flip = i % 2 === 1
          return (
            <article
              class={classNames(
                undefined,
                "feat",
                flip ? "flip" : "",
                p.excerpt && !art ? "text" : "image",
              )}
              data-tone={p.tone}
            >
              <div class="feat-text reveal">
                <span class="num mono">{pad(i + 1)}</span>
                <h2 class="feat-title serif">
                  <a href={href}>{p.title}</a>
                </h2>
                <p class="feat-effect">{p.effect}</p>
                <a href={href} class="enter">
                  See the system
                </a>
              </div>
              <figure class="feat-art reveal" data-drift>
                {art ? (
                  <a href={href} tabindex={-1} aria-hidden="true">
                    <img
                      src={art}
                      alt={p.alt ?? ""}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </a>
                ) : (
                  <blockquote class={p.mono ? "excerpt mono" : "excerpt serif"}>
                    {p.excerpt}
                  </blockquote>
                )}
                {p.source && <figcaption class="mono">{p.source}</figcaption>}
              </figure>
            </article>
          )
        })}
      </div>
    )
  }

  Featured.css = `
.featured { display: flex; flex-direction: column; }
.feat {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 32px;
  align-items: center;
  padding: clamp(64px, 12vh, 140px) 0;
  border-top: 1px solid var(--rule);
}
.feat:first-child { border-top: 0; }
.feat .feat-text { grid-column: 1 / span 5; display: flex; flex-direction: column; gap: 18px; }
.feat .feat-art { grid-column: 7 / span 6; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.feat.flip .feat-text { grid-column: 8 / span 5; order: 2; }
.feat.flip .feat-art { grid-column: 1 / span 6; order: 1; }

.feat .num { font-size: 12px; color: var(--gray); }
.feat .feat-title { margin: 0; font-weight: 300; font-size: clamp(30px, 3.8vw, 54px); line-height: 1.05; letter-spacing: -0.02em; text-wrap: balance; }
.feat .feat-title a { color: var(--dark); }
.feat .feat-title a:hover { color: var(--secondary); }
.feat .feat-effect { margin: 0; font-size: 19px; line-height: 1.5; color: var(--darkgray); max-width: 40ch; }
.feat .enter { align-self: flex-start; margin-top: 8px; font-size: 14px; color: var(--dark); border-bottom: 1px solid var(--gray); padding-bottom: 2px; }
.feat .enter:hover { color: var(--secondary); border-color: var(--secondary); }
.feat .enter::after { content: "\\2192"; margin-left: 8px; color: var(--gray); }

.feat img { width: 100%; height: auto; display: block; }
.feat.image:first-child .feat-art img { max-height: 78vh; width: auto; max-width: 100%; margin: 0 auto; }
.feat figcaption { font-size: 12px; color: var(--gray); }
.feat .excerpt {
  margin: 0; padding: 0 0 0 22px; border-left: 1px solid var(--dark);
  font-weight: 300; font-size: clamp(18px, 1.6vw, 22px); line-height: 1.5; color: var(--dark);
  white-space: pre-line;
}
.feat .excerpt.mono { font-size: 13px; line-height: 1.7; color: var(--darkgray); border-left-color: var(--lightgray); }
@media all and (max-width: 860px) {
  .feat, .feat.flip { grid-template-columns: 1fr; padding: 56px 0; }
  .feat .feat-text, .feat.flip .feat-text { grid-column: 1; order: 1; }
  .feat .feat-art, .feat.flip .feat-art { grid-column: 1; order: 2; }
  .feat.image:first-child .feat-art img { max-height: 70vh; }
}
`
  return Featured
}) satisfies QuartzComponentConstructor
