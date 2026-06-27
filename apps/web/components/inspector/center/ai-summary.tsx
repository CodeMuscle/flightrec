"use client";

import type { Session } from "@flightrec/trace-schema";
import { useState, useTransition } from "react";
import { reportBug, summarizeSession } from "@/lib/summarize";

export function AiSummary({ session }: { session: Session }) {
  const [pending, start] = useTransition();
  const [text, setText] = useState<string | null>(null);

  const summarize = () =>
    start(async () => {
      setText((await summarizeSession(session)).summary);
    });
  const report = () =>
    start(async () => {
      setText((await reportBug(session)).report);
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={summarize}
          disabled={pending}
          className="pill border border-line px-2.5 py-1 font-mono text-[10px] text-fg-muted transition hover:border-line-strong disabled:opacity-50"
        >
          ✦ Summarize
        </button>
        <button
          type="button"
          onClick={report}
          disabled={pending}
          className="pill border border-line px-2.5 py-1 font-mono text-[10px] text-fg-muted transition hover:border-line-strong disabled:opacity-50"
        >
          🐞 Bug report
        </button>
      </div>
      {pending && <span className="font-mono text-[10px] text-fg-faint">thinking…</span>}
      {text && (
        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-fg-muted">
          {text}
        </pre>
      )}
    </div>
  );
}
