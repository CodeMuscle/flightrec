import { recordEvent } from "./context";

/** Record a user interaction (form input, click) on a route. */
export function recordUserInput(route?: string, sourceRef?: string) {
  return recordEvent({ phase: "user-input", route, sourceRef });
}

/** Record the start of a Server Action. */
export function recordServerActionStart(actionName: string, sourceRef?: string, route?: string) {
  return recordEvent({ phase: "server-action:start", actionName, sourceRef, route });
}

/** Record the end of a Server Action, with timing + success. */
export function recordServerActionEnd(
  actionName: string,
  opts: { ms?: number; ok?: boolean } = {},
) {
  return recordEvent({ phase: "server-action:end", actionName, meta: { ...opts } });
}

/** Record an `updateTag(tag)` cache write. */
export function recordCacheUpdate(tag: string) {
  return recordEvent({ phase: "cache:update-tag", meta: { tag } });
}

/** Record a `revalidateTag(tag, profile)` cache invalidation. */
export function recordCacheRevalidate(tag: string, profile?: string) {
  return recordEvent({
    phase: "cache:revalidate-tag",
    meta: profile ? { tag, profile } : { tag },
  });
}

/** Record a cookie mutation (`cookies().set(...)`). */
export function recordCookieMutation(key: string, value?: string) {
  return recordEvent({
    phase: "cookies:mutate",
    meta: value === undefined ? { key } : { key, value },
  });
}

/** Record a response-header mutation (`headers()` / `headers().set(...)`). */
export function recordHeaderMutation(key: string) {
  return recordEvent({ phase: "headers:mutate", meta: { key } });
}

/** Record a `redirect(to)` — status defaults to 307 (use 303 inside a Server Action). */
export function recordRedirect(to: string, status = 307) {
  return recordEvent({ phase: "redirect", route: to, meta: { to, status } });
}

// Harden Transport Module D
/** Record a caught error as an `error` event (name + message). Redirects are not errors. */
export function recordError(error: unknown, sourceRef?: string) {
  const meta =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { message: String(error) };
  return recordEvent({ phase: "error", sourceRef, meta });
}
