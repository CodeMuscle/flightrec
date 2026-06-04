import { createRecorder } from "@flightrec/recorder";
import { after } from "next/server";
import { cache } from "react";
import { saveSession } from "./session-store";

// React cache() is request-scoped, so these are one-per-render and shared by every
// instrumented server component in the tree — no AsyncLocalStorage-around-render needed.
export const getRenderSessionId = cache(() => `ses_${crypto.randomUUID().slice(0, 6)}`);

export const getRenderRecorder = cache(() =>
  createRecorder({
    sessionId: getRenderSessionId(),
    app: "playground-render",
    route: "/playground/render",
    nextVersion: "16.2.6",
  }),
);

/** Record that a server component rendered — a node-create op in an RSC frame. */
export function recordRender(label: string, sourceRef?: string) {
  getRenderRecorder().record({
    phase: "rsc:chunk",
    sourceRef,
    meta: { segment: "render", ops: [{ type: "node-create", nodeId: label, label }] },
  });
}

/**
 * Register an after()-flush of this render's session. We capture the recorder *now*
 * (during render) and close over it, so we don't depend on cache() surviving into the
 * after() callback. Returns the session id for linking to the inspector.
 */
export function flushAfterRender(): string {
  const recorder = getRenderRecorder();
  after(() => saveSession(recorder.session()));
  return getRenderSessionId();
}
