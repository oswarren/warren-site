import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, slugifyFilePath, FilePath, FullSlug } from "../../util/path"
import { classNames } from "../../util/lang"
import fs from "fs"
import path from "path"
import { longDate, parseWhen } from "./data"

// Photos of what came of a system, for its page. Drop image files into content/photos/<source>/ and
// they appear here, newest first, each opening the full image. The caption is the file name:
// 2026-08-22-wolfswood-faire.jpg -> "wolfswood faire", "Aug 22, 2026". A file without a leading date
// is captioned by its name alone. No file, no grid.
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"])
const DATED = /^(\d{4}-\d{2}-\d{2})(?:[-_ ]+(.*))?$/

interface Photo {
  file: string // relative to content/, e.g. photos/events-radar/2026-08-22-wolfswood-faire.jpg
  caption: string
  date?: string
}

function readPhotos(source: string): Photo[] {
  const dir = path.join(process.cwd(), "content", "photos", source)
  let names: string[]
  try {
    names = fs.readdirSync(dir)
  } catch {
    return []
  }
  const files = names.filter((n) => EXT.has(path.extname(n).toLowerCase()) && !n.startsWith("."))
  const stemOf = (n: string) => n.slice(0, -path.extname(n).length)
  // dated files newest first, then the undated ones by name
  const dated = files.filter((n) => DATED.test(stemOf(n))).sort().reverse()
  const undated = files.filter((n) => !DATED.test(stemOf(n))).sort()
  return [...dated, ...undated].map((n) => {
    const stem = stemOf(n)
    const m = stem.match(DATED)
    const words = (m ? m[2] ?? "" : stem).replace(/[-_]+/g, " ").trim()
    return {
      file: `photos/${source}/${n}`,
      caption: words,
      date: m ? longDate(parseWhen(m[1])) : undefined,
    }
  })
}

export default (() => {
  const Gallery: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const source = fileData.frontmatter?.log as string | undefined
    if (!source) return null
    const photos = readPhotos(source)
    if (photos.length === 0) return null
    return (
      <div class={classNames(displayClass, "gallery")}>
        <span class="label mono">what came of it</span>
        <div class="grid">
          {photos.map((p) => {
            // the same path the Assets emitter writes the file to
            const url = resolveRelative(slug, slugifyFilePath(p.file as FilePath) as FullSlug)
            const alt = [p.caption, p.date].filter(Boolean).join(", ")
            return (
              <a href={url} class="photo">
                <img src={url} alt={alt} loading="lazy" />
                {(p.caption || p.date) && (
                  <span class="caption mono">
                    {p.caption && <span>{p.caption}</span>}
                    {p.date && <span class="date">{p.date}</span>}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  Gallery.css = `
.gallery { display: flex; flex-direction: column; gap: 12px; padding-top: 20px; margin-top: 28px; border-top: 1px solid var(--dark); }
.gallery .label { font-size: 12px; color: var(--dark); }
.gallery .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.gallery .photo { display: flex; flex-direction: column; gap: 6px; color: var(--darkgray); }
.gallery img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; background: var(--lightgray); }
.gallery .photo:hover img { opacity: 0.9; }
.gallery .caption { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; }
.gallery .caption .date { color: var(--gray); white-space: nowrap; }
@media all and (max-width: 800px) { .gallery .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`
  return Gallery
}) satisfies QuartzComponentConstructor
