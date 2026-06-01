# Flightrec — Design Language ("Editorial Instrument")

A debugger is a precision instrument — but a *product* people choose has taste. Flightrec pairs
the calm authority of an instrument panel with editorial warmth, so it reads as crafted, not
sterile.

## The idea in one line
**Technical substance, editorial surface.** A serif display voice over a monospace/technical body,
warm neutrals with one black-box-orange signal, and depth that feels physical.

## Inspirations (cross-domain on purpose)
- **Teenage Engineering** — instrument panels; function as form; one signal hue.
- **Linear / Vercel** — restraint, hairlines, confident negative space.
- **Editorial print** (magazines, Instrument Serif revival) — a serif headline gives instant taste.
- **Rauno Freiberg / Family.co** — motion that feels physical (springs, shared elements).
- **Flight recorders are bright orange** — our accent isn't decoration, it's the brand's literal object.

## Principles
1. **Serif display, technical body.** Instrument Serif (400, with italic accents) for headlines;
   Geist Sans for prose; Geist Mono for every measured value. The tension is the taste.
2. **One signal color.** Black-box orange (`--accent`). A muted teal (`--accent-2`) is the only
   counterpoint, used sparingly in glows and the cache plane. Categorical planes stay as small dots.
3. **Warm neutrals + depth.** Not pure black/white — warm near-black (dark) and warm paper (light),
   with real elevation: soft shadows, a 1px top sheen on cards, hover lift.
4. **Motion is measurement.** Animate what actually moves in a session — the scrub head, streaming
   frames, reconcile rows — plus one calm hero aurora. Springs (stiffness ~320, damping ~34).
   Sections rise once on scroll. Respect `prefers-reduced-motion`.
5. **Industry-standard width.** Centered `.page` at max 1200px with fluid gutters — never full-bleed.
6. **Both themes ship.** Dark is home; light is warm and documentation-grade. Every color is a token.

## Tokens
Light = `:root`, dark = `.dark`. Surfaces: `--bg / --bg-raised / --bg-inset`. Text:
`--fg / --fg-muted / --fg-faint`. Signal: `--accent / --accent-2 / --accent-dim / --accent-fg /
--accent-glow`. Depth: `--shadow-sm / --shadow-card / --sheen`. Planes: `--plane-*`.

## Utilities
- `.display` — serif headline face; `.display em` → italic + accent.
- `.card` / `.surface` — elevated, sheened; `.card-hover` adds lift + accent ring.
- `.eyebrow` — mono, uppercase, tracked, accent-colored section label.
- `.page` — the centered container.
- `.reveal(.in)` — scroll-in fade/rise.

## Type scale
- Display (serif): hero `text-7xl`, sections `text-4xl`, tight tracking, balanced.
- Body (sans): 1.6 line-height, `--fg-muted`.
- Data (mono): values, routes, identifiers, eyebrows.
