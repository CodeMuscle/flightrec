# Flightrec Inspector — Information Architecture (wireframe)

> The last Phase-0 artifact: the layout the Phase-2 Inspector MVP builds against. The inspector
> loads a `.frec` bundle (a `Session` from [`@flightrec/trace-schema`](../packages/trace-schema),
> e.g. the golden one in [`@flightrec/trace-fixtures`](../packages/trace-fixtures)) and renders it
> as a scrubbable, multi-pane view. One principle drives everything:
>
> **Complex state transitions are shown as coordinated panes around a shared scrubber. The user
> never has to correlate timestamps by hand.** Move the playhead → every region updates to that tick.

---

## The 5 regions

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ① TOP BAR  session ses_8f31a0 · /posts/new · next 16.2.6                          │
│            [ timeline · diff · causality · payload · presentation ]   ⤓ .frec ⤒  │
├────────────────────────────────────────────────────────────────────────────────┤
│ ② SCRUB TIMELINE  (full width)                                                    │
│    user  ●──────○───────────────────────────────                                 │
│    act   ───────●──────────●─────────────────── ◇ playhead @ tick 06 (+3590ms)   │
│    cache ───────────●───────────────────────────                                 │
│    net   ──────────────●────────●───────────────   ◀◀  ▶  ▶▶   00:00:04:14        │
│    rsc   ───────────────────────────●───●──────                                  │
│    tree  ──────────────────────────────────●──●                                  │
├──────────────┬───────────────────────────────────────────────┬───────────────────┤
│ ③ LEFT       │ ④ CENTER  — view for the current tick           │ ⑤ RIGHT           │
│  EVENT INDEX │                                                 │  CONTEXT          │
│              │   (one of the 5 modes renders here)             │                   │
│  ▸ filters   │                                                 │  source map →     │
│    plane ▢▣  │   timeline   → synced plane panes               │   actions.ts:42   │
│    phase ▢▣  │   diff       → before/after tree                │  cache tags       │
│    route     │   causality  → event → caused-by graph          │  cookies/headers  │
│              │   payload    → parsed RSC/Flight frames          │  AI summary       │
│  ▸ events    │   present    → narrated, demo-friendly          │                   │
│    06 action │                                                 │                   │
│    07 redir… │                                                 │                   │
├──────────────┴───────────────────────────────────────────────┴───────────────────┤
│ ⑥ BOTTOM TRAY (toggle)  raw TraceEvent JSON · console correlation                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Region spec

### ① Top bar
- **Shows:** `Session.id`, `Session.route`, `Session.nextVersion`; the **mode switcher**; import/export `.frec`.
- **Data:** `Session` header fields.
- **Actions:** switch mode, drag-drop / pick a `.frec`, export current session.

### ② Scrub timeline (the spine)
- **Shows:** one **lane per plane** (user · action · cache · net · rsc · tree), a dot per event at its `tick`, and a **playhead**. Past events filled, future hollow.
- **Data:** `Session.events[]` grouped by a `phase → plane` mapping; positioned by `tick`, labelled by `ts`.
- **Actions:** click a tick · drag the playhead · `←/→` step · space play/pause. **This is the single source of "current tick" that every other region reads.**

### ③ Left — event index + filters
- **Shows:** linear, virtualized list of events (`tick · phase · short label`); filter chips by **plane**, **phase**, **route**.
- **Data:** `Session.events[]` (filtered).
- **Actions:** click an event → sets current tick + selects it; filters narrow both the list and the timeline.

### ④ Center — the selected view (mode-dependent)
Renders the state **at the current tick**:
- **timeline** — the synchronized plane panes (Server Action · Cache · RSC frames · Client tree), like the LP demo.
- **diff** — before/after tree (tick−1 vs tick) using `tree:diff` events.
- **causality** — `event → caused-by` graph (user-input → action → cache → redirect → rsc → tree).
- **payload** — parsed, sanitized RSC/Flight frames (`rsc:chunk` + normalized `RscOp[]`). Never `eval`.
- **presentation** — a narrated, large-type walkthrough for demos/bug reports.

### ⑤ Right — context for the selected event
- **Shows:** **source map** (`TraceEvent.sourceRef` / `actionId` → `file:symbol`), active **cache tags** + computed `CacheOutcome`, **cookies/headers** mutated, and the **AI summary** for this tick.
- **Data:** `sourceRef`, `actionId`, `meta` (tags/cookies/headers), `CacheOutcome`, plus MCP/AI enrichment (later phases).

### ⑥ Bottom tray (toggle)
- **Shows:** the raw `TraceEvent` JSON for the selected event + correlated console output. Power-user / debugging drawer; collapsed by default.

---

## Core interaction model

```
                ┌──────────────┐  setTick(t)   ┌────────────────────────────┐
  scrubber ────▶│ currentTick  │──────────────▶│ left · center · right · tray│
  left list ───▶│  (single)    │   (all read)  │  all derive from t          │
  ← → space ───▶└──────────────┘               └────────────────────────────┘
```
- **One** piece of shared state: `currentTick` (plus `mode`, `selectedEventId`, `filters`).
- Everything else is **derived** from `Session.events.slice(0, currentTick + 1)` — no per-pane state to keep in sync.
- **Checkpoints** (Phase 3) let the center jump to any tick without replaying from 0.

## Modes (top-bar switcher)
`timeline` (linear understanding) · `diff` (before/after) · `causality` (graph reasoning) · `payload` (protocol-level) · `presentation` (demos & bug reports).

## Data → UI mapping
| Schema | Region |
|---|---|
| `Session.{id,route,nextVersion}` | ① top bar |
| `Session.events[]` (by `tick`, grouped by plane) | ② timeline · ③ list |
| `TraceEvent.{phase,actionName,meta}` per tick | ④ center panes |
| `TraceEvent.{sourceRef,actionId}` | ⑤ source map |
| `meta.{tag,cookie,header}` + `CacheOutcome` | ⑤ context |
| `RscFrame.normalizedOps[]` | ④ payload mode |
| raw `TraceEvent` | ⑥ tray |

---

## Phase 2 build order (smallest first)
1. **Load** a `.frec` / `Session` (drag-drop + the golden fixture) and validate with the schema.
2. **② scrub timeline** + `currentTick` state (keyboard + drag + play).
3. **③ event index** (virtualized) wired to the same tick.
4. **④ timeline mode** — the synchronized panes (reuse the LP `SessionTimelineMock` shape).
5. **⑤ context panel** (source ref, cache tags, cookies/headers).
6. **diff** + **payload** modes, then **causality**, then **presentation**.
7. **⑥ raw JSON tray**, then `.frec` **export** round-trip.

> Visual language: documentation-grade, the same Soft Lab system as the landing page. Virtualize
> long lists; lazy-load heavy payloads; render the timeline on canvas if events get large.
