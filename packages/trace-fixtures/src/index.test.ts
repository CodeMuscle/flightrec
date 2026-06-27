import { describe, expect, it } from "vitest";
import { RscOp, Session } from "@flightrec/trace-schema";
import { authCookieSession, blogPostSession, staleDashboardSession } from "./index";

describe("blogPostSession", () => {
  const s = blogPostSession();
  it("is a valid Session", () => expect(() => Session.parse(s)).not.toThrow());
  it("has 12 ticks in order", () => {
    expect(s.events).toHaveLength(12);
    expect(s.events.map((e) => e.tick)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it("runs the createPost server action", () =>
    expect(
      s.events.some((e) => e.phase === "server-action:start" && e.actionName === "createPost"),
    ).toBe(true));
  it("invalidates the posts cache tag", () =>
    expect(s.events.find((e) => e.phase === "cache:update-tag")?.meta?.tag).toBe("posts"));
  it("streams schema-valid RSC ops", () => {
    const frames = s.events.filter((e) => e.phase === "rsc:chunk");
    expect(frames.length).toBeGreaterThan(0);
    for (const f of frames) {
      const ops = (f.meta?.ops ?? []) as unknown[];
      expect(ops.length).toBeGreaterThan(0);
      for (const op of ops) expect(RscOp.safeParse(op).success).toBe(true);
    }
  });
});

describe("extra demo flows", () => {
  it("stale dashboard: valid + revalidate with no downstream render", () => {
    const s = staleDashboardSession();
    expect(() => Session.parse(s)).not.toThrow();
    expect(s.events.some((e) => e.phase === "cache:revalidate-tag")).toBe(true);
    expect(s.events.some((e) => e.phase === "rsc:chunk" || e.phase === "tree:diff")).toBe(false);
  });
  it("auth cookie: valid + sets session cookie and redirects", () => {
    const s = authCookieSession();
    expect(() => Session.parse(s)).not.toThrow();
    expect(s.events.find((e) => e.phase === "cookies:mutate")?.meta?.key).toBe("session_token");
    expect(s.events.some((e) => e.phase === "redirect")).toBe(true);
  });
});
