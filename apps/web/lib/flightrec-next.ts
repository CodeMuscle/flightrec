import { recordCacheUpdate, recordCookieMutation } from "@flightrec/recorder";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";

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
