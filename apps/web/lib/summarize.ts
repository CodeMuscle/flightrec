"use server";

import type { Session } from "@flightrec/trace-schema";
import { Session as SessionSchema } from "@flightrec/trace-schema";
import { narrate } from "@/components/inspector/lib/derive";

// Any OpenAI-compatible provider. Default: Groq (free tier, instant key, no card).
// Switch providers via env only — no code change.
const BASE_URL = process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1";
const MODEL = process.env.AI_MODEL ?? "llama-3.3-70b-versatile";
const API_KEY = process.env.AI_API_KEY;

export async function summarizeSession(input: Session): Promise<{ ok: boolean; summary: string }> {
  if (!API_KEY) {
    return { ok: false, summary: "Set AI_API_KEY in apps/web/.env.local to enable AI summaries." };
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
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });
    if (!res.ok) return { ok: false, summary: `AI error ${res.status}` };
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
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
