/**
 * Gate for the cards: every SVG must read complete in the three ways a viewer
 * can show it. `rest` lets the arrival play out; `t0` freezes the clock at
 * zero, which is what static renderers (some webviews, battery saver, apps
 * that rasterise README images) show; `reduced` is prefers-reduced-motion.
 * Writes .review/check-<card>.png with the three frames stacked, and fails if
 * a frozen or reduced frame hides text that the resting frame shows.
 *   node src/check.mjs [filter]
 */
import { createRequire } from 'node:module'
import { readdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const assets = join(root, 'assets')
const filter = process.argv[2] ?? ''
const { chromium } = createRequire(join(root, '..', '..', 'jdflores-dev', 'package.json'))('playwright')

// Fraction of text elements that are actually visible (opacity chain and clip not zeroing them).
const visibleText = () => {
  const els = [...document.querySelectorAll('text')].filter((t) => t.textContent.trim() && !t.closest('[aria-hidden="true"]'))
  const shown = els.filter((t) => {
    for (let e = t; e && e.nodeName !== 'svg'; e = e.parentElement) {
      const s = getComputedStyle(e)
      if (+s.opacity < 0.05 || s.visibility === 'hidden' || s.display === 'none') return false
    }
    const b = t.getBoundingClientRect()
    return b.width > 0 && b.height > 0
  })
  return { total: els.length, shown: shown.length }
}

const browser = await chromium.launch()
let failed = 0
for (const f of readdirSync(assets).filter((f) => f.endsWith('.svg') && f.includes(filter))) {
  const url = pathToFileURL(join(assets, f)).href
  const shots = []
  const result = {}
  for (const mode of ['rest', 't0', 'reduced']) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' })
    await page.goto(url)
    // the SMIL clock back to zero first (it drops the .go gate), then every CSS animation frozen at zero
    if (mode === 't0') await page.evaluate(() => { const s = document.querySelector('svg'); s.pauseAnimations(); s.setCurrentTime(0); document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0 }) })
    else await page.waitForTimeout(mode === 'rest' ? 6000 : 300)
    result[mode] = await page.evaluate(visibleText)
    const p = join(root, '.review', `.${mode}.png`)
    await page.locator('svg').screenshot({ path: p })
    shots.push(p)
    await page.close()
  }
  const ok = ['t0', 'reduced'].every((m) => result[m].shown >= result.rest.shown)
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${f}  text shown rest ${result.rest.shown}/${result.rest.total} · t0 ${result.t0.shown} · reduced ${result.reduced.shown}`)
  // contact sheet: the three frames stacked, labelled
  const sheet = await browser.newPage({ viewport: { width: 1000, height: 600 } })
  const html = join(root, '.review', '.sheet.html')
  writeFileSync(html, `<body style="margin:0;background:#888;font:600 16px system-ui">${shots.map((s, i) => `<div style="padding:4px 8px;color:#fff">${['rest', 't0 (frozen clock)', 'reduced motion'][i]}</div><img src="${pathToFileURL(s).href}" style="display:block;max-width:1000px">`).join('')}</body>`)
  await sheet.goto(pathToFileURL(html).href)
  await sheet.screenshot({ path: join(root, '.review', `check-${f.replace('.svg', '')}.png`), fullPage: true })
  await sheet.close()
  shots.forEach((s) => rmSync(s))
  rmSync(html)
}
await browser.close()
console.log(failed ? `${failed} card(s) hide content when frozen or under reduced motion` : 'all cards complete in every mode')
process.exit(failed ? 1 : 0)
