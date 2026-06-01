# Flightrec — Build Roadmap & Blueprint

> Time-travel debugger for React Server Components, Server Actions, cache invalidation,
> streaming HTML, cookies/headers, and client transitions in Next.js App Router.

This document turns the Master Product Document into an executable, phased plan.
The guiding sequencing principle: **ship a credible landing page + synthetic interactive
demo first** (traction engine), then build the real recorder/inspector behind it. The hard
engine work proceeds in parallel without blocking public momentum.

---

## 0. Tech Stack (decisions)

| Concern | Choice | Why |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Matches the `packages/*` + `apps/*` layout in the PRD |
| Language | TypeScript (strict) | Schema-first product; types are the contract |
| Landing + Inspector | Next.js 15 App Router + React 19 | Dogfood the exact framework we debug |
| UI system | Tailwind v4 + shadcn/ui + Radix | The PRD explicitly asks for a shadcn/Vercel aesthetic |
| Animation | `motion` (Framer Motion) | Subtle, precise transitions per design guidance |
| Diagrams | Mermaid (build-time render) | Architecture/ER diagrams from the PRD |
| Schema/validation | Zod + inferred TS types | One source of truth for `TraceEvent`, `RscFrame`, etc. |
| Local storage | `idb` (IndexedDB) + OPFS adapter | Two storage backends per PRD |
| Package build | `tsup` | Fast dual ESM/CJS bundles for SDK packages |
| Server capture | `AsyncLocalStorage` + `instrumentation.ts` | Per-request trace context without globals |
| Testing | Vitest (unit/integration) + Playwright (E2E/visual) | Matches CI/CD workflow in PRD |
| Tooling | Biome or ESLint+Prettier, Changesets, tsx | Lint/format, versioned releases |
| Docs | Nextra or Fumadocs | Docs-site app in the PRD |

---

## 1. Monorepo Layout (from PRD, finalized)

```
flightrec/
  apps/
    inspector-pwa/      # the scrubbable timeline inspector (Next.js PWA)
    demo-playground/    # Next.js app instrumented with the recorder (3 demos)
    docs-site/          # docs + the public landing page
  packages/
    trace-schema/       # Zod schemas + TS types (TraceEvent, RscFrame, RscOp, CacheOutcome)
    recorder-core/      # framework-agnostic capture + normalization primitives
    recorder-next/      # Next.js server instrumentation (Server Actions, cache, RSC, headers)
    recorder-client/    # client transition + tree-diff capture
    trace-normalizer/   # raw events -> normalized intermediate representation
    trace-storage-indexeddb/
    trace-storage-opfs/
    bundle-frec/         # .frec export/import (zip + manifest + diffs)
    source-mapper/      # actionId/sourceRef -> file:symbol
    ai-insights/        # AI summaries + bug reports
    mcp-adapter/        # Next.js MCP enrichment + Flightrec MCP server
    reconciler/         # RSC replay graph + checkpoint/snapshot engine (NEW vs PRD)
    test-harness/       # golden traces, fixtures, assertion helpers
  docs/                 # this roadmap + design notes
```

> Addition vs PRD: a dedicated **`reconciler`** package isolates the replay-graph engine
> (the RscFrame → tree state machine) from normalization. This is the riskiest code; it
> deserves its own unit-tested boundary.

---

## 2. Phased Roadmap

Each phase lists **Deliverables**, **Exit criteria**, and **Est. duration** (solo/small team).
Phases 1–2 are intentionally front-loaded with the public-facing surface.

### Phase 0 — Foundations (research + scaffolding) · ~1 week
- Bootstrap monorepo (pnpm + Turbo + CI skeleton).
- `trace-schema`: lock `TraceEvent`, `RscFrame`, `RscOp`, `CacheOutcome`, `Session`, `Snapshot` as Zod schemas.
- Synthetic fixture generator: produce a deterministic 12-tick session for the 3 demo flows (blog create / stale dashboard / auth cookie). **No real recorder needed yet.**
- Inspector information architecture wireframe (the 5-region layout).
- **Exit:** `pnpm build` green; one golden `.frec` fixture exists; schemas published internally.

### Phase 1 — Landing page + interactive demo (traction first) · ~1.5 weeks
- `docs-site` landing page (full blueprint in `docs/LANDING_PAGE.md`).
- Interactive scrub-timeline demo driven entirely by **synthetic fixtures** from Phase 0.
- 12-tick scrubber with synchronized panes (Server Action / cache / RSC frames / tree diff).
- Concept explainer animation (the "click save → action → updateTag → RSC streams → tree updates" 10s loop).
- Mermaid architecture + ER diagrams rendered statically.
- Deploy to Vercel; open-source the repo (MIT or Apache-2.0).
- **Exit:** Public URL live; demo scrubs smoothly at 60fps; README + CONTRIBUTING shipped.

### Phase 2 — Inspector MVP (real trace rendering) · ~2 weeks
- `inspector-pwa`: load a `.frec` bundle (drag-drop or URL) and render it.
- Timeline UI, virtualized event list, tick details panel, simple before/after diff view.
- `trace-storage-indexeddb` for persistence; `bundle-frec` import/export round-trips.
- Five inspector modes scaffolded: timeline / diff / causality / payload / presentation.
- **Exit:** A golden `.frec` from Phase 0 renders identically to the synthetic demo; export→import is lossless.

### Phase 3 — Recorder MVP (real capture) · ~3 weeks (hardest)
- `recorder-next`: `instrumentation.ts` hook + `AsyncLocalStorage` request context.
- Capture Server Action start/end + outcome; cache `updateTag`/`revalidateTag`; redirects; cookie/header mutations.
- `recorder-client`: client navigation + tree-diff capture (commit-phase instrumentation).
- RSC chunk capture as ordered `RscFrame`s; `trace-normalizer` → `RscOp[]`.
- `reconciler`: build replay graph, apply ops per tick, materialize checkpoint snapshots at stable boundaries; emit `tree:diff` events.
- Wire `demo-playground` (the 3 real demos) → produce real `.frec` bundles.
- **Exit:** Real captured trace from `demo-playground` opens in the inspector and matches expected tick semantics; golden traces committed.

### Phase 4 — Demo quality + semantic intelligence · ~2 weeks
- `source-mapper`: map events → `file:symbol`.
- Payload explorer (protocol-level RSC/Flight view, sanitized — never eval).
- **Cache Semantics panel**: classify each invalidation as `immediate-freshness` / `stale-then-refresh` / `no-visible-effect` / `orphaned-invalidation`.
- Benchmarks harness (OTel-baseline comparison; scenarios A–F).
- Polish all 3 demos to "documentation-grade".
- **Exit:** Cache-semantics classifier passes golden-trace assertions; benchmark report generated.

### Phase 5 — Distribution + integrations · ~3 weeks
- VS Code extension: tick → open file; "request latest trace for current route".
- `mcp-adapter`: (a) Next.js MCP enrichment (resolve `actionId` via `get_server_action_by_id`, pull logs/errors/route metadata); (b) Flightrec MCP server so agents can query traces.
- `ai-insights`: AI session summaries + auto bug reports (Claude API, with prompt caching).
- **Exit:** Extension installs locally; MCP server answers "which Server Action caused this stale state?" against a golden trace.

### Phase 6 — Growth / scale-out · ongoing
- Cloud sync alpha (optional team sharing of `.frec` bundles).
- Browser extension overlay; desktop app (Tauri).
- Framework expansion research (Remix / SvelteKit adapters behind the same schema).

---

## 3. Critical-path & risk notes

- **Riskiest unit = `reconciler`.** Build it test-first against hand-authored `RscOp` sequences before touching real RSC bytes. Never execute payloads — parse/normalize/sanitize only (Flight protocol has had security CVEs).
- **Recorder overhead must stay dev-only** and bounded (single-digit→low-double-digit % latency in normal mode; a `minimal` mode for big apps). Benchmark vs OTel baseline, don't invent numbers.
- **MCP is enrichment, never source of truth.** Record first, enrich second — replay must work fully offline from a `.frec` bundle.
- **Schema stability.** Version the trace schema (`schemaVersion` field) from day one; `bundle-frec` must migrate older bundles.

---

## 4. Additional modifications / integrations (beyond the PRD)

These raise it to industry standard and widen the solvable-problem surface within the same scope:

1. **`reconciler` as a first-class package** (see above) — de-risks the core.
2. **Schema versioning + bundle migrations** — avoids breaking shared `.frec` files across releases.
3. **PII/secret redaction layer** in `recorder-core` — cookies, auth headers, and RSC payloads routinely carry secrets. Redact-by-default with allowlist; critical for sharing bundles publicly. (Also a strong trust/marketing point.)
4. **Capture modes (`minimal`/`normal`/`verbose`)** wired from day one, gated by env so prod is a no-op import.
5. **OpenTelemetry interop** — ingest existing OTel spans as a trace lane so Flightrec correlates with infra traces instead of competing. Bidirectional: export ticks as OTel events.
6. **Deterministic replay seed** — capture `Math.random`/`Date.now` boundaries so reconstructed ticks are reproducible (helps "shareable repro" use case).
7. **Causality graph engine** — explicit `event → caused-by` edges (user input → request → action → invalidation → RSC → tree-diff), powering both the causality view and the MCP "what caused X" queries.
8. **Error/exception lane** — `error` phase already in schema; add stack capture + source-map resolution so the inspector doubles as a streaming-error debugger.
9. **GitHub integration** — "attach `.frec` to issue" + a CI action that captures a trace on E2E failure and uploads it as an artifact. Turns Flightrec into a regression-repro tool.
10. **Privacy-safe shareable links** — hosted, read-only trace viewer (Sentry/replay-style) for the cloud-sync phase.
11. **Framework-agnostic core** — keep `recorder-core`/`trace-schema` Next-free so Remix/SvelteKit adapters are additive, not rewrites.
12. **Diff algorithm choice** — store structural diffs between snapshots (PRD step 6) using a stable keyed-tree diff; expose diff as both visual and JSON.

---

## 5. Open-source & repo hygiene (do early)

- License (MIT recommended for adoption), `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, issue/PR templates.
- Changesets for versioning; semantic-release optional.
- CI matrix per PRD: lint → typecheck → unit → integration → Playwright E2E → benchmark smoke → docs build → release artifacts.
- Golden-trace + visual-regression snapshots as required CI gates.
- A `good-first-issue` backlog seeded at launch (adapters, demos, payload viewers) to convert traction into contributors.
