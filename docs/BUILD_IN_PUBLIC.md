# Rewindscope — Build-in-Public Playbook (X / Twitter)

Thesis-driven narrative. Three recurring hooks:
- "App Router needs its Redux DevTools moment."
- "I'm building a time-travel debugger for Server Actions and RSC — in public."
- "Why cache tags and streamed payloads make Next.js hard to debug."

## Cadence
- **Daily**: one short "today I shipped X" post with a clip/screenshot (template below).
- **Weekly**: one thread — pick from {technical concept, product demo clip, reverse-engineering insight, roadmap recap}.
- Always end builder posts with a soft CTA: ⭐ the repo / reply with your worst RSC bug.

## Daily template
```
day {N} of building Rewindscope 🦋⏪ (open-source time-travel debugger for Next.js)

today: {what shipped, one line}

{why it matters, one line}

{clip / screenshot}

repo 👇 (it's MIT)
```

## Per-phase ready-to-post drafts

### Phase 0 — Foundations
- "Locked the trace schema today. One `TraceEvent` type unifies 11 phases — user input, Server Actions, cache invalidation, RSC chunks, cookie/header mutations, redirects, tree diffs. The whole product hangs off this. [screenshot of the Zod schema]"
- "Hot take: most Next.js debugging pain is that these 6 planes live in 6 different tools. Rewindscope puts them on one scrubber. Here's the architecture 🧵"

### Phase 1 — Landing page + demo (BIG moment — launch tweet)
- LAUNCH: "Introducing Rewindscope ⏪ — a time-travel debugger for Next.js App Router. Rewind a session and see exactly which Server Action ran, which cache tags changed, what RSC streamed, and how the client tree reacted. All on one timeline. Live demo + open source 👇"
- "The demo runs entirely on synthetic data right now — but the scrubber + synced panes are exactly the real UX. Drag the timeline, watch all 4 planes move together. [clip]"
- "Why a landing page before the engine? Building the hard part (RSC replay) in public is more fun when people are already watching. Traction first, depth in the open."

### Phase 2 — Inspector MVP
- "Rewindscope can now load a real `.rwd` trace bundle and render it — drag, drop, scrub. Export from one machine, open on another. [clip]"
- THREAD: "5 ways to look at the same session: timeline, diff, causality graph, payload explorer, presentation mode. Why one debugger needs all five 🧵"

### Phase 3 — Recorder MVP (the flex)
- "It's real. Rewindscope now *records* an actual Next.js session via `instrumentation.ts` — Server Actions, cache tags, RSC frames, the client tree — and replays it tick by tick. No shadow React runtime, just a deterministic replay graph. [clip]"
- THREAD (reverse-engineering insight): "How I reconstruct the UI without re-running React: capture RSC frames → normalize to ops → apply to a replay tree → snapshot at stable boundaries. Here's the algorithm 🧵"

### Phase 4 — Cache Semantics (the 'aha')
- "Most tools tell you 'tag invalidated'. Rewindscope tells you whether the user actually saw fresh data — and classifies it: immediate-freshness / stale-then-refresh / no-visible-effect / orphaned-invalidation. That last one is a bug you didn't know you had. [clip]"
- "Benchmarked capture overhead against an OpenTelemetry baseline. Normal mode stays in dev-only budget; minimal mode for big apps. Numbers + methodology 🧵"

### Phase 5 — Integrations
- "Rewindscope now ships an MCP server. Ask your coding agent: 'which Server Action caused this stale state?' and it queries the actual session trace. [clip]"
- "VS Code extension: click a tick in the inspector → jump straight to the Server Action source. [clip]"

## Content tips
- Lead with the clip; the UI is the product.
- One idea per post. Threads for depth.
- Show failures too ("spent a day fighting AsyncLocalStorage context loss") — builders reward honesty.
- Pin the launch tweet; update the repo README with the same clips.
- Cross-post threads to a `/blog` on the docs-site for SEO.
