/**
 * Link buttons: one small SVG each, all 56 units tall so they sit level side by
 * side. No ground is painted: the button is the shape, and it sits on GitHub's
 * own page (white or #0d1117). Icons are drawn on the 16-unit grid at 1.25
 * stroke (the LinkedIn mark is not in simple-icons any more, so it is drawn).
 * Console: the primary is amber, squared, and powers on; the rest are hairline.
 * Aquarium: the primary is the aqua lozenge and a band of light crosses it once;
 * the rest are opaque glass pills (opaque so they hold on either GitHub theme).
 */
import { doc, fam, lbl, measure, esc } from './lib.mjs'

const H = 56
const PAD = 10 // outer room for the lift shadow
const BY = 6, BH = 42 // body top, body height
const CY = BY + BH / 2

const ICONS = {
  arrow: 'M2.5 8h11M9 3.5 13.5 8 9 12.5',
  doc: 'M3.75 1.75h5.5l3.5 3.5v9h-9zM9.25 1.75v3.5h3.5M6 8.75h4.5M6 11.5h4.5',
  mail: 'M3.25 3.5h9.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5V5a1.5 1.5 0 0 1 1.5-1.5zM2.5 5 8 9.25 13.5 5',
  in: 'M4.25 2h7.5A2.25 2.25 0 0 1 14 4.25v7.5A2.25 2.25 0 0 1 11.75 14h-7.5A2.25 2.25 0 0 1 2 11.75v-7.5A2.25 2.25 0 0 1 4.25 2zM5.4 7.4v3.6M8.1 11V7.4M8.1 9c0-1.2.9-1.7 1.8-1.7s1.5.7 1.5 1.9V11',
}
const icon = (name, x, color) =>
  `<g transform="translate(${x} ${CY - 10}) scale(1.25)" fill="none" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name]}"/>${name === 'in' ? `<circle cx="5.4" cy="5.3" r=".55" fill="${color}"/>` : ''}</g>`

const BUTTONS = {
  'btn-portfolio': { label: 'Portfolio', ic: 'arrow', primary: true, title: 'Portfolio' },
  'btn-resume-en': { label: 'Résumé EN', ic: 'doc', title: 'Résumé in English' },
  'btn-resume-es': { label: 'Résumé ES', ic: 'doc', title: 'Résumé en español' },
  'btn-linkedin': { label: 'LinkedIn', ic: 'in', title: 'LinkedIn' },
  'btn-email': { label: 'juandi9585@gmail.com', ic: 'mail', raw: true, title: 'Email juandi9585@gmail.com' },
}

function button(spec, t) {
  const dark = t.world === 'dark'
  const size = dark ? 19 : 21
  const track = spec.raw ? 0.02 : dark ? 0.06 : 0.01
  const wght = dark ? 500 : 600
  const txt = spec.raw ? spec.label : lbl(t, spec.label)
  const { width } = measure(t.label, txt, size, track, wght)
  const bw = Math.ceil(22 + 20 + 10 + width + 24)
  const w = bw + 2 * PAD
  const r = dark ? t.radius : BH / 2
  const fgc = spec.primary ? t.onAccent : t.fg
  const ty = CY + (dark ? 0.35 : 0.33) * size
  const css = [`.lb{font-family:${fam(t.label)};font-weight:${wght};font-size:${size}px;letter-spacing:${track}em;fill:${fgc};}`]
  let defs = ''
  let shape = ''

  if (dark) {
    if (spec.primary) {
      shape = `<rect class="pw" x="${PAD}" y="${BY}" width="${bw}" height="${BH}" rx="${r}" fill="${t.accent}"/>`
      css.push(`.pw{animation:pw .5s steps(1) both;}@keyframes pw{0%{opacity:0}18%{opacity:1}34%{opacity:.2}52%{opacity:1}}.lb,.ic{animation:on .4s steps(3) .3s both;}@keyframes on{from{opacity:0}}`)
    } else {
      shape = `<rect x="${PAD + 0.5}" y="${BY + 0.5}" width="${bw - 1}" height="${BH - 1}" rx="${r}" fill="none" stroke="${t.muted2}"/>`
      css.push(`.lb,.ic,.bx{animation:on .4s steps(3) .15s both;}@keyframes on{from{opacity:0}}`)
    }
  } else if (spec.primary) {
    const x = PAD, y = BY
    defs = `<linearGradient id="aq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18a6ee"/><stop offset=".5" stop-color="#0088d0"/><stop offset="1" stop-color="#0079bf"/></linearGradient>
<linearGradient id="aqe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#00385a" stop-opacity=".35"/></linearGradient>
<linearGradient id="aqs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>
<linearGradient id="bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="gl" x="-10%" y="-20%" width="120%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3.2" flood-color="#006aa8" flood-opacity=".4"/></filter>
<clipPath id="top"><rect x="${x}" y="${y}" width="${bw}" height="${BH * 0.46}"/></clipPath>
<clipPath id="body"><rect x="${x}" y="${y}" width="${bw}" height="${BH}" rx="${r}"/></clipPath>`
    shape = `<g filter="url(#gl)"><rect x="${x}" y="${y}" width="${bw}" height="${BH}" rx="${r}" fill="url(#aq)"/></g>
<rect x="${x + 0.5}" y="${y + 0.5}" width="${bw - 1}" height="${BH - 1}" rx="${r - 0.5}" fill="none" stroke="url(#aqe)"/>
<g clip-path="url(#top)"><rect x="${x + 1}" y="${y + 1}" width="${bw - 2}" height="${BH - 2}" rx="${r - 1}" fill="url(#aqs)"/></g>
<g clip-path="url(#body)"><path class="band" d="M-70 ${y}h34l-14 ${BH}h-34z" fill="url(#bd)"/></g>`
    css.push(`.band{animation:band .9s cubic-bezier(.4,0,.2,1) .5s both;}@keyframes band{to{transform:translateX(${bw + 110}px)}}
.lb,.ic{animation:rise .8s cubic-bezier(.16,1,.3,1) .1s both;}@keyframes rise{from{opacity:0}}`)
  } else {
    defs = `<linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e3eef9"/></linearGradient>
<filter id="gl" x="-10%" y="-20%" width="120%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#004a75" flood-opacity=".16"/></filter>`
    shape = `<g filter="url(#gl)"><rect x="${PAD + 0.5}" y="${BY + 0.5}" width="${bw - 1}" height="${BH - 1}" rx="${r}" fill="url(#gf)" stroke="rgba(0,121,191,0.32)"/></g>
<path d="M${PAD + r} ${BY + 1.5}H${PAD + bw - r}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`
    css.push(`.lb,.ic{animation:rise .8s cubic-bezier(.16,1,.3,1) .1s both;}@keyframes rise{from{opacity:0}}`)
  }

  const ix = PAD + 22
  const body = `<defs>${defs}</defs>
${shape}
<g class="ic">${icon(spec.ic, ix, spec.primary ? t.onAccent : dark ? t.fg : t.accent)}</g>
<text class="lb" x="${ix + 30}" y="${ty.toFixed(1)}">${esc(txt)}</text>`

  return doc({ w, h: H, t, title: spec.title, fonts: [t.label], css: css.join('\n'), body })
}

export const cards = Object.fromEntries(Object.entries(BUTTONS).map(([n, s]) => [n, (t) => button(s, t)]))
