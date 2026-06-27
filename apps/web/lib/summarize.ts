"use server";

import type { Session } from "@flightrec/trace-schema";
import { Session as SessionSchema } from "@flightrec/trace-schema";
import { narrate } from "@/components/inspector/lib/derive";

// Any OpenAI-compatible provider. Default: Groq (free tier, instant key, no card).
// Switch providers via env only — no code change.
const BASE_URL = process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1";
const MODEL = process.env.AI_MODEL ?? "llama-3.3-70b-versatile";
const API_KEY = process.env.AI_API_KEY;

function digest(session: Session): string {
  const timeline = session.events
    .map((e) => `${String(e.tick).padStart(2, "0")}: ${narrate(e)}`)
    .join("\n");
  return `App: ${session.app ?? "?"} · route: ${session.route ?? "?"} · ${session.events.length} events.\nTimeline:\n${timeline}`;
}

async function callAI(prompt: string, maxTokens: number): Promise<{ ok: boolean; text: string }> {
  if (!API_KEY) {
    return { ok: false, text: "Set AI_API_KEY in apps/web/.env.local to enable AI." };
  }
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) return { ok: false, text: `AI error ${res.status}` };
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text?.trim() ? { ok: true, text: text.trim() } : { ok: false, text: "No response." };
  } catch (err) {
    return {
      ok: false,
      text: `Request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function summarizeSession(input: Session): Promise<{ ok: boolean; summary: string }> {
  const parsed = SessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, summary: "Invalid session." };
  const r = await callAI(
    `You are a debugging assistant for the Next.js App Router. In 2–3 concise, technical sentences, summarize this recorded session for a developer: what the user did, what the server did (action / cache / redirect), and any notable behavior. Don't list every step.\n\n${digest(parsed.data)}`,
    200,
  );
  return { ok: r.ok, summary: r.text };
}

export async function reportBug(input: Session): Promise<{ ok: boolean; report: string }> {
  const parsed = SessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, report: "Invalid session." };
  const r = await callAI(
    `You are a senior Next.js engineer. From this recorded session, write a concise GitHub bug report in markdown with these sections: **Summary**, **Steps to reproduce**, **Expected**, **Actual**, **Likely cause**. Base it only on the trace; if something is unknown, say so.\n\n${digest(parsed.data)}`,
    500,
  );
  return { ok: r.ok, report: r.text };
}
