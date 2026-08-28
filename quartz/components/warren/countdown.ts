// Client script: a live countdown in every [data-cron] element on the page. The cron (UTC) is on the
// element; the next occurrence is recomputed every tick, so the counter is right however stale the
// build is. Same arithmetic as parseCron() and nextDue() in data.ts. An optional data-prefix
// ("next ") goes in front of the "in 2d 03:18:14" text.
export const dueScript = `
document.addEventListener("nav", () => {
  const cells = document.querySelectorAll("[data-cron]")
  if (cells.length === 0) return
  const pad = (x) => String(x).padStart(2, "0")
  const parse = (cron) => {
    const m = cron.trim().match(/^(\\d{1,2})\\s+(\\d{1,2}(?:,\\d{1,2})*)\\s+\\*\\s+\\*\\s+(\\*|[0-6])$/)
    return m ? { minute: +m[1], hours: m[2].split(",").map(Number), dow: m[3] === "*" ? null : +m[3] } : null
  }
  const next = (s, now) => {
    let best = null
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
    return best
  }
  const tick = () => {
    const now = new Date()
    for (const el of cells) {
      const s = parse(el.getAttribute("data-cron"))
      if (!s) continue
      const target = next(s, now)
      const secs = Math.max(0, Math.floor((target - now) / 1000))
      const d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60)
      el.textContent = (el.getAttribute("data-prefix") || "") + "in " + d + "d " + pad(h) + ":" + pad(m) + ":" + pad(secs % 60)
      el.title = target.toLocaleString()
    }
  }
  tick()
  const t = setInterval(tick, 1000)
  window.addCleanup(() => clearInterval(t))
})
`
