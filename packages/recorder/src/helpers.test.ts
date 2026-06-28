import { describe, expect, it } from "vitest";
import {
  recordCacheRevalidate,
  recordCacheUpdate,
  recordError,
  recordRedirect,
  recordServerActionEnd,
  recordServerActionStart,
  runWithSession,
} from "./index";

describe("recording helpers", () => {
  it("emit the right phases + meta within a scope", async () => {
    const { session } = await runWithSession({ sessionId: "s" }, () => {
      recordServerActionStart("createPost", "actions.ts:createPost");
      recordCacheUpdate("posts");
      recordCacheRevalidate("posts", "max");
      recordRedirect("/posts/42", 303);
      recordServerActionEnd("createPost", { ms: 330, ok: true });
    });

    expect(session.events.map((e) => e.phase)).toEqual([
      "server-action:start",
      "cache:update-tag",
      "cache:revalidate-tag",
      "redirect",
      "server-action:end",
    ]);
    expect(session.events[0].actionName).toBe("createPost");
    expect(session.events[1].meta).toEqual({ tag: "posts" });
    expect(session.events[2].meta).toEqual({ tag: "posts", profile: "max" });
    expect(session.events[3].meta).toMatchObject({ to: "/posts/42", status: 303 });
    expect(session.events[4].meta).toEqual({ ms: 330, ok: true });
  });

  it("helpers are no-ops outside a recording scope", () => {
    expect(recordCacheUpdate("x")).toBeUndefined();
  });

  it("keeps an explicit sourceRef (capture is only the fallback)", async () => {
    const { session } = await runWithSession({ sessionId: "src" }, () => {
      recordServerActionStart("createPost", "app/posts/actions.ts:createPost");
    });
    // Auto-capture from inside the recorder package is filtered out by design, so the explicit
    // arg must win untouched. End-to-end capture is verified via /playground (see plan).
    expect(session.events[0].sourceRef).toBe("app/posts/actions.ts:createPost");
    expect(session.events[0].meta).toBeUndefined();
  });
});

// Transport Module D
it("records a caught error as an error event", async () => {
  const { session } = await runWithSession({ sessionId: "e" }, () => {
    recordError(new Error("boom"), "lib/db.ts:query");
  });
  const ev = session.events[0];
  expect(ev.phase).toBe("error");
  expect(ev.sourceRef).toBe("lib/db.ts:query");
  expect(ev.meta).toEqual({ name: "Error", message: "boom" });
});
