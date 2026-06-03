"use client";

import type { Session } from "@flightrec/trace-schema";
import { useState } from "react";
import { eventAtTick } from "./lib/derive";

export function JsonTray({ session, tick }: { session: Session; tick: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const event = eventAtTick(session, tick);
  const json = event ? JSON.stringify(event, null, 2) : "// no event on this tick";

  const copy = async () => {
    if (!event) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border-t border-line bg-bg-inset">
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-fg-faint transition hover:text-fg-muted"
        >
          <span
            className="inline-block transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "none" }}
          >
            ▸
          </span>
          Raw event
        </button>
        {event && <span className="font-mono text-[11px] text-fg-faint">{event.phase}</span>}
        {open && event && (
          <button
            type="button"
            onClick={copy}
            className="pill ml-auto border border-line px-2 py-0.5 font-mono text-[10px] text-fg-muted transition hover:border-line-strong"
          >
            {copied ? "copied ✓" : "copy"}
          </button>
        )}
      </div>
      {open && (
        <pre className="pane-scroll max-h-56 overflow-auto border-t border-line bg-bg-raised px-4 py-3 font-mono text-[11px] leading-relaxed text-fg-muted">
          {json}
        </pre>
      )}
    </div>
  );
}
