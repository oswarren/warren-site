import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"

// Top bar: warren.systems | letter tools notes about | live clock. No theme toggle.
interface Options {
  links: Record<string, string> // label -> slug ("letter", "tools", ...)
}

const defaultOptions: Options = {
  links: { letter: "letter", tools: "tools", notes: "notes", about: "about" },
}

const clockScript = `
document.addEventListener("nav", () => {
  const el = document.getElementById("clock")
  if (!el) return
  const pad = (x) => String(x).padStart(2, "0")
  const tick = () => {
    const n = new Date()
    el.textContent = pad(n.getHours()) + ":" + pad(n.getMinutes()) + ":" + pad(n.getSeconds())
  }
  tick()
  const t = setInterval(tick, 1000)
  window.addCleanup(() => clearInterval(t))
})
`

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Nav: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    return (
      <nav class={classNames(displayClass, "warren-nav", "mono")}>
        <a href={resolveRelative(slug, "index" as FullSlug)} class="site-name">
          {cfg.pageTitle}
        </a>
        <div class="nav-links">
          {Object.entries(opts.links).map(([label, target]) => {
            const active = slug === target || slug.startsWith(target + "/")
            return (
              <a href={resolveRelative(slug, target as FullSlug)} class={active ? "active" : ""}>
                {label}
              </a>
            )
          })}
        </div>
        <div class="nav-right">
          <span id="clock" aria-live="off"></span>
        </div>
      </nav>
    )
  }

  Nav.css = `
.warren-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--dark);
  font-size: 13px;
  margin: 0;
}
.warren-nav a { color: var(--dark); }
.warren-nav a:hover, .warren-nav a.active { color: var(--secondary); }
.warren-nav .site-name { font-weight: 500; }
.warren-nav .nav-links { display: flex; gap: 28px; }
.warren-nav .nav-right { display: flex; align-items: center; gap: 14px; color: var(--darkgray); }
.warren-nav #clock { min-width: 8ch; text-align: right; font-variant-numeric: tabular-nums; }
@media all and (max-width: 800px) {
  .warren-nav { flex-wrap: wrap; gap: 12px; }
  .warren-nav .nav-links { gap: 18px; }
}
`
  Nav.afterDOMLoaded = clockScript
  return Nav
}) satisfies QuartzComponentConstructor<Partial<Options> | undefined>
