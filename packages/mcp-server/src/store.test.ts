import { blogPostSession } from "@flightrec/trace-fixtures";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
});
