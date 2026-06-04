import type { Session } from "@flightrec/trace-schema";

// Dev-only in-memory transport: recorded sessions live here so the playground and
// the inspector (same Next process) can share them without a round-trip to disk.
// Attached to globalThis so it survives dev-server HMR module reloads.
// NOTE: lost on restart and single-process — production wants OPFS/IndexedDB or a DB.
type Store = Map<string, Session>;
const globalStore = globalThis as unknown as { __frecSessions?: Store };
if (!globalStore.__frecSessions) {
  globalStore.__frecSessions = new Map();
}
const store: Store = globalStore.__frecSessions;

/** Save a session (keyed by its id) and return the id. */
export function saveSession(session: Session): string {
  store.set(session.id, session);
  return session.id;
}

/** Load a stored session by id, or undefined if it isn't there (e.g. after a restart). */
export function getSession(id: string): Session | undefined {
  return store.get(id);
}

/** Stored sessions, newest first. */
export function listSessions(): Session[] {
  return [...store.values()].sort((a, b) => b.startedAt - a.startedAt);
}
