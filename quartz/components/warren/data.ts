// Build-time readers for the three files at the repo root that drive the status board:
// log.jsonl (one event per line), tools.json (the shelf), build.json (written by scripts/build.mjs).
import fs from "fs"
import path from "path"

export interface LogLine {
  when: string // local ISO "2026-08-21T07:02:00" or date-only "2026-08-18"
  what: string
  source: string
  href?: string
  status?: "scheduled"
}

export interface Tool {
  name: string
  what: string
  runs: string
  category?: string // shown in the log's third column for this tool's lines
  lines?: number
  retired?: string // "2026-07"
  href?: string
}

export interface BuildInfo {
  when: Date
  seconds: number | null
}

const ROOT = process.cwd()

function readIfExists(file: string): string | null {
  const p = path.join(ROOT, file)
  try {
    return fs.readFileSync(p, "utf8")
  } catch {
    return null
  }
}

/** Parse an ISO-ish local timestamp. Date-only strings become local midnight. */
export function parseWhen(when: string): Date {
  const m = when.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (!m) return new Date(when)
  const [, y, mo, d, h, mi, s] = m
  return new Date(+y, +mo - 1, +d, h ? +h : 0, mi ? +mi : 0, s ? +s : 0)
}

export function hasTime(when: string): boolean {
  return when.length > 10
}

let logCache: LogLine[] | null = null
export function readLog(): LogLine[] {
  if (logCache) return logCache
  const raw = readIfExists("log.jsonl") ?? ""
  const lines: LogLine[] = []
  for (const line of raw.split("\n")) {
    const t = line.trim()
    if (!t) continue
    try {
      lines.push(JSON.parse(t))
    } catch {
      console.warn(`log.jsonl: skipping unparsable line: ${t.slice(0, 60)}`)
    }
  }
  // newest first
  lines.sort((a, b) => parseWhen(b.when).getTime() - parseWhen(a.when).getTime())
  logCache = lines
  return lines
}

let toolsCache: Tool[] | null = null
export function readTools(): Tool[] {
  if (toolsCache) return toolsCache
  try {
    toolsCache = JSON.parse(readIfExists("tools.json") ?? "[]")
  } catch {
    toolsCache = []
  }
  return toolsCache!
}

let buildCache: BuildInfo | null = null
export function readBuild(): BuildInfo {
  if (buildCache) return buildCache
  try {
    const j = JSON.parse(readIfExists("build.json") ?? "{}")
    buildCache = {
      when: j.when ? parseWhen(j.when) : new Date(),
      seconds: typeof j.seconds === "number" ? j.seconds : null,
    }
  } catch {
    buildCache = { when: new Date(), seconds: null }
  }
  return buildCache
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const pad = (n: number) => String(n).padStart(2, "0")

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

export function hhmm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function localIso(d: Date): string {
  return `${ymd(d)}T${hhmm(d)}:${pad(d.getSeconds())}`
}

export function monthDay(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** "today 06:14" | "Aug 21 07:02" | "Aug 18" (date-only lines) */
export function formatWhen(when: string, now: Date): string {
  const d = parseWhen(when)
  if (!hasTime(when)) return monthDay(d)
  if (sameDay(d, now)) return `today ${hhmm(d)}`
  return `${monthDay(d)} ${hhmm(d)}`
}

/** Relative label for the tools table: "2h ago" | "yesterday" | "Fri 07:02" | "Aug 11" */
export function formatLastRun(when: string, now: Date): string {
  const d = parseWhen(when)
  const diffMs = now.getTime() - d.getTime()
  const hours = diffMs / 36e5
  if (hasTime(when) && sameDay(d, now)) {
    if (hours < 1) return `${Math.max(1, Math.round(diffMs / 6e4))}m ago`
    if (hours < 6) return `${Math.round(hours)}h ago`
    return `${hhmm(d)} today`
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, yesterday)) return "yesterday"
  if (diffMs < 7 * 864e5) return hasTime(when) ? `${DAYS[d.getDay()]} ${hhmm(d)}` : DAYS[d.getDay()]
  return monthDay(d)
}

// The log's third column: the tool's category when the source is a tool, else the source itself.
export function categoryFor(source: string): string {
  return readTools().find((t) => t.name === source)?.category ?? source
}

// The system's own page for a source, as a site-absolute path, or undefined if the source is not a tool.
export function pageFor(source: string): string | undefined {
  const t = readTools().find((t) => t.name === source)
  return t ? "/" + (t.href ?? `tools/${t.name}`) : undefined
}

export function latestRunFor(source: string): LogLine | undefined {
  return readLog().find((l) => l.source === source && l.status !== "scheduled")
}
