"use client";

import { useState } from "react";

export function ClickToCopy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      onClick={copy}
      className="pill group inline-flex items-center gap-2.5 border border-line bg-bg-raised px-4 py-2 font-mono text-sm text-fg-muted shadow-[var(--shadow-sm)] transition hover:border-line-strong hover:text-fg"
      aria-label={`Copy ${text}`}
    >
      <span className="select-none text-fg-faint">$</span>
      <span className="select-none">{text}</span>
      <span className="text-fg-faint transition group-hover:text-accent">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
      <span className="sr-only">{copied ? "Copied" : "Click to copy"}</span>
    </button>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" />
      <path d="M3.5 10.5h-.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v.5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-accent">
      <path d="m3 8.5 3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
