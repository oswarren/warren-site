import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { mapsScript } from "./maps-script"

// Right under the statement on the home page: a map of a system I'm running, that opens as it scrolls
// into view (maps-script.ts). Its data is maps/clay.json, copied into public/ by scripts/build.mjs beside
// the map's own page. Every dot shows how far along that piece is.
export default (() => {
  const Maps: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <section class={classNames(displayClass, "maps")}>
      <div class="maps-head reveal">
        <span class="mono">Maps of what I’m running</span>
        <h2 class="serif">Around the clay map</h2>
        <p>
          A map of where to dig clay anywhere in the US, and the system that helps people find it.
          Each dot is one piece, filled in as it comes along.
        </p>
      </div>
      <div class="omap" data-src="./maps/clay.json">
        <div class="omap-bar">
          <span class="omap-hint mono" aria-live="polite"></span>
        </div>
        <div class="omap-stage">
          <svg
            viewBox="-50 50 1450 870"
            role="group"
            aria-label="Map of the Wild Clay Archive: the app in the centre, with where people find it, the portfolio, numbers and launch around it."
          ></svg>
        </div>
        <div class="omap-panel" aria-live="polite"></div>
        <div class="omap-key mono">
          <span>
            <i class="k plan"></i>Planned
          </span>
          <span>
            <i class="k built"></i>Built, needs work
          </span>
          <span>
            <i class="k now"></i>Refining now
          </span>
          <span>
            <i class="k done"></i>Done
          </span>
        </div>
      </div>
    </section>
  )

  Maps.css = `
.maps { padding: clamp(48px, 9vh, 96px) 0; border-top: 1px solid var(--rule); }
.maps-head { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.maps-head .mono { font-size: 12px; color: var(--gray); }
.maps-head h2 { margin: 0; font-weight: 300; font-size: clamp(30px, 3.8vw, 54px); line-height: 1.05; letter-spacing: -0.02em; color: var(--dark); }
.maps-head p { margin: 0; font-size: 19px; line-height: 1.5; color: var(--darkgray); max-width: 52ch; }

.omap-bar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 16px; min-height: 32px; }
.omap-hint { font-size: 13px; color: var(--secondary); }
.omap-stage { overflow-x: auto; overscroll-behavior-x: contain; margin-top: 8px; }
.omap-stage svg { display: block; width: 100%; min-width: 760px; height: auto; }

.omap text { font-family: var(--bodyFont); fill: var(--dark); paint-order: stroke; stroke: var(--light); stroke-width: 5px; stroke-linejoin: round; }
.omap .t-hub { font-size: 26px; font-weight: 500; }
.omap .t-leaf { font-size: 19px; }
.omap .t-sub { font-size: 15px; fill: var(--gray); }
.omap .d-bg { fill: var(--light); }
.omap .e { fill: none; stroke: var(--lightgray); stroke-width: 1.5; stroke-dasharray: var(--len); stroke-dashoffset: var(--len); transition: stroke-dashoffset .55s cubic-bezier(.16,1,.3,1); }
.omap .e.on { stroke-dashoffset: 0; }
.omap .e.plan.on { stroke-dasharray: 4 4; }
.omap .e.now { stroke: var(--dark); stroke-width: 2.5; }
.omap .n { opacity: 0; pointer-events: none; cursor: pointer; transition: opacity .35s ease; }
.omap .n .in { transform: scale(.3); transition: transform .45s cubic-bezier(.16,1,.3,1); transition-delay: inherit; }
.omap .n.on { opacity: 1; pointer-events: auto; }
.omap .n.on .in { transform: scale(1); }
.omap .n .hit { fill: transparent; }
.omap .n .ring { fill: none; stroke: var(--dark); stroke-width: 1.5; opacity: 0; transition: opacity .2s; }
.omap .n.sel .ring { opacity: 1; }
.omap .n:focus { outline: none; }
.omap .n:focus-visible .ring { opacity: 1; stroke: var(--secondary); stroke-width: 3; }
/* the closed centre breathes a little, so it reads as something to tap */
.omap .n.opens.on:not(.open) .ring { animation: omap-pulse 2.4s ease-in-out infinite; }
@keyframes omap-pulse { 0%, 100% { opacity: 0; } 50% { opacity: .55; } }

.omap-panel { margin-top: 12px; display: grid; grid-template-columns: minmax(0, 240px) minmax(0, 1fr); gap: 10px 24px; max-width: 1000px; }
.omap-panel:not(:empty) { border-top: 1px solid var(--rule); padding-top: 16px; }
.omap-panel > div { min-width: 0; }
.omap-name b { display: block; font-weight: 500; font-size: 18px; color: var(--dark); }
.omap-name span { display: block; font-size: 14px; color: var(--gray); }
.omap-body p { margin: 0; max-width: 68ch; color: var(--darkgray); }
.omap .lbl { margin-top: 18px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); }
.omap .opts, .omap .gate { margin: 8px 0 0; padding: 0; list-style: none; font-size: 14.5px; max-width: 820px; }
.omap .opts li { padding: 7px 0; border-bottom: 1px solid var(--rule); }
.omap .gate { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 24px; }
.omap .gate li { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; }
.omap .gate li::before { content: ""; width: 10px; height: 10px; border: 1.5px solid var(--dark); border-radius: 2px; margin-top: 6px; }
.omap .steps { display: flex; flex-direction: column; margin-top: 6px; max-width: 820px; }
.omap .steps > div { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--rule); }
.omap .steps svg, .omap .state svg { width: 16px; height: 16px; margin-top: 4px; overflow: visible; }
.omap .steps small { display: block; color: var(--gray); font-size: 14px; }
.omap .shape { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 8px; max-width: 820px; font-size: 14.5px; }
.omap .shape div { border-top: 2px solid var(--dark); padding-top: 6px; }
.omap .state { display: inline-flex; align-items: center; gap: 7px; margin-top: 10px; font-size: 14px; color: var(--gray); }
.omap .state svg { margin-top: 0; width: 14px; height: 14px; }

.omap-key { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 20px; font-size: 12px; color: var(--gray); }
.omap-key span { display: inline-flex; align-items: center; gap: 7px; }
.omap-key .k { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid var(--dark); display: inline-block; box-sizing: border-box; }
.omap-key .k.plan { border-style: dashed; border-color: var(--gray); }
.omap-key .k.now { background: linear-gradient(90deg, var(--dark) 50%, transparent 50%); }
.omap-key .k.done { background: var(--dark); }

@media all and (max-width: 720px) {
  .omap-stage svg { min-width: 1000px; }
  .omap-panel { grid-template-columns: 1fr; }
  .omap .gate, .omap .shape { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .omap .e, .omap .n, .omap .n .in { transition: none; }
  .omap .n.opens.on:not(.open) .ring { animation: none; }
}
`
  Maps.afterDOMLoaded = mapsScript
  return Maps
}) satisfies QuartzComponentConstructor
