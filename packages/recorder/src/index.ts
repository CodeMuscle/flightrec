import { Session, type Session as SessionT, type TraceEvent } from "@flightrec/trace-schema";
import { randomBytes } from "node:crypto";

/** What a caller supplies per event — the auto fields (id/sessionId/tick) are filled in. */
export type RecordInput = Omit<TraceEvent, "id" | "sessionId" | "tick" | "ts"> & { ts?: number };

/** Session metadata and an injectable clock for a recorder. */
export type RecorderOptions = {
  /** Stable session id; a crypto-random one is generated when omitted. */
  sessionId?: string;
  /** App name recorded on the session. */
  app?: string;
  /** Route the session started on. */
  route?: string;
  /** Next.js version recorded on the session. */
  nextVersion?: string;
  /** Injectable clock (ms) — defaults to Date.now; pass one for deterministic tests. */
  now?: () => number;
};

/** A live recorder: append events with `record`, then read the built `session`. */
export type Recorder = {
  /** Append one event; auto-fills id/sessionId/tick and a relative timestamp. */
  record(input: RecordInput): TraceEvent;
  /** Build + schema-validate the Session captured so far. */
  session(): SessionT;
};

/**
 * The pure recording core: call `record(...)` as things happen, then `session()`
 * for a schema-validated Session. No Next.js coupling — the instrumentation layer
 * (later modules) drives this. Ticks auto-increment; timestamps are relative to start.
 */
export function createRecorder(options: RecorderOptions = {}): Recorder {
  const now = options.now ?? Date.now;
  const sessionId = options.sessionId ?? `ses_${randomBytes(3).toString("hex")}`;
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

export * from "./context";
export * from "./helpers";
