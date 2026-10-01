/**
 * Project cards: deployed units, one per public repo. Not a template: the
 * portfolio leads (1000 wide, the live sphere beside its text), the other two
 * (500 wide, they sit side by side) each open with their own specimen: the real
 * phone capture, and a diagram of concurrent requests being serialised.
 * Console: the unit's outline is drawn, a 3px amber tick prints on it, the
 * name prints, the lamp comes online. Aquarium: a glass plate surfaces, the
 * specimen behind glass, bubbles. The live lamp is each card's one accent.
 * No label above a name; the status lives in the footer next to the address.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { doc, fam, lbl, measure, sphere, bubbles, skyDefs, skyRect, plateDefs, plate, esc } from './lib.mjs'
import { si, wrap, flow, icon } from './util.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const SHOT = readFileSync(join(here, 'banderas-crop.jpg')).toString('base64')

const DS = 24 // description, never under 22
const FS = 22 // footer address
const LS = 19 // stack labels

const CFG = {
  portfolio: {
    name: 'jdflores-dev',
    desc: 'My portfolio. Bilingual EN/ES, two visual worlds, three generative canvases. Content edited from a CMS and published by GitHub Actions.',
    stack: [['React', si.siReact], ['TypeScript', si.siTypescript], ['Vite', si.siVite], ['GSAP', si.siGreensock], ['Three.js', si.siThreedotjs]],
    foot: 'juandi9585.github.io/jdflores-dev', live: true,
    alt: 'jdflores-dev, my portfolio. Bilingual EN/ES, two visual worlds, three generative canvases. Content edited from a CMS and published by GitHub Actions. Built with React, TypeScript, Vite, GSAP and Three.js. Live at juandi9585.github.io/jdflores-dev.',
  },
  banderas: {
    name: 'juego-banderas',
    desc: 'A flag quiz for 197 countries: three game modes, installable PWA that works offline, global ranking on Supabase validated server-side.',
    stack: [['React 19', si.siReact], ['TypeScript', si.siTypescript], ['Supabase', si.siSupabase], ['PWA', si.siPwa]],
    foot: 'juego-banderas-khaki.vercel.app', live: true,
  },
  aerostore: {
    name: 'aero-store-quarkus',
    desc: 'Inventory reservations that stay consistent under concurrency.',
    stack: [['Java 21', null], ['Quarkus', si.siQuarkus], ['PostgreSQL', si.siPostgresql], ['Flyway', si.siFlyway], ['Next.js', si.siNextdotjs]],
    foot: 'Technical test', live: false,
  },
}

function palette(t) {
  const dark = t.world === 'dark'
  return {
    dark,
    wght: dark ? 400 : 500,
    nameTrack: dark ? -0.01 : 0,
    lTrack: dark ? 0.12 : 0.01,
    sep: dark ? t.line : 'rgba(0,121,191,0.3)',
  }
}

/** shared pieces: name, description lines, stack readings, footer. Returns svg and the y where it ends. */
function textBlock(t, c, { x, y, w, ns, delay }) {
  const p = palette(t)
  const { dark } = p
  const R = dark ? 'rd' : 'rs'
  let svg = ''
  const nameBase = y + ns
  svg += `<text class="nm ${dark ? 'pr' : 'rs'}" x="${x}" y="${nameBase}" style="animation-delay:${delay.toFixed(2)}s">${esc(c.name)}</text>`
  const lines = wrap(t.body, c.desc, DS, w, p.wght)
  let by = nameBase + 18 + DS + 8
  lines.forEach((l, i) => {
    svg += `<text class="ds ${R}" x="${x}" y="${by}" style="animation-delay:${(delay + 0.3 + i * 0.16).toFixed(2)}s">${esc(l)}</text>`
    by += 34
  })
  by -= 34
  // stack readings: mark where the package has one, label in the world's label case
  const items = c.stack.map(([n, mark]) => ({ txt: lbl(t, n), mark }))
  const { out, lines: sl } = flow(items, { key: t.label, size: LS, wght: t.labelWeight, track: p.lTrack, maxW: w, iconS: 20, iconGap: 9, gap: 30 })
  const sTop = by + 28
  out.forEach((it, k) => {
    const sb = sTop + 20 + it.line * 34
    const d = (delay + 0.3 + lines.length * 0.16 + 0.1 + k * 0.08).toFixed(2)
    let s = ''
    if (it.mark) s += icon(it.mark.path, x + it.x, sb - 17, 20, t.muted)
    s += `<text class="label" x="${(x + it.x + (it.mark ? 29 : 0)).toFixed(1)}" y="${sb}" font-size="${LS}">${esc(it.txt)}</text>`
    if (dark && it.x > 0) s += `<rect x="${(x + it.x - 15).toFixed(1)}" y="${sb - 16}" width="1" height="21" fill="${p.sep}"/>`
    svg += `<g class="${R}" style="animation-delay:${d}s">${s}</g>`
  })
  const fb = sTop + 20 + (sl - 1) * 34 + 46
  const fd = (delay + 0.3 + lines.length * 0.16 + 0.1 + out.length * 0.08 + 0.1).toFixed(2)
  const lampX = x + 6, lampY = fb - 7
  const lamp = c.live
    ? `<circle class="lamp" cx="${lampX}" cy="${lampY}" r="5.5" fill="${t.life}" style="animation-delay:${fd}s,${(+fd + 0.5).toFixed(2)}s"/>`
    : `<circle cx="${lampX}" cy="${lampY}" r="4.5" fill="none" stroke="${t.muted2}" stroke-width="1.5"/>`
  svg += `<g class="${R}" style="animation-delay:${fd}s">${lamp}<text class="ft" x="${x + 24}" y="${fb}">${esc(c.foot)}</text></g>`
  return { svg, end: fb }
}

function baseCss(t, nameSize, nameFamKey) {
  const p = palette(t)
  const dark = p.dark
  return [
    `.nm{font-family:${fam(nameFamKey)};font-size:${nameSize}px;fill:${t.fg};${dark ? 'letter-spacing:-0.01em;' : ''}}
.ds{font-size:${DS}px;font-weight:${p.wght};fill:${t.fgDim};}
.ft{font-size:${FS}px;font-weight:500;fill:${t.fgDim};}
.lamp{transform-box:fill-box;transform-origin:center;animation:flick .45s steps(1) both,pulse 2.4s ease-in-out infinite;}
@keyframes flick{0%{opacity:0}30%{opacity:1}45%{opacity:.2}60%{opacity:1}}
@keyframes pulse{50%{transform:scale(.72);opacity:.55}}`,
    dark
      ? `.rd{animation:on .5s steps(3) both;}@keyframes on{from{opacity:0}}
.pr{animation:on .6s steps(4) both;}
.fr{animation:frd 1.1s cubic-bezier(.4,0,.2,1) both;}@keyframes frd{from{stroke-dashoffset:1}}
.tk{transform-box:fill-box;transform-origin:0 0;animation:tkp .5s steps(8) .4s both;}@keyframes tkp{from{transform:scaleX(0)}}
.vr{transform-box:fill-box;transform-origin:0 0;animation:vrp .8s steps(20) .3s both;}@keyframes vrp{from{transform:scaleY(0)}}`
      : `.rs{transform-box:fill-box;animation:rise .9s cubic-bezier(.16,1,.3,1) both;}
@keyframes rise{from{opacity:0;transform:translateY(18px);filter:blur(8px)}}
.shelf{animation:shelf 1s cubic-bezier(.16,1,.3,1) both;}@keyframes shelf{from{transform:translateY(24px);opacity:0}}`,
  ]
}

/* ---------------- small cards (500 wide) ---------------- */

const SW = 500, PX = 40, IW = SW - 2 * PX
const specimenH = 360

function diagram(t, vh) {
  const p = palette(t)
  const N = 6, cy = vh / 2
  const gap = (vh - 72) / (N - 1)
  let lanes = '', toks = ''
  for (let i = 0; i < N; i++) {
    const yi = 36 + i * gap
    const d = `M24 ${yi.toFixed(1)}H150C210 ${yi.toFixed(1)} 215 ${cy} 270 ${cy}H370`
    lanes += `<path d="${d}" fill="none" stroke="${p.dark ? '#2c3445' : 'rgba(0,121,191,0.3)'}" stroke-width="1.5"/>`
    toks += `<circle class="tkn" r="5.5" fill="${p.dark ? t.signal : '#00b2ff'}" ${p.dark ? '' : 'stroke="#fff" stroke-width="1.5"'} style="offset-path:path('${d}');animation-delay:${(-i * 1.1).toFixed(1)}s"/>`
  }
  const gate = `<path d="M232 ${cy - 34}V${cy + 34}" stroke="${p.dark ? t.muted2 : 'rgba(0,121,191,0.5)'}" stroke-width="1.5"/><path d="M226 ${cy - 34}h12M226 ${cy + 34}h12" stroke="${p.dark ? t.muted2 : 'rgba(0,121,191,0.5)'}" stroke-width="1.5"/>`
  const stock = `<rect x="370" y="${cy - 11}" width="22" height="22" rx="${p.dark ? 3 : 7}" fill="none" stroke="${t.muted}" stroke-width="1.5"/><rect x="376" y="${cy - 5}" width="10" height="10" rx="${p.dark ? 1.5 : 3.5}" fill="${t.muted}"/>`
  const css = `.tkn{offset-rotate:0deg;animation:tkgo 6.6s linear infinite;}
@keyframes tkgo{0%{offset-distance:0%;opacity:0}7%{opacity:1}93%{opacity:1}100%{offset-distance:100%;opacity:0}}`
  return { css, svg: `<g aria-hidden="true">${lanes}${gate}${stock}${toks}</g>` }
}

function small(t, c, which, H, ns) {
  const p = palette(t)
  const dark = p.dark
  const y0 = dark ? 44 : 50
  const css = []
  const defs = []
  let back = '', spec = ''
  let vh = specimenH
  const tb = (v) => textBlock(t, c, { x: PX, y: y0 + v + 34, w: IW, ns, delay: 0.7 })
  if (H) vh = specimenH + (H - small(t, c, which, 0, ns).h)

  // the specimen window
  if (which === 'banderas') {
    const rx = dark ? 4 : 14
    defs.push(`<clipPath id="win"><rect x="${PX}" y="${y0}" width="${IW}" height="${vh}" rx="${rx}"/></clipPath>`)
    spec = `<g class="${dark ? 'rd' : 'rs'}" style="animation-delay:.5s"><image href="data:image/jpeg;base64,${SHOT}" x="${PX}" y="${y0}" width="${IW}" height="${(785 * IW / 860).toFixed(1)}" preserveAspectRatio="xMidYMin slice" clip-path="url(#win)"/><rect x="${PX + 0.5}" y="${y0 + 0.5}" width="${IW - 1}" height="${vh - 1}" rx="${rx}" fill="none" stroke="${dark ? t.line : '#fff'}" stroke-width="${dark ? 1 : 2}"/></g>`
  } else {
    const dg = diagram(t, vh)
    css.push(dg.css)
    const rx = dark ? 4 : 14
    spec = `<g class="${dark ? 'rd' : 'rs'}" style="animation-delay:.5s"><rect x="${PX + 0.5}" y="${y0 + 0.5}" width="${IW - 1}" height="${vh - 1}" rx="${rx}" fill="${dark ? t.panel : 'rgba(217,227,240,0.6)'}" stroke="${dark ? t.line : '#fff'}" stroke-width="${dark ? 1 : 2}"/><g transform="translate(${PX} ${y0})">${dg.svg}</g></g>`
  }
  const blk = tb(vh)
  const bottom = blk.end + (dark ? 44 : 34)
  let frame = ''
  let h
  if (dark) {
    h = bottom
    back = `<rect width="${SW}" height="${h}" fill="${t.ground}"/>`
    frame = `<rect class="fr" x=".5" y=".5" width="${SW - 1}" height="${h - 1}" rx="4" fill="none" stroke="${t.line}" pathLength="1" stroke-dasharray="1"/>`
  } else {
    const ph = bottom - 14
    h = bottom + 36
    defs.push(skyDefs(), plateDefs())
    const bb = bubbles({ w: SW, h, count: 4, burst: 4, seed: which === 'banderas' ? 3 : 9 })
    defs.push(bb.defs); css.push(bb.css)
    back = skyRect(SW, h) + bb.svg + `<g class="shelf">${plate({ x: 14, y: 14, w: SW - 28, h: ph, r: 24 })}</g>`
    frame = ''
  }
  css.unshift(...baseCss(t, ns, t.display))
  return {
    h,
    svg: () => doc({
      w: SW, h, t,
      title: c.alt,
      fonts: [t.display, t.body],
      css: css.join('\n'),
      body: `<defs>${defs.join('\n')}</defs>${back}${spec}${blk.svg}${frame}`,
      extraChars: '0123456789',
    }),
  }
}

function pair(t, which) {
  const p = palette(t)
  const names = [CFG.banderas.name, CFG.aerostore.name]
  const ns = Math.min(28, ...names.map((n) => Math.floor(IW / measure(t.display, n, 1, p.nameTrack).width * 0.98)))
  const hs = [small(t, CFG.banderas, 'banderas', 0, ns).h, small(t, CFG.aerostore, 'aerostore', 0, ns).h]
  const H = Math.max(...hs)
  return small(t, CFG[which], which, H, ns).svg()
}

/* ---------------- the featured card (1000 wide) ---------------- */

function portfolio(t) {
  const p = palette(t)
  const dark = p.dark
  const c = CFG.portfolio
  const W = 1000, X = 56, TW = 500
  const ns = Math.min(50, Math.floor(TW / measure(t.display, c.name, 1, p.nameTrack).width * 0.98))
  const y0 = dark ? 60 : 68
  const blk = textBlock(t, c, { x: X, y: y0, w: TW, ns, delay: 0.5 })
  const bottom = blk.end + (dark ? 52 : 40)
  const css = baseCss(t, ns, t.display)
  const defs = []
  let back, frame = ''
  let h
  let sp
  if (dark) {
    h = bottom
    sp = sphere({ cx: 800, cy: h / 2, r: Math.min(150, h / 2 - 40), t, period: 30, idp: 'sp' })
    back = `<rect width="${W}" height="${h}" fill="${t.ground}"/>`
    frame = `<rect class="fr" x=".5" y=".5" width="${W - 1}" height="${h - 1}" rx="4" fill="none" stroke="${t.line}" pathLength="1" stroke-dasharray="1"/><rect class="vr" x="600" y="1" width="1" height="${h - 2}" fill="${t.line}"/>`
  } else {
    const ph = bottom - 14
    h = bottom + 38
    sp = sphere({ cx: 800, cy: 14 + ph / 2, r: Math.min(150, ph / 2 - 30), t, period: 30, idp: 'sp' })
    defs.push(skyDefs(), plateDefs())
    const bb = bubbles({ w: W, h, count: 7, burst: 6, seed: 4 })
    defs.push(bb.defs); css.push(bb.css)
    back = skyRect(W, h) + bb.svg + `<g class="shelf">${plate({ x: 14, y: 14, w: 600, h: ph, r: 30 })}</g>`
    frame = ''
  }
  defs.push(sp.defs); css.push(sp.css)
  return doc({
    w: W, h, t, title: c.alt,
    fonts: [t.display, t.body],
    css: css.join('\n'),
    body: `<defs>${defs.join('\n')}</defs>${back}${sp.svg}${blk.svg}${frame}`,
    extraChars: '0123456789',
  })
}

CFG.banderas.alt = 'juego-banderas: a flag quiz for 197 countries. Three game modes, an installable PWA that works offline, and a global ranking on Supabase validated server-side. Built with React 19, TypeScript, Supabase and PWA. Live at juego-banderas-khaki.vercel.app. Shown with a capture of the app on a phone.'
CFG.aerostore.alt = 'aero-store-quarkus: inventory reservations that stay consistent under concurrency. Built with Java 21, Quarkus, PostgreSQL, Flyway and Next.js. A technical test. Shown as concurrent requests lining up into a single sequence.'

export const cards = {
  'project-portfolio': portfolio,
  'project-banderas': (t) => pair(t, 'banderas'),
  'project-aerostore': (t) => pair(t, 'aerostore'),
}
