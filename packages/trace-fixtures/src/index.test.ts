import { describe, expect, it } from "vitest";
import { Session } from "@flightrec/trace-schema";
import { blogPostSession } from "./index";

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
});
