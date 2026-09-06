import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { runsAttr } from "./data"

// The home page's close: back to the idea, quietly, then the two ways in. The countdown from the
// top of the page is here again, still running, so the page continues rather than concludes.
export default (() => {
  const Ending: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const runs = runsAttr(allFiles)
    return (
      <section class={classNames(displayClass, "ending")}>
        <p class="echo serif reveal">Ideas travel farther when something carries them.</p>
        <div class="paths reveal">
          <a class="path" href={resolveRelative(slug, "work-with-me" as FullSlug)}>
            <span class="mono">Have an idea</span>
            <span class="big serif">Work with me</span>
          </a>
          <a class="path" href={resolveRelative(slug, "use" as FullSlug)}>
            <span class="mono">Want something that already exists</span>
            <span class="big serif">Use something I've built</span>
          </a>
        </div>
        {runs && (
          <p class="alive mono" data-runs={runs} aria-live="off">
            &nbsp;
          </p>
        )}
      </section>
    )
  }

  Ending.css = `
.ending {
  display: flex; flex-direction: column; gap: 56px;
  padding: clamp(96px, 18vh, 200px) 0 clamp(64px, 12vh, 120px);
  border-top: 1px solid var(--dark);
}
.ending .echo { margin: 0; font-weight: 300; font-size: clamp(28px, 3.6vw, 48px); line-height: 1.1; letter-spacing: -0.02em; max-width: 20ch; text-wrap: balance; color: var(--dark); }
.ending .paths { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 48px; }
.ending .path { display: flex; flex-direction: column; gap: 10px; padding: 28px 0; border-top: 1px solid var(--dark); }
.ending .path .mono { font-size: 12px; color: var(--gray); }
.ending .path .big { font-weight: 300; font-size: clamp(26px, 2.8vw, 38px); line-height: 1.1; letter-spacing: -0.015em; color: var(--dark); }
.ending .path:hover .big { color: var(--secondary); }
.ending .path .big::after { content: "\\2192"; margin-left: 12px; color: var(--gray); font-family: var(--sans); font-size: 0.7em; }
.ending .alive { margin: 24px 0 0; font-size: 13px; color: var(--darkgray); font-variant-numeric: tabular-nums; min-height: 1.4em; }
@media all and (max-width: 720px) {
  .ending .paths { grid-template-columns: 1fr; gap: 0; }
}
`
  return Ending
}) satisfies QuartzComponentConstructor
