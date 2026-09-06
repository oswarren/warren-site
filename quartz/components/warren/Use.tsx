import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import fs from "fs"
import path from "path"

// "Use something I've built": the things a person can visit, read, run, or buy today, in three
// groups. Read from use.json at the repo root so adding one is adding a line, not editing a page.
interface UseItem {
  name: string
  does: string // one sentence, the effect
  href: string
  action: string // the verb on the link: "open the map", "subscribe", "get the routine"
  note?: string // one quiet line: price, what you need, what it is not
}
interface UseGroup {
  label: string // "visit", "read", "run it yourself"
  items: UseItem[]
}

function readUse(): UseGroup[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "use.json"), "utf8"))
  } catch {
    return []
  }
}

export default (() => {
  const Use: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const groups = readUse()
    if (!groups.length) return null
    return (
      <div class={classNames(displayClass, "use")}>
        {groups.map((g) => (
          <section class="use-group reveal">
            <h2 class="label mono">{g.label}</h2>
            <div class="rows">
              {g.items.map((it) => (
                <div class="use-row">
                  <a class="name serif" href={it.href}>
                    {it.name}
                  </a>
                  <span class="does">{it.does}</span>
                  <span class="meta mono">
                    <a href={it.href}>{it.action}</a>
                    {it.note && <span class="note">{it.note}</span>}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  Use.css = `
.use { display: flex; flex-direction: column; gap: 56px; margin-top: 16px; }
.use-group { display: flex; flex-direction: column; gap: 0; }
.use-group .label { margin: 0; padding-bottom: 12px; font-size: 12px; font-weight: 400; color: var(--gray); border-bottom: 1px solid var(--dark); }
.use-row {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 6fr) minmax(0, 3fr);
  column-gap: 24px;
  row-gap: 6px;
  align-items: baseline;
  padding: 22px 0;
  border-bottom: 1px solid var(--rule);
}
.use-row .name { font-weight: 300; font-size: clamp(22px, 2.2vw, 28px); line-height: 1.15; letter-spacing: -0.015em; color: var(--dark); }
.use-row .name:hover { color: var(--secondary); }
.use-row .does { font-size: 16px; line-height: 1.5; color: var(--darkgray); }
.use-row .meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--gray); text-align: right; }
.use-row .meta a { color: var(--dark); }
.use-row .meta a::after { content: "\\2192"; margin-left: 6px; color: var(--gray); }
.use-row .meta a:hover { color: var(--secondary); }
@media all and (max-width: 720px) {
  .use-row { grid-template-columns: 1fr; }
  .use-row .meta { text-align: left; }
}
`
  return Use
}) satisfies QuartzComponentConstructor
