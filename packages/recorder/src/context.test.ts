import { describe, expect, it } from "vitest";
import { currentRecorder, recordEvent, runWithSession } from "./index";

describe("recording context", () => {
  it("records events into the active scope across awaits", async () => {
    const { result, session } = await runWithSession({ sessionId: "s", route: "/x" }, async () => {
      recordEvent({ phase: "user-input", route: "/x" });
      await Promise.resolve();
      recordEvent({ phase: "server-action:start", actionName: "go" });
      return "done";
    });
    expect(result).toBe("done");
    expect(session.events).toHaveLength(2);
    expect(session.events[1].actionName).toBe("go");
  });

  it("recordEvent outside a scope is a no-op", () => {
    expect(currentRecorder()).toBeUndefined();
    expect(recordEvent({ phase: "user-input" })).toBeUndefined();
  });

  it("keeps concurrent scopes isolated", async () => {
    const [a, b] = await Promise.all([
      runWithSession({ sessionId: "a" }, async () => {
        recordEvent({ phase: "user-input" });
        await Promise.resolve();
        recordEvent({ phase: "user-input" });
      }),
      runWithSession({ sessionId: "b" }, async () => {
        recordEvent({ phase: "redirect" });
      }),
    ]);
    expect(a.session.events).toHaveLength(2);
    expect(b.session.events).toHaveLength(1);
    expect(b.session.events[0].phase).toBe("redirect");
  });
});
