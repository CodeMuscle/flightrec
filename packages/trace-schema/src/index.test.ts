import { describe, expect, it } from "vitest";
import { RscOp, Session, SCHEMA_VERSION, TraceEvent } from "./index";

describe("TraceEvent", () => {
  it("accepts a valid event", () => {
    const e = { id: "e1", sessionId: "s1", ts: 0, tick: 0, phase: "server-action:start" };
    expect(TraceEvent.parse(e).phase).toBe("server-action:start");
  });
  it("rejects an unknown phase", () => {
    expect(() =>
      TraceEvent.parse({ id: "e", sessionId: "s", ts: 0, tick: 0, phase: "nope" }),
    ).toThrow();
  });
});

describe("RscOp", () => {
  it("discriminates on type", () => {
    expect(RscOp.parse({ type: "node-create", nodeId: "n1", label: "<Post>" }).type).toBe(
      "node-create",
    );
  });
});

describe("Session", () => {
  it("pins the schema version", () => {
    const s = Session.parse({ id: "s1", schemaVersion: SCHEMA_VERSION, startedAt: 0, events: [] });
    expect(s.schemaVersion).toBe(1);
  });
});
