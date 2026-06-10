"use server";

import {
  recordRedirect,
  recordServerActionEnd,
  recordServerActionStart,
  recordUserInput,
  runWithSession,
  recordError,
} from "@flightrec/recorder";
import { recordedRedirect, recordedSetCookie, recordedUpdateTag } from "@/lib/flightrec-next";
import { saveSession } from "@/lib/session-store";

/** Runs a createPost-style flow inside a recording scope; stores it and returns the .frec + id. */
export async function recordSession(): Promise<{ frec: string; events: number; id: string }> {
  const { session } = await runWithSession(
    { app: "playground", route: "/posts/new", nextVersion: "16.2.6" },
    async () => {
      recordUserInput("/posts/new", "app/playground/page.tsx:RecordPanel");
      recordServerActionStart(
        "createPost",
        "app/playground/actions.ts:recordSession",
        "/posts/new",
      );
      recordedUpdateTag("posts");
      await recordedSetCookie("last_post", "42");
      recordRedirect("/posts/42", 303); // a real app would `redirect("/posts/42")` here (it throws)
      recordServerActionEnd("createPost", { ms: 330, ok: true });
    },
  );
  const id = saveSession(session);
  return { frec: JSON.stringify(session, null, 2), events: session.events.length, id };
}

/** Records a flow that ends in a real redirect, then lands you in the inspector viewing it. */
export async function recordAndInspect(): Promise<void> {
  const id = `ses_${crypto.randomUUID().slice(0, 6)}`;
  await runWithSession(
    { sessionId: id, app: "playground", route: "/posts/new", nextVersion: "16.2.6" },
    async () => {
      recordUserInput("/posts/new", "app/playground/page.tsx:RecordPanel");
      recordServerActionStart(
        "createPost",
        "app/playground/actions.ts:recordAndInspect",
        "/posts/new",
      );
      recordedUpdateTag("posts");
      await recordedSetCookie("last_post", "42");
      recordServerActionEnd("createPost", { ms: 330, ok: true });
      recordedRedirect(`/inspector?session=${id}`); // real redirect() — throws, navigates
    },
  );
}

// Harden Transport Module D
/** Records a flow where the action throws — the error is captured as an `error` event. */
export async function recordFailingAction(): Promise<{ frec: string; events: number; id: string }> {
  const { session } = await runWithSession(
    { app: "playground", route: "/posts/new", nextVersion: "16.2.6" },
    async () => {
      recordUserInput("/posts/new", "app/playground/page.tsx:RecordPanel");
      recordServerActionStart(
        "createPost",
        "app/playground/actions.ts:recordFailingAction",
        "/posts/new",
      );
      recordedUpdateTag("posts");
      try {
        throw new Error("Database connection refused");
      } catch (err) {
        recordError(err, "app/posts/actions.ts:createPost");
      }
      recordServerActionEnd("createPost", { ms: 120, ok: false });
    },
  );
  const id = saveSession(session);
  return { frec: JSON.stringify(session, null, 2), events: session.events.length, id };
}
