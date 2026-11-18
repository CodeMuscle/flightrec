import { blogPostSession } from "@flightrec/trace-fixtures";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { listSessions, loadSession, sessionIds } from "./store";

let dir: string;
const session = blogPostSession();

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "frec-"));
  writeFileSync(join(dir, `${session.id}.frec`), JSON.stringify(session));
  writeFileSync(join(dir, "broken.frec"), "{not json");
  writeFileSync(join(dir, "ignore.txt"), "x"); // non-.frec is skipped
});

describe("store", () => {
  it("lists .frec ids only", () => {
    expect(sessionIds(dir).sort()).toEqual(["broken", session.id]);
  });

  it("loads + validates a session, undefined for missing/corrupt", () => {
    expect(loadSession(dir, session.id)?.id).toBe(session.id);
    expect(loadSession(dir, "broken")).toBeUndefined();
    expect(loadSession(dir, "nope")).toBeUndefined();
  });

  it("listSessions drops invalid files and never throws on a bad dir", () => {
    expect(listSessions(dir).map((s) => s.id)).toEqual([session.id]);
    expect(listSessions(join(dir, "does-not-exist"))).toEqual([]);
  });

  // Ids arrive from MCP tool arguments. `join` normalizes "../" instead of rejecting it, so without
  // the guard a caller could read any .frec on disk outside the configured directory.
  it("rejects ids that escape the directory", () => {
    const outside = mkdtempSync(join(tmpdir(), "frec-outside-"));
    writeFileSync(join(outside, "secret.frec"), JSON.stringify(session));
    const escapingId = join("..", basename(outside), "secret");

    expect(loadSession(dir, escapingId)).toBeUndefined();
    expect(loadSession(dir, "../../etc/passwd")).toBeUndefined();
    expect(loadSession(dir, "sub/nested")).toBeUndefined();
    expect(loadSession(dir, "..")).toBeUndefined();
    expect(loadSession(dir, "")).toBeUndefined();
    // the same file read by its bare id still works, so the guard is not over-broad
    expect(loadSession(outside, "secret")?.id).toBe(session.id);
  });
});
