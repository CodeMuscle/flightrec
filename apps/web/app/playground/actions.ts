"use server";

import {
  recordRedirect,
  recordServerActionEnd,
  recordServerActionStart,
  recordUserInput,
  runWithSession,
} from "@flightrec/recorder";
import { recordedSetCookie, recordedUpdateTag } from "@/lib/flightrec-next";

/** Runs a createPost-style flow inside a recording scope; returns the captured .frec. */
export async function recordSession(): Promise<{ frec: string; events: number }> {
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
  return { frec: JSON.stringify(session, null, 2), events: session.events.length };
}
