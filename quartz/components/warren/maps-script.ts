// Client script for the opening map on the home page. The map starts as one dot. As it scrolls into
// view it grows the branches out of it, then their pieces, and stays open. Tapping a dot opens a card beside it.
// The data sits in the page itself (Maps.tsx reads maps/<name>.json at build). Dot states are a snapshot.
// It runs on its own as soon as the page is ready, and again after each in-site navigation, so the
// map draws even when the site's other scripts are slow or missing; a flag keeps it from drawing twice.
export const mapsScript = `
;(() => {
function initMap() {
  const root = document.querySelector(".omap")
  if (!root || root.dataset.ready) return
  root.dataset.ready = "1"
  const svg = root.querySelector("svg")
  const pop = root.querySelector(".omap-pop")
  const stage = root.querySelector(".omap-stage")
  // on a narrow screen the map scrolls sideways: keep what was just opened in view
  const focusX = (x, smooth) => {
    if (stage.scrollWidth <= stage.clientWidth) return
    const scale = svg.clientWidth / 1450
    stage.scrollTo({ left: (x + 50) * scale - stage.clientWidth / 2, behavior: smooth && !reduce ? "smooth" : "auto" })
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const NS = "http://www.w3.org/2000/svg"
  const C = { pro: "#2a78d6", cer: "#eb6834", biz: "#008300", web: "#e87ba4", ana: "#1baf7a", wri: "#eda100" }
  const LABEL = { plan: "Planned", built: "Built, needs work", now: "Refining now", done: "Done" }
  const cleanup = (f) => { if (window.addCleanup) window.addCleanup(f) }
  let alive = true
  cleanup(() => { alive = false })

  const sv = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e }
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e }
  function dot(st, r, c) {
    const g = sv("g")
    if (st === "plan") { g.append(sv("circle", { r, class: "d-bg", stroke: "var(--gray)", "stroke-width": 1.5, "stroke-dasharray": "2.5 2" })); return g }
    g.append(sv("circle", { r, class: "d-bg", stroke: c, "stroke-width": 2 }))
    if (st === "now") g.append(sv("path", { d: "M0 " + -r + " A" + r + " " + r + " 0 0 0 0 " + r + " Z", fill: c }))
    if (st === "done") g.append(sv("circle", { r, fill: c }))
    return g
  }

  ;(() => {
    const D = JSON.parse(root.querySelector(".omap-data").textContent)
    if (!alive) return
    const N = D.nodes, by = {}
    N.forEach((d) => { by[d.id] = d; d.kids = [] })
    N.forEach((d) => { if (d.p) by[d.p].kids.push(d) })
    const centre = N.find((d) => d.hub === 2)
    N.forEach((h) => { if (h.hub !== 1) return; const k = h.kids.length, G = k > 4 ? 66 : 72, lx = h.side === "l" ? 230 : 1170
      h.kids.forEach((d, i) => { d.x = lx; d.y = h.y + (i - (k - 1) / 2) * G; d.side = h.side; d.r = 7 }) })
    // On a phone the whole system runs top to bottom so it fits the screen: the phone at the top,
    // then each branch down one line on the left, its pieces stepping off it to the right.
    const vert = window.matchMedia("(max-width: 720px)").matches
    if (vert) {
      root.classList.add("vert")
      const order = ["find", "port", "numbers", "launch"].map((k) => by[k]).filter(Boolean)
      N.forEach((h) => { if (h.hub === 1 && !order.includes(h)) order.push(h) })
      const SX = 70, PX = 112
      centre.x = SX; centre.y = 0
      let y = 110, prev = centre
      order.forEach((h) => {
        h.x = SX; h.y = y; h.from = prev; prev = h
        h.kids.forEach((k, i) => { k.x = PX; k.y = y + 62 + i * 54 })
        y += 62 + h.kids.length * 54 + 40
      })
      svg.setAttribute("viewBox", "0 -20 390 " + (y - 30))
    }
    const hubState = (h) => { const s = h.kids.map((k) => k.st)
      if (s.every((x) => x === "done")) return "done"; if (s.some((x) => x === "now")) return "now"
      if (s.every((x) => x === "plan")) return "plan"; return "built" }
    N.forEach((d) => { d.state = d.hub === 1 ? hubState(d) : d.st })

    const gE = sv("g"), gN = sv("g"); svg.append(gE, gN)
    N.forEach((d) => {
      if (d !== centre) {
        const p = d.from || (d.p ? by[d.p] : centre)
        // on a phone, pieces step down then across from their branch
        const elbow = vert && d.p
        const len = elbow ? Math.abs(d.y - p.y) + Math.abs(d.x - p.x) : Math.hypot(d.x - p.x, d.y - p.y)
        const path = elbow ? "M" + p.x + " " + p.y + " V" + d.y + " H" + d.x : "M" + p.x + " " + p.y + " L" + d.x + " " + d.y
        d.edge = sv("path", { d: path, class: "e" + (d.state === "now" ? " now" : d.state === "plan" ? " plan" : "") })
        d.edge.style.setProperty("--len", len)
        gE.append(d.edge)
      }
      const g = sv("g", { class: "n" + (d.hub ? " opens" : ""), tabindex: "0", role: "button", transform: "translate(" + d.x + "," + d.y + ")" })
      const inner = sv("g", { class: "in" })
      // the centre is the phone itself (Maps.tsx), so it has no dot of its own, only its name under the phone
      if (d === centre) inner.append(sv("circle", { class: "hit", r: 26 }))
      else inner.append(sv("circle", { class: "hit", r: 26 }), sv("circle", { class: "ring", r: d.r + 7 }), dot(d.state, d.r, C[d.kind]))
      let a, x0, ys
      if (vert) { a = "start"; if (d === centre) { x0 = 24; ys = [34, 56] } else if (d.hub === 1) { x0 = 26; ys = [9, 31] } else { x0 = 17; ys = [-2, 18] } }
      else if (d.lab === "right-high") { a = "start"; x0 = 24; ys = [-40, -18] }
      else if (d.lab === "right") { a = "start"; x0 = 24; ys = [-6, 16] }
      else if (d.hub === 2) { a = "middle"; x0 = 0; ys = [178, 200] }
      else if (d.hub === 1) { a = "middle"; x0 = 0; ys = d.below ? [44, 66] : [-44, -24] }
      else { a = d.side === "l" ? "end" : "start"; x0 = d.side === "l" ? -17 : 17; ys = [-2, 18] }
      let sub = d.s || ""
      if (d.hub === 1) { const c = {}; d.kids.forEach((k) => { c[k.st] = (c[k.st] || 0) + 1 }); const parts = []
        if (c.done) parts.push(c.done + " done"); if (c.now) parts.push(c.now + " refining"); if (c.built) parts.push(c.built + " built"); if (c.plan) parts.push(c.plan + " planned"); sub = parts.join(" · ") }
      inner.append(sv("text", { class: d.hub ? "t-hub" : "t-leaf", x: x0, y: ys[0], "text-anchor": a }, d.n), sv("text", { class: "t-sub", x: x0, y: ys[1], "text-anchor": a }, sub))
      g.append(inner)
      g.setAttribute("aria-label", d.n + (d.hub === 1 ? "" : ", " + LABEL[d.state]) + (sub ? ", " + sub : ""))
      g.addEventListener("click", () => tap(d))
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(d) } })
      d.g = g; gN.append(g)
    })

    const hubs = N.filter((d) => d.hub === 1)
    // show a node, its edge drawing out first, the dot arriving at the end of it
    function show(d, delay) {
      if (d.shown) return; d.shown = true
      const t = reduce ? 0 : delay
      if (d.edge) { d.edge.style.transitionDelay = t + "ms"; d.edge.classList.add("on") }
      d.g.style.transitionDelay = (reduce ? 0 : t + 260) + "ms"; d.g.classList.add("on")
    }
    // one tap on the centre opens everything: the branches first, then each branch's pieces
    function openHub(h, base) { h.g.classList.add("open"); h.kids.forEach((k, i) => show(k, base + i * 70)) }
    function openCentre() {
      centre.g.classList.add("open")
      hubs.forEach((h, i) => { show(h, i * 110); openHub(h, 650 + i * 160) })
    }
    function tap(d) {
      if (d === centre && !centre.g.classList.contains("open")) openCentre()
      pick(d)
    }
    function pick(d) {
      N.forEach((x) => x.g.classList.toggle("sel", x === d))
      pop.innerHTML = ""
      const x = el("button", "omap-x", "×"); x.type = "button"; x.setAttribute("aria-label", "Close")
      x.addEventListener("click", close)
      const h = el("div", "omap-name"); h.append(el("b", null, d.n)); if (d.s && d.hub !== 1) h.append(el("span", null, d.s))
      const r = el("div", "omap-body"); r.append(el("p", null, d.t))
      if (d.opts) { r.append(el("div", "lbl", "Other ideas I weighed")); const ol = el("ul", "opts")
        d.opts.forEach((x) => { const li = el("li"); li.append(el("b", null, x[0]), document.createTextNode(": " + x[1])); ol.append(li) }); r.append(ol) }
      if (d.gate) { r.append(el("div", "lbl", "How each video is made")); const gl = el("ul", "gate"); d.gate.forEach((x) => gl.append(el("li", null, x))); r.append(gl) }
      if (d.steps) { r.append(el("div", "lbl", "What’s happened so far")); const stl = el("div", "steps")
        d.steps.forEach((x) => { const row = el("div"); const s = sv("svg", { viewBox: "-8 -8 16 16" }); s.append(dot(x[3], 6.5, C[d.kind]))
          const tx = el("span"); tx.append(el("b", null, x[1]), el("small", null, x[2])); row.append(s, tx); stl.append(row) }); r.append(stl) }
      if (d.shape) { r.append(el("div", "lbl", "Posting it")); const sh = el("div", "shape")
        d.shape.forEach((x) => { const c = el("div"); c.append(el("b", null, x[0]), document.createTextNode(" " + x[1])); sh.append(c) }); r.append(sh) }
      if (d.hub !== 1) { const s = el("div", "state"); const g = sv("svg", { viewBox: "-8 -8 16 16" }); g.append(dot(d.state, 6, C[d.kind])); s.append(g, document.createTextNode(LABEL[d.state])); r.append(s) }
      pop.append(x, h, r)
      pop.hidden = false
      place(d)
    }
    // the card sits beside the dot: to its right when the dot is on the left half, else to its left.
    // On a phone it is a sheet along the bottom of the screen instead (CSS), so nothing to place.
    function place(d) {
      pop.style.left = pop.style.top = ""
      if (window.matchMedia("(max-width: 720px)").matches) return
      const o = root.getBoundingClientRect(), r = d.g.querySelector(".hit").getBoundingClientRect()
      const cx = r.left + r.width / 2 - o.left, cy = r.top + r.height / 2 - o.top
      const w = pop.offsetWidth, gap = 26
      let left = cx < o.width / 2 ? cx + gap : cx - gap - w
      left = Math.max(0, Math.min(left, o.width - w))
      pop.style.left = left + "px"
      pop.style.top = Math.max(0, cy - 36) + "px"
    }
    function close() { pop.hidden = true; pop.innerHTML = ""; N.forEach((x) => x.g.classList.remove("sel")) }
    const onDoc = (e) => { if (!pop.hidden && !e.target.closest(".omap-pop") && !e.target.closest(".omap .n")) close() }
    const onKey = (e) => { if (e.key === "Escape" && !pop.hidden) close() }
    document.addEventListener("click", onDoc)
    document.addEventListener("keydown", onKey)
    cleanup(() => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onKey) })
    centre.g.classList.add("on")
    focusX(centre.x, false)
    // the map opens by itself, whole, as it scrolls into view, and stays open
    if (reduce || !("IntersectionObserver" in window)) openCentre()
    else {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); openCentre() }
      }, { rootMargin: "0px 0px -20% 0px", threshold: 0 })
      io.observe(stage)
      cleanup(() => io.disconnect())
    }
  })()
}
document.addEventListener("nav", initMap)
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMap)
else initMap()
})()
`
