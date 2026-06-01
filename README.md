<div align="center">

# ⏪ Flightrec

**A time-travel debugger for the Next.js App Router.**

Record a full session as a replayable execution trace, then scrub the timeline to see exactly
which Server Action ran, which cache tags changed, what RSC payload streamed, what
cookies/headers mutated, and how the client tree reacted — all in one view.

MIT licensed · built in public

</div>

---

> **Status: alpha (v0.1).** This repo currently contains the marketing/landing site and an
> interactive demo running on synthetic trace data. The recorder, inspector, and MCP server land
> phase by phase — see [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Why

App Router apps are hard to debug because the story is scattered: state is split across the
server/client boundary, rendering is streamed in RSC chunks, cache invalidation changes behavior
over time, and no tool unifies these layers. Logs, traces, metrics, and firewall rules each see
one slice. Flightrec replays the whole causal chain on a single scrubbable timeline.

## The six planes

Flightrec unifies six planes against one timeline — the differentiator versus observability,
runtime metadata, or generic session replay:

1. **User actions** — clicks, inputs, navigations that start the chain
2. **Server Actions** — which function ran, with what args, and its outcome
3. **Cache invalidation** — `updateTag` / `revalidateTag` and the freshness it produced
4. **RSC payloads** — ordered Flight frames as they streamed in
5. **Response mutations** — cookie writes, header mutations, redirects
6. **Client tree** — the client-visible nodes created, patched, removed

## Getting started (landing + demo)

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

## Docs

- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased build plan, monorepo blueprint, stack decisions
- [`docs/LANDING_PAGE.md`](docs/LANDING_PAGE.md) — landing page design blueprint
- [`docs/BUILD_IN_PUBLIC.md`](docs/BUILD_IN_PUBLIC.md) — the build-in-public playbook

## License

[MIT](LICENSE)
