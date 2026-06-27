<div align="center">

# ⏪ Flightrec

**A time-travel debugger for the Next.js App Router.**

Record a full session as a replayable execution trace, then scrub the timeline to see exactly
which Server Action ran, which cache tags changed, what RSC payload streamed, what
cookies/headers mutated, and how the client tree reacted — all in one view.

MIT licensed · built in public

</div>

---

> **Status: alpha (v0.1) · built in public.** Shipped: the trace schema, the recorder (server-side
> capture via `AsyncLocalStorage` + React `cache()` render capture), the inspector (5 modes, `.frec`
> import/export), AI summaries + bug reports, secret redaction, and 3 demo flows. Next: MCP server,
> browser persistence. See [`docs/ROADMAP.md`](docs/ROADMAP.md) ·
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

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

## Getting started

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

Routes to try:

- **`/inspector`** — scrub a recorded session (try `?demo=blog`, `?demo=dashboard`, `?demo=auth`)
- **`/playground`** — record a real session live (server action → `.frec` → inspect)
- **`/docs`** — documentation

AI summaries/bug-reports need a free key (Groq by default) — copy `apps/web/.env.example` to
`apps/web/.env.local` and set `AI_API_KEY`. Without it, the buttons show a graceful prompt.

```bash
pnpm test        # vitest across all packages
pnpm typecheck
pnpm build
```

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — as-built HLD/LLD, components, flows, decisions
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased build plan, monorepo blueprint, stack decisions
- [`docs/INSPECTOR-IA.md`](docs/INSPECTOR-IA.md) — inspector's 5-region wireframe
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — dev setup + PR flow

## License

[MIT](LICENSE)
