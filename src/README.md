# Card generator

Builds every SVG in `../assets/`, each in two worlds: `-dark` is the Deployed
Systems Console and `-light` the Aquarium Window, the two themes of
[jdflores-dev](https://github.com/juandi9585/jdflores-dev). The README picks one
per visitor through `<picture>` and `prefers-color-scheme`.

## Requirements

- Node 18+ and Python 3 with `fonttools` and `brotli` (`pip install fonttools brotli`).
  Python subsets the fonts to the glyphs each card prints.
- A checkout of `jdflores-dev` next to this repo's parent folder
  (`../../jdflores-dev` from here) with `npm install` run. It provides the
  self-hosted faces (`public/fonts`), Playwright, simple-icons, and the copy the
  stack and credentials cards read from `src/content/content.en.json`.

## Commands (from the repo root)

```bash
node src/build.mjs            # every card, both worlds, plus resting-frame PNGs in .review/
node src/build.mjs impact     # only cards whose name contains "impact"
node src/check.mjs            # the gate: must end "all cards complete in every mode"
```

`check.mjs` renders each card three ways: animation finished, clock frozen at
zero, and reduced motion. It fails if any text is hidden in the last two.
Contact sheets go to `.review/check-*.png`.

## How a card works

- One module per card in `src/`, exporting `cards = { name: (t) => svg }`.
  `t` is the world's tokens from `lib.mjs`. Read only `t.<token>` and never
  hardcode a colour.
- `doc()` in `lib.mjs` embeds the subset fonts and wraps the card. It also moves
  every finite animation behind a `.go` class that SMIL adds 50 ms in. A viewer
  that never runs the clock (some webviews, battery saver, apps that rasterise
  README images) then shows the complete resting frame. Write arrivals as
  from-only keyframes with `both` fill.
- Loops (sphere, bubbles, code rain) use `infinite`. An ornament whose shape is
  its motion carries the class `hold`, so reduced motion freezes it instead of
  removing it.
- Avoid `clip-path: inset()` on SVG groups or text for reveals. It resolves
  against the wrong box and cuts rows in half. Use a `<clipPath>` with a scaled
  rect, or opacity and transform.
- Keep text that must be read at 22 units or more: GitHub shows the 1000-unit
  width at about 340 px on a phone.

After changing a card: build, check, look at `.review/`, then commit the SVGs
and the source together.
