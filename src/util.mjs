/** Small helpers shared by the stack and project cards: brand marks, word wrap, inline flow. */
import { createRequire } from 'node:module'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { measure } from './lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
export const JD_DIR = join(here, '..', '..', '..', 'jdflores-dev')
export const si = createRequire(join(JD_DIR, 'package.json'))('simple-icons')

/** Greedy word wrap by real glyph advances. */
export function wrap(key, text, size, maxW, wght, track = 0) {
  const lines = []
  let cur = ''
  for (const word of text.split(' ')) {
    const next = cur ? cur + ' ' + word : word
    if (cur && measure(key, next, size, track, wght).width > maxW) { lines.push(cur); cur = word } else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

/** A simple-icons path (24-unit grid) drawn at size s with its top-left at x,y. */
export const icon = (d, x, y, s, fill) => `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s / 24).toFixed(4)})" d="${d}" fill="${fill}"/>`

/** Lays inline items (optional mark + text) into lines no wider than maxW. */
export function flow(items, { key, size, wght, track = 0, maxW, iconS, iconGap, gap }) {
  let x = 0, line = 0
  const out = items.map((it) => {
    const w = (it.mark ? iconS + iconGap : 0) + measure(key, it.txt, size, track, wght).width
    if (x > 0 && x + w > maxW) { line++; x = 0 }
    const r = { ...it, x, line, w }
    x += w + gap
    return r
  })
  return { out, lines: line + 1 }
}
