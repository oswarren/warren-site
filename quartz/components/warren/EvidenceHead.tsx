import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"

// The turn from the portfolio to the evidence. After the selected systems, the page opens the back of
// the watch: what he is doing, what the systems are doing, what runs without him and what still needs
// his hands. This is the head of that section; Now and Balance follow it. The old thesis lives here
// now, as the one dimension of the practice this section is about.
export default (() => {
  const EvidenceHead: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <section class={classNames(displayClass, "evidence-head", "reveal")}>
      <span class="label mono">running now</span>
      <h2 class="statement serif">I build small systems that run without me.</h2>
      <p class="sub">The lines that follow are kept current by the systems themselves.</p>
    </section>
  )

  EvidenceHead.css = `
.evidence-head {
  display: flex; flex-direction: column; gap: 18px;
  padding: clamp(72px, 14vh, 160px) 0 40px;
  border-top: 1px solid var(--dark);
}
.evidence-head .label { font-size: 12px; color: var(--gray); }
.evidence-head .statement { margin: 0; font-weight: 300; font-size: clamp(30px, 3.8vw, 52px); line-height: 1.08; letter-spacing: -0.02em; max-width: 18ch; text-wrap: balance; color: var(--dark); }
.evidence-head .sub { margin: 0; font-size: 16px; color: var(--darkgray); max-width: 48ch; }
`
  return EvidenceHead
}) satisfies QuartzComponentConstructor
