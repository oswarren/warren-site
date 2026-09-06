import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { runsAttr } from "./data"

// The opening viewport of the home page: the statement, and one clue that the page is alive.
// The clue is real and it moves: the name of the next system that will run without him, counting
// down every second (motion.ts). Nothing else. The statement is the page's title in content/index.md.
export default (() => {
  const Hero: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const title = (fileData.frontmatter?.title as string | undefined) ?? ""
    const runs = runsAttr(allFiles)
    return (
      <section class={classNames(displayClass, "hero")}>
        <h1 class="thesis serif">{title}</h1>
        {runs && (
          <p class="alive mono" data-runs={runs} aria-live="off">
            &nbsp;
          </p>
        )}
      </section>
    )
  }

  Hero.css = `
.hero {
  min-height: calc(100vh - 120px);
  min-height: calc(100svh - 120px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 48px;
  padding: 8vh 0 6vh;
}
.hero .thesis {
  margin: 0;
  font-weight: 300;
  font-size: clamp(44px, 7.4vw, 108px);
  line-height: 1.0;
  letter-spacing: -0.028em;
  max-width: 14ch;
  text-wrap: balance;
  color: var(--dark);
}
.hero .alive {
  margin: 0;
  margin-top: auto;
  font-size: 13px;
  color: var(--darkgray);
  font-variant-numeric: tabular-nums;
  min-height: 1.4em;
}
@media all and (max-width: 720px) {
  .hero { min-height: calc(100svh - 140px); gap: 36px; }
  .hero .thesis { font-size: clamp(40px, 12vw, 64px); max-width: 12ch; }
}
`
  return Hero
}) satisfies QuartzComponentConstructor
