import {
  Session,
  type RscOp,
  type Session as SessionT,
  type TraceEvent,
} from "@flightrec/trace-schema";

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
      meta: {
        frameIndex: 0,
        segment: "posts/[id]",
        ops: [
          { type: "node-create", nodeId: "n0", label: "<PostLayout>" },
          { type: "node-create", nodeId: "n1", parentId: "n0", label: "<Suspense>" },
          { type: "suspend", nodeId: "n1" },
        ] satisfies RscOp[],
      },
    }),
    ev(9, 3880, "rsc:chunk", {
      route: "/posts/42",
      meta: {
        frameIndex: 1,
        segment: "posts/[id]/page",
        ops: [
          { type: "resolve", nodeId: "n1" },
          { type: "node-create", nodeId: "n2", parentId: "n1", label: "<PostView>" },
          { type: "node-create", nodeId: "n3", parentId: "n2", label: "<h1>" },
          { type: "prop-patch", nodeId: "n3", key: "children", nextValue: "Shipping Flightrec" },
        ] satisfies RscOp[],
      },
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

function mkEv(sid: string) {
  return (
    tick: number,
    ts: number,
    phase: TraceEvent["phase"],
    extra: Partial<TraceEvent> = {},
  ): TraceEvent => ({ id: `${sid}_${tick}`, sessionId: sid, ts, tick, phase, ...extra });
}

/** "Stale dashboard" demo — a revalidate with no downstream render → orphaned-invalidation. */
export function staleDashboardSession(): SessionT {
  const sid = "ses_dash01";
  const e = mkEv(sid);
  const events: TraceEvent[] = [
    e(0, 0, "user-input", { route: "/dashboard", sourceRef: "app/dashboard/page.tsx:Dashboard" }),
    e(1, 120, "server-action:start", {
      route: "/dashboard",
      actionName: "refreshMetrics",
      sourceRef: "app/dashboard/actions.ts:refreshMetrics",
    }),
    e(2, 210, "cache:revalidate-tag", {
      actionName: "refreshMetrics",
      meta: { tag: "metrics", profile: "max" },
    }),
    e(3, 260, "server-action:end", { actionName: "refreshMetrics", meta: { ok: true, ms: 140 } }),
  ];
  return Session.parse({
    id: sid,
    schemaVersion: 1,
    app: "demo-playground",
    route: "/dashboard",
    nextVersion: "16.2.6",
    startedAt: 0,
    events,
  });
}

/** "Auth cookie" demo — sign-in sets a (secret) cookie + header, redirects, renders. */
export function authCookieSession(): SessionT {
  const sid = "ses_auth01";
  const e = mkEv(sid);
  const events: TraceEvent[] = [
    e(0, 0, "user-input", { route: "/login", sourceRef: "app/login/page.tsx:LoginForm" }),
    e(1, 1500, "user-input", { route: "/login" }),
    e(2, 1820, "server-action:start", {
      route: "/login",
      actionName: "signIn",
      sourceRef: "app/login/actions.ts:signIn",
    }),
    e(3, 1950, "cookies:mutate", { meta: { key: "session_token", value: "eyJhbGciOi.secret" } }),
    e(4, 1980, "headers:mutate", {
      meta: { key: "set-cookie", value: "session_token=…; HttpOnly" },
    }),
    e(5, 2090, "server-action:end", { actionName: "signIn", meta: { ok: true, ms: 270 } }),
    e(6, 2140, "redirect", { route: "/dashboard", meta: { status: 303, to: "/dashboard" } }),
    e(7, 2300, "rsc:chunk", {
      route: "/dashboard",
      meta: {
        frameIndex: 0,
        segment: "dashboard",
        ops: [{ type: "node-create", nodeId: "d0", label: "<Dashboard>" }] satisfies RscOp[],
      },
    }),
    e(8, 2440, "tree:diff", { route: "/dashboard", sourceRef: "app/dashboard/page.tsx:Greeting" }),
  ];
  return Session.parse({
    id: sid,
    schemaVersion: 1,
    app: "demo-playground",
    route: "/login",
    nextVersion: "16.2.6",
    startedAt: 0,
    events,
  });
}
