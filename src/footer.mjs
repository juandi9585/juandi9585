/**
 * Footer: the portfolio's contact close. Head and lead are a baseline-aligned
 * pair (first baselines level), the place hangs from the head's left edge.
 * Console: the code rain falls behind, dimmed under the type; the head prints.
 * Aquarium: bubbles rise behind a glass plate; the lines surface.
 */
import { W, doc, fam, measure, codeRain, bubbles, skyDefs, skyRect, plateDefs, plate, esc } from './lib.mjs'

const H = 280
const HEAD = ['Tell me what', 'you need built']
const LEAD = 'Open to freelance projects in AI, automation and full-stack engineering.'
const PLACE = 'Caracas, Venezuela'

const wrap = (key, text, size, track, wght, max) => {
  const lines = []
  let cur = ''
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word
    if (cur && measure(key, next, size, track, wght).width > max) { lines.push(cur); cur = word } else cur = next
  }
  return [...lines, cur]
}

export function footer(t) {
  const dark = t.world === 'dark'
  const X = dark ? 56 : 88
  const RX = 570
  const RW = W - (dark ? 56 : 88) - RX
  const hk = t.head
  const htrack = dark ? -0.01 : -0.01
  // head: as large as the left column allows (it must clear the right column by 44)
  const widest = (s) => Math.max(...HEAD.map((l, i) => measure(hk, i === 1 ? l + '.' : l, s, htrack).width))
  let hs = 40
  while (widest(hs) > RX - 44 - X) hs -= 0.5
  const b1 = 112, b2 = b1 + Math.round(hs * 1.28)
  const ls = 22, lstep = 32
  const lw = dark ? 500 : 500
  const lead = wrap(t.body, LEAD, ls, 0, lw, RW)
  const pb = b2 + 52
  const css = [`.hd{font-family:${fam(hk)};font-size:${hs}px;letter-spacing:${htrack}em;fill:${t.fg};}
.dot{fill:${t.accent};}
.ld{font-family:${fam(t.body)};font-size:${ls}px;font-weight:${lw};fill:${t.fgDim};}
.pl{font-family:${fam(t.label)};font-size:21px;font-weight:${t.labelWeight};letter-spacing:${t.labelTrack};fill:${t.world === 'dark' ? t.muted : t.muted};}`]
  const defs = []
  let back = '', mid = ''

  if (dark) {
    const rain = codeRain({ w: W, h: H, cols: 16, seed: 23 })
    css.push(rain.css)
    defs.push(`<filter id="bl" x="-5%" y="-40%" width="110%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
<mask id="rm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect x="0" y="62" width="${W}" height="156" fill="#000" opacity=".82" filter="url(#bl)"/></mask>`)
    back = `<rect width="${W}" height="${H}" fill="${t.ground}"/><g mask="url(#rm)" opacity=".8">${rain.svg}</g><path d="M0 .5H${W}" stroke="${t.line}"/>`
    HEAD.forEach((_, k) => defs.push(`<clipPath id="hc${k}"><rect class="pr" x="${X - 4}" y="${(k ? b2 : b1) - hs}" width="${RX - X}" height="${hs + 14}" style="animation-delay:${(0.2 + k * 0.5).toFixed(2)}s"/></clipPath>`))
    css.push(`.pr{transform-box:fill-box;transform-origin:0 0;animation:print .6s steps(18) both;}@keyframes print{from{transform:scaleX(0)}}
.rd{animation:on .5s steps(3) both;}@keyframes on{from{opacity:0}}`)
  } else {
    const bb = bubbles({ w: W, h: H, count: 8, burst: 6, seed: 5 })
    defs.push(skyDefs(), plateDefs(), bb.defs)
    css.push(bb.css)
    defs.push(`<mask id="bm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect x="40" y="28" width="${W - 80}" height="204" rx="28" fill="#000"/></mask>`)
    back = skyRect(W, H) + `<g mask="url(#bm)">${bb.svg}</g>` + `<g class="pl8">${plate({ x: 40, y: 28, w: W - 80, h: 204, r: 28 })}</g>`
    css.push(`.pl8{animation:shelf 1s cubic-bezier(.16,1,.3,1) both;}@keyframes shelf{from{transform:translateY(22px);opacity:0}}
.rd{animation:rise .9s cubic-bezier(.16,1,.3,1) both;}@keyframes rise{from{opacity:0;transform:translateY(18px);filter:blur(8px)}}`)
  }

  const clip = (k) => (dark ? ` clip-path="url(#hc${k})"` : '')
  const dly = (d) => (dark ? '' : ` style="animation-delay:${d}s"`)
  const head = HEAD.map((l, k) => {
    const last = k === HEAD.length - 1
    return `<text class="hd${dark ? '' : ' rd'}" x="${X}" y="${k ? b2 : b1}"${clip(k)}${dly(0.3 + k * 0.12)}>${esc(l)}${last ? '<tspan class="dot">.</tspan>' : ''}</text>`
  }).join('')
  const ld = lead.map((l, k) => `<text class="ld rd" x="${RX}" y="${b1 + k * lstep}" style="animation-delay:${((dark ? 0.9 : 0.55) + k * 0.15).toFixed(2)}s">${esc(l)}</text>`).join('')
  // a place pin on the 16-unit grid, 1.25 stroke, scaled 1.25
  const pin = `<g transform="translate(${X} ${pb - 17}) scale(1.25)" fill="none" stroke="${t.muted}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14.5s4.75-4.2 4.75-8a4.75 4.75 0 0 0-9.5 0c0 3.8 4.75 8 4.75 8z"/><circle cx="8" cy="6.5" r="1.75"/></g>`
  const place = `<g class="rd" style="animation-delay:${dark ? 1.4 : 0.8}s">${pin}<text class="pl" x="${X + 30}" y="${pb}">${esc(PLACE)}</text></g>`

  const body = `<defs>${defs.join('\n')}</defs>
${back}${mid}
${head}${ld}${place}`
  return doc({
    h: H, t,
    title: 'Tell me what you need built. Open to freelance projects in AI, automation and full-stack engineering. Caracas, Venezuela.',
    fonts: [hk, t.body, t.label, 'saira'].filter((k, i, a) => a.indexOf(k) === i),
    css: css.join('\n'),
    body,
  })
}
export const cards = { footer }
