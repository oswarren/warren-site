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


// A tiny picture of a system's diagram for its button: the same lines and dots, no words.
const KC: Record<string, string> = { pro: "#2a78d6", cer: "#eb6834", biz: "#008300", web: "#e87ba4", ana: "#1baf7a", wri: "#eda100" }
const mini = (key: string, viewBox: string, phone: boolean) => {
  let D: any
  try {
    D = JSON.parse(fs.readFileSync(path.join(process.cwd(), "maps", key + ".json"), "utf8"))
  } catch {
    return null
  }
  const N: any[] = D.nodes || [], by: Record<string, any> = {}
  const KK = { ...KC, ...((D.theme && D.theme.colors) || {}) }
  N.forEach((d) => { by[d.id] = { ...d, kids: [] } })
  Object.values(by).forEach((d: any) => { if (d.p) { by[d.p].kids.push(d); if (!d.kind) d.kind = by[d.p].kind } })
  const centre: any = Object.values(by).find((d: any) => d.hub === 2)
  Object.values(by).forEach((h: any) => {
    if (h.hub !== 1) return
    const k = h.kids.length, G = k > 4 ? 66 : 72, lx = h.side === "l" ? 230 : 1170
    h.kids.forEach((d: any, i: number) => { if (d.x == null) { d.x = lx; d.y = h.y + (i - (k - 1) / 2) * G } })
  })
  const all: any[] = Object.values(by)
  return (
    <svg class="mini" viewBox={viewBox} aria-hidden="true">
      {all.filter((d) => d !== centre).map((d) => {
        const p = d.p ? by[d.p] : centre
        return <line x1={p.x} y1={p.y} x2={d.x} y2={d.y} />
      })}
      {all.filter((d) => d !== centre).map((d) => (
        <circle cx={d.x} cy={d.y} r={d.hub === 1 ? 22 : 15} fill={d.st === "done" ? KK[d.kind] : "var(--light)"} stroke={KK[d.kind]} stroke-width="8" />
      ))}
      {phone ? (
        <rect x={centre.x - 82} y={centre.y - 145} width="164" height="290" rx="22" fill="var(--light)" stroke="var(--dark)" stroke-width="10" />
      ) : (
        <circle cx={centre.x} cy={centre.y} r="34" fill="var(--light)" stroke={KK[centre.kind]} stroke-width="10" />
      )}
    </svg>
  )
}

// A row of big numbers for a system, taken from its own counts (maps/<key>.json "stats")
const stats = (key: string) => {
  let D: any
  try {
    D = JSON.parse(fs.readFileSync(path.join(process.cwd(), "maps", key + ".json"), "utf8"))
  } catch {
    return null
  }
  if (!D.stats) return null
  return (
    <div class="maps-stats">
      <dl>
        {D.stats.map(([v, l]: [string, string]) => (
          <div>
            <dt>{v}</dt>
            <dd>{l}</dd>
          </div>
        ))}
      </dl>
      {D.statsAsOf && <small class="mono">{D.statsAsOf}</small>}
    </div>
  )
}

// The systems shown, one at a time; the buttons swap between them. The therapy practice stays unnamed.
const SYSTEMS = [
  {
    key: "clay",
    // the paper tints toward this while the map is in view (motion.ts, data-tone)
    tone: "#ede3d3",
    name: "Wild Clay Archive",
    title: "The Wild Clay Archive system",
    intro: [
      "Wild Clay Archive is an app I made that shows where to dig clay anywhere in the US.",
      "This is the system that helps it grow.",
    ],
    viewBox: "-50 190 1450 680",
    aria: "Diagram of the Wild Clay Archive system: the app in the centre, with where people find it, numbers and launch around it.",
    phone: true,
  },
  {
    key: "penny",
    tone: "#f1e8dc",
    name: "A Penny For Your Pottery",
    title: "The A Penny For Your Pottery system",
    intro: [
      "A Penny For Your Pottery is 10,000 pots I’m making, each priced at its number in pennies.",
      "This is the system that gets each one photographed, sold and found.",
    ],
    viewBox: "-60 190 1520 736",
    aria: "Diagram of the A Penny For Your Pottery system: the 10,000 pots in the centre, with the pots, the stores, where people find them and behind the scenes around it.",
    phone: false,
  },
  {
    key: "framework",
    tone: "#e8ece4",
    name: "A therapy practice",
    title: "The therapy practice system",
    intro: [
      "A therapy practice near Philadelphia hired me to run its website.",
      "This is the system that helps more people looking for a therapist find it.",
    ],
    viewBox: "-60 190 1520 736",
    aria: "Diagram of a therapy practice’s website system: the site in the centre, with what is live, what waits for an OK, numbers and where people find the practice around it.",
    phone: false,
  },
]

// Right under the statement on the home page: a map of a system I'm running, that opens as it scrolls
// into view (maps-script.ts). Its data is maps/clay.json, read at build into the page. Every dot shows how far along that piece is.
export default (() => {
  const Maps: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <section class={classNames(displayClass, "maps")}>
      <div class="maps-head">
        <span class="mono">Systems I’m running</span>
        <div class="maps-tabs" role="tablist" aria-label="Pick a system">
          {SYSTEMS.map((s, i) => (
            <button
              type="button"
              class="maps-tab"
              role="tab"
              data-sys={s.key}
              aria-selected={i === 0 ? "true" : "false"}
            >
              {mini(s.key, s.viewBox, s.phone)}
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
      {SYSTEMS.map((s, i) => (
        <div class="maps-sys" data-sys={s.key} data-tone={s.tone} role="tabpanel" hidden={i !== 0}>
          <div class="maps-text">
            <h2 class="serif">{s.title}</h2>
            {s.intro.map((t) => (
              <p>{t}</p>
            ))}
          </div>
          {stats(s.key)}
          <div class="omap">
            <script
              type="application/json"
              class="omap-data"
              dangerouslySetInnerHTML={{ __html: readMap(s.key) }}
            />
            <div class="omap-stage">
              <div class="omap-canvas">
                <svg viewBox={s.viewBox} role="group" aria-label={s.aria}></svg>
                {s.phone && (
                  /* the app itself sits at the centre of the diagram, on a phone you can scroll */
                  <div
                    class="omap-phone"
                    tabindex={0}
                    aria-label="Wild Clay Archive on a phone. Scroll to read the whole page. Tap to fold the system in or out."
                  >
                    <img
                      src="./maps/wca-phone.jpg"
                      alt="The Wild Clay Archive map on a phone, showing soil around Seagrove, North Carolina, with Georgeville soil marked as a strong lead."
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
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
                <svg class="k-auto" viewBox="-12 -4 24 8" aria-hidden="true">
                  <path class="flow" d="M12 0 H-12" />
                </svg>
                Runs on its own
              </span>
            </div>
          </div>
        </div>
      ))}
      <script dangerouslySetInnerHTML={{ __html: mapsScript }} />
    </section>
  )

  Maps.css = `
.maps { padding: clamp(48px, 9vh, 96px) 0; border-top: 1px solid var(--rule); }
.maps-head { display: flex; flex-direction: column; gap: 14px; margin-bottom: 22px; }
.maps-tabs { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; max-width: 980px; }
.maps-tab { font: inherit; display: flex; flex-direction: column; gap: 8px; align-items: stretch; text-align: left; padding: 10px 10px 12px; border-radius: 10px; border: 1.5px solid var(--lightgray); background: none; color: var(--dark); cursor: pointer; transition: border-color .15s, background .15s; }
.maps-tab span { font-size: 14px; font-weight: 500; line-height: 1.25; }
.maps-tab .mini { display: block; width: 100%; height: auto; aspect-ratio: 2 / 1; }
.maps-tab .mini line { stroke: var(--lightgray); stroke-width: 5; }
.maps-tab[aria-selected="true"] { border-color: var(--dark); }
.maps-tab:hover:not([aria-selected="true"]) { border-color: var(--gray); }
.maps-tab:focus-visible { outline: 3px solid var(--secondary); outline-offset: 2px; }
@media all and (max-width: 720px) { .maps-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; } .maps-tab span { font-size: 13px; } }
.maps-sys[hidden] { display: none; }
.maps-stats { margin: 4px 0 28px; }
.maps-stats dl { display: flex; flex-wrap: wrap; gap: 18px 44px; margin: 0; }
.maps-stats dl div { display: flex; flex-direction: column; gap: 2px; }
.maps-stats dt { font-weight: 300; font-size: clamp(30px, 3.4vw, 46px); line-height: 1; letter-spacing: -0.02em; color: var(--dark); }
.maps-stats dd { margin: 0; font-size: 14px; color: var(--gray); }
.maps-stats small { display: block; margin-top: 12px; font-size: 12px; color: var(--gray); }
@media all and (max-width: 720px) { .maps-stats dl { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; } }
.maps-text { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.maps-text h2 { margin: 0; font-weight: 300; font-size: clamp(30px, 3.8vw, 54px); line-height: 1.05; letter-spacing: -0.02em; color: var(--dark); }
.maps-text p + p { margin-top: 0.75em; }
.maps-text p { margin: 0; font-size: 19px; line-height: 1.5; color: var(--darkgray); max-width: 52ch; }
/* the phone takes the app's place in the diagram: the app sits at 700,520 in the viewBox (-50 190 1450 680),
   and the phone is 290 units tall, so it spans x 618 to 782 and y 375 to 665 */
.omap-canvas { position: relative; min-width: 760px; }
.omap-phone {
  position: absolute; z-index: 1; cursor: pointer; left: 46.103%; top: 27.206%; width: 11.25%; height: 42.647%; box-sizing: border-box;
  border: 4px solid var(--dark); border-radius: 16px; background: var(--lightgray);
  overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
  box-shadow: 0 10px 30px rgba(22, 24, 26, 0.10);
}
.omap-phone::-webkit-scrollbar { display: none; }
.omap-phone img { display: block; width: 100%; height: auto; }
.omap-phone:focus-visible { outline: 3px solid var(--secondary); outline-offset: 3px; }
.maps-head .mono { font-size: 12px; color: var(--gray); }

.omap-stage { overflow-x: auto; overscroll-behavior-x: contain; margin-top: 8px; }
.omap-stage svg { display: block; width: 100%; height: auto; }

/* the outline that lifts a label off the lines is the page's own colour, tint included */
.omap text { font-family: var(--bodyFont); fill: var(--dark); paint-order: stroke; stroke: var(--tone, var(--light)); stroke-width: 5px; stroke-linejoin: round; transition: stroke 1400ms ease; }
.omap .t-hub { font-size: 26px; font-weight: 500; }
.omap .t-leaf { font-size: 19px; }
.omap .t-sub { font-size: 15px; fill: var(--gray); }
.omap .d-bg { fill: var(--omap-dot, var(--light)); }
.omap .e { fill: none; stroke: var(--omap-edge, var(--lightgray)); stroke-width: 1.5; stroke-dasharray: var(--len); stroke-dashoffset: var(--len); transition: stroke-dashoffset .55s cubic-bezier(.16,1,.3,1); }
.omap .e.on { stroke-dashoffset: 0; }
.omap .e.plan.on { stroke-dasharray: 4 4; }
.omap .e.now { stroke: var(--omap-now, var(--dark)); stroke-width: var(--omap-noww, 2.5); }
.omap .e.now.on { stroke-dasharray: var(--omap-nowdash, none); }
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
/* the owner's private note under a card (maps-script.ts, priv): shows only on the claude.ai copy of the page */
.omap-note { display: block; width: 100%; margin-top: 8px; padding: 8px 10px; box-sizing: border-box; font: inherit; font-size: 14.5px; line-height: 1.45; color: var(--darkgray); background: var(--omap-dot, var(--light)); border: 1px solid var(--lightgray); border-radius: 8px; resize: vertical; }
.omap-note:focus { outline: 2px solid var(--dark); outline-offset: 1px; }
.omap-note-st { min-height: 1.2em; margin-top: 4px; font-size: 12px; color: var(--gray); }

.maps-meanwhile { margin-top: clamp(40px, 7vh, 72px); display: flex; flex-direction: column; gap: 8px; }
.maps-meanwhile .mono { font-size: 12px; color: var(--gray); }
.maps-meanwhile p { margin: 0; font-weight: 300; font-size: clamp(30px, 3.8vw, 54px); line-height: 1.1; letter-spacing: -0.02em; color: var(--dark); }
.maps-meanwhile .ing { display: inline-block; font-style: italic; transition: opacity .35s ease, transform .35s ease; }
.maps-meanwhile .ing.out { opacity: 0; transform: translateY(8px); }
.maps-meanwhile .mw-pic { display: inline-block; height: 1.05em; width: 1.4em; object-fit: cover; border-radius: .18em; vertical-align: -0.12em; margin: 0 .08em 0 .1em; transition: opacity .35s ease; }
.maps-meanwhile .mw-pic.out { opacity: 0; }
.maps-meanwhile .mw-w { white-space: nowrap; }
@media all and (max-width: 720px) { .maps-meanwhile p { font-size: 26px; } }
.omap-key { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 20px; font-size: 12px; color: var(--gray); }
.omap-key span { display: inline-flex; align-items: center; gap: 7px; }
.omap-key .k { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid var(--dark); display: inline-block; box-sizing: border-box; }
.omap-key .k.plan { border-style: dashed; border-color: var(--gray); }
.omap-key .k.now { background: linear-gradient(90deg, var(--dark) 50%, transparent 50%); }
.omap-key .k.done { background: var(--dark); }
/* a piece that runs on its own: its line is a row of black dots moving toward the branch, like the key */
.omap .e.auto { stroke: transparent; }
.omap .flow { fill: none; stroke: var(--omap-now, var(--dark)); stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 0 7; opacity: 0; transition: opacity .4s .5s; animation: omap-flow .9s linear infinite; }
.omap .e.on + .flow, .omap .state .flow, .omap-key .flow { opacity: 1; }
.omap-key .k-auto { width: 24px; height: 8px; overflow: visible; }
.omap .state .flow { stroke-width: 2.5; stroke-dasharray: 0 7; animation-duration: .9s; }
.omap-key .k-auto .flow { stroke: var(--dark); stroke-width: 2.5; stroke-dasharray: 0 7; animation-duration: .9s; }
.omap .state svg:has(.flow) { width: 22px; }
@keyframes omap-flow { to { stroke-dashoffset: -14; } }

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
  .omap .flow { animation: none; }
}
`
  Maps.afterDOMLoaded = mapsScript
  return Maps
}) satisfies QuartzComponentConstructor
