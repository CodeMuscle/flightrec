import { Session as SessionSchema } from "@flightrec/trace-schema";
import type { Session } from "@flightrec/trace-schema";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Dev transport: an in-memory cache backed by .frec files on disk, so recorded sessions
// survive a dev-server restart (the in-memory Map alone did not). Server-side, dev-only;
// production target is IndexedDB/OPFS in the inspector-PWA.
const DIR = join(process.cwd(), ".flightrec");
const fileFor = (id: string) => join(DIR, `${id}.frec`);

type Store = Map<string, Session>;
const globalStore = globalThis as unknown as { __frecSessions?: Store };
if (!globalStore.__frecSessions) {
  globalStore.__frecSessions = new Map();
}
const store: Store = globalStore.__frecSessions;

function ensureDir() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
}

/** Save a session (idempotent: keyed + filed by session.id) to memory + disk. */
export function saveSession(session: Session): string {
  store.set(session.id, session);
  ensureDir();
  writeFileSync(fileFor(session.id), JSON.stringify(session));
  return session.id;
}

/** Load by id — memory first, then disk (schema-validated; tolerates a restart). */
export function getSession(id: string): Session | undefined {
  const cached = store.get(id);
  if (cached) return cached;
  if (!existsSync(fileFor(id))) return undefined;
  const parsed = SessionSchema.safeParse(JSON.parse(readFileSync(fileFor(id), "utf8")));
  if (!parsed.success) return undefined;
  store.set(id, parsed.data);
  return parsed.data;
}

/** Stored sessions (memory ∪ disk), newest first. */
export function listSessions(): Session[] {
  ensureDir();
  const ids = new Set(store.keys());
  for (const f of readdirSync(DIR)) {
    if (f.endsWith(".frec")) ids.add(f.slice(0, -5));
  }
  return ids
    .values()
    .toArray()
    .map(getSession)
    .filter((s): s is Session => s !== undefined)
    .sort((a, b) => b.startedAt - a.startedAt);
}
