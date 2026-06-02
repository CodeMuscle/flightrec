/**
 * Synthetic trace fixture for the landing-page demo.
 *
 * Models the "blog post creator" flow from the Master Doc (Demo 1):
 *   user fills a form -> Server Action `createPost` runs -> updateTag('posts')
 *   -> cookie write -> redirect -> RSC frames stream -> client tree reconciles.
 *
 * This is the exact UX of the real inspector, running on deterministic synthetic
 * data — no recorder/backend required. In Phase 0 these become generated golden
 * `.frec` fixtures shared with the real inspector app.
 */

export type Plane = "user" | "action" | "cache" | "rsc" | "net" | "tree";

export type Phase =
  | "user-input"
  | "client-navigation"
  | "server-action:start"
  | "server-action:end"
  | "cache:update-tag"
  | "cache:revalidate-tag"
  | "cookies:mutate"
  | "headers:mutate"
  | "redirect"
  | "rsc:chunk"
  | "tree:diff";

export type CacheOutcome =
  | "immediate-freshness"
  | "stale-then-refresh"
  | "no-visible-effect"
  | "orphaned-invalidation";

export type TreeOp = {
  kind: "create" | "replace" | "patch" | "remove";
  label: string;
  depth: number;
};

export type Tick = {
  tick: number;
  ts: number; // ms offset from session start
  plane: Plane;
  phase: Phase;
  title: string;
  detail: string;
  route: string;
  source?: string; // file:symbol
  // pane payloads (cumulative state is derived in the component)
  action?: { name: string; status: "running" | "ok" | "error"; argsPreview: string };
  cache?: { tag: string; api: "updateTag" | "revalidateTag"; outcome?: CacheOutcome };
  rsc?: { frameIndex: number; rawKind: string; segment: string; bytes: number };
  net?: { kind: "cookie" | "header" | "redirect"; key: string; value: string };
  tree?: TreeOp;
};

export const SESSION = {
  id: "ses_8f31a0",
  route: "/posts/new",
  app: "demo-playground",
  nextVersion: "16.2.6",
};

export const TICKS: Tick[] = [
  {
    tick: 0,
    ts: 0,
    plane: "user",
    phase: "user-input",
    title: "Focus title field",
    detail: "User focuses the post title input.",
    route: "/posts/new",
    source: "app/posts/new/page.tsx:NewPostForm",
  },
  {
    tick: 1,
    ts: 1840,
    plane: "user",
    phase: "user-input",
    title: "Type title",
    detail: 'value = "Shipping Flightrec"',
    route: "/posts/new",
    source: "app/posts/new/page.tsx:NewPostForm",
  },
  {
    tick: 2,
    ts: 3120,
    plane: "user",
    phase: "user-input",
    title: "Submit form",
    detail: "User clicks Save — form action dispatched.",
    route: "/posts/new",
    source: "app/posts/new/page.tsx:NewPostForm",
  },
  {
    tick: 3,
    ts: 3260,
    plane: "action",
    phase: "server-action:start",
    title: "createPost() starts",
    detail: "Server Action invoked with form payload.",
    route: "/posts/new",
    source: "app/posts/actions.ts:createPost",
    action: {
      name: "createPost",
      status: "running",
      argsPreview: '{ title: "Shipping Flightrec" }',
    },
  },
  {
    tick: 4,
    ts: 3410,
    plane: "cache",
    phase: "cache:update-tag",
    title: "updateTag('posts')",
    detail: "Read-your-own-writes invalidation requested.",
    route: "/posts/new",
    source: "app/posts/actions.ts:createPost",
    cache: { tag: "posts", api: "updateTag", outcome: "immediate-freshness" },
  },
  {
    tick: 5,
    ts: 3480,
    plane: "net",
    phase: "cookies:mutate",
    title: "Set cookie last_post",
    detail: "cookies().set('last_post', '42')",
    route: "/posts/new",
    source: "app/posts/actions.ts:createPost",
    net: { kind: "cookie", key: "last_post", value: "42" },
  },
  {
    tick: 6,
    ts: 3590,
    plane: "action",
    phase: "server-action:end",
    title: "createPost() returns",
    detail: "Action resolved in 330ms — post #42 created.",
    route: "/posts/new",
    source: "app/posts/actions.ts:createPost",
    action: { name: "createPost", status: "ok", argsPreview: "→ { id: 42 }" },
  },
  {
    tick: 7,
    ts: 3640,
    plane: "net",
    phase: "redirect",
    title: "redirect('/posts/42')",
    detail: "303 → navigate to created post.",
    route: "/posts/42",
    source: "app/posts/actions.ts:createPost",
    net: { kind: "redirect", key: "Location", value: "/posts/42" },
  },
  {
    tick: 8,
    ts: 3710,
    plane: "rsc",
    phase: "rsc:chunk",
    title: "RSC frame · layout",
    detail: "Flight frame 0 — /posts/[id] layout segment.",
    route: "/posts/42",
    source: "app/posts/[id]/layout.tsx",
    rsc: { frameIndex: 0, rawKind: "F", segment: "posts/[id]", bytes: 1420 },
    tree: { kind: "create", label: "<PostLayout>", depth: 0 },
  },
  {
    tick: 9,
    ts: 3880,
    plane: "rsc",
    phase: "rsc:chunk",
    title: "RSC frame · post body",
    detail: "Flight frame 1 — server-fetched post content.",
    route: "/posts/42",
    source: "app/posts/[id]/page.tsx:PostView",
    rsc: { frameIndex: 1, rawKind: "F", segment: "posts/[id]/page", bytes: 3180 },
    tree: { kind: "create", label: "<PostView id=42>", depth: 1 },
  },
  {
    tick: 10,
    ts: 4020,
    plane: "tree",
    phase: "tree:diff",
    title: "Reconcile post title",
    detail: "Client tree patched with fresh server data.",
    route: "/posts/42",
    source: "app/posts/[id]/page.tsx:PostTitle",
    tree: { kind: "patch", label: "<h1> Shipping Flightrec", depth: 2 },
  },
  {
    tick: 11,
    ts: 4140,
    plane: "tree",
    phase: "tree:diff",
    title: "Suspense resolved",
    detail: "Boundary committed — checkpoint snapshot persisted.",
    route: "/posts/42",
    source: "app/posts/[id]/page.tsx:Comments",
    tree: { kind: "create", label: "<Comments>", depth: 2 },
  },
];

export const PLANE_META: Record<Plane, { label: string; varName: string; short: string }> = {
  user: { label: "User action", varName: "var(--plane-user)", short: "USER" },
  action: { label: "Server Action", varName: "var(--plane-action)", short: "ACTION" },
  cache: { label: "Cache invalidation", varName: "var(--plane-cache)", short: "CACHE" },
  rsc: { label: "RSC payload", varName: "var(--plane-rsc)", short: "RSC" },
  net: { label: "Response mutation", varName: "var(--plane-net)", short: "NET" },
  tree: { label: "Client tree", varName: "var(--plane-tree)", short: "TREE" },
};

export const CACHE_OUTCOME_META: Record<
  CacheOutcome,
  { label: string; tone: "good" | "warn" | "bad" }
> = {
  "immediate-freshness": { label: "Immediate freshness", tone: "good" },
  "stale-then-refresh": { label: "Stale → refresh", tone: "warn" },
  "no-visible-effect": { label: "No visible effect", tone: "bad" },
  "orphaned-invalidation": { label: "Orphaned invalidation", tone: "bad" },
};
