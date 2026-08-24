#!/usr/bin/env node
// build.mjs → quartz
// Records when the build started, runs the Quartz CLI (`quartz build`), then writes build.json
// ({ when, seconds }) which the Footer, Log and ProvenanceFooter components read.
//
// Ordering note: the site is rendered *during* this script, so the page can only
// show the duration of the previous build. build.json is written twice: once at
// start (this build's time, last build's seconds) and once at the end (real seconds).
import { spawnSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const buildFile = join(root, "build.json")

function localIso(d) {
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

let previousSeconds = null
if (existsSync(buildFile)) {
  try {
    previousSeconds = JSON.parse(readFileSync(buildFile, "utf8")).seconds ?? null
  } catch {}
}

const start = new Date()
writeFileSync(buildFile, JSON.stringify({ when: localIso(start), seconds: previousSeconds }, null, 2) + "\n")

const extra = process.argv.slice(2)
// Run the CLI through node directly (not `npx quartz`): no reliance on an executable bit or a shell.
const cli = join(root, "quartz", "bootstrap-cli.mjs")
const result = spawnSync(process.execPath, [cli, "build", ...extra], { cwd: root, stdio: "inherit" })

const seconds = Math.round(((Date.now() - start.getTime()) / 1000) * 10) / 10
writeFileSync(buildFile, JSON.stringify({ when: localIso(start), seconds }, null, 2) + "\n")

if (result.status !== 0) {
  console.error(`quartz build failed (exit ${result.status})`)
  process.exit(result.status ?? 1)
}
console.log(`built in ${seconds}s → build.json`)
