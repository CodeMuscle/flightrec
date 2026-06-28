import { narrate } from "@flightrec/trace-analyze";
import type { Session } from "@flightrec/trace-schema";

/** The narrated, tick-numbered timeline an agent reads to understand a session. */
export function timeline(session: Session): string {
  return session.events.map((e) => `${String(e.tick).padStart(2, "0")}: ${narrate(e)}`).join("\n");
}

export type CacheDiag = {
  tick: number;
  kind: "cache:update-tag" | "cache:revalidate-tag";
  tag: string | null;
  /** The Server Action that issued the write, when the trace attributes one. */
  action: string | null;
  /** A render (rsc/tree) landed after the write → fresh; otherwise the invalidation is orphaned. */
  outcome: "immediate-freshness" | "orphaned-invalidation";
};

/**
 * Per-write cache diagnosis — the flagship "which Server Action caused this stale state?" answer.
 * A write with no downstream render is `orphaned-invalidation`; name `action` points at the culprit.
 */
export function diagnoseCache(session: Session): CacheDiag[] {
  const writes = session.events.filter(
    (e) => e.phase === "cache:update-tag" || e.phase === "cache:revalidate-tag",
  );
  return writes.map((w) => {
    const renderedAfter = session.events.some(
      (e) => e.tick > w.tick && (e.phase === "rsc:chunk" || e.phase === "tree:diff"),
    );
    return {
      tick: w.tick,
      kind: w.phase as CacheDiag["kind"],
      tag: typeof w.meta?.tag === "string" ? w.meta.tag : null,
      action: w.actionName ?? null,
      outcome: renderedAfter ? "immediate-freshness" : "orphaned-invalidation",
    };
  });
}

/** Compact metadata for a session list. */
export function summary(session: Session) {
  return {
    id: session.id,
    app: session.app ?? null,
    route: session.route ?? null,
    events: session.events.length,
    startedAt: session.startedAt,
  };
}
