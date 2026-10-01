/**
 * Shared spine for every README card: the two worlds' tokens, the self-hosted
 * faces (subset to the glyphs each card prints and embedded, because an SVG
 * shown through <img> cannot fetch anything), glyph metrics, and the ornaments.
 *
 * Rules every card follows (they are jdflores-dev/DESIGN.md, carried over):
 * - One spine, two worlds: `dark` is the Deployed Systems Console, `light` the
 *   Aquarium Window. Same names, new values: a card reads `t.<token>` only.
 * - One accent per card. Cyan only on generative ornaments, never on type.
 * - Dark has no shadows (hairlines and tonal steps); light is built from lift.
 * - Motion plays once on arrival (from-only keyframes, so the resting frame is
 *   the complete card even where animation never runs); only ornaments loop.
 *   Everything stops under prefers-reduced-motion; an ornament whose shape
 *   is its motion (the sphere, the rain) carries `hold` and freezes instead.
 * - Width is always W (1000). GitHub shrinks it to ~340px on a phone, so no
 *   text that must be read goes under 22 units.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const FONT_DIR = join(here, '..', '..', '..', 'jdflores-dev', 'public', 'fonts')
const CACHE = join(here, '..', '.cache')
mkdirSync(CACHE, { recursive: true })

export const W = 1000

export const FONTS = {
  michroma: { file: 'michroma-latin.woff2', family: 'JD Michroma' },
  saira: { file: 'saira-latin.woff2', family: 'JD Saira', weight: '100 900', stretch: '50% 125%' },
  neuropol: { file: 'neuropol.woff2', family: 'JD Neuropol' },
  unbounded: { file: 'unbounded-300-latin.woff2', family: 'JD Unbounded', weight: '300' },
  source: { file: 'source-sans-3-latin.woff2', family: 'JD Source', weight: '200 900' },
}

const dark = {
  world: 'dark',
  ground: '#0a0c10', panel: '#111520', band: '#0d1017',
  line: '#222836', lineSoft: '#191e29',
  fg: '#eceef3', fgDim: '#c3c8d4', muted: '#8b93a4', muted2: '#5f6675',
  accent: '#ffb84d', accentBright: '#ffcf82', onAccent: '#3a2a0e',
  signal: '#57e0d8', life: '#7fd88f',
  display: 'michroma', head: 'michroma', body: 'saira', label: 'saira',
  labelCase: 'uppercase', labelTrack: '0.12em', labelWeight: 500, leadWeight: 500,
  radius: 4, radiusLg: 10,
}

const light = {
  world: 'light',
  ground: '#e9f3fc', panel: '#ffffff', band: '#d9e3f0',
  line: 'rgba(0,121,191,0.24)', lineSoft: 'rgba(0,121,191,0.13)',
  fg: '#06344f', fgDim: '#073c5c', muted: '#163d54', muted2: '#21506b',
  accent: '#0079bf', accentBright: '#00b2ff', onAccent: '#ffffff',
  signal: '#ffffff', life: '#6bcb3c', leaf: '#35800f',
  sky: '#00b2ff', water: '#0079bf', grass: '#6bcb3c', glass: '#d9e3f0',
  display: 'neuropol', head: 'unbounded', body: 'source', label: 'source',
  labelCase: 'none', labelTrack: '0.01em', labelWeight: 600, leadWeight: 600,
  radius: 10, radiusLg: 20,
}
dark.leaf = dark.life

export const WORLDS = { dark, light }
/** Labels are capitals in the console and sentence case on glass. Cased here, not in CSS, so the font subset sees the real glyphs. */
export const lbl = (t, s) => (t.labelCase === 'uppercase' ? s.toUpperCase() : s)
export const fam = (key) => `'${FONTS[key].family}', system-ui, sans-serif`

/* ---------- glyph metrics (for per-letter motion without reflow) ---------- */

const metricsCache = {}
function metrics(key, wght) {
  const id = `${key}@${wght ?? 'default'}`
  if (metricsCache[id]) return metricsCache[id]
  const out = join(CACHE, `${id}.metrics.json`)
  if (!existsSync(out)) {
    // variable faces are measured at the weight they are set in, not at their default instance
    const py = `
import json,sys
from fontTools.ttLib import TTFont
t=TTFont(sys.argv[1]); w=sys.argv[3]
if w!='default' and 'fvar' in t:
    from fontTools.varLib import instancer
    t=instancer.instantiateVariableFont(t,{'wght':float(w)})
cmap=t.getBestCmap(); hm=t['hmtx'].metrics
json.dump({'upm':t['head'].unitsPerEm,'adv':{str(c):hm[g][0] for c,g in cmap.items()}},open(sys.argv[2],'w'))`
    execFileSync('python', ['-c', py, join(FONT_DIR, FONTS[key].file), out, String(wght ?? 'default')])
  }
  return (metricsCache[id] = JSON.parse(readFileSync(out, 'utf8')))
}

/** x offset of every character and the total advance, at `size` units, with `track` em of letter-spacing, at weight `wght` for the variable faces (Saira, Source Sans 3). No kerning: close enough for placement. */
export function measure(key, text, size, track = 0, wght) {
  const m = metrics(key, wght)
  const xs = []
  let x = 0
  for (const ch of text) {
    xs.push(x)
    x += ((m.adv[ch.codePointAt(0)] ?? m.upm * 0.5) / m.upm) * size + track * size
  }
  return { xs, width: x - track * size }
}

/* ---------- font embedding ---------- */

function subset(key, chars) {
  const text = [...new Set(chars + '0123456789 ')].sort().join('')
  const tag = Buffer.from(text).toString('base64url').slice(0, 40) + text.length
  const out = join(CACHE, `${key}-${tag}.woff2`)
  if (!existsSync(out)) {
    writeFileSync(join(CACHE, 'text.txt'), text, 'utf8')
    execFileSync('pyftsubset', [
      join(FONT_DIR, FONTS[key].file), `--text-file=${join(CACHE, 'text.txt')}`,
      '--flavor=woff2', '--layout-features=*', `--output-file=${out}`,
    ])
  }
  return readFileSync(out).toString('base64')
}

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
const textOf = (svg) => decode([...svg.matchAll(/>([^<>]+)</g)].map((m) => m[1]).join(''))

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* ---------- the document ---------- */

/**
 * Arrival animations start hidden, so a viewer that never runs the clock (some
 * webviews, battery saver, apps that rasterise README images) would show an
 * empty card. Every rule's finite animation-* declarations move under `.go`,
 * a class a SMIL <set> puts on the card's wrapper 50ms in. Frozen at zero the
 * card is its resting frame; running, nothing visible changes. Rules whose
 * animations all loop (the ornaments) stay as they are: they must already be
 * in motion at zero to look like themselves (the sphere's dots, the rain).
 */
function gateArrivals(css) {
  let out = ''
  let i = 0
  while (i < css.length) {
    const open = css.indexOf('{', i)
    if (open < 0) { out += css.slice(i); break }
    const head = css.slice(i, open)
    if (head.trim().startsWith('@')) {
      let depth = 0, j = open
      do { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++ } while (depth > 0 && j < css.length)
      out += css.slice(i, j)
      i = j
      continue
    }
    const close = css.indexOf('}', open)
    const decls = css.slice(open + 1, close).split(';').map((d) => d.trim()).filter(Boolean)
    const anim = decls.filter((d) => /^animation(-[a-z-]+)?\s*:/.test(d))
    const loops = anim.length && anim.every((d) => !/^animation\s*:/.test(d) || d.split(',').every((a) => a.includes('infinite')))
      && !anim.some((d) => /^animation-iteration-count\s*:\s*\d/.test(d))
    if (!anim.length || loops) {
      out += css.slice(i, close + 1)
    } else {
      const rest = decls.filter((d) => !anim.includes(d))
      const sel = head.trim()
      if (rest.length) out += `${sel}{${rest.join(';')}}`
      out += sel.split(',').map((s) => `.go ${s.trim()}`).join(',') + `{${anim.join(';')}}`
    }
    i = close + 1
  }
  return out
}

/**
 * Wraps a card. `fonts` lists the FONTS keys it uses; each is subset to the
 * text the body prints (plus `extraChars` for glyphs set from CSS or numerals).
 */
export function doc({ w = W, h, t, title, fonts, css = '', body, extraChars = '' }) {
  const chars = textOf(body) + extraChars
  const faces = fonts.map((k) => {
    const f = FONTS[k]
    return `@font-face{font-family:'${f.family}';src:url(data:font/woff2;base64,${subset(k, chars)}) format('woff2');${f.weight ? `font-weight:${f.weight};` : ''}${f.stretch ? `font-stretch:${f.stretch};` : ''}}`
  }).join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
${faces}
text{font-family:${fam(t.body)};fill:${t.fg};}
.label{font-family:${fam(t.label)};font-weight:${t.labelWeight};letter-spacing:${t.labelTrack};fill:${t.muted};}
.tnum{font-variant-numeric:tabular-nums;}
${gateArrivals(css)}
@media (prefers-reduced-motion: reduce){*:not(.hold){animation:none!important;}.hold{animation-play-state:paused!important;}}
</style>
<g class="jd"><set attributeName="class" to="jd go" begin="0.05s" fill="freeze"/>
${body}
</g>
</svg>
`
}

/* ---------- light-world materials ---------- */

/** The sky ground: the portfolio's fixed sky layer, sun high right, grass light low. */
export function skyDefs(id = 'sky') {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#8ad9ff"/><stop offset=".18" stop-color="#b7e6fd"/><stop offset=".42" stop-color="#9ad6f4"/>
  <stop offset=".66" stop-color="#8fcdec"/><stop offset=".86" stop-color="#7cc2e8"/><stop offset="1" stop-color="#6db8e2"/></linearGradient>
<radialGradient id="${id}-sun" cx=".82" cy=".04" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-grass" cx=".5" cy="1.08" r=".7"><stop offset="0" stop-color="#6bcb3c" stop-opacity=".32"/><stop offset="1" stop-color="#6bcb3c" stop-opacity="0"/></radialGradient>`
}
export function skyRect(w, h, id = 'sky') {
  return `<rect width="${w}" height="${h}" fill="url(#${id})"/><rect width="${w}" height="${h}" fill="url(#${id}-sun)"/><rect width="${w}" height="${h}" fill="url(#${id}-grass)"/>`
}

/** Glass plate defs: white gradient fill, specular top edge, soft deep-water lift. */
export function plateDefs(id = 'plate') {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".86"/><stop offset="1" stop-color="#fff" stop-opacity=".66"/></linearGradient>
<filter id="${id}-lift" x="-10%" y="-20%" width="120%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#004a75" flood-opacity=".12"/></filter>
<linearGradient id="${id}-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
}
/** A raised plate with its specular top edge; `reflect` adds the wet reflection under it. */
export function plate({ x, y, w, h, r = 20, id = 'plate', reflect = true }) {
  return `<g filter="url(#${id}-lift)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id})" stroke="#fff" stroke-opacity=".92"/></g>
<path d="M${x + r} ${y + 1.5}H${x + w - r}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
${reflect ? `<ellipse cx="${x + w / 2}" cy="${y + h + 9}" rx="${w * 0.42}" ry="7" fill="url(#${id}-sheen)" opacity=".7"/>` : ''}`
}

/* ---------- ornaments ---------- */

/**
 * The particle sphere, turning. Each dot rides one shared keyframe pair (x on a
 * sine, depth as opacity) at its own phase via a negative delay, so 400 dots
 * cost two keyframe blocks. Under reduced motion it stands still, still a sphere.
 */
export function sphere({ cx, cy, r, t, period = 28, rings = 17, idp = 'sp', tilt = -16 }) {
  const steps = 24
  const kx = [], ko = []
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    kx.push(`${((i / steps) * 100).toFixed(2)}%{transform:translateX(calc(var(--r) * ${Math.sin(a).toFixed(4)} * 1px))}`)
    ko.push(`${((i / steps) * 100).toFixed(2)}%{opacity:calc(var(--o) * ${(0.16 + 0.84 * ((Math.cos(a) + 1) / 2)).toFixed(3)})}`)
  }
  const dotColor = t.world === 'dark' ? t.signal : '#ffffff'
  const css = `@keyframes ${idp}x{${kx.join('')}}@keyframes ${idp}o{${ko.join('')}}
.${idp}{animation:${idp}x ${period}s linear infinite,${idp}o ${period}s linear infinite;}
.${idp}g{transform-origin:${cx}px ${cy}px;animation:${idp}in 1.6s cubic-bezier(.16,1,.3,1) both;}
@keyframes ${idp}in{from{transform:scale(.82);opacity:0}}`
  let dots = ''
  for (let i = 1; i < rings; i++) {
    const lat = (i / rings) * Math.PI - Math.PI / 2
    const rr = r * Math.cos(lat)
    const y = cy + r * Math.sin(lat)
    const n = Math.max(6, Math.round(30 * Math.cos(lat)))
    const edge = 1 - Math.abs(Math.sin(lat)) * 0.35
    for (let j = 0; j < n; j++) {
      const delay = -((j / n) * period + (i % 2) * (period / n / 2))
      dots += `<circle class="${idp} hold" cx="${cx}" cy="${y.toFixed(1)}" r="${t.world === 'dark' ? 1.7 : 2.1}" fill="${dotColor}" style="--r:${rr.toFixed(1)};--o:${edge.toFixed(2)};animation-delay:${delay.toFixed(2)}s"/>`
    }
  }
  const glow = t.world === 'dark'
    ? `<radialGradient id="${idp}glow" cx=".38" cy=".32" r=".6"><stop offset="0" stop-color="${t.signal}" stop-opacity=".16"/><stop offset="1" stop-color="${t.signal}" stop-opacity="0"/></radialGradient>`
    : `<radialGradient id="${idp}glow" cx=".38" cy=".3" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".7" stop-color="#00b2ff" stop-opacity=".12"/><stop offset="1" stop-color="#0079bf" stop-opacity="0"/></radialGradient>`
  return { css, defs: glow, svg: `<g class="${idp}g" aria-hidden="true"><circle cx="${cx}" cy="${cy}" r="${r * 1.04}" fill="url(#${idp}glow)"/><g transform="rotate(${tilt} ${cx} ${cy})">${dots}</g></g>` }
}

/** Bubbles drifting up through the water: the light world's one ornament. `burst` rise once, the rest loop slowly. */
export function bubbles({ w, h, count = 9, burst = 6, seed = 7, idp = 'bb' }) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const defs = `<radialGradient id="${idp}f" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#00b2ff" stop-opacity=".2"/><stop offset=".78" stop-color="#0079bf" stop-opacity=".26"/><stop offset="1" stop-color="#0079bf" stop-opacity=".34"/></radialGradient>
<radialGradient id="${idp}h" cx=".3" cy=".24" r=".3"><stop offset="0" stop-color="#fff" stop-opacity=".98"/><stop offset=".6" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
  const css = `@keyframes ${idp}rise{0%{transform:translate(0,0) scale(.85);opacity:0}12%{opacity:.9}88%{opacity:.75}100%{transform:translate(var(--d),calc(-1px * var(--h))) scale(1.12);opacity:0}}
.${idp}{animation:${idp}rise linear infinite;transform-box:fill-box;}
.${idp}.once{animation-iteration-count:1;animation-fill-mode:both;animation-timing-function:cubic-bezier(.16,1,.3,1);}
@media (prefers-reduced-motion: reduce){.${idp}.once{display:none}}`
  const one = (cls, dur, delay) => {
    const r = 5 + rnd() * 16
    const x = 30 + rnd() * (w - 60)
    const y = h + r + 4
    return `<g class="${cls}" style="--d:${Math.round(rnd() * 50 - 25)}px;--h:${h + 2 * r + 10};animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s"><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="url(#${idp}f)" stroke="#fff" stroke-opacity=".92" stroke-width="1.5"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="url(#${idp}h)"/></g>`
  }
  let svg = ''
  for (let i = 0; i < count; i++) svg += one(idp, 14 + rnd() * 12, -rnd() * 26)
  for (let i = 0; i < burst; i++) svg += one(`${idp} once`, 2.4 + rnd() * 1.6, 0.3 + rnd() * 0.6)
  return { defs, css, svg: `<g aria-hidden="true">${svg}</g>` }
}

/**
 * Code rain: the console's one ornament. Columns of mirrored numerals fall in
 * Signal Cyan, the lead glyph lifted toward white; two planes differ in
 * brightness and speed. Numerals, not katakana: an <img> SVG cannot count on
 * a Japanese face, and the portfolio falls back to numerals the same way.
 */
export function codeRain({ w, h, cols = 16, seed = 11, idp = 'cr', size = 18 }) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const css = `@keyframes ${idp}fall{from{transform:translateY(calc(-1px * var(--len)))}to{transform:translateY(${h}px)}}
.${idp}{animation:${idp}fall linear infinite;font-family:${fam('saira')};font-weight:500;}`
  let svg = ''
  for (let c = 0; c < cols; c++) {
    const near = c % 3 !== 0
    const len = 6 + Math.floor(rnd() * 8)
    const x = Math.round((c + 0.5) * (w / cols) + (rnd() - 0.5) * 18)
    let col = ''
    for (let k = 0; k < len; k++) {
      const lead = k === len - 1
      const o = lead ? 1 : 0.18 + (k / len) * 0.6
      col += `<text x="0" y="${(k + 1) * size * 1.15}" font-size="${size}" fill="${lead ? '#e6fffd' : '#57e0d8'}" fill-opacity="${(near ? o : o * 0.5).toFixed(2)}" transform="scale(-1,1)">${Math.floor(rnd() * 10)}</text>`
    }
    const dur = (near ? 5 : 8) + rnd() * 4
    svg += `<g transform="translate(${x} 0)"><g class="${idp} hold" style="--len:${len * size * 1.15};animation-duration:${dur.toFixed(1)}s;animation-delay:${(-rnd() * dur).toFixed(1)}s">${col}</g></g>`
  }
  return { css, svg: `<g aria-hidden="true">${svg}</g>` }
}

export function write(dir, name, svg) {
  writeFileSync(join(dir, name), svg, 'utf8')
  return `${name} ${(Buffer.byteLength(svg) / 1024).toFixed(0)}KB`
}
