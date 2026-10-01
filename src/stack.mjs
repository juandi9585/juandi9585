/**
 * Stack: a spec sheet whose head sits in the first row of the same two-column
 * grid as the data (DESIGN.md, Stack). Left column: the head, then each group's
 * key. Right column: the lead, then each group's items with their brand mark
 * where simple-icons has one (text only where it does not).
 * Console: hairlines print across and each row powers on in turn.
 * Aquarium: the sheet is one glass plate and the rows surface out of blur.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { W, doc, fam, lbl, measure, skyDefs, skyRect, plateDefs, plate, bubbles, esc } from './lib.mjs'
import { JD_DIR, si, wrap, flow, icon } from './util.mjs'

const content = JSON.parse(readFileSync(join(JD_DIR, 'src', 'content', 'content.en.json'), 'utf8')).stack

// A mark only where simple-icons really has one. Everything else stays text.
const MARKS = {
  'Claude Code': si.siClaude, n8n: si.siN8n, 'Google Cloud Platform': si.siGooglecloud,
  'Node.js': si.siNodedotjs, 'React.js': si.siReact, 'Express.js': si.siExpress, Flutter: si.siFlutter,
  Python: si.siPython, TensorFlow: si.siTensorflow, PyTorch: si.siPytorch, PostgreSQL: si.siPostgresql,
  'Apps Script': si.siGoogleappsscript,
}

export function stack(t) {
  const dark = t.world === 'dark'
  const X = 56, LW = 330, X2 = 440, RW = W - X - X2
  const top = dark ? 52 : 64
  const IS = 22, LS = 19, WG = 500
  const lTrack = dark ? 0.12 : 0.01
  const css = []
  const defs = []
  let back = '', rows = '', front = ''

  // head row: title (left) + lead (right) share the first baseline
  const words = content.title.split(' ')
  const longest = Math.max(...words.map((w) => measure(t.head, w, 1, dark ? -0.01 : -0.01).width))
  const hs = Math.min(32, Math.floor((LW / longest) * 0.98))
  const tLines = wrap(t.head, content.title, hs, LW, undefined, -0.01)
  const hLH = hs * 1.28
  const leadLines = wrap(t.body, content.lead, 24, RW, WG)
  const headH = Math.max(tLines.length * hLH, leadLines.length * 34) + 40
  const base0 = top + 34 + hs
  const headSvg = tLines.map((l, i) => `<text class="hd rd" x="${X}" y="${(base0 + i * hLH).toFixed(1)}" style="animation-delay:${(0.5 + i * 0.12).toFixed(2)}s">${esc(l)}</text>`).join('')
    + leadLines.map((l, i) => `<text class="ld rd" x="${X2}" y="${base0 + i * 34}" style="animation-delay:${(0.7 + i * 0.12).toFixed(2)}s">${esc(l)}</text>`).join('')

  let y = top + headH
  const rule = (yy, d) => dark
    ? `<rect class="rl" x="${X}" y="${yy}" width="${W - 2 * X}" height="1" fill="${t.line}" style="animation-delay:${d.toFixed(2)}s"/>`
    : `<rect class="rs" x="${X}" y="${yy}" width="${W - 2 * X}" height="1" fill="${t.line}" style="animation-delay:${d.toFixed(2)}s"/>`
  rows += rule(y, 0.3)

  content.groups.forEach((g, gi) => {
    const d0 = 0.9 + gi * 0.24
    const items = g.items.map((txt) => ({ txt, mark: MARKS[txt] }))
    const { out, lines } = flow(items, { key: t.body, size: IS, wght: WG, maxW: RW, iconS: 20, iconGap: 10, gap: dark ? 36 : 30 })
    const b0 = y + 24 + IS
    rows += `<text class="label rd" x="${X}" y="${b0}" font-size="${LS}" style="animation-delay:${d0.toFixed(2)}s">${esc(lbl(t, g.label))}</text>`
    out.forEach((it, k) => {
      const bx = X2 + it.x
      const by = b0 + it.line * 38
      const d = (d0 + 0.08 + k * 0.07).toFixed(2)
      let s = ''
      if (it.mark) s += icon(it.mark.path, bx, by - 17, 20, t.muted)
      s += `<text class="it" x="${(bx + (it.mark ? 30 : 0)).toFixed(1)}" y="${by}">${esc(it.txt)}</text>`
      if (dark && k > 0 && it.x > 0) s += `<rect x="${(bx - 18).toFixed(1)}" y="${by - 17}" width="1" height="21" fill="${t.line}"/>`
      rows += `<g class="${dark ? 'rd' : 'rs'}" style="animation-delay:${d}s">${s}</g>`
    })
    y += 24 + lines * 38 + 14
    rows += rule(y, d0 + 0.1)
  })

  let H
  if (dark) {
    H = y + 44
    back = `<rect width="${W}" height="${H}" fill="${t.ground}"/>`
    front = `<rect class="rl" x="${X}" y="${top}" width="${W - 2 * X}" height="1" fill="${t.line}"/>`
    css.push(`.rl{transform-box:fill-box;transform-origin:0 0;animation:prn .7s steps(20) both;}@keyframes prn{from{transform:scaleX(0)}}
.tk{transform-box:fill-box;transform-origin:0 0;animation:prn .5s steps(8) .15s both;}
.rd{animation:on .5s steps(3) both;}@keyframes on{from{opacity:0}}`)
  } else {
    const ph = y + 24 - 28
    H = 28 + ph + 54
    defs.push(skyDefs(), plateDefs())
    const bb = bubbles({ w: W, h: H, count: 7, burst: 6, seed: 5 })
    defs.push(bb.defs); css.push(bb.css)
    back = skyRect(W, H) + bb.svg + `<g class="shelf">${plate({ x: 24, y: 28, w: W - 48, h: ph, r: 26 })}</g>`
    front = ''
    css.push(`.shelf{animation:shelf 1s cubic-bezier(.16,1,.3,1) both;}@keyframes shelf{from{transform:translateY(24px);opacity:0}}
.rs,.rd{transform-box:fill-box;animation:rise .9s cubic-bezier(.16,1,.3,1) both;}
@keyframes rise{from{opacity:0;transform:translateY(18px);filter:blur(8px)}}`)
  }
  // light heads/leads ride the same blur rise as the rows
  css.push(`.hd{font-family:${fam(t.head)};font-size:${hs}px;letter-spacing:-0.01em;fill:${t.fg};}
.ld{font-size:24px;font-weight:${WG};fill:${t.fgDim};}
.it{font-size:${IS}px;font-weight:${WG};fill:${t.fg};}`)

  return doc({
    h: H, t,
    title: `${content.title} ${content.lead} ` + content.groups.map((g) => `${g.label}: ${g.items.join(', ')}.`).join(' '),
    fonts: [t.head, t.body],
    css: css.join('\n'),
    body: `<defs>${defs.join('\n')}</defs>${back}${headSvg}${rows}${front}`,
    extraChars: '0123456789',
  })
}
export const cards = { stack }
