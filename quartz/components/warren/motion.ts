// Client script for the whole site's behavioural language of movement. Attached to Nav, so it runs
// on every page, once per navigation.
//
//   .reveal           rises into place the first time it enters the viewport
//   [data-drift]      moves a few pixels against the scroll, so artifacts feel placed, not pasted
//   [data-tone]       a section that, while it is the thing in view, tints the page's paper toward
//                     its own colour (the atmosphere shifting toward a project, then back)
//   [data-runs]       "label=cron;;label=cron" (UTC crons): the soonest one is named and counted
//                     down every second. The one alive clue on the home page, and the line that keeps
//                     counting after the page's end.
//
// Everything but the countdown is skipped under prefers-reduced-motion; the countdown is text.
export const motionScript = `
document.addEventListener("nav", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // reveal
  const toReveal = Array.from(document.querySelectorAll(".reveal"))
  if (reduce || !("IntersectionObserver" in window)) {
    toReveal.forEach((el) => el.classList.add("in"))
  } else if (toReveal.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in")
          io.unobserve(en.target)
        }
      })
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 })
    toReveal.forEach((el) => io.observe(el))
    const safety = setTimeout(() => {
      const vh = window.innerHeight
      toReveal.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < vh && r.bottom > 0) el.classList.add("in")
      })
    }, 1500)
    window.addCleanup(() => { io.disconnect(); clearTimeout(safety) })
  }

  // drift and tone, both driven by one scroll handler
  const drifters = Array.from(document.querySelectorAll("[data-drift]"))
  const toned = Array.from(document.querySelectorAll("[data-tone]"))
  const root = document.documentElement
  let ticking = false
  const frame = () => {
    ticking = false
    const vh = window.innerHeight
    if (!reduce) {
      for (const el of drifters) {
        const r = el.getBoundingClientRect()
        const c = (r.top + r.height / 2 - vh / 2) / vh
        el.style.setProperty("--drift", (-c * 16).toFixed(1) + "px")
      }
    }
    let best = null, bestDist = Infinity
    for (const el of toned) {
      const r = el.getBoundingClientRect()
      if (r.bottom < vh * 0.25 || r.top > vh * 0.75) continue
      const d = Math.abs(r.top + r.height / 2 - vh / 2)
      if (d < bestDist) { bestDist = d; best = el }
    }
    if (best) root.style.setProperty("--tone", best.getAttribute("data-tone"))
    else root.style.removeProperty("--tone")
  }
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(frame)
  }
  if (drifters.length || toned.length) {
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    onScroll()
    window.addCleanup(() => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      root.style.removeProperty("--tone")
    })
  } else {
    root.style.removeProperty("--tone")
  }

  // the next thing that runs without him
  const runs = Array.from(document.querySelectorAll("[data-runs]"))
  if (runs.length) {
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
    const fmt = (target, now) => {
      const s = Math.max(0, Math.floor((target - now) / 1000))
      const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
      return (d ? d + "d " : "") + pad(h) + ":" + pad(m) + ":" + pad(s % 60)
    }
    const items = runs.map((el) => ({
      el,
      list: el.getAttribute("data-runs").split(";;").map((p) => {
        const i = p.indexOf("=")
        return { label: p.slice(0, i), sched: parse(p.slice(i + 1)) }
      }).filter((x) => x.sched),
    }))
    const tick = () => {
      const now = new Date()
      for (const it of items) {
        let soon = null
        for (const x of it.list) {
          const t = next(x.sched, now)
          if (!soon || t < soon.t) soon = { t, label: x.label }
        }
        if (soon) it.el.textContent = soon.label + " runs again in " + fmt(soon.t, now)
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    window.addCleanup(() => clearInterval(timer))
  }
})
`
