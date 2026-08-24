import { PageFrame, PageFrameProps } from "./types"

/**
 * warren.systems page frame — one 12-column grid (see quartz/styles/custom.scss):
 *
 *   nav    nav    nav    nav    nav    nav    nav    nav    nav    nav    nav    nav
 *   head   head   head   head   head   head   head   head   .      right  right  right
 *   body   body   body   body   body   body   body   body   .      right  right  right
 *   pfoot  pfoot  pfoot  pfoot  pfoot  pfoot  pfoot  pfoot  .      right  right  right
 *   footer footer footer footer footer footer footer footer footer footer footer footer
 *
 * `header` components (Nav) go in the top bar, `beforeBody` (Meta, ArticleTitle) in head,
 * the page body in body, `afterBody` (Home, ToolsTable, Log, ProvenanceFooter) in pfoot,
 * `right` (on this page / tagged / reply / tools stats) in the rail. No left sidebar.
 * Pages without rail content collapse to full width via body[data-slug] rules in custom.scss.
 */
export const WarrenFrame: PageFrame = {
  name: "warren",
  render({ componentData, header, beforeBody, pageBody: Content, afterBody, right, footer }: PageFrameProps) {
    return (
      <>
        <div class="warren-nav-area">
          {header.map((HeaderComponent) => (
            <HeaderComponent {...componentData} />
          ))}
        </div>
        <div class="warren-head">
          {beforeBody.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <div class="warren-body">
          <Content {...componentData} />
        </div>
        <div class="warren-after">
          {afterBody.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <div class="warren-rail">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <div class="warren-footer-area">
          {footer.map((FooterComponent) => (
            <FooterComponent {...componentData} />
          ))}
        </div>
      </>
    )
  },
}
