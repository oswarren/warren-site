import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import fs from "fs"
import path from "path"
import { mapsScript } from "./maps-script"

// the map's data goes into the page itself, so nothing has to be fetched to draw it
const readMap = (name: string) => {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), "maps", name + ".json"), "utf8")
      .replace(/</g, "\\u003c")
  } catch {
    return "{}"
  }
}

// Right under the statement on the home page: a map of a system I'm running, that opens as it scrolls
// into view (maps-script.ts). Its data is maps/clay.json, read at build into the page. Every dot shows how far along that piece is.
export default (() => {
  const Maps: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <section class={classNames(displayClass, "maps")}>
      <div class="maps-head">
        <div class="maps-text">
          <span class="mono">Systems I’m running</span>
          <h2 class="serif">The Wild Clay Archive system</h2>
          <p>
            Wild Clay Archive is an app I made that shows where to dig clay anywhere in the US.
          </p>
          <p>
            This is the system that helps it grow.
          </p>
        </div>
      </div>
      <div class="omap">
        <script
          type="application/json"
          class="omap-data"
          dangerouslySetInnerHTML={{ __html: readMap("clay") }}
        />
        <div class="omap-stage">
          <div class="omap-canvas">
            <svg
              viewBox="-50 190 1450 680"
              role="group"
              aria-label="Diagram of the Wild Clay Archive system: the app in the centre, with where people find it, numbers and launch around it."
            ></svg>
            {/* the app itself sits at the centre of the diagram, on a phone you can scroll */}
            <div
              class="omap-phone"
              tabindex={0}
              aria-label="Wild Clay Archive on a phone. Scroll to read the whole page."
            >
              <img
                src="./maps/wca-phone.jpg"
                alt="The Wild Clay Archive map on a phone, showing soil around Seagrove, North Carolina, with Georgeville soil marked as a strong lead."
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
        <div class="omap-pop" role="dialog" aria-live="polite" hidden></div>
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
          <span>
            <svg class="k-auto" viewBox="-8 -8 16 16" aria-hidden="true">
              <path d="M3.6 -2.2 A4.2 4.2 0 1 0 4.2 0.9" />
              <path d="M4.9 -4.3 L3.7 -2 L1.3 -2.8" />
            </svg>
            Runs on its own
          </span>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: mapsScript }} />
    </section>
  )

  Maps.css = `
.maps { padding: clamp(48px, 9vh, 96px) 0; border-top: 1px solid var(--rule); }
.maps-head { margin-bottom: 20px; }
.maps-text { display: flex; flex-direction: column; gap: 10px; }
/* the phone takes the app's place in the diagram: the app sits at 700,520 in the viewBox (-50 190 1450 680),
   and the phone is 290 units tall, so it spans x 618 to 782 and y 375 to 665 */
.omap-canvas { position: relative; min-width: 760px; }
.omap-phone {
  position: absolute; z-index: 1; left: 46.103%; top: 27.206%; width: 11.25%; height: 42.647%; box-sizing: border-box;
  border: 4px solid var(--dark); border-radius: 16px; background: var(--lightgray);
  overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
  box-shadow: 0 10px 30px rgba(22, 24, 26, 0.10);
}
.omap-phone::-webkit-scrollbar { display: none; }
.omap-phone img { display: block; width: 100%; height: auto; }
.omap-phone:focus-visible { outline: 3px solid var(--secondary); outline-offset: 3px; }
.maps-head .mono { font-size: 12px; color: var(--gray); }
.maps-head h2 { margin: 0; font-weight: 300; font-size: clamp(30px, 3.8vw, 54px); line-height: 1.05; letter-spacing: -0.02em; color: var(--dark); }
.maps-head p + p { margin-top: 0.75em; }
.maps-head p { margin: 0; font-size: 19px; line-height: 1.5; color: var(--darkgray); max-width: 52ch; }

.omap-stage { overflow-x: auto; overscroll-behavior-x: contain; margin-top: 8px; }
.omap-stage svg { display: block; width: 100%; height: auto; }

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

.omap { position: relative; }
.omap-pop {
  position: absolute; z-index: 5; width: min(420px, 100%);
  max-height: min(70vh, 640px); overflow-y: auto; overscroll-behavior: contain;
  background: var(--light); border: 1px solid var(--lightgray); border-radius: 10px;
  box-shadow: 0 12px 40px rgba(22, 24, 26, 0.12); padding: 18px 20px 20px;
  animation: omap-pop .22s cubic-bezier(.16,1,.3,1);
}
.omap-pop[hidden] { display: none; }
@keyframes omap-pop { from { opacity: 0; transform: translateY(6px); } }
.omap-x { position: absolute; top: 8px; right: 10px; font: inherit; font-size: 22px; line-height: 1; color: var(--gray); background: none; border: 0; padding: 4px 6px; cursor: pointer; }
.omap-x:hover { color: var(--dark); }
.omap-name { padding-right: 28px; margin-bottom: 8px; }
.omap-name b { display: block; font-weight: 500; font-size: 18px; color: var(--dark); }
.omap-name span { display: block; font-size: 14px; color: var(--gray); }
.omap-body p { margin: 0; max-width: 68ch; color: var(--darkgray); }
.omap-link { display: block; width: fit-content; margin-top: 14px; padding: 8px 14px; border: 1.5px solid var(--dark); border-radius: 999px; font-size: 15px; font-weight: 500; color: var(--dark); text-decoration: none; transition: background .15s, color .15s; }
.omap-link:hover, .omap-link:focus-visible { background: var(--dark); color: var(--light); }
.omap-inline { color: var(--dark); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
.omap-inline:hover { text-decoration-thickness: 2.5px; }
.omap .lbl { margin-top: 18px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); }
.omap .opts, .omap .gate { margin: 8px 0 0; padding: 0; list-style: none; font-size: 14.5px; max-width: 820px; }
.omap .opts li { padding: 7px 0; border-bottom: 1px solid var(--rule); }
.omap .gate { display: grid; grid-template-columns: 1fr; gap: 4px; }
.omap .gate li { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; }
.omap .gate li::before { content: ""; width: 10px; height: 10px; border: 1.5px solid var(--dark); border-radius: 2px; margin-top: 6px; }
.omap .steps { display: flex; flex-direction: column; margin-top: 6px; max-width: 820px; }
.omap .steps > div { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--rule); }
.omap .steps svg, .omap .state svg { width: 16px; height: 16px; margin-top: 4px; overflow: visible; }
.omap .steps small { display: block; color: var(--gray); font-size: 14px; }
.omap .shape { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 8px; max-width: 820px; font-size: 14.5px; }
.omap .shape div { border-top: 2px solid var(--dark); padding-top: 6px; }
.omap .state { display: inline-flex; align-items: center; gap: 7px; margin: 10px 18px 0 0; font-size: 14px; color: var(--gray); }
.omap .state svg { margin-top: 0; width: 14px; height: 14px; }

.omap-key { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 20px; font-size: 12px; color: var(--gray); }
.omap-key span { display: inline-flex; align-items: center; gap: 7px; }
.omap-key .k { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid var(--dark); display: inline-block; box-sizing: border-box; }
.omap-key .k.plan { border-style: dashed; border-color: var(--gray); }
.omap-key .k.now { background: linear-gradient(90deg, var(--dark) 50%, transparent 50%); }
.omap-key .k.done { background: var(--dark); }
.omap .auto path, .omap-key .k-auto path { fill: none; stroke: var(--dark); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.omap-key .k-auto { width: 15px; height: 15px; overflow: visible; }

@media all and (max-width: 720px) {
  /* phones get the top-to-bottom version (maps-script.ts), so nothing scrolls sideways */
  .omap-canvas { min-width: 0; }
  .omap.vert .omap-canvas { display: flex; flex-direction: column; }
  .omap.vert .omap-phone { order: -1; position: static; display: block; width: 36%; height: auto; aspect-ratio: 9 / 16; border-width: 4px; border-radius: 18px; }
  .omap-pop { position: fixed; left: 0; right: 0; bottom: 0; top: auto; width: auto; max-height: 62vh; border-radius: 14px 14px 0 0; border-width: 1px 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
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
