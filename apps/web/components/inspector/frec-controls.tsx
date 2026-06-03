"use client";

import type { Session } from "@flightrec/trace-schema";
import { useRef, useState } from "react";
import { parseFrec, serializeFrec } from "./lib/frec";

export function FrecControls({
  session,
  onLoad,
}: {
  session: Session;
  onLoad: (session: Session) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const result = parseFrec(await file.text());
    if (result.ok) {
      setError(null);
      onLoad(result.session);
    } else {
      setError(result.error);
    }
  };

  const exportFrec = () => {
    const url = URL.createObjectURL(
      new Blob([serializeFrec(session)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.id}.frec`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept=".frec,.json,application/json"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="pill border border-line px-2 py-0.5 font-mono text-[10px] text-fg-muted transition hover:border-line-strong"
      >
        ⤓ import
      </button>
      <button
        type="button"
        onClick={exportFrec}
        className="pill border border-line px-2 py-0.5 font-mono text-[10px] text-fg-muted transition hover:border-line-strong"
      >
        export ⤒
      </button>
      {error && <span className="font-mono text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
