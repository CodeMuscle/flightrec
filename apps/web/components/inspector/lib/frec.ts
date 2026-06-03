import { Session } from "@flightrec/trace-schema";

export type FrecResult = { ok: true; session: Session } | { ok: false; error: string };

/** Parse + schema-validate a .frec file's text. Never trusts the input shape. */
export function parseFrec(text: string): FrecResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "not valid JSON" };
  }
  const result = Session.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "invalid .frec schema" };
  }
  return { ok: true, session: result.data };
}

/** Serialize a session to .frec text (pretty-printed). */
export function serializeFrec(session: Session): string {
  return JSON.stringify(session, null, 2);
}
