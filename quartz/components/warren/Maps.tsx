import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"

// Right under the statement on the home page: three maps of systems I'm running. Each map is a plain
// page in maps/ at the root, made outside Quartz and copied in by scripts/build.mjs, so the links skip
// the SPA router. Every dot shows how far along that piece is.
const MAPS = [
  {
    href: "/maps/clay.html",
    img: "/maps/clay.jpg",
    title: "Around the clay map",
    line: "A map of where to dig clay anywhere in the US, and how people find it.",
  },
  {
    href: "/maps/penny.html",
    img: "/maps/penny.jpg",
    title: "Around the Penny map",
    line: "10,000 numbered pots, and how each one gets photographed, listed and found.",
  },
  {
    href: "/maps/framework.html",
    img: "/maps/framework.jpg",
    title: "Around the Framework map",
    line: "A therapy practice’s website, and everything I built so people nearby find it.",
  },
]

export default (() => {
  const Maps: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <section class={classNames(displayClass, "maps")}>
      <div class="maps-head reveal">
        <span class="mono">Maps of what I’m running</span>
        <p>Each dot is one piece of a system, filled in as it comes along.</p>
      </div>
      <div class="maps-row">
        {MAPS.map((m) => (
          <a class="map-card reveal" href={m.href} data-router-ignore>
            <img src={m.img} alt="" loading="lazy" decoding="async" />
            <span class="map-title serif">{m.title}</span>
            <span class="map-line">{m.line}</span>
          </a>
        ))}
      </div>
    </section>
  )

  Maps.css = `
.maps { padding: clamp(48px, 9vh, 96px) 0; border-top: 1px solid var(--rule); }
.maps-head { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
.maps-head .mono { font-size: 12px; color: var(--gray); }
.maps-head p { margin: 0; font-size: 19px; line-height: 1.5; color: var(--darkgray); max-width: 46ch; }
.maps-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.map-card { display: flex; flex-direction: column; gap: 10px; color: var(--dark); background: none; }
.map-card img { width: 100%; aspect-ratio: 16 / 10; object-fit: contain; padding: 8px; display: block; background: #fbf9f5; border: 1px solid var(--rule); }
.map-card .map-title { font-weight: 300; font-size: clamp(22px, 2.2vw, 30px); line-height: 1.1; letter-spacing: -0.015em; }
.map-card .map-line { font-size: 15px; line-height: 1.5; color: var(--darkgray); }
.map-card:hover .map-title { color: var(--secondary); }
.map-card:hover img { border-color: var(--gray); }
@media all and (max-width: 860px) {
  .maps-row { grid-template-columns: 1fr; gap: 40px; }
}
`
  return Maps
}) satisfies QuartzComponentConstructor
