// Client script for the opening map on the home page. The map starts as one dot. As it scrolls into
// view it grows the branches out of it, then their pieces, and stays open. Tapping a dot opens a card beside it.
// The data sits in the page itself (Maps.tsx reads maps/<name>.json at build). Dot states are a snapshot.
// It runs on its own as soon as the page is ready, and again after each in-site navigation, so the
// map draws even when the site's other scripts are slow or missing; a flag keeps it from drawing twice.
export const mapsScript = `
;(() => {
// Private notes. On the copy of this page published to claude.ai, the owner can keep a note on any
// piece, read only by the owner or an editor there: it lives in that page's own store (collection
// "notes", one document per piece, "<system>.<piece>"), never in this repo or on the site, where
// window.claude does not exist and nothing of this shows.
const priv = (async () => {
  try {
    if (!window.claude || !window.claude.use) return null
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")])
    if (!db || !user) return null
    const [own, edit] = await Promise.all([user.isOwner(), user.canEdit()])
    if (!own && !edit) return null
    const notes = {}, hooks = new Set()
    db.collection("notes").onSnapshot((snap) => {
      snap.docChanges().forEach((c) => { if (c.type === "removed") delete notes[c.doc.id]; else notes[c.doc.id] = c.doc.data() })
      hooks.forEach((f) => f())
    }, () => {})
    return { db, notes, hooks }
  } catch (e) { return null }
})()
function initMap(root) {
  if (!root || root.dataset.ready) return
  root.dataset.ready = "1"
  const svg = root.querySelector("svg")
  const pop = root.querySelector(".omap-pop")
  const stage = root.querySelector(".omap-stage")
  const sysEl = root.closest(".maps-sys"), sys = (sysEl && sysEl.dataset.sys) || "map"
  let sel = null
  // on a narrow screen the map scrolls sideways: keep what was just opened in view
  const focusX = (x, smooth) => {
    if (stage.scrollWidth <= stage.clientWidth) return
    const vb = svg.viewBox.baseVal, scale = svg.clientWidth / vb.width
    stage.scrollTo({ left: (x - vb.x) * scale - stage.clientWidth / 2, behavior: smooth && !reduce ? "smooth" : "auto" })
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
    // a system can take its colours from its centre (Penny: the glaze of pot #2,158)
    if (D.theme) { Object.assign(C, D.theme.colors || {}); for (const k in D.theme.vars || {}) root.style.setProperty(k, D.theme.vars[k]) }
    const N = D.nodes, by = {}
    const phone = root.querySelector(".omap-phone")
    // Penny's centre is a square of 10,000 tiny cells, one per pot, the ones made filled in
    const grid = D.grid, pots = D.pots
    N.forEach((d) => { by[d.id] = d; d.kids = [] })
    N.forEach((d) => { if (d.p) { by[d.p].kids.push(d); if (!d.kind) d.kind = by[d.p].kind } })
    const centre = N.find((d) => d.hub === 2)
    N.forEach((h) => { if (h.hub !== 1) return; const k = h.kids.length, G = k > 4 ? 66 : 72, lx = h.side === "l" ? 230 : 1170
      h.kids.forEach((d, i) => { if (d.x != null) { d.side = h.side; d.r = 7; return } d.x = lx; d.y = h.y + (i - (k - 1) / 2) * G; d.side = h.side; d.r = 7 }) })
    // a piece can have a piece of its own (Instagram's reel maker): it carries its own x and y
    N.forEach((d) => { if (d.p && by[d.p].hub !== 1) { d.r = 7; d.side = by[d.p].side } })
    // On a phone the whole system runs top to bottom so it fits the screen: the phone at the top,
    // then each branch down one line on the left, its pieces stepping off it to the right.
    const vert = window.matchMedia("(max-width: 720px)").matches
    if (vert) {
      root.classList.add("vert")
      const order = (D.order || ["find", "port", "numbers", "launch"]).map((k) => by[k]).filter(Boolean)
      N.forEach((h) => { if (h.hub === 1 && !order.includes(h)) order.push(h) })
      const SX = 70, PX = 112
      centre.x = SX; centre.y = grid || pots ? 50 : 0
      let y = grid || pots ? 190 : 110, prev = centre
      order.forEach((h) => {
        h.x = SX; h.y = y; h.from = prev; prev = h
        let row = 0
        const place = (k, depth) => { k.x = PX + depth * 30; k.y = y + 62 + row * 54; row++; k.kids.forEach((g) => place(g, depth + 1)) }
        h.kids.forEach((k) => place(k, 0))
        y += 62 + row * 54 + 40
      })
      svg.setAttribute("viewBox", (phone ? "0 -20 390 " : "0 -34 390 ") + (y - (phone ? 30 : 16)))
    }
    const hubState = (h) => { const s = h.kids.map((k) => k.st)
      if (s.every((x) => x === "done")) return "done"; if (s.some((x) => x === "now")) return "now"
      if (s.every((x) => x === "plan")) return "plan"; return "built" }
    N.forEach((d) => { d.state = d.hub === 1 ? hubState(d) : d.st })

    const gE = sv("g"), gN = sv("g"); svg.append(gE, gN)
    // S units square, 100 by 100 cells; the first grid.made cells (in number order, row by row) filled
    // or a real pot, its number and price under it; each tap shows the next one
    let potImg = null
    const price = (n) => "#" + n.toLocaleString("en-US") + " · $" + (n / 100).toFixed(2)
    function potPhoto(W) {
      // a cut-out pot, so it sits right on the page; its shape sets the height
      const H = W * (pots[0].h || 1), src = (n) => "./maps/penny-pots/" + n + ".png"
      potImg = sv("image", { href: src(pots[0].n), x: -W / 2, y: -H / 2, width: W, height: H, class: "pot" })
      pots.forEach((p) => { const im = new Image(); im.src = src(p.n) })
      return [sv("rect", { class: "hit", x: -W / 2, y: -H / 2, width: W, height: H }),
        potImg]  // no outline box around the pot
    }
    function gridSquare(S, col) {
      const c = S / 100, x0 = -S / 2, y0 = -S / 2, id = "pg" + Math.random().toString(36).slice(2, 7)
      const defs = sv("defs")
      const mk = (pid, fill) => { const pt = sv("pattern", { id: pid, width: c, height: c, patternUnits: "userSpaceOnUse", x: x0, y: y0 })
        pt.append(sv("rect", { width: c * 0.72, height: c * 0.72, fill })); return pt }
      defs.append(mk(id + "e", "var(--lightgray)"), mk(id + "f", col))
      const m = Math.min(grid.made, 10000), r = Math.floor(m / 100), rem = m % 100
      return [defs,
        sv("rect", { class: "hit", x: x0 - 6, y: y0 - 6, width: S + 12, height: S + 12 }),
        sv("rect", { class: "ring", x: x0 - 8, y: y0 - 8, width: S + 16, height: S + 16, rx: 4 }),
        sv("rect", { x: x0, y: y0, width: S, height: S, fill: "var(--light)" }),
        sv("rect", { x: x0, y: y0, width: S, height: S, fill: "url(#" + id + "e)" }),
        sv("rect", { x: x0, y: y0, width: S, height: r * c, fill: "url(#" + id + "f)" }),
        sv("rect", { x: x0, y: y0 + r * c, width: rem * c, height: c, fill: "url(#" + id + "f)" })]
    }
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
        // a piece that runs on its own keeps sending small dots along its line into its branch
        if (d.auto) { d.edge.classList.add("auto"); gE.append(sv("path", { d: path, class: "flow" })) }
      }
      const g = sv("g", { class: "n" + (d.hub ? " opens" : ""), tabindex: "0", role: "button", transform: "translate(" + d.x + "," + d.y + ")" })
      const inner = sv("g", { class: "in" })
      // the centre is the phone itself (Maps.tsx), so it has no dot of its own, only its name under the phone
      if (d === centre && phone) inner.append(sv("circle", { class: "hit", r: 26 }))
      else if (d === centre && grid) inner.append(...gridSquare(vert ? 120 : 170, C[d.kind]))
      else if (d === centre && pots) inner.append(...potPhoto(vert ? 110 : 170))
      else inner.append(sv("circle", { class: "hit", r: 26 }), sv("circle", { class: "ring", r: d.r + 7 }), dot(d.state, d.r, C[d.kind]))
      let a, x0, ys
      if (vert) { a = "start"; if (d === centre) { x0 = phone ? 24 : grid ? 74 : pots ? 62 : 34; ys = phone ? [34, 56] : grid || pots ? [-8, 14] : [-2, 20] } else if (d.hub === 1) { x0 = 26; ys = [9, 31] } else { x0 = 17; ys = [-2, 18] } }
      else if (d.lab === "right-high") { a = "start"; x0 = 24; ys = [-40, -18] }
      else if (d.lab === "right") { a = "start"; x0 = 24; ys = [-6, 16] }
      else if (d.hub === 2) { a = "middle"; x0 = 0; ys = phone ? [178, 200] : grid ? [118, 140] : pots ? [122, 144] : [56, 78] }
      else if (d.hub === 1) { a = "middle"; x0 = 0; ys = d.below ? [44, 66] : [-44, -24] }
      else { a = d.side === "l" ? "end" : "start"; x0 = d.side === "l" ? -17 : 17; ys = [-2, 18] }
      let sub = d.s || ""
      if (d === centre && pots) sub = price(pots[0].n)
      if (d.hub === 1) { const c = {}; d.kids.forEach((k) => { c[k.st] = (c[k.st] || 0) + 1 }); const parts = []
        if (c.done) parts.push(c.done + " done"); if (c.now) parts.push(c.now + " refining"); if (c.built) parts.push(c.built + " built"); if (c.plan) parts.push(c.plan + " planned"); sub = parts.join(" · ") }
      inner.append(sv("text", { class: d.hub ? "t-hub" : "t-leaf", x: x0, y: ys[0], "text-anchor": a }, d.n), sv("text", { class: "t-sub", x: x0, y: ys[1], "text-anchor": a }, sub))
      g.append(inner)
      g.setAttribute("aria-label", d.n + (d.hub === 1 ? "" : ", " + LABEL[d.state]) + (d.auto ? ", runs on its own" : "") + (sub ? ", " + sub : ""))
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
    function openHub(h, base) { h.g.classList.add("open"); h.kids.forEach((k, i) => { show(k, base + i * 70); k.kids.forEach((g, j) => show(g, base + i * 70 + 320 + j * 70)) }) }
    let isOpen = false, io = null
    function openCentre() {
      isOpen = true
      centre.g.classList.add("open")
      hubs.forEach((h, i) => { show(h, i * 110); openHub(h, 650 + i * 160) })
    }
    // the reverse: the pieces fold back first, then the branches, each line pulling back into the phone
    function hide(d, delay) {
      if (!d.shown) return; d.shown = false
      const t = reduce ? 0 : delay
      if (d.edge) { d.edge.style.transitionDelay = (reduce ? 0 : t + 150) + "ms"; d.edge.classList.remove("on") }
      d.g.style.transitionDelay = t + "ms"; d.g.classList.remove("on", "open")
    }
    function closeCentre() {
      isOpen = false
      close()
      centre.g.classList.remove("open")
      N.filter((d) => d !== centre && d.hub !== 1).reverse().forEach((d, i) => hide(d, i * 35))
      hubs.forEach((h, i) => hide(h, 450 + i * 90))
    }
    // tapping the phone folds the system back into it, and tapping again brings it back out
    if (phone) {
      const toggle = () => { if (io) { io.disconnect(); io = null } isOpen ? closeCentre() : openCentre() }
      phone.addEventListener("click", toggle)
      phone.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); toggle() } })
    }
    function tap(d) {
      // like the phone: tapping the centre (a pot, a site) folds the system into it, and tapping again brings it back out
      if (d === centre && !phone) { if (io) { io.disconnect(); io = null } close(); isOpen ? closeCentre() : openCentre(); return }
      if (d === centre && !centre.g.classList.contains("open")) openCentre()
      pick(d)
    }
    function pick(d) {
      if (sel && sel !== d) dropNote(sel)
      sel = d
      N.forEach((x) => x.g.classList.toggle("sel", x === d))
      pop.innerHTML = ""
      const x = el("button", "omap-x", "×"); x.type = "button"; x.setAttribute("aria-label", "Close")
      x.addEventListener("click", close)
      const h = el("div", "omap-name"); h.append(el("b", null, d.n)); if (d.s && d.hub !== 1) h.append(el("span", null, d.s))
      const r = el("div", "omap-body"), para = el("p")
      // a word in the text can be a link (d.tl = [word, address])
      const at = d.tl ? d.t.indexOf(d.tl[0]) : -1
      if (at < 0) para.textContent = d.t
      else { const a = el("a", "omap-inline", d.tl[0]); a.href = d.tl[1]; a.target = "_blank"; a.rel = "noopener"
        para.append(document.createTextNode(d.t.slice(0, at)), a, document.createTextNode(d.t.slice(at + d.tl[0].length))) }
      r.append(para)
      if (d.link) { const a = el("a", "omap-link", d.link[0] + " →"); a.href = d.link[1]; a.target = "_blank"; a.rel = "noopener"; r.append(a) }
      if (d.opts) { r.append(el("div", "lbl", "Other ideas I weighed")); const ol = el("ul", "opts")
        d.opts.forEach((x) => { const li = el("li"); li.append(el("b", null, x[0]), document.createTextNode(": " + x[1])); ol.append(li) }); r.append(ol) }
      if (d.gate) { r.append(el("div", "lbl", "How each video is made")); const gl = el("ul", "gate"); d.gate.forEach((x) => gl.append(el("li", null, x))); r.append(gl) }
      if (d.steps) { r.append(el("div", "lbl", d.stepsLabel || "What’s happened so far")); const stl = el("div", "steps")
        d.steps.forEach((x) => { const row = el("div"); const s = sv("svg", { viewBox: "-8 -8 16 16" }); s.append(dot(x[3], 6.5, C[d.kind]))
          const tx = el("span"); tx.append(el("b", null, x[1]), el("small", null, x[2])); row.append(s, tx); stl.append(row) }); r.append(stl) }
      if (d.shape) { r.append(el("div", "lbl", "Posting it")); const sh = el("div", "shape")
        d.shape.forEach((x) => { const c = el("div"); c.append(el("b", null, x[0]), document.createTextNode(" " + x[1])); sh.append(c) }); r.append(sh) }
      if (d.auto) { const s = el("div", "state"); const g = sv("svg", { viewBox: "-8 -8 16 16" }); g.append(sv("path", { d: "M7 0 H-7", class: "flow" })); s.append(g, document.createTextNode("Runs on its own")); r.append(s) }
      if (d.hub !== 1) { const s = el("div", "state"); const g = sv("svg", { viewBox: "-8 -8 16 16" }); g.append(dot(d.state, 6, C[d.kind])); s.append(g, document.createTextNode(LABEL[d.state])); r.append(s) }
      pop.append(x, h, r)
      pop.hidden = false
      place(d)
      priv.then((P) => { if (P && alive && sel === d && !pop.hidden) noteBox(P, d, r) })
    }
    // the owner's private note on this piece (see priv above): a box under the card, saved when you leave it
    function noteBox(P, d, r) {
      const key = sys + "." + d.id, ref = P.db.doc("notes/" + key)
      r.append(el("div", "lbl priv", "Notes, only you see these"))
      const ta = el("textarea", "omap-note"); ta.rows = 4; ta.placeholder = "What’s really going on with this piece"
      const st = el("div", "omap-note-st", "")
      let saved = (P.notes[key] && P.notes[key].text) || ""
      ta.value = saved
      const save = () => { const v = ta.value.trim(); if (v === saved) return; saved = v; st.textContent = "Saving…"
        ;(v ? ref.set({ text: v, at: new Date().toISOString() }) : ref.delete()).then(() => { st.textContent = v ? "Saved" : "Cleared" }, () => { st.textContent = "That didn’t save. Try again in a moment." }) }
      const refresh = () => { if (document.activeElement === ta) return; const v = (P.notes[key] && P.notes[key].text) || ""; if (v !== saved) { saved = v; ta.value = v } }
      ta.addEventListener("blur", save)
      ta.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); save() } })
      P.hooks.add(refresh)
      d.noteSave = save; d.noteOff = () => P.hooks.delete(refresh)
      r.append(ta, st)
    }
    function dropNote(d) { if (d.noteSave) d.noteSave(); if (d.noteOff) d.noteOff(); d.noteSave = d.noteOff = null }
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
    function close() { if (sel) dropNote(sel); sel = null; pop.hidden = true; pop.innerHTML = ""; N.forEach((x) => x.g.classList.remove("sel")) }
    const onDoc = (e) => { if (!pop.hidden && !e.target.closest(".omap-pop") && !e.target.closest(".omap .n")) close() }
    const onKey = (e) => { if (e.key === "Escape" && !pop.hidden) close() }
    document.addEventListener("click", onDoc)
    document.addEventListener("keydown", onKey)
    cleanup(() => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onKey); if (sel) dropNote(sel) })
    centre.g.classList.add("on")
    focusX(centre.x, false)
    // the map opens by itself, whole, as it scrolls into view, and stays open
    if (reduce || !("IntersectionObserver" in window)) openCentre()
    else {
      io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); io = null; openCentre() }
      }, { rootMargin: "0px 0px -20% 0px", threshold: 0 })
      io.observe(stage)
      cleanup(() => { if (io) io.disconnect() })
    }
  })()
}
// "While the system runs, I'm …": the last word keeps changing, a few seconds each
function initMeanwhile() {
  const w = document.querySelector(".maps-meanwhile .ing")
  if (!w || w.dataset.ready) return
  w.dataset.ready = "1"
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const pic = document.querySelector(".maps-meanwhile .mw-pic")
  const srcs = pic ? pic.dataset.srcs.split("|") : []
  srcs.forEach((k) => { const im = new Image(); im.src = "./maps/meanwhile/" + k + ".jpg" })  // load them all now so each swap is instant
  const words = w.dataset.words.split("|")
  let i = 0
  const t = setInterval(() => {
    w.classList.add("out"); if (pic) pic.classList.add("out")
    setTimeout(() => { i = (i + 1) % words.length; w.textContent = words[i]; w.classList.remove("out")
      if (pic) { pic.src = "./maps/meanwhile/" + srcs[i] + ".jpg"; pic.classList.remove("out") } }, 350)
  }, 2600)
  if (window.addCleanup) window.addCleanup(() => clearInterval(t))
}
document.addEventListener("nav", initMeanwhile)
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMeanwhile)
else initMeanwhile()
// "Systems I'm running" shows one system at a time; the buttons above swap which one.
// Each system opens by itself the first time it comes into view.
function initAll() {
  document.querySelectorAll(".omap").forEach(initMap)
  const tabs = document.querySelectorAll(".maps-tab")
  tabs.forEach((b) => {
    if (b.dataset.ready) return
    b.dataset.ready = "1"
    b.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", t === b ? "true" : "false"))
      document.querySelectorAll(".maps-sys").forEach((p) => { p.hidden = p.dataset.sys !== b.dataset.sys })
      document.querySelectorAll(".omap-pop").forEach((p) => { p.hidden = true })
    })
  })
}
document.addEventListener("nav", initAll)
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAll)
else initAll()
})()
`
