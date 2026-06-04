import { recordCacheUpdate, recordCookieMutation } from "@flightrec/recorder";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { currentRecorder, recordRedirect } from "@flightrec/recorder";
import { redirect } from "next/navigation";
import { saveSession } from "./session-store";

/** updateTag(tag) — records cache:update-tag, then delegates (best-effort in the demo). */
export function recordedUpdateTag(tag: string): void {
  recordCacheUpdate(tag);
  try {
    updateTag(tag);
  } catch {
    /* best-effort: the trace is recorded even if no cached data uses this tag */
  }
}

/** cookies().set — records cookies:mutate, then writes the real cookie. */
export async function recordedSetCookie(name: string, value: string): Promise<void> {
  recordCookieMutation(name, value);
  try {
    (await cookies()).set(name, value);
  } catch {
    /* best-effort */
  }
}

/**
 * Real redirect(), captured: record the event, flush the session to the store
 * *before* the NEXT_REDIRECT throw (the store is synchronous, so this always wins
 * the race), then perform the navigation. For an async store, flush via Next's
 * `after()` instead.
 */
export function recordedRedirect(to: string): never {
  recordRedirect(to, 303);
  const recorder = currentRecorder();
  if (recorder) saveSession(recorder.session());
  redirect(to);
}
