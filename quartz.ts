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
 * on the page slug (home vs a system's page vs a sent page), which the YAML `condition`
 * presets (not-index, has-tags, ...) cannot express.
 */

const EMAIL = "opensourcewarren@gmail.com"
const SOURCE = "https://github.com/oswarren/warren-site"

const isSent = (slug: string) => /^sent\/[^/]+\/.+/.test(slug)
const isFront = (slug: string) => slug === "index"
const isSystemsIndex = (slug: string) => slug === "systems/index"
const isFolderIndex = (slug: string) => slug === "index" || slug.endsWith("/index")
// pages that are "documents" (about, a system's page, something sent): they get the rail blocks
const isDoc = (slug: string) =>
  !isFolderIndex(slug) && !["tags", "404"].includes(slug) && !slug.startsWith("tags/")
// a system's own page: frontmatter `log: <name>` names its entry in tools.json
const isSystem = (p: QuartzComponentProps) => typeof p.fileData.frontmatter?.log === "string"

const when = (component: ReturnType<typeof Warren.Nav>, test: (slug: string) => boolean) =>
  ConditionalRender({ component, condition: (p: QuartzComponentProps) => test(p.fileData.slug!) })

const config = await loadQuartzConfig()
export default config

// Layout from YAML (ArticleTitle in beforeBody), then the warren pieces around it.
const yaml = await loadQuartzLayout()

const shared: Partial<FullPageLayout> = {
  header: [Warren.Nav()],
  beforeBody: [when(Warren.SentMeta(), isSent), ...(yaml.defaults.beforeBody ?? [])],
  afterBody: [
    // home, today: what Warren is doing (now.json) beside what the systems are doing (log.jsonl)
    when(Warren.Now(), isFront),
    // home, the standing arrangement: what runs without him, what still needs his hands, and the line moving
    when(Warren.Balance(), isFront),
    // the portfolio lives on /systems only; the home page carries the balance instead
    when(Warren.Systems(), isSystemsIndex),
    // a system's page: photos of what came of it, its facts, then everything it has sent
    ConditionalRender({ component: Warren.Gallery(), condition: isSystem }),
    ConditionalRender({ component: Warren.SystemFacts(), condition: isSystem }),
    ConditionalRender({ component: Warren.History(), condition: isSystem }),
  ],
  left: [],
  right: [
    when(Warren.OnThisPage(TableOfContents()), isDoc),
    when(Warren.Tagged, isDoc),
    when(Warren.Reply({ email: EMAIL }), isDoc),
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
