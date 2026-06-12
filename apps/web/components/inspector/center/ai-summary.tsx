"use client";

import type { Session } from "@flightrec/trace-schema";
import { useState, useTransition } from "react";
import { summarizeSession } from "@/lib/summarize";

export function AiSummary({ session }: { session: Session }) {
  const [pending, start] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);

  const run = () =>
    start(async () => {
      const r = await summarizeSession(session);
      setSummary(r.summary);
    });

  if (summary) {
    return <p className="text-[11px] leading-relaxed text-fg-muted">{summary}</p>;
  }
  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="pill border border-line px-2.5 py-1 font-mono text-[10px] text-fg-muted transition hover:border-line-strong disabled:opacity-50"
    >
      {pending ? "summarizing…" : "✦ Summarize with AI"}
    </button>
  );
}
