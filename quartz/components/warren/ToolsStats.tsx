import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { classNames } from "../../util/lang"
import { readTools } from "./data"

// Small stats block for the tools page right rail: tools / running / retired / total lines.
export default (() => {
  const ToolsStats: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const tools = readTools()
    const retired = tools.filter((t) => t.retired).length
    const lines = tools.reduce((n, t) => n + (t.lines ?? 0), 0)
    return (
      <div class={classNames(displayClass, "tools-stats", "mono")}>
        <div><span>tools</span><span>{tools.length}</span></div>
        <div><span>running</span><span class="ok">{tools.length - retired}</span></div>
        <div><span>retired</span><span>{retired}</span></div>
        <div><span>total lines</span><span>{lines}</span></div>
      </div>
    )
  }
  ToolsStats.css = `
.tools-stats { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--darkgray); padding-top: 8px; border-top: 1px solid var(--dark); }
.tools-stats > div { display: flex; justify-content: space-between; }
.tools-stats .ok { color: var(--ok); }
`
  return ToolsStats
}) satisfies QuartzComponentConstructor
