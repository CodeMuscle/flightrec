# Rewindscope — Design Language ("Oscilloscope")

A debugger is a measurement instrument. Rewindscope should feel like one — precise,
calm, and trustworthy, with a single live signal you can read at a glance.

## Inspirations (cross-domain on purpose)
- **Teenage Engineering** — industrial/utilitarian instrument panels; function expressed as form; restrained color with one signal hue.
- **Linear** — keyboard-first, dense-but-calm, motion that confirms rather than decorates.
- **Vercel / shadcn** — typographic restraint, hairline borders, generous negative space.
- **Rauno Freiberg / Family.co** — motion craft: springs, shared-element transitions, "physical" feel.
- **Oscilloscopes & CRT terminals** — phosphor amber signal on near-black, scan lines, grid graticule.

## Principles
1. **One signal color.** Phosphor amber `--accent` is the only loud hue. Everything else is monochrome zinc. Categorical "plane" hues appear only as small dots/labels, never as fills.
2. **Hairlines, not boxes.** Structure comes from 1px lines and segmented panes, not shadows or cards-on-cards.
3. **Mono for data, sans for prose.** Geist Mono carries every measured value, label, route, and identifier. Geist Sans carries human sentences.
4. **Motion is measurement.** Animate the scrub head, the streaming frames, the reconcile — the things that actually move in a session. Springs (stiffness ~320, damping ~34). Never animate for decoration. Respect `prefers-reduced-motion`.
5. **Graticule depth.** A faint dotted grid + optional scan sweep gives atmosphere without gradients.
6. **Legible in both themes.** Dark is home; light is documentation-grade. Both ship day one.

## Tokens
All color is CSS variables (`--bg`, `--fg`, `--accent`, `--plane-*`, …) defined for light (`:root`)
and dark (`.dark`). Components never hardcode hue except amber-button foreground. Container width is
fluid via `.page` (max 1440px, padding `clamp(1rem, 4vw, 4rem)`).

## Type scale
- Display: Geist Sans, 600, tight tracking, `text-wrap: balance`.
- Body: Geist Sans, 1.6 line-height, `--fg-muted`.
- Data/labels: Geist Mono, uppercase `tracking-wider` for section eyebrows.

## Motion vocabulary
- **Scrub:** spring on head + progress fill.
- **Stream-in:** RSC frames enter `x:-8 → 0`, opacity 0→1.
- **Reconcile:** tree rows `height:0 → auto`.
- **Reveal:** sections fade+rise on scroll (8–16px), staggered, once.
- **Hover:** border → accent, never scale-up on dense UI.
