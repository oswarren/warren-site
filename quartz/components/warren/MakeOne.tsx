import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { makeOneScript } from "./make-one-script"

// The commission page. A visitor says what they keep meaning to do; the page designs one small system
// for it and shows it being built, then hands them a written email if they want it made for real.
// The markup is static; makeone.ts wires it on the client and calls the design endpoint.
//
// The shelf is written here rather than read from tools.json on purpose: tools.json is the portfolio of
// what runs, this is the list of what has been built for someone. Add a row when one is built.
const SHELF = [
  {
    name: "The Wild Clay Hunt",
    href: "https://wildclayhunt.substack.com",
    does: "A note from a creek bank becomes a letter that sends itself.",
    whose: "Warren",
  },
  {
    name: "A Penny For Your Pottery",
    href: "https://apennyforyourpottery.com",
    does: "Every pot that leaves the shelf gets a page with its own address.",
    whose: "Warren",
  },
  {
    name: "Wild Clay Archive",
    href: "https://wildclayarchive.com",
    does: "Where to dig, anywhere in the country, from public survey records.",
    whose: "Warren",
  },
  {
    name: "Porch Light",
    href: "/systems/events-radar",
    does: "Thursday evenings, the few things worth leaving the house for.",
    whose: "Warren",
  },
]

export default (() => {
  const MakeOne: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <div class={classNames(displayClass, "makeone")}>
      <p class="lead">
        Click one, or say your own. Whatever you pick, it runs on its own once it exists.
      </p>

      <div class="pool" id="pool"></div>

      <div class="own">
        <input
          type="text"
          id="ownInput"
          placeholder="or say it your way"
          autocomplete="off"
          aria-label="Say what you keep meaning to do, in your own words"
        />
        <div class="owns">
          <button class="more" type="button" id="more">
            Show me other ones
          </button>
          <button class="more" type="button" id="dunno">
            I have no idea
          </button>
        </div>
        <p class="lead poolnote" id="poolnote"></p>
      </div>

      <div class="built" id="built">
        <div>
          <p class="mono">Then here is yours</p>
          <p class="yours" id="yours"></p>
          <p class="sysname" id="sysname"></p>
        </div>

        <div class="pivot" id="pivot" hidden>
          <p class="instead" id="instead"></p>
        </div>

        <p class="thinking" id="thinking" hidden>
          Building it<span>...</span>
        </p>

        <div class="spec">
          <div class="step" id="st0">
            <span class="lead">It reads</span>
            <span class="what" id="w0"></span>
          </div>
          <div class="step" id="st1">
            <span class="lead">It decides</span>
            <span class="what" id="w1"></span>
          </div>
          <div class="step" id="st2">
            <span class="lead">It sends you</span>
            <span class="what" id="w2"></span>
          </div>
          <div class="step" id="st3">
            <span class="lead">Your part</span>
            <span class="what" id="w3"></span>
          </div>
        </div>

        <div class="firstrun" id="firstrun">
          <span class="lead">The first one would read</span>
          <p id="first"></p>
        </div>

        <div class="ask" id="ask">
          <div class="fields">
            <input
              type="text"
              id="who"
              placeholder="your name"
              autocomplete="name"
              aria-label="Your name"
            />
            <input
              type="email"
              id="mail"
              placeholder="where to reach you"
              autocomplete="email"
              aria-label="Your email"
            />
          </div>
          <button class="send" type="button" id="send">
            Build mine for real
          </button>
          <button class="alt" type="button" id="again">
            Build it a different way
          </button>
          <p class="fineprint" id="fine">
            Built one at a time, by me. Once it is yours it runs without you, and it keeps running
            whether or not you think about it again.
          </p>
          <p class="fineprint sent" id="sentNote"></p>
        </div>
      </div>

      <div class="mine" id="mine" hidden>
        <p class="mono" id="minecount"></p>
        <div class="rows" id="minerows"></div>
      </div>

      <div class="again" id="nextwrap" hidden>
        <div class="pool" id="nextpool"></div>
        <button class="more" type="button" id="nextmore">
          Show me other ones
        </button>
      </div>

      <div class="shelf">
        <h2>Built so far</h2>
        <p class="intro">
          Every one of these belongs to the person who asked for it. It runs for them, and it links
          to their page, not mine.
        </p>
        <div class="rows">
          {SHELF.map((s) => (
            <div class="row">
              <span class="name">
                <a href={s.href} target="_blank" rel="noopener">
                  {s.name}
                </a>
              </span>
              <span class="does">{s.does}</span>
              <span class="whose">{s.whose}</span>
            </div>
          ))}
          <div class="row empty">
            <span class="name">Yours</span>
            <span class="does">With your name on it and a page of its own, linked from here.</span>
            <span class="whose">Open</span>
          </div>
        </div>
      </div>
    </div>
  )

  MakeOne.css = `
.makeone { display: flex; flex-direction: column; gap: 28px; padding-top: 8px; }
.makeone [hidden] { display: none !important; }
.makeone .lead { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--darkgray); margin: 0; }
.makeone .mono { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--darkgray); margin: 0; }

.makeone .pool { display: flex; flex-wrap: wrap; gap: 10px 28px; align-items: baseline; }
.makeone button.want, .makeone .more, .makeone .alt {
  appearance: none; background: none; border: 0; padding: 0 0 3px; margin: 0; text-align: left; cursor: pointer;
  font-family: inherit; color: var(--darkgray); border-bottom: 1px solid transparent;
  transition: color 160ms ease, border-color 160ms ease;
}
.makeone button.want { font-family: var(--serif); font-optical-sizing: auto; font-weight: 300; font-size: clamp(20px, 2vw, 26px); letter-spacing: -0.01em; }
.makeone button.want:hover { color: var(--dark); border-bottom-color: var(--secondary); }
.makeone .more, .makeone .alt { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
.makeone .more:hover, .makeone .alt:hover { color: var(--dark); }

.makeone .own { display: flex; flex-direction: column; gap: 10px; max-width: 34rem; }
.makeone .owns { display: flex; gap: 24px; flex-wrap: wrap; }
.makeone input {
  appearance: none; background: none; border: 0; border-bottom: 1px solid var(--lightgray);
  padding: 8px 0; font-family: var(--serif); font-optical-sizing: auto; font-weight: 300; font-size: clamp(20px, 2vw, 26px); color: var(--dark); width: 100%;
}
.makeone input::placeholder { color: var(--gray); opacity: 1; }
.makeone input:focus { border-bottom-color: var(--secondary); outline: none; }
.makeone .poolnote { min-height: 14px; }

.makeone .built { display: none; flex-direction: column; gap: 24px; border-top: 1px solid var(--dark); padding-top: 28px; }
.makeone .built.on { display: flex; }
.makeone .yours { margin: 6px 0 0; font-family: var(--serif); font-optical-sizing: auto; font-weight: 300; font-size: clamp(28px, 3.2vw, 44px); line-height: 1.1; letter-spacing: -0.02em; color: var(--dark); max-width: 24ch; }
.makeone .sysname { margin: 6px 0 0; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--secondary); min-height: 14px; }
.makeone .pivot .instead { margin: 0; font-family: var(--serif); font-optical-sizing: auto; font-weight: 300; font-size: clamp(20px, 2.2vw, 28px); line-height: 1.25; color: var(--dark); max-width: 42rem; }

.makeone .spec { display: flex; flex-direction: column; gap: 14px; max-width: 40rem; }
.makeone .step { display: flex; flex-direction: column; gap: 2px; opacity: 0; transform: translateY(5px);
  transition: opacity 460ms ease, transform 460ms ease; }
.makeone .step.on { opacity: 1; transform: none; }
.makeone .step .what { font-family: var(--serif); font-optical-sizing: auto; font-weight: 300; font-size: clamp(19px, 1.9vw, 24px); line-height: 1.35; color: var(--dark); max-width: 38ch; }

.makeone .firstrun { border-left: 2px solid var(--secondary); padding: 2px 0 2px 15px; max-width: 38rem; opacity: 0; transition: opacity 600ms ease; }
.makeone .firstrun.on { opacity: 1; }
.makeone .firstrun .lead { display: block; margin-bottom: 5px; }
.makeone .firstrun p { margin: 0; font-family: var(--serif); font-optical-sizing: auto; font-weight: 300; font-size: clamp(18px, 1.8vw, 22px); line-height: 1.45; color: var(--dark); }

.makeone .thinking { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--darkgray); margin: 0; }
.makeone .thinking span { animation: makeone-blink 1.3s ease-in-out infinite; }
@keyframes makeone-blink { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

.makeone .ask { display: flex; flex-direction: column; gap: 16px; max-width: 30rem; opacity: 0; transition: opacity 600ms ease; }
.makeone .ask.on { opacity: 1; }
.makeone .fields { display: flex; flex-direction: column; gap: 12px; }
.makeone .send {
  appearance: none; align-self: flex-start; background: var(--dark); color: var(--light); border-radius: 0;
  border: 0; border-radius: 2px; padding: 11px 18px; cursor: pointer; font-family: inherit;
  font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
}
.makeone .send:hover { background: var(--secondary); }
.makeone .fineprint { font-size: 13px; line-height: 1.6; color: var(--darkgray); margin: 0; max-width: 44ch; }
.makeone .sent { display: none; }
.makeone .sent.on { display: block; }

.makeone .mine { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--dark); padding-top: 28px; }
.makeone .mine .rows .row { grid-template-columns: 1fr 1.15fr; }
.makeone .mine .row .name { color: var(--dark); }
.makeone .mine .row:last-child { animation: makeone-arrive 620ms ease; }
@keyframes makeone-arrive { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.makeone .again { display: flex; flex-direction: column; gap: 14px; }

.makeone .shelf { display: flex; flex-direction: column; gap: 16px; border-top: 1px solid var(--dark); padding-top: 28px; }
.makeone .shelf h2 { margin: 0; font-family: var(--serif); font-optical-sizing: auto; font-size: 26px; font-weight: 300; color: var(--dark); }
.makeone .shelf .intro { margin: 0; font-size: 15px; line-height: 1.5; color: var(--darkgray); max-width: 52ch; }
.makeone .rows { display: flex; flex-direction: column; }
.makeone .row { display: grid; grid-template-columns: 1fr 1.15fr auto; gap: 5px 24px; align-items: baseline;
  padding: 14px 0; border-bottom: 1px solid var(--lightgray); }
.makeone .row .name { font-family: var(--serif); font-optical-sizing: auto; font-weight: 300; font-size: 21px; color: var(--dark); }
.makeone .row .does { font-size: 14px; line-height: 1.5; color: var(--darkgray); }
.makeone .row .whose { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); white-space: nowrap; }
.makeone .row a { color: var(--dark); border-bottom: 1px solid var(--secondary); }
.makeone .row a:hover { color: var(--secondary); }
.makeone .row.empty { border-bottom: 0; }
.makeone .row.empty .name { color: var(--gray); font-style: italic; }

@media all and (max-width: 720px) {
  .makeone .row { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .makeone .step, .makeone .firstrun, .makeone .ask { transition: none; }
  .makeone .thinking span { animation: none; }
}
`
  MakeOne.afterDOMLoaded = makeOneScript
  return MakeOne
}) satisfies QuartzComponentConstructor
