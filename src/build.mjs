/**
 * Builds every card in both worlds into assets/, then renders each
 * one's resting frame to .review/ for a look.
 *   node src/build.mjs            build + review renders
 *   node src/build.mjs hero       only the cards whose name contains "hero"
 */
import { createRequire } from 'node:module'
import { mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { WORLDS, write } from './lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const out = join(root, 'assets')
const review = join(root, '.review')
mkdirSync(out, { recursive: true })
mkdirSync(review, { recursive: true })

// Each card module exports `cards`: { name: (t) => svgString }.
const filter = process.argv[2] ?? ''
const built = []
for (const file of readdirSync(here).filter((f) => f.endsWith('.mjs') && !['lib.mjs', 'build.mjs', 'check.mjs', 'util.mjs'].includes(f))) {
  const mod = await import(pathToFileURL(join(here, file)).href)
  for (const [name, render] of Object.entries(mod.cards ?? {})) {
    if (!name.includes(filter)) continue
    for (const t of Object.values(WORLDS)) {
      const fname = `${name}-${t.world}.svg`
      console.log(write(out, fname, render(t)))
      built.push(fname)
    }
  }
}

const { chromium } = createRequire(join(root, '..', '..', 'jdflores-dev', 'package.json'))('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 })
for (const f of built) {
  await page.goto(pathToFileURL(join(out, f)).href)
  await page.waitForTimeout(4500) // past every arrival animation: the resting frame
  await page.locator('svg').screenshot({ path: join(review, f.replace('.svg', '.png')) })
}
await browser.close()
console.log(`rendered ${built.length} to .review/`)
