import { Session, type Session as SessionT, type TraceEvent } from "@flightrec/trace-schema";

const SID = "ses_8f31a0";

function ev(
  tick: number,
  ts: number,
  phase: TraceEvent["phase"],
  extra: Partial<TraceEvent> = {},
): TraceEvent {
  return { id: `${SID}_${tick}`, sessionId: SID, ts, tick, phase, ...extra };
}

/** The "blog post creator" demo flow — deterministic + schema-validated. */
export function blogPostSession(): SessionT {
  const events: TraceEvent[] = [
    ev(0, 0, "user-input", {
      route: "/posts/new",
      sourceRef: "app/posts/new/page.tsx:NewPostForm",
    }),
    ev(1, 1840, "user-input", { route: "/posts/new" }),
    ev(2, 3120, "user-input", { route: "/posts/new" }),
    ev(3, 3260, "server-action:start", {
      route: "/posts/new",
      actionName: "createPost",
      sourceRef: "app/posts/actions.ts:createPost",
    }),
    ev(4, 3410, "cache:update-tag", { actionName: "createPost", meta: { tag: "posts" } }),
    ev(5, 3480, "cookies:mutate", { meta: { key: "last_post", value: "42" } }),
    ev(6, 3590, "server-action:end", { actionName: "createPost", meta: { ok: true, ms: 330 } }),
    ev(7, 3640, "redirect", { route: "/posts/42", meta: { status: 303, to: "/posts/42" } }),
    ev(8, 3710, "rsc:chunk", {
      route: "/posts/42",
      meta: { frameIndex: 0, segment: "posts/[id]" },
    }),
    ev(9, 3880, "rsc:chunk", {
      route: "/posts/42",
      meta: { frameIndex: 1, segment: "posts/[id]/page" },
    }),
    ev(10, 4020, "tree:diff", {
      route: "/posts/42",
      sourceRef: "app/posts/[id]/page.tsx:PostTitle",
    }),
    ev(11, 4140, "tree:diff", { route: "/posts/42" }),
  ];

  return Session.parse({
    id: SID,
    schemaVersion: 1,
    app: "demo-playground",
    route: "/posts/new",
    nextVersion: "16.2.6",
    startedAt: 0,
    events,
  });
}
