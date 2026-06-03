import { z } from "zod";

/** Bump when the trace shape changes; bundles carry this so they stay migratable. */
export const SCHEMA_VERSION = 1 as const;

export const Phase = z.enum([
  "user-input",
  "client-navigation",
  "server-action:start",
  "server-action:end",
  "rsc:chunk",
  "cache:update-tag",
  "cache:revalidate-tag",
  "headers:mutate",
  "cookies:mutate",
  "redirect",
  "tree:diff",
  "error",
]);
export type Phase = z.infer<typeof Phase>;

export const TraceEvent = z.object({
  id: z.string(),
  sessionId: z.string(),
  ts: z.number(),
  tick: z.number().int().nonnegative(),
  phase: Phase,
  route: z.string().optional(),
  actionId: z.string().optional(),
  actionName: z.string().optional(),
  payloadRef: z.string().optional(),
  sourceRef: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});
export type TraceEvent = z.infer<typeof TraceEvent>;

export const RscOp = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("node-create"),
    nodeId: z.string(),
    parentId: z.string().optional(),
    label: z.string(),
  }),
  z.object({ type: z.literal("node-replace"), nodeId: z.string(), nextLabel: z.string() }),
  z.object({
    type: z.literal("prop-patch"),
    nodeId: z.string(),
    key: z.string(),
    nextValue: z.unknown(),
  }),
  z.object({ type: z.literal("suspend"), nodeId: z.string() }),
  z.object({ type: z.literal("resolve"), nodeId: z.string() }),
  z.object({ type: z.literal("remove"), nodeId: z.string() }),
]);
export type RscOp = z.infer<typeof RscOp>;

export const RscFrame = z.object({
  sessionId: z.string(),
  requestId: z.string(),
  frameIndex: z.number().int().nonnegative(),
  ts: z.number(),
  routeSegment: z.string().optional(),
  rawKind: z.string(),
  normalizedOps: z.array(RscOp),
});
export type RscFrame = z.infer<typeof RscFrame>;

export const CacheOutcome = z.enum([
  "immediate-freshness",
  "stale-then-refresh",
  "no-visible-effect",
  "orphaned-invalidation",
]);
export type CacheOutcome = z.infer<typeof CacheOutcome>;

export const Session = z.object({
  id: z.string(),
  schemaVersion: z.literal(SCHEMA_VERSION),
  app: z.string().optional(),
  route: z.string().optional(),
  nextVersion: z.string().optional(),
  startedAt: z.number(),
  events: z.array(TraceEvent),
});
export type Session = z.infer<typeof Session>;
