# Flightrec — Architecture & Engineering Notes

> **Living document.** The as-built HLD/LLD, component map, data-flow walkthroughs, and the
> ideation → decision → implementation record for each phase and module. Append a new entry as
> each module lands; never rewrite history — annotate it. Pairs with:
> - [`ROADMAP.md`](./ROADMAP.md) — the forward plan + status.
> - [`INSPECTOR-IA.md`](./INSPECTOR-IA.md) — the inspector's 5-region wireframe.
> - [`LANDING_PAGE.md`](./LANDING_PAGE.md) — the marketing-surface blueprint.

---

## 1. What Flightrec is

A **time-travel debugger for the Next.js App Router**. It records a full server→client session as a
replay-able, schema-validated **trace** and lets you scrub it on one timeline — Server Actions, cache
invalidation, RSC payloads, cookies/headers, redirects, and the client React tree — so you see *what
changed and why*, not just disconnected logs.

Three subsystems, one contract:

```
  ┌────────────┐    emits     ┌────────────┐   .frec /    ┌────────────┐
  │  RECORDER  │ ───────────▶ │ TRANSPORT  │ ──store──▶   │ INSPECTOR  │
  │ (capture)  │  TraceEvents │  (.frec /  │   ?session=  │  (replay)  │
  └────────────┘              │   store)   │              └────────────┘
        │                     └────────────┘                    │
        └──────────────── @flightrec/trace-schema ──────────────┘
                         (the single source of truth)
```

The **schema is the contract**: the recorder only emits shapes the schema allows; the inspector only
renders shapes the schema guarantees; the `.frec` file is just a serialized, schema-validated `Session`.

---

## 2. High-Level Design (HLD)

### 2.1 Components

| Component | Package / location | Responsibility |
|---|---|---|
| **Trace schema** | `packages/trace-schema` | Zod schemas + inferred TS types: `TraceEvent`, `Phase`, `RscOp`, `RscFrame`, `CacheOutcome`, `Session`. The contract. |
| **Fixtures** | `packages/trace-fixtures` | The golden, deterministic 12-tick "blog-post" `Session` (the demo + test data). |
| **Recorder** | `packages/recorder` | `createRecorder` core · `AsyncLocalStorage` per-request context · typed recording vocabulary. Framework-agnostic core, server-driven. |
| **Next bindings** | `apps/web/lib/flightrec-next.ts`, `flightrec-render.ts` | Thin wrappers over real Next APIs (`updateTag`, `cookies`, `redirect`) + render-side capture (React `cache()` + `after()`). |
| **Transport** | `apps/web/lib/session-store.ts`, `app/api/sessions` | Dev in-memory store (keyed by session id) + ingest/list route handlers. |
| **Inspector** | `apps/web/components/inspector/*` | The 5-region, 5-mode scrubbable UI. Pure derivation from one `currentTick`. |
| **Playground** | `apps/web/app/playground/*` | Live capture demos (record-and-return, record-and-redirect, render-capture). |
| **Public surface** | `apps/web/app/{page,docs,vision,waitlist}` | Landing page, docs, pitch deck, waitlist. |

### 2.2 The pipeline (end to end)

```
  user action / render
        │
        ▼
  recorder.record({ phase, … })  ──┐  (inside an AsyncLocalStorage scope
        │                          │   or a React cache()'d per-render recorder)
        ▼                          │
  Session (events[], schema-valid) │
        │                          │
        ▼                          │
  saveSession(session)  ───────────┘   key = session.id  (idempotent)
        │
        ▼
  GET /inspector?session=<id>  →  getSession(id)  →  <Inspector session=… />
        │
        ▼
  currentTick state  →  derived: timeline · index · panes · context · tray
```

---

## 3. The core contract — `@flightrec/trace-schema`

The whole product hangs off these types. **Keywords:** *schema-first*, *discriminated union*,
*schema versioning*, *inferred types*.

- **`SCHEMA_VERSION = 1`** — every `Session` carries it (`schemaVersion`) so bundles stay migratable as
  the shape evolves. (Keyword: *forward/backward-compatible serialization*.)
- **`Phase`** — a `z.enum` of the 12 lifecycle phases: `user-input`, `client-navigation`,
  `server-action:start/end`, `rsc:chunk`, `cache:update-tag`, `cache:revalidate-tag`,
  `headers:mutate`, `cookies:mutate`, `redirect`, `tree:diff`, `error`.
- **`TraceEvent`** — `{ id, sessionId, ts, tick, phase, route?, actionId?, actionName?, payloadRef?,
  sourceRef?, meta? }`. `tick` is the **discrete step index** (the inspector's only state); `ts` is the
  relative millisecond timestamp; `meta` is `Record<string, unknown>` (the schema can't know each
  phase's payload — coerced at render/format boundaries, never `any`).
- **`RscOp`** — a **discriminated union** on `type`: `node-create | node-replace | prop-patch | suspend
  | resolve | remove`. The normalized React-tree operations (what payload mode renders — *not* raw Flight
  bytes).
- **`RscFrame`** — a streamed chunk: `{ sessionId, requestId, frameIndex, ts, routeSegment?, rawKind,
  normalizedOps: RscOp[] }`.
- **`CacheOutcome`** — `immediate-freshness | stale-then-refresh | no-visible-effect |
  orphaned-invalidation`. The semantic classification the context panel computes.
- **`Session`** — `{ id, schemaVersion, app?, route?, nextVersion?, startedAt, events: TraceEvent[] }`.
  A `.frec` file is exactly `JSON.stringify(Session)`, re-validated on import via `Session.safeParse`
  (**never trust a dropped file**).

### Plane mapping (the one translation layer)

The 12 phases collapse into **6 planes** (the timeline swim-lanes), defined once in
`inspector/lib/derive.ts:planeForPhase`:

| Plane | Phases |
|---|---|
| `user` | user-input, client-navigation |
| `action` | server-action:start/end, cookies:mutate, headers:mutate |
| `cache` | cache:update-tag, cache:revalidate-tag |
| `net` | redirect |
| `rsc` | rsc:chunk |
| `tree` | tree:diff |

This is the *only* place the trace shape is translated to the UI; everything else is derived.

---

## 4. Low-Level Design (LLD) by subsystem

### 4.1 Recorder core — `packages/recorder/src/index.ts`
`createRecorder(options)` returns `{ record, session }`.
- **Auto fields:** `id = ${sessionId}_${tick}`, `tick` auto-increments per event, `ts = now() - startedAt`.
- **Injectable clock** (`options.now`) → deterministic tests.
- **`session()`** runs `Session.parse(...)` so a recorder can never produce an invalid session — the
  validation boundary is the recorder's exit, not the consumer's entry.
- Session id is **crypto-random** (`node:crypto` `randomBytes`) — resolves CodeQL "insecure randomness"
  and gives a collision-safe **idempotency key** for the store.

### 4.2 Per-request context — `packages/recorder/src/context.ts`
- **`AsyncLocalStorage<Recorder>`** carries "the recorder for *this* request" across `await`s without
  threading it through every call. (Keyword: *request-scoped context*, *no globals*.)
- `runWithSession(options, fn)` → opens a scope, returns `{ result, session }`.
- `recordEvent(input)` → writes to the active scope's recorder; **safe no-op outside any scope** (so
  wrapped APIs never crash in non-recorded code).
- Verified invariant: **concurrent scopes stay isolated** (the property that makes it safe on a real
  multi-request server).

### 4.3 Recording vocabulary — `packages/recorder/src/helpers.ts`
Typed helpers, one per server-side phase (`recordServerActionStart/End`, `recordCacheUpdate`,
`recordCacheRevalidate`, `recordCookieMutation`, `recordHeaderMutation`, `recordRedirect`,
`recordUserInput`), each encoding the correct `meta` shape grounded in the real Next signatures
(`updateTag(tag)`, `revalidateTag(tag, profile)`, `redirect` → 303 in actions). Pure → fully unit-tested.

### 4.4 Next API bindings — `apps/web/lib/flightrec-next.ts`
The "wrapper" layer that records **and** delegates to the real framework:
- `recordedUpdateTag(tag)` → `recordCacheUpdate` + real `updateTag` (best-effort try/catch).
- `recordedSetCookie(name, value)` → `recordCookieMutation` + real `(await cookies()).set(...)`.
- `recordedRedirect(to)` → record + **flush the session to the store, then** real `redirect()`.
  **Keyword: *flush-before-throw*** — `redirect()` throws `NEXT_REDIRECT`; because the store write is
  synchronous it always wins the race before the throw, so the trace survives the redirect.

### 4.5 Render-side capture — `apps/web/lib/flightrec-render.ts`
The only public-API way to scope a recorder to a **page render** (you can't wrap React's render in your
own ALS):
- **`getRenderRecorder = cache(() => createRecorder(...))`** — React `cache()` is **per-request**, so
  every instrumented server component shares one recorder for the render.
- `recordRender(label, sourceRef?)` → an `rsc:chunk` event with a `node-create` op.
- **`flushAfterRender()`** captures the recorder *during* render and registers
  **`after(() => saveSession(recorder.session()))`** — flushes after the response without blocking it,
  and closes over the recorder object so it doesn't depend on `cache()` surviving into `after()`.

### 4.6 Transport — `apps/web/lib/session-store.ts` + `app/api/sessions`
- Dev **in-memory store**: a `Map<string, Session>` on `globalThis` (survives HMR; **dev-only**, lost on
  restart — production target: IndexedDB/OPFS).
- `saveSession` is keyed by `session.id` → re-saving the same session is **idempotent**.
- Route handlers: `POST /api/sessions` (schema-validated ingest for external recorders, 201),
  `GET /api/sessions` (list, newest first). The in-process playground writes the store directly; the
  inspector page reads it directly — no HTTP round-trip needed within one process.

### 4.7 Inspector — `apps/web/components/inspector/*`
**The architectural thesis: one piece of state, everything derived.**
- **State:** `currentTick` (+ `mode`, `activePlanes`, `dragging`). Nothing else.
- **Derivation** (`lib/derive.ts`, pure + unit-tested): `eventsUpTo(tick)`, `planeLanes`, `paneBuckets`,
  `eventsAtTick`, `previousOnPlane`, `filterEvents`, `activeCacheTags`, `cacheOutcome`, `mutations`,
  `parseSourceRef`, `rscFramesUpTo`, `frameOps`, `causalChain`, `narrate`. Each is a pure function of the
  session + tick.
- **5 regions:** ① timeline (the spine; playhead is a Framer-Motion value, decoupled from `tick` for
  dwell-and-glide playback) · ② event index + plane filters · ③ center (mode view) · ④ context panel ·
  ⑤ raw JSON tray.
- **5 modes:** `timeline` (synced plane panes) · `diff` (single-tick before→after) · `payload`
  (`frameOps` → RscOp list) · `causality` (`causalChain` cause→effect) · `presentation` (`narrate`).
- **`.frec` I/O** (`lib/frec.ts`): `parseFrec` (JSON → `Session.safeParse`, errors don't throw) +
  `serializeFrec`. Import via drag-drop or `?session=<id>` from the store.

---

## 5. Architectural flows

**A. Record-and-return** (`/playground` → "Record a session"):
`runWithSession` → helpers record the flow → `saveSession` → return `{ frec, events, id }` → panel shows
JSON + download + "Open in inspector".

**B. Record-and-redirect** (`/playground` → "Record & open in inspector"):
`runWithSession` → record flow → `recordedRedirect("/inspector?session=<id>")` → flush-before-throw →
real `redirect()` → browser lands in the inspector on the recorded session.

**C. Render capture** (`/playground/render`):
each server component calls `recordRender` into the `cache()`'d recorder → `flushAfterRender` registers
`after()` → page responds → `after()` flushes the session → user clicks the trace link → inspector loads it.

**D. Inspect** (`/inspector?session=<id>`):
server page `getSession(id) ?? blogPostSession()` → `<Inspector session=… />` → client sets `currentTick`
→ all regions derive.

---

## 6. Phase-by-phase record (ideation → build → reasoning)

### Phase 0 — Foundations
- **Ideation:** schema-first — if the trace shape is the contract, lock it before any UI/recorder.
- **Built:** pnpm + Turborepo monorepo; full tooling baseline (Biome, Husky + lint-staged, commitlint,
  Changesets, GitHub Actions CI, CodeQL, Dependabot, CodeRabbit); `trace-schema` (Zod); `trace-fixtures`
  (golden session); `INSPECTOR-IA.md` wireframe.
- **Reasoning:** the golden fixture lets the *entire* inspector be built and tested with zero recorder —
  decoupling the hardest subsystem (capture) from the most visible one (UI).

### Phase 2 — Inspector MVP (built second, against fixtures)
- **Ideation:** "complex state transitions shown as coordinated panes around a shared scrubber; the user
  never correlates timestamps by hand." → the single-`currentTick` model.
- **Built (per module):** M4 load+scrub → M5 event index+filters → M6 center timeline mode → M7 mode
  switcher + diff → M8 context panel (+ `cacheOutcome`) → M9 raw JSON tray → M10 `.frec` import/export →
  M11 payload mode (+ fixture `RscOp` enrichment) → M12 causality → M13 presentation.
- **Reasoning:** each mode is "another projection of the same tick" — proves the derived-state model
  scales without per-pane state to keep in sync.

### Phase 1 — Recorder (built last)
- **Ideation:** `instrumentation.ts` is boot-only (not a per-request interceptor) → capture needs
  `AsyncLocalStorage` context + a thin wrapper layer over Next APIs.
- **Built (per module):** M1 core → M2 ALS context → M3 vocabulary → M4 playground live capture → M6
  transport (store + `/api/sessions` + `?session=`) → M5 real `redirect()` (flush-before-throw) →
  render-side capture (`cache()` + `after()`).
- **Reasoning / spike finding:** raw binary **Flight frames are not publicly intercepted**; the
  inspector renders `normalizedOps`, so `cache()`-based component instrumentation feeds it real data
  without fragile internals — deferring raw-frame capture honestly.

---

## 7. Key engineering decisions & keywords

| Keyword | Where | Why |
|---|---|---|
| **Schema-first / single source of truth** | `trace-schema` | One Zod contract; recorder + inspector + `.frec` all derive from it. |
| **Schema versioning** | `SCHEMA_VERSION` on every `Session` | Migratable bundles across releases. |
| **Discriminated union** | `RscOp` | Exhaustive, type-safe op handling in `frameOps`/payload mode. |
| **Idempotency key** | `session.id` keying `saveSession` | Re-ingesting the same session is a safe no-op overwrite. |
| **Request-scoped context** | `AsyncLocalStorage` | "The recorder for this request" without globals; concurrent-safe. |
| **Per-render memoization** | React `cache()` | One recorder shared across a render tree (no ALS-around-render). |
| **Post-response side effect** | `after()` | Flush the trace without blocking/altering the response. |
| **Flush-before-throw** | `recordedRedirect` | Sync store write beats the `NEXT_REDIRECT` throw → trace survives. |
| **Derived state** | inspector `currentTick` | Zero per-pane state; every region is a pure function of one number. |
| **Validate-at-boundary** | `Session.parse` / `safeParse` | Recorder can't emit invalid; inspector can't load invalid. |
| **No-eval payload safety** | payload mode renders `normalizedOps` | Never executes Flight payloads (protocol has had CVEs). |
| **Best-effort delegation** | `recorded*` wrappers' try/catch | The trace records even if the real Next call no-ops in the demo. |

---

## 8. Metrics & invariants (as built)

- **Tests:** `trace-schema` 4 · `trace-fixtures` 5 · `recorder` 7 · `web` 31 — all green; CI runs
  `turbo test/typecheck` + Biome + CodeQL.
- **Inspector state surface:** exactly **1** core value (`currentTick`); everything else derived.
- **Schema phases:** 12 · **planes:** 6 · **inspector modes:** 5 · **regions:** 5.
- **Recorder overhead target (planned):** dev-only; single→low-double-digit % latency in `normal` mode,
  a `minimal` mode for large apps; benchmark vs OTel baseline (never invent numbers).
- **Verified invariants:** concurrent ALS scopes isolated; redirect trace survives the throw; render
  capture flushes 4 node-create ops; `?session=<id>` loads the recorded (not fixture) session.

---

## 9. Changelog (append per module)

- **2026-06** — Initial as-built capture through Phase 1 (recorder complete: core, context, vocabulary,
  live capture, transport, real redirect, render capture). Next: **B** persistent storage + `.frec`
  bundle · **D** error-path capture + source-mapping · **C** checkpoints / AI / MCP.
