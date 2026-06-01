# Rewindscope — Landing Page Blueprint

Aesthetic target: **shadcn / Vercel docs-grade** — restrained, typographic, precise borders,
segmented panes, subtle motion. No noisy gradients. Engineering-first and trustworthy.

## Stack
- Next.js 15 App Router + Tailwind v4 + shadcn/ui
- `motion` for transitions; `next-themes` for dark/light (dark default)
- Geist Sans + Geist Mono typography
- Mermaid rendered at build time to SVG (no client cost)

## Page sections (top → bottom)

1. **Top nav** — wordmark, docs / demo / GitHub (star count) / "npm i" copy button.
2. **Hero**
   - H1: "Rewind any Next.js session." Sub: the one-line pitch from the PRD.
   - Primary CTA: *Open live demo* · Secondary: *Read the docs* · Tertiary: GitHub.
   - Right side / below: a muted looping preview of the scrub timeline (the real demo, autoplay-on-scroll).
3. **The problem** — 3–4 cards: split server/client state, streamed rendering, cache-tag subtlety, no unified replay. Each with a tiny inline diagram.
4. **Interactive scrub-timeline demo (the centerpiece)**
   - Horizontal scrubber, 12 synthetic ticks.
   - Synchronized panes: Server Action · Cache invalidation · RSC frames · Client tree diff.
   - Keyboard arrows scrub; panes update together; "play" auto-advances.
   - Built on Phase-0 synthetic fixtures (no backend).
5. **Concept explainer animation** — 10s loop: click *Save* → Server Action runs → `updateTag` invalidates → RSC frames stream → tree updates. Labels + subtle arrows.
6. **The six planes** — the differentiator: user actions · Server Actions · cache · RSC payloads · response mutations · client tree. Compact segmented graphic.
7. **Comparison section** — Rewindscope vs Vercel Observability vs Next.js MCP vs generic session replay. Honest table; we win on "human-first replay of causality".
8. **Cache Semantics teaser** — show the 4 outcomes (`immediate-freshness` / `stale-then-refresh` / `no-visible-effect` / `orphaned-invalidation`) as a small annotated example. This is the "aha".
9. **Architecture** — the high-level Mermaid flowchart + ER diagram, in collapsible code-snippet cards.
10. **Code snippet cards** — `instrumentation.ts` one-liner setup; `.rwd` export; reading a trace. Copy buttons.
11. **Roadmap / build-in-public** — link to the public roadmap + X handle; "we're building this in the open".
12. **Footer** — license, GitHub, docs, contributing.

## Components to build (shadcn-based)
- `<ScrubTimeline>` — the controller + shared tick state (context/zustand).
- `<SyncedPane>` — generic pane that subscribes to current tick.
- `<TreeDiffView>` — keyed tree with added/removed/changed highlighting.
- `<PayloadFrame>` — RSC frame card (sanitized).
- `<CacheOutcomeBadge>` — the 4 semantic states.
- `<MermaidCard>` / `<CodeCard>` — diagram + snippet wrappers with copy.
- `<ComparisonTable>`.

## Performance
- Virtualize the event list; lazy-load heavy payload detail.
- Use checkpoint snapshots so scrubbing never recomputes from tick 0.
- Prefer transform/opacity animations; respect `prefers-reduced-motion`.
- Target 60fps scrub; Lighthouse 95+; ship the demo as static where possible.

## Assets to produce for the LP / X
- 1 hero loop (silent mp4 + webm, ~6s).
- 1 concept explainer (10s).
- 3 demo clips (blog create / stale dashboard / auth cookie), 15–25s each.
- OG image + social card.
