"use server";

import type { Session } from "@flightrec/trace-schema";
import { Session as SessionSchema } from "@flightrec/trace-schema";
import { narrate } from "@/components/inspector/lib/derive";

const MODEL = "gemini-2.5-flash"; // free tier; fall back to "gemini-2.0-flash" if this 404s

export async function summarizeSession(input: Session): Promise<{ ok: boolean; summary: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      ok: false,
      summary: "Set GEMINI_API_KEY in apps/web/.env.local to enable AI summaries.",
    };
  }
  const parsed = SessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, summary: "Invalid session." };
  const session = parsed.data;

  const timeline = session.events
    .map((e) => `${String(e.tick).padStart(2, "0")}: ${narrate(e)}`)
    .join("\n");
  const prompt = `You are a debugging assistant for the Next.js App Router. In 2–3 concise, technical sentences, summarize this recorded session for a developer: what the user did, what the server did (action / cache / redirect), and any notable behavior. Don't list every step.

App: ${session.app ?? "?"} · route: ${session.route ?? "?"} · ${session.events.length} events.
Timeline:
${timeline}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) return { ok: false, summary: `Gemini error ${res.status}` };
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim()
      ? { ok: true, summary: text.trim() }
      : { ok: false, summary: "No summary returned." };
  } catch (err) {
    return {
      ok: false,
      summary: `Request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
