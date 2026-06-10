import { Session as SessionSchema } from "@flightrec/trace-schema";
import type { Session } from "@flightrec/trace-schema";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Dev transport: an in-memory cache, backed best-effort by .frec files on disk so recorded
// sessions survive a dev-server restart. Disk is a DEV-ONLY convenience — production runs on a
// read-only filesystem (e.g. Vercel), so persistence is gated off and every fs call is guarded.
// In production this degrades to a pure in-memory store and never throws.
const DIR = join(process.cwd(), ".flightrec");
const fileFor = (id: string) => join(DIR, `${id}.frec`);
const PERSIST = process.env.NODE_ENV !== "production";

type Store = Map<string, Session>;
const globalStore = globalThis as unknown as { __frecSessions?: Store };
if (!globalStore.__frecSessions) {
  globalStore.__frecSessions = new Map();
}
const store: Store = globalStore.__frecSessions;

/** Make the trace dir; returns false if it can't (disabled in prod, or read-only fs). */
function ensureDir(): boolean {
  if (!PERSIST) return false;
  try {
    if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
    return true;
  } catch {
    return false; // read-only filesystem — fall back to memory-only
  }
}

/** Save a session (idempotent, keyed by session.id) to memory + best-effort disk. */
export function saveSession(session: Session): string {
  store.set(session.id, session);
  if (ensureDir()) {
    try {
      writeFileSync(fileFor(session.id), JSON.stringify(session));
    } catch {
      // best-effort: the in-memory copy is authoritative
    }
  }
  return session.id;
}

/** Load by id — memory first, then disk (schema-validated). Never throws. */
export function getSession(id: string): Session | undefined {
  const cached = store.get(id);
  if (cached) return cached;
  if (!PERSIST) return undefined;
  try {
    if (!existsSync(fileFor(id))) return undefined;
    const parsed = SessionSchema.safeParse(JSON.parse(readFileSync(fileFor(id), "utf8")));
    if (!parsed.success) return undefined;
    store.set(id, parsed.data);
    return parsed.data;
  } catch {
    return undefined; // unreadable/corrupt file — ignore
  }
}

/** Stored sessions (memory ∪ disk), newest first. Never throws. */
export function listSessions(): Session[] {
  const ids = new Set(store.keys());
  if (ensureDir()) {
    try {
      for (const f of readdirSync(DIR)) {
        if (f.endsWith(".frec")) ids.add(f.slice(0, -5));
      }
    } catch {
      // ignore — in-memory keys are still listed
    }
  }
  return ids
    .values()
    .toArray()
    .map(getSession)
    .filter((s): s is Session => s !== undefined)
    .sort((a, b) => b.startedAt - a.startedAt);
}
