import type { Phase, Session, TraceEvent } from "@flightrec/trace-schema";

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
