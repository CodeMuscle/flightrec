import { Session } from "@flightrec/trace-schema";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Standalone (Next-free) reader for a directory of `.frec` files — the dev recorder writes these to
 * `<app>/.flightrec`. Every call is guarded; a missing/corrupt dir or file degrades to empty, never
 * throws (the MCP server must stay up).
 */

/** The `.frec` filenames in `dir` (basename, no extension), or [] if the dir is unreadable. */
export function sessionIds(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".frec"))
      .map((f) => f.slice(0, -5));
  } catch {
    return [];
  }
}

/**
 * A session id must name a file directly inside `dir`. Ids reach us from MCP tool arguments, and
 * `join` normalizes "../" rather than rejecting it, so "../../etc/passwd" would otherwise escape the
 * configured directory. Schema validation runs after the read, far too late to help.
 */
function isSafeId(id: string): boolean {
  if (id === "" || id === "." || id === "..") return false;
  if (id.includes("/") || id.includes("\\") || id.includes("\0")) return false;
  return true;
}

/** Load + schema-validate one session by id; undefined if missing, unsafe or invalid. */
export function loadSession(dir: string, id: string): Session | undefined {
  if (!isSafeId(id)) return undefined;
  try {
    const parsed = Session.safeParse(JSON.parse(readFileSync(join(dir, `${id}.frec`), "utf8")));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/** All valid sessions in `dir`, newest first. */
export function listSessions(dir: string): Session[] {
  return sessionIds(dir)
    .map((id) => loadSession(dir, id))
    .filter((s): s is Session => s !== undefined)
    .sort((a, b) => b.startedAt - a.startedAt);
}
