import type { CacheOutcome, Phase, Session, TraceEvent } from "@flightrec/trace-schema";
import { RscOp } from "@flightrec/trace-schema";

/**
 * The timeline shows one lane per "plane" — a coarse grouping of the schema's 12
 * phases into the 6 swim-lanes from docs/INSPECTOR-IA.md §②. This mapping is the
 * only translation between the trace shape and the UI; everything else is derived.
 */
export const PLANES = ["user", "action", "cache", "net", "rsc", "tree"] as const;
export type Plane = (typeof PLANES)[number];

const PHASE_PLANE: Record<Phase, Plane> = {
  "user-input": "user",
  "client-navigation": "user",
  "server-action:start": "action",
  "server-action:end": "action",
  "cookies:mutate": "action",
  "headers:mutate": "action",
  "cache:update-tag": "cache",
  "cache:revalidate-tag": "cache",
  redirect: "net",
  "rsc:chunk": "rsc",
  "tree:diff": "tree",
  // an error renders as a marker on the plane it interrupted; default to action.
  error: "action",
};

/** Which swim-lane an event belongs to. Pure + total over the Phase enum. */
export function planeForPhase(phase: Phase): Plane {
  return PHASE_PLANE[phase];
}

/** The CSS custom property holding a plane's accent color (see globals.css). */
export function planeColor(plane: Plane): string {
  return `var(--plane-${plane})`;
}

/**
 * Inclusive lower/upper bounds for the playhead. Empty sessions clamp to 0 so the
 * scrubber has a valid (if inert) position.
 */
export function tickBounds(session: Session): { min: number; max: number } {
  if (session.events.length === 0) return { min: 0, max: 0 };
  const ticks = session.events.map((e) => e.tick);
  return { min: Math.min(...ticks), max: Math.max(...ticks) };
}

/** Clamp an arbitrary number into a session's valid tick range. */
export function clampTick(session: Session, tick: number): number {
  const { min, max } = tickBounds(session);
  return Math.max(min, Math.min(max, Math.round(tick)));
}

/**
 * The core projection: everything the UI shows at time `t` is a function of the
 * events at or before `t`. Later events are "future" (hollow on the timeline).
 */
export function eventsUpTo(session: Session, tick: number): TraceEvent[] {
  return session.events.filter((e) => e.tick <= tick);
}

/** The single event sitting exactly on the playhead, if any. */
export function eventAtTick(session: Session, tick: number): TraceEvent | undefined {
  return session.events.find((e) => e.tick === tick);
}

export type LaneDot = { event: TraceEvent; plane: Plane; isPast: boolean };
export type Lane = { plane: Plane; dots: LaneDot[] };

/**
 * Group every event into its lane, tagging each dot as past/future relative to
 * `tick`. Returns all 6 planes in fixed order so lanes never reflow as you scrub.
 */
export function planeLanes(session: Session, tick: number): Lane[] {
  return PLANES.map((plane) => ({
    plane,
    dots: session.events
      .filter((e) => planeForPhase(e.phase) === plane)
      .map((event) => ({ event, plane, isPast: event.tick <= tick })),
  }));
}

/** A short, human label for an event — used by the timeline tooltip + index. */
export function eventLabel(event: TraceEvent): string {
  if (event.actionName) return event.actionName;
  return event.phase;
}

/**
 * Filtering is a lens, not state: given the planes currently toggled on, return
 * the events on those planes. Time (currentTick) is unaffected — you can filter
 * while parked on any tick. An empty set means "nothing on" → no events.
 */
export function filterEvents(session: Session, active: ReadonlySet<Plane>): TraceEvent[] {
  return session.events.filter((e) => active.has(planeForPhase(e.phase)));
}

/** Past events bucketed by plane — the center panes read from this. Cumulative: grows with the tick. */
export function paneBuckets(session: Session, tick: number): Record<Plane, TraceEvent[]> {
  const buckets = Object.fromEntries(PLANES.map((p) => [p, [] as TraceEvent[]])) as Record<
    Plane,
    TraceEvent[]
  >;
  for (const e of session.events) {
    if (e.tick <= tick) buckets[planeForPhase(e.phase)].push(e);
  }
  return buckets;
}

/** A human one-liner describing what an event did — the secondary line in a pane row. */
export function eventDetail(event: TraceEvent): string {
  // meta is Record<string, unknown> (the schema can't know each phase's shape),
  // so coerce values to strings at the boundary rather than reaching for `any`.
  const meta = event.meta ?? {};
  const m = (key: string): string => String(meta[key] ?? "?");
  switch (event.phase) {
    case "server-action:start":
      return `${event.actionName ?? "action"}() started`;
    case "server-action:end":
      return `${event.actionName ?? "action"}() · ${m("ms")}ms ${meta.ok ? "✓" : "✗"}`;
    case "cache:update-tag":
      return `updateTag('${m("tag")}')`;
    case "cache:revalidate-tag":
      return `revalidateTag('${m("tag")}')`;
    case "cookies:mutate":
      return `cookie ${m("key")} = ${m("value")}`;
    case "headers:mutate":
      return `header ${m("key")} set`;
    case "redirect":
      return `→ ${meta.to ? m("to") : (event.route ?? "?")} (${m("status")})`;
    case "rsc:chunk":
      return `frame #${m("frameIndex")} · ${m("segment")}`;
    case "tree:diff":
      return event.sourceRef ?? "tree patched";
    default:
      return event.route ?? event.phase;
  }
}

/** Events landing exactly on a given tick (usually one; the schema allows several). */
export function eventsAtTick(session: Session, tick: number): TraceEvent[] {
  return session.events.filter((e) => e.tick === tick);
}

/** The most recent event on a plane strictly before `tick` — the "before" in a diff. */
export function previousOnPlane(
  session: Session,
  plane: Plane,
  tick: number,
): TraceEvent | undefined {
  let prev: TraceEvent | undefined;
  for (const e of session.events) {
    if (e.tick < tick && planeForPhase(e.phase) === plane) prev = e;
  }
  return prev;
}

/** Split a "file:symbol" source ref into its parts (symbol may be empty). */
export function parseSourceRef(ref: string | undefined): { file: string; symbol: string } | null {
  if (!ref) return null;
  const i = ref.lastIndexOf(":");
  return i === -1 ? { file: ref, symbol: "" } : { file: ref.slice(0, i), symbol: ref.slice(i + 1) };
}

/** Unique cache tags touched by cache events at or before the tick, in order. */
export function activeCacheTags(session: Session, tick: number): string[] {
  const tags: string[] = [];
  for (const e of session.events) {
    if (e.tick > tick) continue;
    if (e.phase === "cache:update-tag" || e.phase === "cache:revalidate-tag") {
      const tag = e.meta?.tag;
      if (typeof tag === "string" && !tags.includes(tag)) tags.push(tag);
    }
  }
  return tags;
}

/**
 * Heuristic cache outcome at a tick: a cache write followed by a render
 * (rsc/tree) is "immediate-freshness"; a write with nothing downstream yet is
 * "orphaned-invalidation"; no writes → null.
 */
export function cacheOutcome(session: Session, tick: number): CacheOutcome | null {
  const upTo = session.events.filter((e) => e.tick <= tick);
  const writes = upTo.filter(
    (e) => e.phase === "cache:update-tag" || e.phase === "cache:revalidate-tag",
  );
  if (writes.length === 0) return null;
  const lastWriteTick = Math.max(...writes.map((e) => e.tick));
  const rendered = upTo.some(
    (e) => e.tick > lastWriteTick && (e.phase === "rsc:chunk" || e.phase === "tree:diff"),
  );
  return rendered ? "immediate-freshness" : "orphaned-invalidation";
}

/** Cookie/header mutations at or before the tick. */
export function mutations(
  session: Session,
  tick: number,
): { kind: "cookie" | "header"; key: string; value: string }[] {
  const out: { kind: "cookie" | "header"; key: string; value: string }[] = [];
  for (const e of session.events) {
    if (e.tick > tick) continue;
    if (e.phase === "cookies:mutate" || e.phase === "headers:mutate") {
      out.push({
        kind: e.phase === "cookies:mutate" ? "cookie" : "header",
        key: String(e.meta?.key ?? "?"),
        value: String(e.meta?.value ?? ""),
      });
    }
  }
  return out;
}

/** The rsc:chunk frames streamed at or before the tick. */
export function rscFramesUpTo(session: Session, tick: number): TraceEvent[] {
  return session.events.filter((e) => e.phase === "rsc:chunk" && e.tick <= tick);
}

/** Parse + schema-validate a frame's normalized ops; bad ops are dropped, never thrown. */
export function frameOps(event: TraceEvent): RscOp[] {
  const raw = event.meta?.ops;
  if (!Array.isArray(raw)) return [];
  const ops: RscOp[] = [];
  for (const o of raw) {
    const parsed = RscOp.safeParse(o);
    if (parsed.success) ops.push(parsed.data);
  }
  return ops;
}
