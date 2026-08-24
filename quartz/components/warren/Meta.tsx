import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { ymd } from "./data"

// "notes/home-cooked.md · 2026-08-18 · 4 min" — the line above a note's title.
export default (() => {
  const Meta: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const rel = fileData.relativePath ?? fileData.filePath?.replace(/^content\//, "") ?? ""
    const date = fileData.dates?.modified ?? fileData.dates?.created
    const text = fileData.text ?? ""
    // same arithmetic as the reading-time package (200 words per minute)
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return (
      <div class={classNames(displayClass, "meta", "mono")}>
        <span>{rel}</span>
        {date && <span>{ymd(date)}</span>}
        <span>{minutes} min</span>
      </div>
    )
  }
  Meta.css = `
.meta { display: flex; gap: 20px; font-size: 12px; color: var(--darkgray); margin: 0 0 14px 0; }
`
  return Meta
}) satisfies QuartzComponentConstructor
