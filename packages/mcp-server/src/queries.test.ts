import { blogPostSession, staleDashboardSession } from "@flightrec/trace-fixtures";
import { describe, expect, it } from "vitest";
import { diagnoseCache, summary, timeline } from "./queries";

describe("timeline", () => {
  it("narrates every tick, zero-padded and in order", () => {
    const lines = timeline(blogPostSession()).split("\n");
    expect(lines).toHaveLength(blogPostSession().events.length);
    expect(lines[0]).toMatch(/^00: /);
    expect(lines[3]).toContain("createPost");
  });
});

describe("diagnoseCache", () => {
  it("marks a write followed by a render as immediate-freshness, naming the action", () => {
    const diag = diagnoseCache(blogPostSession());
    expect(diag).toHaveLength(1);
    expect(diag[0]).toMatchObject({
      tag: "posts",
      action: "createPost",
      outcome: "immediate-freshness",
    });
  });

  it("flags a revalidate with no downstream render as orphaned-invalidation", () => {
    const diag = diagnoseCache(staleDashboardSession());
    expect(diag).toHaveLength(1);
    expect(diag[0]).toMatchObject({
      tag: "metrics",
      action: "refreshMetrics",
      outcome: "orphaned-invalidation",
    });
  });
});

describe("summary", () => {
  it("projects compact session metadata", () => {
    expect(summary(blogPostSession())).toMatchObject({
      id: "ses_8f31a0",
      route: "/posts/new",
      events: 12,
    });
  });
});
