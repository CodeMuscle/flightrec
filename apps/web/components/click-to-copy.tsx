"use client";

import { useState } from "react";

export function ClickToCopy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      onClick={copy}
      className={`pill group inline-flex items-center gap-2.5 border bg-bg-raised px-4 py-2 font-mono text-sm shadow-(--shadow-sm) transition ${
        copied
          ? "cursor-default border-accent text-fg"
          : "cursor-pointer border-line text-fg-muted hover:border-line-strong hover:text-fg"
      }`}
      aria-label={copied ? "Copied" : `Copy ${text}`}
    >
      <span className="select-none text-fg-faint">
        <PackageIcon />
      </span>
      <span className="select-none">{copied ? "Copied!" : text}</span>
      <span className={`transition ${copied ? "text-accent" : "text-fg-faint group-hover:text-accent"}`}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
      <span className="sr-only">{copied ? "Copied" : "Click to copy"}</span>
    </button>
  );
}

function PackageIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M8 1.6 13.5 4.5v6.9L8 14.4 2.5 11.4V4.5z" />
      <path d="M2.6 4.6 8 7.5l5.4-2.9M8 7.5v6.9" />
    </svg>
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
