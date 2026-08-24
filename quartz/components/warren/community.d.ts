// tsconfig uses moduleResolution "node", which cannot see the "./components" subpath export
// of community plugins. esbuild resolves it fine at build time; this keeps `tsc` happy.
declare module "@quartz-community/table-of-contents/components" {
  import type { QuartzComponentConstructor } from "../types"
  export const TableOfContents: QuartzComponentConstructor<
    Partial<{ layout: "modern" | "legacy" }> | undefined
  >
}
