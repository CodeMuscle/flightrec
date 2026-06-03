import { Session, type Session as SessionT, type TraceEvent } from "@flightrec/trace-schema";

/** What a caller supplies per event — the auto fields (id/sessionId/tick) are filled in. */
export type RecordInput = Omit<TraceEvent, "id" | "sessionId" | "tick" | "ts"> & { ts?: number };

export type RecorderOptions = {
  sessionId?: string;
  app?: string;
  route?: string;
  nextVersion?: string;
  /** Injectable clock (ms) — defaults to Date.now; pass one for deterministic tests. */
  now?: () => number;
};

export type Recorder = {
  record(input: RecordInput): TraceEvent;
  session(): SessionT;
};

/**
 * The pure recording core: call `record(...)` as things happen, then `session()`
 * for a schema-validated Session. No Next.js coupling — the instrumentation layer
 * (later modules) drives this. Ticks auto-increment; timestamps are relative to start.
 */
export function createRecorder(options: RecorderOptions = {}): Recorder {
  const now = options.now ?? Date.now;
  const sessionId = options.sessionId ?? `ses_${Math.random().toString(16).slice(2, 8)}`;
  const startedAt = now();
  const events: TraceEvent[] = [];
  let tick = 0;

  return {
    record({ ts, ...fields }) {
      const event: TraceEvent = {
        id: `${sessionId}_${tick}`,
        sessionId,
        tick,
        ts: ts ?? now() - startedAt,
        ...fields,
      };
      events.push(event);
      tick += 1;
      return event;
    },
    session() {
      return Session.parse({
        id: sessionId,
        schemaVersion: 1,
        app: options.app,
        route: options.route,
        nextVersion: options.nextVersion,
        startedAt,
        events,
      });
    },
  };
}
