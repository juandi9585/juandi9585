/**
 * Impact: the ruled ledger. The figures carry the display type; the section
 * name demotes to the table caption (DESIGN.md, Impact). Four rows, one accent
 * figure (94%).
 * Console: the caption prints, each rule draws across, the figures count up on
 * an odometer behind a clip, the row text prints left to right.
 * Aquarium: one glass plate rises out of blur, then each row surfaces and its
 * figure rolls up.
 * Resting state = real figures: the odometer's resting transform IS the final
 * digit; the keyframe only supplies the "from".
 */
import { W, doc, fam, measure, skyDefs, skyRect, plateDefs, plate, esc } from './lib.mjs'

const X = 56, TX = 470, RH = 156
const CAPTION = 'Outcomes, not output.'
const ROWS = [
  { fig: ['94%'], name: 'Operating cost reduction', det: 'Autonomous agentic support solution · banking_sector', accent: true },
  { fig: ['90%+'], name: 'Man-hours saved', det: 'AI-powered credit-analysis application' },
  { fig: ['End-to-', 'end'], name: 'Delivery ownership', det: 'Front-end, back-end, AI agents & automation · solo_architect' },
  { fig: ['Core'], name: 'Payments migration', det: 'Release & versioning lead · IBM_AS/400_·_banking' },
]

export function impact(t) {
  const dark = t.world === 'dark'
  const R0 = dark ? 104 : 116
  const H = dark ? R0 + 4 * RH + 30 : R0 + 4 * RH + 30 + 44
  const defs = []
  const css = []
  let back = '', rules = '', rows = ''

  // figure size: one for all rows, fitted so the widest ("End-to-end") stays in the figure column
  const colW = TX - X - 36
  const base = dark ? 70 : 78
  const maxW = Math.max(...ROWS.flatMap((r) => r.fig.map((l) => measure(t.display, l, base).width)))
  const fs = +Math.min(base, (base * colW) / maxW).toFixed(1)
  const LH = fs * 1.5
  const ns = 28, ds = 22
  const nameW = W - TX - X
  // detail: greedy wrap by measure; '_' glues words that must stay together
  const wrap = (str) => {
    const out = []
    let cur = ''
    for (const wd of str.split(' ')) {
      const trial = cur ? cur + ' ' + wd : wd
      if (cur && measure(t.body, trial.replace(/_/g, ' '), ds, 0, 400).width > nameW) { out.push(cur); cur = wd } else cur = trial
    }
    out.push(cur)
    return out.map((l) => l.replace(/_/g, ' '))
  }
  ROWS.forEach((r) => {
    r.lines = wrap(r.det)
    if (measure(t.body, r.name, ns, 0, t.leadWeight).width > nameW) throw new Error('name too wide: ' + r.name)
  })

  if (dark) back = `<rect width="${W}" height="${H}" fill="${t.ground}"/>`
  else {
    defs.push(skyDefs(), plateDefs())
    back = skyRect(W, H) + `<g class="pl">${plate({ x: 28, y: 28, w: W - 56, h: H - 28 - 44, r: 28 })}</g>`
    css.push(`.pl{animation:plin 1s cubic-bezier(.16,1,.3,1) both;}@keyframes plin{from{transform:translateY(26px);opacity:0}}
.rise{transform-box:fill-box;transform-origin:50% 100%;animation:rise .9s cubic-bezier(.16,1,.3,1) both;}
@keyframes rise{from{opacity:0;transform:translateY(20px);filter:blur(8px)}}`)
  }
  css.push(`.fgr{font-family:${fam(t.display)};font-size:${fs}px;fill:${t.fg};}
.fgr.ac{fill:${t.accent};}
.dg{text-anchor:middle;}
.nm{font-size:${ns}px;font-weight:${t.leadWeight};fill:${t.fg};}
.dt{font-size:${ds}px;font-weight:400;fill:${t.muted};}
.cap{font-family:${fam(t.head)};font-size:${dark ? 24 : 26}px;fill:${t.fgDim};${dark ? 'letter-spacing:-0.01em;' : ''}}
.odo{animation:roll 1.5s cubic-bezier(.16,1,.3,1) both;}
@keyframes roll{from{transform:translateY(0)}}
.pr{transform-box:fill-box;transform-origin:0 0;animation:print .7s steps(20) both;}@keyframes print{from{transform:scaleX(0)}}
.rl{transform-box:fill-box;transform-origin:0 0;animation:draw .6s cubic-bezier(.4,0,.2,1) both;}@keyframes draw{from{transform:scaleX(0)}}
.on{animation:on .45s steps(3) both;}@keyframes on{from{opacity:0}}`)

  // caption
  if (dark) {
    defs.push(`<clipPath id="capc"><rect class="pr" x="${X - 4}" y="${R0 - 62}" width="520" height="44" style="animation-delay:.1s"/></clipPath>`)
    rows += `<text class="cap" x="${X}" y="${R0 - 30}" clip-path="url(#capc)">${esc(CAPTION)}</text>`
  } else {
    rows += `<text class="cap rise" x="${X}" y="${R0 - 30}" style="animation-delay:.3s">${esc(CAPTION)}</text>`
  }

  ROWS.forEach((r, i) => {
    const top = R0 + i * RH
    const d = 0.45 + i * 0.5
    const mid = top + RH / 2
    const pitch = fs * 0.95
    const baseY = r.fig.length === 1 ? mid + fs * 0.35 : mid - (pitch - 0.7 * fs) / 2
    const first = r.fig[0]
    const hasDigits = /^\d/.test(first)
    const nd = [...first].findIndex((c) => !/\d/.test(c))
    const digits = nd < 0 ? first : first.slice(0, nd)
    const { xs, width } = measure(t.display, first, fs)
    let fig = ''
    if (hasDigits) {
      ;[...digits].forEach((dch, k) => {
        const adv = (xs[k + 1] ?? width) - xs[k]
        const cx = (X + xs[k] + adv / 2).toFixed(1)
        let col = ''
        for (let j = 0; j < 20; j++) col += `<text class="fgr dg${r.accent ? ' ac' : ''}" x="${cx}" y="${(baseY + j * LH).toFixed(1)}">${j % 10}</text>`
        fig += `<g class="odo" style="transform:translateY(${(-(10 + +dch) * LH).toFixed(1)}px);animation-delay:${(d + 0.15 + k * 0.12).toFixed(2)}s">${col}</g>`
      })
      fig += `<text class="fgr${r.accent ? ' ac' : ''} on" x="${(X + xs[digits.length]).toFixed(1)}" y="${baseY.toFixed(1)}" style="animation-delay:${(d + 0.15).toFixed(2)}s">${esc(first.slice(digits.length))}</text>`
      defs.push(`<clipPath id="ck${i}"><rect x="${X - 6}" y="${(baseY - fs * 0.88).toFixed(1)}" width="${(width + 12).toFixed(1)}" height="${(fs * 1.05).toFixed(1)}"/></clipPath>`)
      fig = `<g clip-path="url(#ck${i})">${fig}</g>`
    } else {
      const wmax = Math.max(...r.fig.map((l) => measure(t.display, l, fs).width))
      const words = r.fig.map((l, k) => `<text class="fgr" x="${X}" y="${(baseY + k * pitch).toFixed(1)}">${esc(l)}</text>`).join('')
      if (dark) {
        defs.push(`<clipPath id="ck${i}"><rect class="pr" x="${X - 6}" y="${(baseY - fs).toFixed(1)}" width="${(wmax + 12).toFixed(1)}" height="${(fs * 1.3 + (r.fig.length - 1) * pitch).toFixed(1)}" style="animation-delay:${(d + 0.15).toFixed(2)}s"/></clipPath>`)
        fig = `<g clip-path="url(#ck${i})">${words}</g>`
      } else fig = words
    }
    const n = r.lines.length
    const total = 25 + 36 + (n - 1) * 28
    const ny = mid - total / 2 + 20
    let txt = `<text class="nm" x="${TX}" y="${ny.toFixed(1)}">${esc(r.name)}</text>`
    r.lines.forEach((s2, k) => { txt += `<text class="dt" x="${TX}" y="${(ny + 36 + k * 28).toFixed(1)}">${esc(s2)}</text>` })
    if (dark) {
      defs.push(`<clipPath id="tx${i}"><rect class="pr" x="${TX - 4}" y="${top + 8}" width="${W - TX}" height="${RH - 16}" style="animation-delay:${(d + 0.3).toFixed(2)}s"/></clipPath>`)
      rows += `${fig}<g clip-path="url(#tx${i})">${txt}</g>`
      rules += `<rect class="rl" x="${X}" y="${top}" width="${W - 2 * X}" height="1" fill="${t.line}" style="animation-delay:${(d - 0.1).toFixed(2)}s"/>`
    } else {
      const sep = i ? `<path d="M${X} ${top}H${W - X}" stroke="${t.line}"/>` : ''
      rows += `<g class="rise" style="animation-delay:${d.toFixed(2)}s">${sep}${fig}${txt}</g>`
    }
  })
  if (dark) rules += `<rect class="rl" x="${X}" y="${R0 + 4 * RH}" width="${W - 2 * X}" height="1" fill="${t.line}" style="animation-delay:1.95s"/>`

  const body = `<defs>${defs.join('\n')}</defs>\n${back}\n${rules}\n${rows}`
  return doc({
    h: H, t, fonts: [t.display, t.head, t.body].filter((v, k, a) => a.indexOf(v) === k),
    title: 'Impact. Outcomes, not output. 94% operating cost reduction through an autonomous agentic support solution in the banking sector. 90%+ man-hours saved with an AI-powered credit-analysis application. End-to-end delivery ownership as solo architect of front-end, back-end, AI agents and automation. Core payments migration, release and versioning lead on IBM AS/400 in banking.',
    css: css.join('\n'), body, extraChars: '0123456789',
  })
}
export const cards = { impact }
