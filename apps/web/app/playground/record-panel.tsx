"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { recordAndInspect, recordSession } from "./actions";

export function RecordPanel() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{
    frec: string;
    events: number;
    id: string;
  } | null>(null);

  const record = () =>
    start(async () => {
      setResult(await recordSession());
    });

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([result.frec], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "playground.frec";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <form action={recordAndInspect}>
        <button
          type="submit"
          className="pill bg-fg px-5 py-3 text-sm font-medium text-bg shadow-(--shadow-card) transition hover:opacity-90"
        >
          ▶ Record &amp; open in inspector
        </button>
      </form>
      <span className="font-mono text-[10px] uppercase tracking-widest text-fg-faint">
        or record + view here
      </span>

      <button
        type="button"
        onClick={record}
        disabled={pending}
        className="pill bg-fg px-5 py-3 text-sm font-medium text-bg shadow-(--shadow-card) transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Recording…" : "▶ Record a session"}
      </button>

      <Link
        href="/playground/render"
        className="font-mono text-[11px] text-accent underline-offset-4 hover:underline"
      >
        or capture a server render →
      </Link>

      {result && (
        <div className="card flex w-full flex-col items-center gap-3 px-5 py-4">
          <span className="font-mono text-xs text-fg-muted">
            ✅ recorded <span className="text-plane-cache">{result.events} events</span>
          </span>
          <pre className="pane-scroll max-h-48 w-full select-text overflow-auto rounded-lg border border-line bg-bg-inset px-3 py-2 text-left font-mono text-[11px] text-fg-muted">
            {result.frec}
          </pre>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={download}
              className="pill border border-line px-3 py-1.5 font-mono text-[11px] text-fg-muted transition hover:border-line-strong"
            >
              ⤓ Download .frec
            </button>
            <Link
              href={`/inspector?session=${result.id}`}
              className="pill border border-accent/40 bg-accent-soft px-3 py-1.5 font-mono text-[11px] text-accent-dim transition hover:border-accent"
            >
              Open in inspector →
            </Link>
          </div>
          <span className="font-mono text-[10px] text-fg-faint">
            opens your recorded session directly — no download needed
          </span>
        </div>
      )}
    </div>
  );
}
