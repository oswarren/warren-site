import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { PageTypes } from "./quartz/plugins"
import { ConditionalRender } from "./quartz/components"
import { QuartzComponentProps } from "./quartz/components/types"
import { FullPageLayout } from "./quartz/cfg"
import * as Warren from "./quartz/components/warren"

/**
 * warrenstetler.com, Quartz 5 TS override.
 *
 * quartz.config.yaml holds the site configuration and the plugin list. This file places the
 * warren components (core components in quartz/components/warren/) into the layout. They are
 * placed here rather than in YAML because their presence depends on the page slug (home, the work
 * index, a project page, something sent), which the YAML `condition` presets cannot express.
 *
 * The pages:
 *   /              hero (the statement, one live clue), the selected systems, the evidence (what I'm
 *                  doing, what the systems are doing, what runs without me), the two ways in
 *   /systems       the work index, every project page
 *   /systems/<x>   a project page: title, effect, artifact, the narrative, then the live facts and
 *                  everything it has sent (for systems that log here)
 *   /sent/<x>/<d>  something a system sent, as it went out
 *   /work-with-me  Make one
 *   /use           Use something I've built
 *   /about
 */

const EMAIL = "opensourcewarren@gmail.com"
const SOURCE = "https://github.com/oswarren/warren-site"

const isSent = (slug: string) => /^sent\/[^/]+\/.+/.test(slug)
const isFront = (slug: string) => slug === "index"
const notFront = (slug: string) => slug !== "index"
const isSystemsIndex = (slug: string) => slug === "systems/index"
const isWorkWithMe = (slug: string) => slug === "work-with-me"
const isUse = (slug: string) => slug === "use"
// a project page: frontmatter `effect` (the one sentence on what the system makes possible)
const isProject = (p: QuartzComponentProps) => typeof p.fileData.frontmatter?.effect === "string"
// a system that logs here: frontmatter `log: <name>` names its entry in tools.json
const isSystem = (p: QuartzComponentProps) => typeof p.fileData.frontmatter?.log === "string"

const when = (component: ReturnType<typeof Warren.Nav>, test: (slug: string) => boolean) =>
  ConditionalRender({ component, condition: (p: QuartzComponentProps) => test(p.fileData.slug!) })

const config = await loadQuartzConfig()
export default config

// Layout from YAML (ArticleTitle in beforeBody), then the warren pieces around it.
const yaml = await loadQuartzLayout()

const shared: Partial<FullPageLayout> = {
  header: [Warren.Nav()],
  beforeBody: [
    when(Warren.SentMeta(), isSent),
    // the stock title everywhere but home, where the hero carries the statement itself
    ...(yaml.defaults.beforeBody ?? []).map((c) => when(c, notFront)),
    when(Warren.Hero(), isFront),
    // a project page: the effect, the artifact, the way in, above the narrative
    ConditionalRender({ component: Warren.ProjectHead(), condition: isProject }),
  ],
  afterBody: [
    // home, in order: the selected systems, then the back of the watch, then the two ways in
    when(Warren.Featured(), isFront),
    when(Warren.EvidenceHead(), isFront),
    when(Warren.Now(), isFront),
    when(Warren.Balance(), isFront),
    when(Warren.Ending(), isFront),
    // the work index
    when(Warren.Systems(), isSystemsIndex),
    // the two ways in
    when(Warren.MakeOne(), isWorkWithMe),
    when(Warren.Use(), isUse),
    // a system's page: photos of what came of it, its live facts, then everything it has sent
    ConditionalRender({ component: Warren.Gallery(), condition: isSystem }),
    ConditionalRender({ component: Warren.SystemFacts(), condition: isSystem }),
    ConditionalRender({ component: Warren.History(), condition: isSystem }),
  ],
  left: [],
  right: [],
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
