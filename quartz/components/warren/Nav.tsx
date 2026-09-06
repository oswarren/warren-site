import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import { motionScript } from "./motion"

// Top bar, kept quiet: the name on the left; work and about; then the two ways in, which stay
// reachable on every page. No clock: the home page's one alive clue is the countdown in the hero.
interface Link {
  label: string
  target: string // slug
  prefixes?: string[] // other slug prefixes that count as "here" (systems/…, sent/…)
}
interface Options {
  links: Link[]
  paths: Link[]
}

const defaultOptions: Options = {
  links: [
    { label: "Work", target: "systems/index", prefixes: ["systems/", "sent/"] },
    { label: "About", target: "about" },
  ],
  paths: [
    { label: "Work with me", target: "work-with-me" },
    { label: "Use something I've built", target: "use" },
  ],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Nav: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const item = ({ label, target, prefixes }: Link) => {
      const active =
        slug === target ||
        slug.startsWith(target + "/") ||
        (prefixes ?? []).some((p) => slug.startsWith(p))
      return (
        <a href={resolveRelative(slug, target as FullSlug)} class={active ? "active" : ""}>
          {label}
        </a>
      )
    }
    return (
      <nav class={classNames(displayClass, "warren-nav")} aria-label="Site">
        <a href={resolveRelative(slug, "index" as FullSlug)} class="site-name">
          {cfg.pageTitle}
        </a>
        <div class="nav-links">{opts.links.map(item)}</div>
        <div class="nav-paths">{opts.paths.map(item)}</div>
      </nav>
    )
  }

  Nav.css = `
.warren-nav {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 28px;
  padding: 26px 0 0;
  font-family: var(--sans);
  font-size: 14px;
  margin: 0;
}
.warren-nav a { color: var(--darkgray); }
.warren-nav a:hover, .warren-nav a.active { color: var(--dark); }
.warren-nav .site-name { color: var(--dark); font-weight: 500; letter-spacing: -0.01em; }
.warren-nav .nav-links { display: flex; gap: 24px; margin-right: auto; }
.warren-nav .nav-paths { display: flex; gap: 24px; }
.warren-nav .nav-paths a::before { content: "\\2192"; margin-right: 6px; color: var(--gray); }
@media all and (max-width: 720px) {
  .warren-nav { flex-wrap: wrap; row-gap: 10px; font-size: 13px; }
  .warren-nav .nav-links { gap: 18px; }
  .warren-nav .nav-paths { width: 100%; gap: 18px; }
}
`
  // the reveal styles only apply once scripting is known to be present, so content never stays hidden
  Nav.beforeDOMLoaded = `document.documentElement.classList.add("js")`
  Nav.afterDOMLoaded = motionScript
  return Nav
}) satisfies QuartzComponentConstructor<Partial<Options> | undefined>
