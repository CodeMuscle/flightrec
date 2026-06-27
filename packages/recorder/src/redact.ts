import type { Session, TraceEvent } from "@flightrec/trace-schema";

const SENSITIVE_HEADERS = new Set(["authorization", "cookie", "set-cookie", "x-api-key"]);
const REDACTED = "[redacted]";

/**
 * Mask secret values before a session is shared as a .frec: cookie values and the values of
 * sensitive headers (authorization, cookie, etc.). Keys are kept so the trace stays readable.
 * Redact-by-default — call this at export/share time, not at record time (you want the real
 * values when debugging your own app locally).
 */
export function redactSession(session: Session): Session {
  return { ...session, events: session.events.map(redactEvent) };
}

function redactEvent(e: TraceEvent): TraceEvent {
  if (!e.meta) return e;
  if (e.phase === "cookies:mutate" && "value" in e.meta) {
    return { ...e, meta: { ...e.meta, value: REDACTED } };
  }
  if (e.phase === "headers:mutate" && "value" in e.meta) {
    const key = typeof e.meta.key === "string" ? e.meta.key.toLowerCase() : "";
    if (SENSITIVE_HEADERS.has(key)) return { ...e, meta: { ...e.meta, value: REDACTED } };
  }
  return e;
}
