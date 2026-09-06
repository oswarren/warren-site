// Client script for the Make One page. The page asks a visitor what they keep meaning to do, then
// designs one small system for it and shows it being built, line by line.
//
// The design call goes to a small endpoint on Vercel (make-one-api), which holds the API key. If that
// call fails for any reason (no key, rate limit, offline), the page falls back to its own canned four
// lines, so a visitor always sees something rather than an error.
export const makeOneScript = `
document.addEventListener("nav", () => {
  const pool = document.getElementById("pool")
  if (!pool || pool.dataset.wired === "1") return
  pool.dataset.wired = "1"

  const ENDPOINT = "https://make-one-api-oswarren.vercel.app/api/design"
  const MAILTO = "opensourcewarren@gmail.com"

  const WANTS = [
    "Meet people in a new area",
    "Get my work in front of strangers",
    "Find someone to make things with",
    "Know every place worth going near me",
    "Turn what I know into something people use",
    "Have my work found while I sleep",
    "Keep every good idea I have ever had",
    "Learn a place before I move there",
    "Turn a year of notes into a book",
    "Find the people who would buy what I make",
    "Never miss the thing I would have loved",
    "Get out of the house more",
    "Make my archive searchable by anyone",
    "Find collaborators for a strange idea",
    "Send my parents something weekly",
    "Get my photos into someone's hands",
    "Know what my town is doing first",
    "Read the things I save",
    "Find the used one before anyone else",
    "Build a following without posting daily",
    "Give my work a place to live",
    "Meet one new person a month",
    "Turn a hobby into something with an address",
    "Keep in touch without trying",
  ]

  const el = (id) => document.getElementById(id)
  const built = el("built"), yours = el("yours"), sysname = el("sysname")
  const thinking = el("thinking"), firstrun = el("firstrun"), firstEl = el("first")
  const ask = el("ask"), ownInput = el("ownInput"), poolnote = el("poolnote")
  const pivot = el("pivot"), insteadEl = el("instead"), sentNote = el("sentNote"), fine = el("fine")
  const steps = [el("st0"), el("st1"), el("st2"), el("st3")]
  const whats = [el("w0"), el("w1"), el("w2"), el("w3")]

  let timers = [], shown = 0, current = null, variant = 0, ctl = null

  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
  }
  const order = shuffle(WANTS.slice())

  const button = (label) => {
    const b = document.createElement("button")
    b.className = "want"
    b.type = "button"
    b.textContent = label
    b.addEventListener("click", () => start(label))
    return b
  }

  const render = () => {
    pool.innerHTML = ""
    for (let k = 0; k < 9; k++) pool.appendChild(button(order[(shown + k) % order.length]))
  }

  const clearReveal = () => {
    timers.forEach(clearTimeout)
    timers = []
    steps.forEach((s) => s.classList.remove("on"))
    firstrun.classList.remove("on")
    ask.classList.remove("on")
    sysname.textContent = ""
    pivot.hidden = true
    insteadEl.textContent = ""
    sentNote.classList.remove("on")
    fine.style.display = ""
  }

  const reveal = (spec) => {
    spec.slice(0, 4).forEach((text, n) => {
      timers.push(setTimeout(() => {
        whats[n].textContent = text
        steps[n].classList.add("on")
      }, 120 + n * 480))
    })
    timers.push(setTimeout(() => {
      firstEl.textContent = spec[4]
      firstrun.classList.add("on")
    }, 120 + 4 * 480))
    timers.push(setTimeout(() => ask.classList.add("on"), 120 + 5 * 480))
  }

  const localSpec = (want) => [
    "whatever you already keep about this, wherever you keep it",
    "what changed since the last time you looked",
    "the short version, sent to you at the moment it is useful",
    "nothing, once it is running",
    "Here is what moved this week on: " + want.toLowerCase() + ".",
  ]

  const design = async (payload, signal) => {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: signal,
    })
    if (!r.ok) throw new Error("endpoint " + r.status)
    return await r.json()
  }

  async function start(want, keepVariant) {
    if (!keepVariant) variant = 0
    current = { want: want, spec: null }
    clearReveal()
    yours.textContent = want.charAt(0).toUpperCase() + want.slice(1) + "."
    built.classList.add("on")
    built.scrollIntoView({ behavior: "smooth", block: "start" })

    thinking.hidden = false
    if (ctl) ctl.abort()
    ctl = new AbortController()
    try {
      const data = await design({ mode: "design", want: want, variant: variant }, ctl.signal)
      thinking.hidden = true
      if (!data || !data.source) throw new Error("shape")
      if (data.means) {
        insteadEl.textContent = "Which means: " + data.means + "."
        pivot.hidden = false
        current.means = data.means
      }
      sysname.textContent = data.name || ""
      current.name = data.name || ""
      current.spec = [data.source, data.decides, data.hands, data.yourpart || "nothing, once it is running", data.first]
      reveal(current.spec)
    } catch (e) {
      if (e && e.name === "AbortError") return
      thinking.hidden = true
      current.spec = localSpec(want)
      reveal(current.spec)
    }
  }

  el("again").addEventListener("click", () => {
    if (!current) return
    variant++
    start(current.want, true)
  })

  el("dunno").addEventListener("click", async () => {
    poolnote.textContent = "Thinking of some..."
    try {
      const out = await design({ mode: "wants" })
      if (out && out.wants && out.wants.length) {
        pool.innerHTML = ""
        out.wants.slice(0, 9).forEach((label) => pool.appendChild(button(label)))
        poolnote.textContent = "Nine that did not exist a second ago."
        return
      }
      throw new Error("shape")
    } catch (e) {
      shown = (shown + 9) % order.length
      render()
      poolnote.textContent = "Here are some others."
    }
  })

  el("more").addEventListener("click", () => {
    shown = (shown + 9) % order.length
    render()
  })

  ownInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && ownInput.value.trim().length > 2) start(ownInput.value.trim())
  })
  ownInput.addEventListener("blur", () => {
    const v = ownInput.value.trim()
    if (v.length > 2 && (!current || current.want !== v)) start(v)
  })

  el("send").addEventListener("click", () => {
    if (!current || !current.spec) return
    const who = el("who").value.trim()
    const mail = el("mail").value.trim()
    const body = [
      "What I keep meaning to do:",
      current.want + (current.means ? " (which means: " + current.means + ")" : ""),
      "",
      current.name ? "What the page called it: " + current.name : "",
      "Reads: " + current.spec[0],
      "Decides: " + current.spec[1],
      "Sends me: " + current.spec[2],
      "My part: " + current.spec[3],
      "First one would read: " + current.spec[4],
      "",
      "Name: " + (who || "(not given)"),
      "Reach me at: " + (mail || "(not given)"),
    ].join("\\n")
    window.location.href = "mailto:" + MAILTO + "?subject=" + encodeURIComponent("Build me one") +
      "&body=" + encodeURIComponent(body)
    fine.style.display = "none"
    sentNote.textContent = "Your mail app should be opening with all of it written out. If it did not, send the same to " + MAILTO + " and I will start on it."
    sentNote.classList.add("on")
  })

  render()
})
`
