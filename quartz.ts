import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { PageTypes } from "./quartz/plugins"
import { ConditionalRender } from "./quartz/components"
import { QuartzComponentProps } from "./quartz/components/types"
import { FullPageLayout } from "./quartz/cfg"
import { TableOfContents } from "@quartz-community/table-of-contents/components"
import * as Warren from "./quartz/components/warren"

/**
 * warren.systems — Quartz 5 TS override.
 *
 * quartz.config.yaml holds the site configuration and the plugin list. This file
 * places the warren components (core components in quartz/components/warren/) into
 * the layout. They are placed here rather than in YAML because their presence depends
 * on the page slug (home vs tools vs note), which the YAML `condition` presets
 * (not-index, has-tags, ...) cannot express.
 */

const EMAIL = "hello@example.com"
const SOURCE = "https://github.com"

const isHome = (slug: string) => slug === "index"
const isTools = (slug: string) => slug === "tools/index"
const isFolderIndex = (slug: string) => slug === "index" || slug.endsWith("/index")
// pages that are "documents" (notes, letters, about): they get the meta line and provenance grid
const isDoc = (slug: string) =>
  !isFolderIndex(slug) && !["log", "tags", "404"].includes(slug) && !slug.startsWith("tags/")

const when = (component: ReturnType<typeof Warren.Nav>, test: (slug: string) => boolean) =>
  ConditionalRender({ component, condition: (p: QuartzComponentProps) => test(p.fileData.slug!) })

const config = await loadQuartzConfig()
export default config

// Layout from YAML (ArticleTitle in beforeBody), then the warren pieces around it.
const yaml = await loadQuartzLayout()

const shared: Partial<FullPageLayout> = {
  header: [Warren.Nav()],
  beforeBody: [when(Warren.Meta(), isDoc), ...(yaml.defaults.beforeBody ?? [])],
  afterBody: [
    when(Warren.Home(), isHome),
    when(Warren.ToolsTable(), isTools),
    // full log on /log
    when(Warren.Log({ limit: 0, older: false }), (s) => s === "log"),
    // per-tool pages: frontmatter `log: <tool name>` shows only that tool's lines
    ConditionalRender({
      component: Warren.Log({ limit: 0, older: false, rebuildRow: false, source: "frontmatter" }),
      condition: (p: QuartzComponentProps) => typeof p.fileData.frontmatter?.log === "string",
    }),
    when(Warren.ProvenanceFooter(), isDoc),
  ],
  left: [],
  right: [
    when(Warren.OnThisPage(TableOfContents()), isDoc),
    when(Warren.Tagged, isDoc),
    when(Warren.Reply({ email: EMAIL }), isDoc),
    when(Warren.ToolsStats(), isTools),
  ],
  footer: [Warren.WarrenFooter({ source: SOURCE, email: EMAIL })],
}

export const layout = await loadQuartzLayout({
  defaults: shared,
  byPageType: {
    content: shared,
    folder: shared,
    tag: shared,
    "404": { ...shared, beforeBody: [], right: [], afterBody: [] },
  },
})

// loadQuartzConfig() builds the PageTypeDispatcher from the YAML-only layout; swap in
// the one above so the TS placement is what actually renders.
const i = config.plugins.emitters.findIndex((e) => e.name === "PageTypeDispatcher")
const dispatcher = PageTypes.PageTypeDispatcher(layout)
if (i >= 0) config.plugins.emitters[i] = dispatcher
else config.plugins.emitters.push(dispatcher)
