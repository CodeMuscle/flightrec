import { Session } from "@flightrec/trace-schema";
import { describe, expect, it } from "vitest";
import { createRecorder } from "./index";

function clock(...values: number[]) {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

describe("createRecorder", () => {
  it("builds a schema-valid session with incrementing ticks", () => {
    const r = createRecorder({ sessionId: "ses_test", route: "/x" });
    r.record({ phase: "user-input", route: "/x" });
    r.record({ phase: "server-action:start", actionName: "doThing" });
    const s = r.session();
    expect(() => Session.parse(s)).not.toThrow();
    expect(s.events).toHaveLength(2);
    expect(s.events.map((e) => e.tick)).toEqual([0, 1]);
    expect(s.events[1].actionName).toBe("doThing");
  });

  it("stamps timestamps relative to start via an injectable clock", () => {
    const r = createRecorder({ sessionId: "s", now: clock(1000, 1200, 1500) });
    r.record({ phase: "user-input" });
    r.record({ phase: "user-input" });
    expect(r.session().events.map((e) => e.ts)).toEqual([200, 500]);
  });
});
