/**
 * Hero: the masthead and its status strip, with the particle sphere turning
 * behind it. No label above the name, no descriptor under it (DESIGN.md, Hero).
 * Console: an amber scan line crosses, the name decodes out of stand-in
 * numerals, the thesis prints, the strip comes online reading by reading.
 * Aquarium: the letters rise out of a blur, a burst of bubbles goes up, the
 * glass shelf slides in.
 */
import { W, doc, fam, lbl, measure, sphere, bubbles, skyDefs, skyRect, plateDefs, plate, esc } from './lib.mjs'

const H = 530
const X = 56
const NAME = ['Juan Diego', 'Flores']
const THESIS = ['Autonomous agents and full-stack systems', 'that cut banking operating costs by ']
const FIGURE = '94%'
const STRIP = ['Systems Engineer · AI Specialist', 'Caracas, Venezuela', 'Available for freelance']

export function hero(t) {
  const dark = t.world === 'dark'
  const size = dark ? 72 : 80
  const base = [182, 268]
  const sp = sphere({ cx: 772, cy: 236, r: 208, t, period: 30 })
  const css = [sp.css]
  const defs = [sp.defs]
  let back = ''
  let front = ''

  if (!dark) {
    defs.push(skyDefs(), plateDefs())
    const bb = bubbles({ w: W, h: H, count: 8, burst: 7 })
    defs.push(bb.defs)
    css.push(bb.css)
    back = skyRect(W, H) + bb.svg
  } else {
    back = `<rect width="${W}" height="${H}" fill="${t.ground}"/>`
  }

  // The name, one <text> per letter so each can arrive on its own beat without reflowing the line.
  let letters = ''
  let i = 0
  NAME.forEach((line, li) => {
    const { xs } = measure(t.display, line, size, dark ? -0.01 : 0)
    ;[...line].forEach((ch, k) => {
      if (ch === ' ') return
      const x = (X + xs[k]).toFixed(1)
      const d = (0.35 + i * 0.055).toFixed(3)
      if (dark) {
        // a stand-in numeral sits on the glyph, then hands over to it
        const n1 = (i * 7 + 3) % 10, n2 = (i * 3 + 8) % 10
        letters += `<text class="nm num a" x="${x}" y="${base[li]}" style="animation-delay:${(d - 0.3).toFixed(3)}s,${d}s">${n1}</text>`
        letters += `<text class="nm num b" x="${x}" y="${base[li]}" style="animation-delay:${(d - 0.15).toFixed(3)}s">${n2}</text>`
      }
      letters += `<text class="nm ch" x="${x}" y="${base[li]}" style="animation-delay:${d}s">${esc(ch)}</text>`
      i++
    })
  })
  const nameEnd = 0.35 + i * 0.055

  css.push(`.nm{font-family:${fam(t.display)};font-size:${size}px;fill:${t.fg};${dark ? 'letter-spacing:-0.01em;' : ''}}`)
  if (dark) {
    css.push(`.num{fill:${t.muted2};opacity:0;}
.num.a{animation:numOn .01s linear both,numOff .01s linear forwards;}
.num.b{animation:numFlick .3s steps(1) both;}
@keyframes numOn{to{opacity:1}}@keyframes numOff{to{opacity:0}}
@keyframes numFlick{0%{opacity:0}1%{opacity:1}50%{opacity:0}}
.ch{animation:chOn .18s steps(2) both;}@keyframes chOn{from{opacity:0}}
.scan{animation:scan 1.2s cubic-bezier(.4,0,.2,1) .1s both;}
@keyframes scan{from{transform:translateY(0);opacity:1}85%{opacity:1}to{transform:translateY(${H}px);opacity:0}}`)
    front += `<rect class="scan" x="0" y="-1" width="${W}" height="1" fill="${t.accent}" opacity="0"/>`
  } else {
    css.push(`.ch{transform-box:fill-box;transform-origin:50% 100%;animation:rise .9s cubic-bezier(.16,1,.3,1) both;}
@keyframes rise{from{opacity:0;transform:translateY(22px);filter:blur(8px)}}`)
  }

  // Thesis: printed left to right in the console, surfacing in the aquarium.
  const ts = 28
  const tBase = [334, 372]
  const tStart = dark ? nameEnd - 0.2 : nameEnd - 0.4
  const fig = `<tspan class="fig">${FIGURE}</tspan>`
  const thesis = THESIS.map((l, k) => `<text class="th" x="${X}" y="${tBase[k]}" ${dark ? `clip-path="url(#tc${k})"` : `style="animation-delay:${(tStart + k * 0.12).toFixed(2)}s"`}>${esc(l)}${k === 1 ? fig + '<tspan>.</tspan>' : ''}</text>`).join('')
  css.push(`.th{font-family:${fam(t.body)};font-size:${ts}px;font-weight:${t.leadWeight};fill:${t.fgDim};}
.fig{fill:${t.accent};}`)
  if (dark) {
    THESIS.forEach((_, k) => defs.push(`<clipPath id="tc${k}"><rect class="pr" x="${X - 4}" y="${tBase[k] - ts}" width="640" height="${ts + 12}" style="animation-delay:${(tStart + k * 0.55).toFixed(2)}s"/></clipPath>`))
    css.push(`.pr{transform-box:fill-box;transform-origin:0 0;animation:print .6s steps(24) both;}@keyframes print{from{transform:scaleX(0)}}`)
  } else {
    css.push(`.th{animation:rise .9s cubic-bezier(.16,1,.3,1) both;transform-box:fill-box;}`)
  }

  // Status strip: hairline-ruled readings in the console, a glass shelf in the aquarium.
  // Fit the readings to the measure: one size for the whole strip, never over 19.
  const gapW = dark ? 30 : 34
  const fitW = W - 2 * X - 20
  const natural = STRIP.reduce((a, s) => a + measure(t.label, lbl(t, s), 19, dark ? 0.12 : 0.01, t.labelWeight).width, 0) + gapW * (STRIP.length - 1) + 20
  const ls = Math.min(19, +(19 * fitW / natural).toFixed(1))
  const sy = dark ? 492 : 482
  const stripStart = tStart + 1.0
  let strip = ''
  let x = X
  const gap = gapW * ls / 19
  STRIP.forEach((s, k) => {
    const live = k === STRIP.length - 1
    const txt = lbl(t, s)
    const { width } = measure(t.label, txt, ls, dark ? 0.12 : 0.01, t.labelWeight)
    const d = (stripStart + k * 0.22).toFixed(2)
    if (live) {
      strip += `<g class="rd" style="animation-delay:${d}s"><circle class="lamp" cx="${x + 6}" cy="${sy - 6.5}" r="5.5" fill="${t.life}" style="animation-delay:${d}s,${(+d + 0.5).toFixed(2)}s"/><text class="label live" x="${x + 20}" y="${sy}" font-size="${ls}">${esc(txt)}</text></g>`
    } else {
      strip += `<text class="label rd" x="${x}" y="${sy}" font-size="${ls}" style="animation-delay:${d}s">${esc(txt)}</text>`
      x += width + gap
      strip += `<path d="M${(x - gap / 2).toFixed(1)} ${sy - 19}v24" stroke="${dark ? t.line : 'rgba(0,121,191,0.3)'}"/>`
    }
  })
  css.push(`.label.live{fill:${t.fgDim};}
.rd{animation:on .5s steps(3) both;}@keyframes on{from{opacity:0}}
.lamp{transform-box:fill-box;transform-origin:center;animation:flick .45s steps(1) both,pulse 2.4s ease-in-out infinite;}
@keyframes flick{0%{opacity:0}30%{opacity:1}45%{opacity:.2}60%{opacity:1}}
@keyframes pulse{50%{transform:scale(.72);opacity:.55}}`)

  let shelf = ''
  if (dark) {
    shelf = `<path d="M${X} 446H${W - X}" stroke="${t.line}"/>`
  } else {
    shelf = `<g class="shelf">${plate({ x: X - 20, y: 444, w: W - 2 * X + 40, h: 62, r: 31, reflect: false })}</g>`
    css.push(`.shelf{animation:shelf 1s cubic-bezier(.16,1,.3,1) ${(stripStart - 0.3).toFixed(2)}s both;}@keyframes shelf{from{transform:translateY(24px);opacity:0}}`)
  }

  const body = `<defs>${defs.join('\n')}</defs>
${back}
${sp.svg}
${shelf}
${letters}
${thesis}
${strip}
${front}`

  return doc({
    h: H, t,
    title: 'Juan Diego Flores. Autonomous agents and full-stack systems that cut banking operating costs by 94%.',
    fonts: [t.display, t.body],
    css: css.join('\n'),
    body,
    extraChars: '0123456789',
  })
}
export const cards = { hero }
