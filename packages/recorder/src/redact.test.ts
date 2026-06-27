import { describe, expect, it } from "vitest";
import { recordCookieMutation, recordHeaderMutation, redactSession, runWithSession } from "./index";

describe("redactSession", () => {
  it("masks cookie + sensitive-header values, keeps keys", async () => {
    const { session } = await runWithSession({ sessionId: "r" }, () => {
      recordCookieMutation("session_token", "abc123secret");
      recordHeaderMutation("authorization"); // no value recorded by default
    });
    const r = redactSession(session);
    const cookie = r.events.find((e) => e.phase === "cookies:mutate");
    expect(cookie?.meta).toEqual({ key: "session_token", value: "[redacted]" });
    // original is untouched (redact returns a copy)
    expect(session.events.find((e) => e.phase === "cookies:mutate")?.meta?.value).toBe(
      "abc123secret",
    );
  });
});
