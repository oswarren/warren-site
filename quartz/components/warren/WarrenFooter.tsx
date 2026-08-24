import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { pathToRoot, joinSegments } from "../../util/path"
import { readBuild, sameDay, hhmm, monthDay } from "./data"

// "built today 06:14 · build.mjs → quartz · 2.8s · source"        rss  email
interface Options {
  source: string
  email: string
  builder: string
}
const defaultOptions: Options = {
  source: "https://github.com",
  email: "hello@example.com",
  builder: "build.mjs → quartz",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const Footer: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const b = readBuild()
    const now = new Date()
    const when = sameDay(b.when, now) ? `today ${hhmm(b.when)}` : `${monthDay(b.when)} ${hhmm(b.when)}`
    const rss = joinSegments(pathToRoot(fileData.slug!), "index.xml")
    return (
      <footer class={classNames(displayClass, "warren-footer", "mono")}>
        <span>
          built {when} · {opts.builder}
          {b.seconds != null ? ` · ${b.seconds}s` : ""} · <a href={opts.source}>source</a>
        </span>
        <div class="links">
          <a href={rss}>rss</a>
          <a href={`mailto:${opts.email}`}>email</a>
        </div>
      </footer>
    )
  }
  Footer.css = `
.warren-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 0 24px 0;
  margin: 0;
  font-size: 12px;
  color: var(--darkgray);
  border-top: 1px solid var(--dark);
  opacity: 1;
}
.warren-footer a { color: var(--darkgray); }
.warren-footer a:hover { color: var(--secondary); }
.warren-footer .links { display: flex; gap: 20px; }
`
  return Footer
}) satisfies QuartzComponentConstructor<Partial<Options> | undefined>
