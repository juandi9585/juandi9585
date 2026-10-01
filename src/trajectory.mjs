/**
 * Trajectory: the spine rail. A hairline runs the full height, a heavier spine
 * draws down it (stroke-dashoffset) and each node lights as the spine reaches
 * it. Rail endpoints ("Now", "2023") carry the display type; the current role's
 * node is the card's one accent (amber) / grass on glass.
 * Console: nodes and rows power on in steps. Aquarium: one deep-lift plate,
 * rows rise out of blur, the current node ripples once.
 */
import { W, doc, fam, lbl, measure, skyDefs, skyRect, plateDefs, plate, esc } from './lib.mjs'

const SX = 326, TX = SX + 40, PX = SX - 34, RH = 82, Y0 = 156
const ROLES = [
  ['09/2025–Present', 'AI Developer', 'PadTech Solution, C.A.'],
  ['03/2025–05/2025', 'Automation Architect Intern', 'Ministry of Natural Resources & Environment'],
  ['01/2025–09/2025', 'Full-Stack Specialist Architect', 'Inversiones Galiang, C.A.'],
  ['01/2024–12/2024', 'Developer Intern', 'Banesco, Banco Universal'],
  ['09/2023–07/2024', 'Teaching Assistant, Introductory Mathematics', 'Universidad Metropolitana de Caracas'],
  ['04/2023–08/2023', 'Data Modeling & Integration Intern', 'Banesco, Banco Universal'],
]
const ENDS = ['Now', '2023']

export function trajectory(t) {
  const dark = t.world === 'dark'
  const yEnd = Y0 + (ROLES.length - 1) * RH
  const sTop = 62, sBot = yEnd + 104
  const H = sBot + 52 + (dark ? 0 : 44)
  const T = 2.6, L = sBot - sTop
  const at = (y) => 0.35 + ((y - sTop) / L) * T
  const defs = [], css = []
  let back, plateSvg = ''
  if (dark) back = `<rect width="${W}" height="${H}" fill="${t.ground}"/>`
  else {
    defs.push(skyDefs(), plateDefs())
    back = skyRect(W, H)
    plateSvg = `<g class="pl">${plate({ x: 28, y: 24, w: W - 56, h: H - 24 - 44, r: 28 })}</g>`
  }

  const avail = W - 56 - TX
  const pw = SX - 34 - 56
  const psz = (s) => Math.min(20, 20 * pw / measure(t.label, lbl(t, s), 20, dark ? 0.12 : 0.01, t.labelWeight).width)
  const ds = dark ? 44 : 52

  css.push(`.ttl{font-size:var(--ts);font-weight:${t.leadWeight};fill:${t.fg};}
.co{font-size:22px;fill:${t.muted};}
.pd{text-anchor:end;}
.en{font-family:${fam(t.display)};font-size:${ds}px;fill:${t.fg};text-anchor:end;}
.hair{stroke:${t.line};stroke-width:1;}
.spine{stroke:${dark ? t.muted : t.accent};stroke-width:${dark ? 2 : 3};stroke-linecap:round;stroke-dasharray:${L};animation:sdraw ${T}s cubic-bezier(.45,.05,.35,1) .35s both;}
@keyframes sdraw{from{stroke-dashoffset:${L}}}
.nd{transform-box:fill-box;transform-origin:center;animation:nd .5s cubic-bezier(.16,1,.3,1) both;}
@keyframes nd{from{opacity:0;transform:scale(.3)}}
.ripple{transform-box:fill-box;transform-origin:center;animation:rip 1.4s cubic-bezier(.16,1,.3,1) both;}
@keyframes rip{from{opacity:.9;transform:scale(.6)}to{opacity:0;transform:scale(2.4)}}
${dark
    ? `.row,.en{animation:on .5s steps(3) both;}@keyframes on{from{opacity:0}}`
    : `.row,.en{transform-box:fill-box;transform-origin:50% 100%;animation:rise .9s cubic-bezier(.16,1,.3,1) both;}
@keyframes rise{from{opacity:0;transform:translateY(20px);filter:blur(8px)}}
.pl{animation:plin 1s cubic-bezier(.16,1,.3,1) both;}@keyframes plin{from{transform:translateY(26px);opacity:0}}`}`)

  let rail = `<path class="hair" d="M${SX} ${sTop}V${sBot}"/><path class="spine" d="M${SX} ${sTop}V${sBot}" fill="none"/>`
  let rows = ''
  ROLES.forEach(([per, title, co], i) => {
    const y = Y0 + i * RH
    const d = at(y).toFixed(2)
    const cur = i === 0
    const ts = +Math.min(28, 28 * avail / measure(t.body, title, 28, 0, t.leadWeight).width).toFixed(1)
    if (ts < 24) throw new Error('title too wide: ' + title)
    if (measure(t.body, co, 22, 0, 400).width > avail) throw new Error('company too wide: ' + co)
    const p = lbl(t, per)
    const ring = dark ? t.ground : '#fff'
    let node
    if (cur) {
      const c = dark ? t.accent : t.life
      node = `${dark ? '' : `<circle class="ripple" cx="${SX}" cy="${y}" r="13" fill="none" stroke="${t.leaf}" stroke-width="2" style="animation-delay:${d}s"/>`}<circle class="nd" cx="${SX}" cy="${y}" r="11" fill="${c}" stroke="${ring}" stroke-width="3" style="animation-delay:${d}s"/>`
    } else {
      node = `<circle class="nd" cx="${SX}" cy="${y}" r="8" fill="${ring}" stroke="${dark ? t.fgDim : t.accent}" stroke-width="2.5" style="animation-delay:${d}s"/>`
    }
    rail += node
    rows += `<g class="row" style="animation-delay:${d}s;--ts:${ts}px"><text class="label pd" x="${PX}" y="${y + 7}" font-size="${psz(per).toFixed(1)}">${dark ? esc(p).replace('–', `<tspan style="font-family:${fam(t.display)}">–</tspan>`) : esc(p)}</text><text class="ttl" x="${TX}" y="${y + 8}">${esc(title)}</text><text class="co" x="${TX}" y="${y + 40}">${esc(co)}</text></g>`
  })
  // rail endpoints in the display face
  rows += `<text class="en" x="${PX}" y="${sTop + ds * 0.62}" style="animation-delay:.1s">${ENDS[0]}</text>`
  rows += `<text class="en" x="${PX}" y="${sBot - 6}" style="animation-delay:${at(sBot).toFixed(2)}s">${ENDS[1]}</text>`

  const body = `<defs>${defs.join('\n')}</defs>\n${back}\n${plateSvg}\n${rail}\n${rows}`
  return doc({
    h: H, t, fonts: [t.display, t.body, t.label].filter((v, k, a) => a.indexOf(v) === k),
    title: 'Trajectory. Now: AI Developer at PadTech Solution, C.A., since 09/2025. Before that, Automation Architect Intern at the Ministry of Natural Resources & Environment, Full-Stack Specialist Architect at Inversiones Galiang, Developer Intern at Banesco, Teaching Assistant, Introductory Mathematics at Universidad Metropolitana de Caracas, and Data Modeling & Integration Intern at Banesco, back to 2023.',
    css: css.join('\n'), body, extraChars: '0123456789',
  })
}
export const cards = { trajectory }
