import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { pathToRoot, joinSegments } from "../../util/path"

// source        rss  email
interface Options {
  source: string
  email: string
}
const defaultOptions: Options = {
  source: "https://github.com",
  email: "hello@example.com",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const Footer: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const rss = joinSegments(pathToRoot(fileData.slug!), "index.xml")
    return (
      <footer class={classNames(displayClass, "warren-footer", "mono")}>
        <a href={opts.source}>source</a>
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
