// Build-time readers for the files at the repo root that drive the site:
// log.jsonl (one delivery per line), tools.json (the systems), build.json (written by scripts/build.mjs).
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
  name: string // the `source` its log lines carry; also the page name, systems/<name>
  what: string // one sentence: what it does and what it sends
  runs: string // the schedule in words, e.g. "Thu 6pm ET"
  cron?: string // the routine's schedule, UTC, e.g. "0 22 * * 4"; drives the "next run" countdown
  category?: string // small label on the entry; grouping later, once there are enough systems
  link?: { label: string; href: string } // where its output lives, or where to get it
  retired?: string // "2026-07"
  href?: string // page slug override; default systems/<name>
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

export interface NowEntry {
  when: string // same shapes as LogLine.when
  doing: string[] // Warren's own words, one entry per line or sentence
  finished_week?: number
}

let nowLogCache: NowEntry[] | null = null
// now.jsonl: one line per day Warren answered "what are you doing today?", appended by the
// Night Shift routine (now.json keeps only the current answer). Newest first.
export function readNowLog(): NowEntry[] {
  if (nowLogCache) return nowLogCache
  const raw = readIfExists("now.jsonl") ?? ""
  const entries: NowEntry[] = []
  for (const line of raw.split("\n")) {
    const t = line.trim()
    if (!t) continue
    try {
      entries.push(JSON.parse(t))
    } catch {
      console.warn(`now.jsonl: skipping unparsable line: ${t.slice(0, 60)}`)
    }
  }
  entries.sort((a, b) => parseWhen(b.when).getTime() - parseWhen(a.when).getTime())
  nowLogCache = entries
  return entries
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

export function monthDay(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** "Aug 20, 2026" */
export function longDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** "today 06:14" | "Aug 21 07:02" | "Aug 18" (date-only lines) */
export function formatWhen(when: string, now: Date): string {
  const d = parseWhen(when)
  if (!hasTime(when)) return monthDay(d)
  if (sameDay(d, now)) return `today ${hhmm(d)}`
  return `${monthDay(d)} ${hhmm(d)}`
}

/** Date only, for the entry's detail line: "today" | "Aug 20" | "Dec 3, 2025" (another year) */
export function sentLabel(when: string, now: Date): string {
  const d = parseWhen(when)
  if (sameDay(d, now)) return "today"
  return d.getFullYear() === now.getFullYear() ? monthDay(d) : longDate(d)
}

// The system's page slug (no leading slash).
export function slugFor(t: Tool): string {
  return t.href ?? `systems/${t.name}`
}

// The system's page for a source, as a site-absolute path, or undefined if the source is not a system.
export function pageFor(source: string): string | undefined {
  const t = readTools().find((t) => t.name === source)
  return t ? "/" + slugFor(t) : undefined
}

export function latestRunFor(source: string): LogLine | undefined {
  return readLog().find((l) => l.source === source && l.status !== "scheduled")
}

// Schedules. tools.json carries the routine's cron verbatim (UTC, as the cloud shows it). Only the two
// shapes a routine actually uses are understood: "m h * * d" (weekly) and "m h * * *" (daily); h may be a
// comma list ("30 9,16,22 * * *"), in which case the countdown runs to the nearest one.
export interface Schedule {
  minute: number
  hours: number[]
  dow: number | null // 0 = Sunday, null = every day
}

export function parseCron(cron: string | undefined): Schedule | null {
  if (!cron) return null
  const m = cron.trim().match(/^(\d{1,2})\s+(\d{1,2}(?:,\d{1,2})*)\s+\*\s+\*\s+(\*|[0-6])$/)
  if (!m) return null
  return { minute: +m[1], hours: m[2].split(",").map(Number), dow: m[3] === "*" ? null : +m[3] }
}

/** Next instant (UTC) the schedule fires, strictly after `now`. Same arithmetic as the client script. */
export function nextDue(s: Schedule, now: Date): Date {
  let best: Date | null = null
  for (const hour of s.hours) {
    const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, s.minute, 0))
    if (s.dow === null) {
      if (t <= now) t.setUTCDate(t.getUTCDate() + 1)
    } else {
      let delta = (s.dow - t.getUTCDay() + 7) % 7
      if (delta === 0 && t <= now) delta = 7
      t.setUTCDate(t.getUTCDate() + delta)
    }
    if (!best || t < best) best = t
  }
  return best!
}

/** "in 1d 06:43:12", the countdown text the client script keeps ticking. */
export function formatCountdown(target: Date, now: Date): string {
  const s = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `in ${d}d ${pad(h)}:${pad(m)}:${pad(s % 60)}`
}
