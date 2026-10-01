/**
 * Credentials: a hanging indent beside the first row, one row grammar for every
 * group (DESIGN.md, Credentials). The head hangs in the left margin; every group
 * is a label rule in the main column followed by rows of name / detail / year.
 * Console: the band is a tonal step, the rules print across, rows are wiped on
 * by stepping on, as the trajectory rows do (a clip-path wipe on an SVG group
 * resolved against the wrong box and cut rows in half). Aquarium: the rows sit on a raised glass plate, as on the
 * other cards, and rise out of a blur. The accent marks the master's.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { W, doc, fam, lbl, measure, skyDefs, skyRect, plateDefs, plate, esc } from './lib.mjs'
import { JD_DIR, wrap } from './util.mjs'

const c = JSON.parse(readFileSync(join(JD_DIR, 'src', 'content', 'content.en.json'), 'utf8')).credentials

const groups = [
  { label: c.eduLabel, rows: c.education.map((e, i) => ({
    name: e.degree, sub: e.school.includes('Caracas') ? e.school : `${e.school} — ${e.place}`, year: e.period, note: e.note, live: i === 0 })) },
  { label: c.certLabel, rows: c.certs.map((e) => ({ name: e.name, sub: e.issuer, year: e.year })) },
  { label: c.langLabel, cols: 2, rows: c.languages.map((e) => ({ name: e.lang, sub: e.level })) },
  { label: c.beyondLabel, rows: c.beyond.map((e) => ({ name: e })) },
]

export function credentials(t) {
  const dark = t.world === 'dark'
  const X = 56, X2 = 330, RE = W - 56, RW = RE - X2, NW = RW - 140
  const NS = 24, SS = 22, LS = 19, WN = dark ? 500 : 600, WS = 400
  const top = dark ? 44 : 64
  const css = [], defs = []
  let rows = '', y

  // the head spans the top; the hang below it carries the group keys
  const hs = dark ? 28 : 30
  const head = `<text class="hd rd" x="${X}" y="${top + 24 + hs}" style="animation-delay:.4s">${esc(c.title)}</text>`
  y = top + 24 + hs + 30

  const cell = (r, x, w, y0, d, nameW) => {
    const nl = wrap(t.body, r.name, NS, nameW, WN)
    const sl = r.sub ? wrap(t.body, r.sub, SS, w, WS) : []
    const ol = r.note ? wrap(t.body, r.note, SS, w - (r.live ? 20 : 0), WS) : []
    let by = y0 + NS, s = ''
    nl.forEach((l, i) => { s += `<text class="nm" x="${x}" y="${by + i * 29}">${esc(l)}</text>` })
    by += (nl.length - 1) * 29
    sl.forEach((l, i) => { s += `<text class="sb" x="${x}" y="${by + 28 + i * 28}">${esc(l)}</text>` })
    by += sl.length * 28
    ol.forEach((l, i) => {
      const yy = by + 28 + i * 28
      s += r.live ? `<circle cx="${x + 5}" cy="${yy - 7}" r="5" fill="${t.accent}"/><text class="sb" x="${x + 20}" y="${yy}" style="fill:${t.accent};font-weight:600">${esc(l)}</text>` : `<text class="sb" x="${x}" y="${yy}">${esc(l)}</text>`
    })
    by += ol.length * 28
    if (r.year) s += `<text class="yr tnum" x="${x + w}" y="${y0 + NS}" text-anchor="end">${esc(r.year)}</text>`
    return { s: `<g class="wp" style="animation-delay:${d.toFixed(2)}s">${s}</g>`, bottom: by }
  }

  groups.forEach((g, gi) => {
    const d0 = 0.5 + gi * 0.3
    rows += `<rect class="rl" x="${X}" y="${y}" width="${RE - X}" height="1" fill="${t.line}" style="animation-delay:${d0.toFixed(2)}s"/>`
    rows += `<text class="label rd" x="${X}" y="${y + 16 + NS}" font-size="${LS}" style="animation-delay:${(d0 + 0.1).toFixed(2)}s">${esc(lbl(t, g.label))}</text>`
    y += 16
    const per = g.cols ?? 1, cw = (RW - (per - 1) * 8) / per
    for (let i = 0; i < g.rows.length; i += per) {
      const d = d0 + 0.2 + (i / per) * 0.12
      let bottom = 0
      g.rows.slice(i, i + per).forEach((r, k) => {
        const o = cell(r, X2 + k * (cw + 8), cw, y, d, per > 1 ? cw : (r.year ? NW : RW))
        rows += o.s; bottom = Math.max(bottom, o.bottom)
      })
      y = bottom + 16
      if (i + per < g.rows.length) rows += `<rect class="rl" x="${X2}" y="${y - 1}" width="${RW}" height="1" fill="${t.lineSoft}" style="animation-delay:${(d + 0.1).toFixed(2)}s"/>`
    }
  })

  const H = y + (dark ? 28 : 56)
  let back, front = ''
  if (dark) {
    back = `<rect width="${W}" height="${H}" fill="${t.band}"/>`
    css.push(`.rl{transform-box:fill-box;transform-origin:0 0;animation:prn .7s steps(20) both;}@keyframes prn{from{transform:scaleX(0)}}
.rd{animation:on .5s steps(3) both;}@keyframes on{from{opacity:0}}
.wp{animation:on .5s steps(3) both;}`)
  } else {
    // a raised glass plate like its siblings: Juan found the recessed cut too dull next to them (2026-10-01)
    defs.push(skyDefs(), plateDefs())
    back = skyRect(W, H) + `<g class="shelf">${plate({ x: 24, y: 24, w: W - 48, h: H - 56, r: 26 })}</g>`
    css.push(`.shelf{animation:shelf 1s cubic-bezier(.16,1,.3,1) both;}@keyframes shelf{from{opacity:0}}
.rl{transform-box:fill-box;transform-origin:0 0;animation:prn .9s cubic-bezier(.16,1,.3,1) both;}@keyframes prn{from{transform:scaleX(0)}}
.rd{animation:rise .9s cubic-bezier(.16,1,.3,1) both;}@keyframes rise{from{opacity:0;transform:translateY(14px);filter:blur(8px)}}
.wp{transform-box:fill-box;animation:rise .9s cubic-bezier(.16,1,.3,1) both;}`)
  }
  css.push(`.hd{font-family:${fam(t.head)};font-size:${hs}px;letter-spacing:-0.01em;fill:${t.fg};}
.nm{font-size:${NS}px;font-weight:${WN};fill:${t.fg};}
.sb{font-size:${SS}px;font-weight:${WS};fill:${t.muted};}
.yr{font-family:${fam(dark ? t.body : 'neuropol')};font-size:${dark ? 23 : 24}px;font-weight:${dark ? 500 : 400};fill:${t.fgDim};}`)

  const all = [c.title, ...groups.flatMap((g) => [g.label + ':', ...g.rows.map((r) => [r.name, r.sub, r.year, r.note].filter(Boolean).join(', ') + '.')])]
  return doc({
    h: H, t, title: all.join(' '), fonts: dark ? [t.head, t.body] : [t.head, t.body, 'neuropol'],
    css: css.join('\n'), body: `<defs>${defs.join('\n')}</defs>${back}${head}${rows}${front}`, extraChars: '0123456789–',
  })
}
export const cards = { credentials }
